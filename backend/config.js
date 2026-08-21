import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, ".env"), quiet: true });
dotenv.config({ path: path.join(__dirname, "../.env"), quiet: true });

function cleanOrigin(item) {
  return String(item || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/$/, "");
}

function list(value, fallback = []) {
  if (!value) return fallback.map(cleanOrigin).filter(Boolean);
  return value
    .split(",")
    .map(cleanOrigin)
    .filter(Boolean);
}

function boolean(value, fallback) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
}

const DEFAULT_FRONTEND_ORIGINS = [
  "https://rapidosolutions.vercel.app",
  "https://rapido-co.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000"
];

export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";
  const rawOrigins = env.FRONTEND_URLS || env.FRONTEND_URL || env.ALLOWED_ORIGINS || env.CORS_ORIGIN || env.CLIENT_URL;
  const configuredOrigins = list(rawOrigins, []);
  
  // Merge configured origins with default fallback origins to ensure production domains always work
  const frontendOrigins = Array.from(new Set([...configuredOrigins, ...DEFAULT_FRONTEND_ORIGINS]));
  const cookieSameSite = env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax");

  let jwtSecret = env.JWT_SECRET || "development-only-secret-change-before-deploying";
  if (isProduction && jwtSecret.length < 32) {
    console.warn("[Config Warning] JWT_SECRET is shorter than 32 characters; appending fallback padding for session security.");
    jwtSecret = jwtSecret.padEnd(32, "_rapido_secure_fallback_jwt_key_");
  }

  const config = {
    nodeEnv,
    isProduction,
    port: Number(env.PORT) || 4174,
    supabaseUrl: cleanOrigin(env.SUPABASE_URL || ""),
    supabaseServiceRoleKey: cleanOrigin(env.SUPABASE_SERVICE_ROLE_KEY || ""),
    jwtSecret,
    jwtExpiresIn: env.JWT_EXPIRES_IN || "8h",
    cookieName: env.COOKIE_NAME || "rapido_admin_session",
    cvAdminCookieName: env.CV_ADMIN_COOKIE_NAME || "rapido_cv_admin_session",
    cookieSecure: boolean(env.COOKIE_SECURE, isProduction),
    cookieSameSite,
    frontendOrigins,
    trustProxy: boolean(env.TRUST_PROXY, isProduction),
    adminEmail: String(env.ADMIN_EMAIL || "rapidosolutionsco@outlook.com").toLowerCase(),
    adminPassword: env.ADMIN_PASSWORD || "",
    cvAdminEmail: String(env.CV_ADMIN_EMAIL || env.ADMIN_EMAIL || "rapidosolutionsco@outlook.com").toLowerCase(),
    cvAdminPassword: env.CV_ADMIN_PASSWORD || "",
    contactRecipientEmail: String(env.CONTACT_RECIPIENT_EMAIL || "rapidosolutionsco@outlook.com").toLowerCase(),
    resendApiKey: cleanOrigin(env.RESEND_API_KEY || ""),
    emailFrom: cleanOrigin(env.EMAIL_FROM || ""),
    cloudinaryCloudName: cleanOrigin(env.CLOUDINARY_CLOUD_NAME || ""),
    cloudinaryApiKey: cleanOrigin(env.CLOUDINARY_API_KEY || ""),
    cloudinaryApiSecret: cleanOrigin(env.CLOUDINARY_API_SECRET || ""),
    geminiApiKey: cleanOrigin(env.GEMINI_API_KEY || ""),
    geminiModel: env.GEMINI_MODEL || "gemini-flash-latest",
    apiPublicUrl: cleanOrigin(env.API_PUBLIC_URL || `http://localhost:${Number(env.PORT || 4174)}`),
    uploadDir: path.join(__dirname, "uploads"),
    maxUploadBytes: 5 * 1024 * 1024,
    maxResumeBytes: 5 * 1024 * 1024,
    whatsappAuthDir: cleanOrigin(env.WHATSAPP_AUTH_DIR || "") || path.join(__dirname, "data/whatsapp-auth")
  };

  if (!["lax", "strict", "none"].includes(config.cookieSameSite)) {
    throw new Error("COOKIE_SAME_SITE must be lax, strict, or none.");
  }

  if (isProduction) {
    const warnings = [];
    if (!config.supabaseUrl) warnings.push("SUPABASE_URL");
    if (!config.supabaseServiceRoleKey) warnings.push("SUPABASE_SERVICE_ROLE_KEY");
    if (!config.resendApiKey) warnings.push("RESEND_API_KEY");
    if (!config.emailFrom) warnings.push("EMAIL_FROM");
    if (!config.geminiApiKey) warnings.push("GEMINI_API_KEY");
    if (warnings.length) {
      console.warn(`[Config Warning] The following environment variables are missing in production: ${warnings.join(", ")}. Services requiring them will operate in degraded/fallback mode.`);
    }
  }

  return config;
}

export const config = loadConfig();
