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

export function createSessionManager(config) {
  function issue(res, admin) {
    const csrfToken = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign(
      { sub: admin.id, email: admin.email, csrf: csrfToken },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn, issuer: "rapido-solutions-api", audience: "rapido-admin" }
    );
    res.cookie(config.cookieName, token, cookieOptions(config));
    return csrfToken;
  }

  function clear(res) {
    const { maxAge, ...options } = cookieOptions(config);
    res.clearCookie(config.cookieName, options);
  }

  function requireAuth(req, res, next) {
    const token = req.cookies?.[config.cookieName];
    if (!token) {
      next(new AppError(401, "Administrator login required.", "AUTH_REQUIRED"));
      return;
    }

    try {
      req.admin = jwt.verify(token, config.jwtSecret, {
        issuer: "rapido-solutions-api",
        audience: "rapido-admin"
      });
      next();
    } catch {
      clear(res);
      next(new AppError(401, "Your session has expired. Please log in again.", "SESSION_EXPIRED"));
    }
  }

  function requireCsrf(req, res, next) {
    if (!safeEqual(req.get("X-CSRF-Token"), req.admin?.csrf)) {
      next(new AppError(403, "Invalid security token.", "CSRF_INVALID"));
      return;
    }
    next();
  }

  return { issue, clear, requireAuth, requireCsrf };
}
