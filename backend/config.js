import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, ".env"), quiet: true });
dotenv.config({ path: path.join(__dirname, "../.env"), quiet: true });

function list(value, fallback = []) {
  return value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : fallback;
}

function boolean(value, fallback) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
}

export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";
  const frontendOrigins = list(env.FRONTEND_URLS || env.FRONTEND_URL, ["http://localhost:5173"]);
  const cookieSameSite = env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax");

  const config = {
    nodeEnv,
    isProduction,
    port: Number(env.PORT || 4174),
    mongoUri: env.MONGODB_URI || "mongodb://127.0.0.1:27017/rapido",
    jwtSecret: env.JWT_SECRET || "development-only-secret-change-before-deploying",
    jwtExpiresIn: env.JWT_EXPIRES_IN || "8h",
    cookieName: env.COOKIE_NAME || "rapido_admin_session",
    cookieSecure: boolean(env.COOKIE_SECURE, isProduction),
    cookieSameSite,
    frontendOrigins,
    trustProxy: boolean(env.TRUST_PROXY, isProduction),
    adminEmail: String(env.ADMIN_EMAIL || "rapidosolutionsco@outlook.com").toLowerCase(),
    adminPassword: env.ADMIN_PASSWORD || "",
    contactRecipientEmail: String(env.CONTACT_RECIPIENT_EMAIL || "rapidosolutionsco@outlook.com").toLowerCase(),
    resendApiKey: env.RESEND_API_KEY || "",
    emailFrom: env.EMAIL_FROM || "",
    cloudinaryCloudName: env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: env.CLOUDINARY_API_SECRET || "",
    apiPublicUrl: env.API_PUBLIC_URL || `http://localhost:${Number(env.PORT || 4174)}`,
    uploadDir: path.join(__dirname, "uploads"),
    maxUploadBytes: 5 * 1024 * 1024
  };

  if (!["lax", "strict", "none"].includes(config.cookieSameSite)) {
    throw new Error("COOKIE_SAME_SITE must be lax, strict, or none.");
  }

  if (isProduction) {
    const missing = [];
    if (!env.MONGODB_URI) missing.push("MONGODB_URI");
    if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) missing.push("JWT_SECRET (at least 32 characters)");
    if (!env.FRONTEND_URLS && !env.FRONTEND_URL) missing.push("FRONTEND_URLS");
    if (!env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
    if (!env.EMAIL_FROM) missing.push("EMAIL_FROM");
    if (!env.CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
    if (!env.CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
    if (!env.CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
    if (config.cookieSameSite === "none" && !config.cookieSecure) missing.push("COOKIE_SECURE=true when COOKIE_SAME_SITE=none");
    if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }

  return config;
}

export const config = loadConfig();
