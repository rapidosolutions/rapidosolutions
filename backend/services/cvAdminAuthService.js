import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { AppError } from "../utils/http.js";
import { assertDatabaseResult } from "../utils/database.js";
import { decryptSecret, encryptSecret } from "../utils/cryptoSecret.js";

const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7K.nY1aQzNHVPlQOVGP6xOq0JGM0D5e";
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const columns =
  "id,email,password_hash,role,full_name,is_active,totp_secret_encrypted,totp_enabled,failed_login_attempts,lock_until,last_login_at,created_at";

function serialize(admin) {
  if (!admin) return null;
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    fullName: admin.full_name,
    isActive: admin.is_active,
    totpEnabled: Boolean(admin.totp_enabled),
    lastLoginAt: admin.last_login_at,
    createdAt: admin.created_at
  };
}

function tempPassword() {
  return `Cv!${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}Aa1`;
}

export function createCvAdminAuthService({ supabase, config, emailService }) {
  async function findByEmail(email) {
    const { data, error } = await supabase.from("admin_users").select(columns).eq("email", email).maybeSingle();
    assertDatabaseResult(error, "CV administrator lookup failed.");
    return data;
  }

  async function findById(id) {
    const { data, error } = await supabase.from("admin_users").select(columns).eq("id", id).maybeSingle();
    assertDatabaseResult(error, "CV administrator lookup failed.");
    return data;
  }

  return {
    serialize,

    async bootstrapSuperAdmin() {
      if (!supabase) return null;
      const { data: existing, error } = await supabase.from("admin_users").select("id,email").limit(1);
      if (error) {
        if (error.code === "42P01" || /relation .* does not exist/i.test(error.message || "")) {
          console.warn("[CV Admin] admin_users table missing. Run migration 005_cv_admin.sql.");
          return null;
        }
        assertDatabaseResult(error, "CV administrator bootstrap failed.");
      }
      if (existing?.length) return existing[0];

      const password = config.cvAdminPassword || config.adminPassword;
      if (!password) {
        console.warn("[CV Admin] No CV admin yet. Set CV_ADMIN_PASSWORD (or ADMIN_PASSWORD) to bootstrap the first super_admin.");
        return null;
      }
      if (password.length < 12) throw new Error("CV_ADMIN_PASSWORD must contain at least 12 characters.");

      const email = String(config.cvAdminEmail || config.adminEmail).toLowerCase();
      const passwordHash = await bcrypt.hash(password, 12);
      const { data, error: insertError } = await supabase
        .from("admin_users")
        .insert({
          email,
          password_hash: passwordHash,
          role: "super_admin",
          full_name: "CV Super Admin",
          is_active: true
        })
        .select("id,email")
        .single();
      assertDatabaseResult(insertError, "CV super admin creation failed.");
      return data;
    },

    async authenticate(email, password) {
      const admin = await findByEmail(String(email).toLowerCase());
      if (!admin || !admin.is_active) {
        await bcrypt.compare(password, DUMMY_HASH);
        throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
      }

      if (admin.lock_until && new Date(admin.lock_until).getTime() > Date.now()) {
        throw new AppError(429, "Too many failed attempts. Try again later.", "ACCOUNT_LOCKED");
      }

      const valid = await bcrypt.compare(password, admin.password_hash);
      if (!valid) {
        const failedAttempts = Number(admin.failed_login_attempts || 0) + 1;
        const locked = failedAttempts >= MAX_ATTEMPTS;
        await supabase
          .from("admin_users")
          .update({
            failed_login_attempts: locked ? 0 : failedAttempts,
            lock_until: locked ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null
          })
          .eq("id", admin.id);
        throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
      }

      return serialize(admin);
    },

    async completeLogin(adminId) {
      const { error } = await supabase
        .from("admin_users")
        .update({ failed_login_attempts: 0, lock_until: null, last_login_at: new Date().toISOString() })
        .eq("id", adminId);
      assertDatabaseResult(error, "Could not update login state.");
      return serialize(await findById(adminId));
    },

    async verifyTotp(adminId, token) {
      const admin = await findById(adminId);
      if (!admin?.totp_enabled || !admin.totp_secret_encrypted) {
        throw new AppError(400, "Two-factor authentication is not set up for this account.", "TOTP_NOT_CONFIGURED");
      }
      const secret = decryptSecret(admin.totp_secret_encrypted, config.jwtSecret);
      const result = await verify({ token: String(token || "").replace(/\s/g, ""), secret });
      if (!result?.valid) throw new AppError(401, "Invalid authentication code.", "INVALID_TOTP");
      return serialize(admin);
    },

    async setupTotp(adminId) {
      const admin = await findById(adminId);
      if (!admin) throw new AppError(404, "Administrator not found.", "NOT_FOUND");
      const secret = generateSecret();
      const otpauth = generateURI({ issuer: "Rapido CV Admin", label: admin.email, secret });
      const qrDataUrl = await QRCode.toDataURL(otpauth);
      const { error } = await supabase
        .from("admin_users")
        .update({
          totp_secret_encrypted: encryptSecret(secret, config.jwtSecret),
          totp_enabled: false
        })
        .eq("id", adminId);
      assertDatabaseResult(error, "Could not store 2FA secret.");
      return { qrDataUrl, secret, otpauth };
    },

    async confirmTotp(adminId, token) {
      const admin = await findById(adminId);
      if (!admin?.totp_secret_encrypted) throw new AppError(400, "Start 2FA setup first.", "TOTP_SETUP_REQUIRED");
      const secret = decryptSecret(admin.totp_secret_encrypted, config.jwtSecret);
      const result = await verify({ token: String(token || "").replace(/\s/g, ""), secret });
      if (!result?.valid) throw new AppError(401, "Invalid authentication code.", "INVALID_TOTP");
      const { error } = await supabase.from("admin_users").update({ totp_enabled: true }).eq("id", adminId);
      assertDatabaseResult(error, "Could not enable 2FA.");
      return serialize(await findById(adminId));
    },

    async listAdmins() {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id,email,role,full_name,is_active,totp_enabled,last_login_at,created_at")
        .order("created_at", { ascending: true });
      assertDatabaseResult(error, "Could not list administrators.");
      return (data || []).map(serialize);
    },

    async createAdmin({ email, fullName, role }, createdBy) {
      if (!["admin", "super_admin"].includes(role)) {
        throw new AppError(400, "Role must be admin or super_admin.", "INVALID_ROLE");
      }
      const password = tempPassword();
      const passwordHash = await bcrypt.hash(password, 12);
      const { data, error } = await supabase
        .from("admin_users")
        .insert({
          email: String(email).toLowerCase(),
          password_hash: passwordHash,
          role,
          full_name: fullName || "",
          is_active: true,
          created_by: createdBy
        })
        .select("id,email,role,full_name,is_active,totp_enabled,last_login_at,created_at")
        .single();
      assertDatabaseResult(error, "Could not create administrator.");

      if (emailService?.sendCvAdminInvite) {
        await emailService.sendCvAdminInvite({
          email: data.email,
          fullName: data.full_name,
          temporaryPassword: password
        }).catch((err) => console.warn("[CV Admin Invite]", err.message));
      }

      return { admin: serialize(data), temporaryPassword: password };
    },

    async setActive(adminId, isActive) {
      const { data, error } = await supabase
        .from("admin_users")
        .update({ is_active: Boolean(isActive) })
        .eq("id", adminId)
        .select("id,email,role,full_name,is_active,totp_enabled,last_login_at,created_at")
        .single();
      assertDatabaseResult(error, "Could not update administrator.");
      return serialize(data);
    },

    async resetPassword(adminId) {
      const password = tempPassword();
      const passwordHash = await bcrypt.hash(password, 12);
      const { data, error } = await supabase
        .from("admin_users")
        .update({
          password_hash: passwordHash,
          failed_login_attempts: 0,
          lock_until: null,
          totp_enabled: false,
          totp_secret_encrypted: ""
        })
        .eq("id", adminId)
        .select("id,email,role,full_name,is_active,totp_enabled,last_login_at,created_at")
        .single();
      assertDatabaseResult(error, "Could not reset password.");
      return { admin: serialize(data), temporaryPassword: password };
    }
  };
}
