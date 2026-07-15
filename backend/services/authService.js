import bcrypt from "bcryptjs";
import { AppError } from "../utils/http.js";
import { assertDatabaseResult } from "../utils/database.js";

const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7K.nY1aQzNHVPlQOVGP6xOq0JGM0D5e";
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const adminColumns = "id,email,password_hash,failed_login_attempts,lock_until,last_login_at,created_at,updated_at";

export function createAuthService({ supabase, config }) {
  return {
    async bootstrapAdmin() {
      const { data: existing, error: findError } = await supabase
        .from("admins")
        .select(adminColumns)
        .eq("email", config.adminEmail)
        .maybeSingle();
      assertDatabaseResult(findError, "Administrator lookup failed.");
      if (existing) return { id: existing.id, email: existing.email };

      if (!config.adminPassword) {
        if (config.isProduction) {
          throw new Error("No administrator exists. Set ADMIN_PASSWORD for the first deployment, then remove it after startup.");
        }
        console.warn("Admin login is disabled until ADMIN_PASSWORD is set in backend/.env.");
        return null;
      }

      if (config.adminPassword.length < 12) throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
      const passwordHash = await bcrypt.hash(config.adminPassword, 12);
      const { data, error } = await supabase
        .from("admins")
        .insert({ email: config.adminEmail, password_hash: passwordHash })
        .select("id,email")
        .single();
      assertDatabaseResult(error, "Administrator creation failed.");
      return data;
    },

    async authenticate(email, password) {
      const { data: admin, error } = await supabase
        .from("admins")
        .select(adminColumns)
        .eq("email", email)
        .maybeSingle();
      assertDatabaseResult(error, "Administrator lookup failed.");

      if (!admin) {
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
        const { error: updateError } = await supabase
          .from("admins")
          .update({
            failed_login_attempts: locked ? 0 : failedAttempts,
            lock_until: locked ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null
          })
          .eq("id", admin.id);
        assertDatabaseResult(updateError, "Administrator security state could not be updated.");
        throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
      }

      const { error: updateError } = await supabase
        .from("admins")
        .update({ failed_login_attempts: 0, lock_until: null, last_login_at: new Date().toISOString() })
        .eq("id", admin.id);
      assertDatabaseResult(updateError, "Administrator login state could not be updated.");
      return { id: admin.id, email: admin.email };
    },

    async changePassword(adminId, currentPassword, newPassword) {
      const { data: admin, error } = await supabase
        .from("admins")
        .select("id,password_hash")
        .eq("id", adminId)
        .maybeSingle();
      assertDatabaseResult(error, "Administrator lookup failed.");

      if (!admin || !(await bcrypt.compare(currentPassword, admin.password_hash))) {
        throw new AppError(401, "The current password is incorrect.", "INVALID_CURRENT_PASSWORD");
      }
      if (newPassword.length < 12) {
        throw new AppError(400, "The new password must contain at least 12 characters.", "WEAK_PASSWORD");
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      const { error: updateError } = await supabase
        .from("admins")
        .update({ password_hash: passwordHash, failed_login_attempts: 0, lock_until: null })
        .eq("id", admin.id);
      assertDatabaseResult(updateError, "Administrator password could not be updated.");
    }
  };
}
