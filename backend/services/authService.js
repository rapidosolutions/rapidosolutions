import bcrypt from "bcryptjs";
import { AppError } from "../utils/http.js";

const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7K.nY1aQzNHVPlQOVGP6xOq0JGM0D5e";
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export function createAuthService({ Admin, config }) {
  return {
    async bootstrapAdmin() {
      const existing = await Admin.findOne({ email: config.adminEmail });
      if (existing) return existing;

      if (!config.adminPassword) {
        if (config.isProduction) {
          throw new Error("No administrator exists. Set ADMIN_PASSWORD for the first deployment, then remove it after startup.");
        }
        console.warn("Admin login is disabled until ADMIN_PASSWORD is set in backend/.env.");
        return null;
      }

      if (config.adminPassword.length < 12) throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
      const passwordHash = await bcrypt.hash(config.adminPassword, 12);
      return Admin.create({ email: config.adminEmail, passwordHash });
    },

    async authenticate(email, password) {
      const admin = await Admin.findOne({ email }).select("+passwordHash");
      if (!admin) {
        await bcrypt.compare(password, DUMMY_HASH);
        throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
      }

      if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
        throw new AppError(429, "Too many failed attempts. Try again later.", "ACCOUNT_LOCKED");
      }

      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) {
        admin.failedLoginAttempts += 1;
        if (admin.failedLoginAttempts >= MAX_ATTEMPTS) {
          admin.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
          admin.failedLoginAttempts = 0;
        }
        await admin.save();
        throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
      }

      admin.failedLoginAttempts = 0;
      admin.lockUntil = null;
      admin.lastLoginAt = new Date();
      await admin.save();
      return { id: String(admin._id), email: admin.email };
    },

    async changePassword(adminId, currentPassword, newPassword) {
      const admin = await Admin.findById(adminId).select("+passwordHash");
      if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
        throw new AppError(401, "The current password is incorrect.", "INVALID_CURRENT_PASSWORD");
      }
      if (newPassword.length < 12) {
        throw new AppError(400, "The new password must contain at least 12 characters.", "WEAK_PASSWORD");
      }
      admin.passwordHash = await bcrypt.hash(newPassword, 12);
      admin.failedLoginAttempts = 0;
      admin.lockUntil = null;
      await admin.save();
    }
  };
}
