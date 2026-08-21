import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/http.js";

function cookieOptions(config) {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    path: "/",
    maxAge: 8 * 60 * 60 * 1000
  };
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createCvSessionManager(config) {
  const cookieName = config.cvAdminCookieName || "rapido_cv_admin_session";
  const audience = "rapido-cv-admin";
  const issuer = "rapido-solutions-api";

  function issue(res, admin, { pending2fa = false } = {}) {
    const csrfToken = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: admin.role,
        fullName: admin.fullName || admin.full_name || "",
        csrf: csrfToken,
        pending2fa: Boolean(pending2fa)
      },
      config.jwtSecret,
      { expiresIn: pending2fa ? "10m" : config.jwtExpiresIn, issuer, audience }
    );
    res.cookie(cookieName, token, cookieOptions(config));
    return csrfToken;
  }

  function clear(res) {
    const { maxAge, ...options } = cookieOptions(config);
    res.clearCookie(cookieName, options);
  }

  function read(req) {
    const token = req.cookies?.[cookieName];
    if (!token) return null;
    try {
      return jwt.verify(token, config.jwtSecret, { issuer, audience });
    } catch {
      return null;
    }
  }

  function requireAuth(req, res, next) {
    const admin = read(req);
    if (!admin || admin.pending2fa) {
      clear(res);
      next(new AppError(401, "CV administrator login required.", "CV_AUTH_REQUIRED"));
      return;
    }
    req.cvAdmin = admin;
    next();
  }

  function requirePending2fa(req, res, next) {
    const admin = read(req);
    if (!admin?.pending2fa) {
      next(new AppError(401, "Complete password login before 2FA.", "CV_2FA_REQUIRED"));
      return;
    }
    req.cvAdmin = admin;
    next();
  }

  function requireRole(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.cvAdmin?.role)) {
        next(new AppError(403, "You do not have permission for this action.", "CV_FORBIDDEN"));
        return;
      }
      next();
    };
  }

  function requireCsrf(req, res, next) {
    if (!safeEqual(req.get("X-CSRF-Token"), req.cvAdmin?.csrf)) {
      next(new AppError(403, "Invalid security token.", "CSRF_INVALID"));
      return;
    }
    next();
  }

  return { issue, clear, read, requireAuth, requirePending2fa, requireRole, requireCsrf, cookieName };
}
