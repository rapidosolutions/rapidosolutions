import crypto from "node:crypto";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import multer from "multer";
import { createSessionManager } from "./middleware/auth.js";
import {
  blogSchema,
  contactSchema,
  loginSchema,
  passwordChangeSchema,
  messageStatusSchema,
  validateBody
} from "./middleware/validation.js";
import { AppError, asyncHandler } from "./utils/http.js";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function limiter(windowMs, limit, message) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: message, code: "RATE_LIMITED" }
  });
}

export function createApp({
  config,
  authService,
  blogService,
  contactService,
  uploadService,
  databaseStatus
}) {
  const app = express();
  const session = createSessionManager(config);
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 1 },
    fileFilter: (req, file, callback) => {
      callback(imageTypes.has(file.mimetype) ? null : new AppError(400, "Use a JPG, PNG, or WebP image.", "INVALID_FILE_TYPE"), imageTypes.has(file.mimetype));
    }
  });

  if (config.trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    req.id = req.get("X-Request-Id") || crypto.randomUUID();
    res.set("X-Request-Id", req.id);
    next();
  });
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || config.frontendOrigins.includes(origin)) return callback(null, true);
      return callback(new AppError(403, "This website origin is not allowed.", "ORIGIN_NOT_ALLOWED"));
    }
  }));
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: false, limit: "64kb" }));
  app.use(cookieParser());
  app.use(limiter(15 * 60 * 1000, 300, "Too many requests. Please try again shortly."));

  app.use("/uploads", express.static(config.uploadDir, { maxAge: "7d", immutable: true }));

  app.get("/api/health", (req, res) => {
    const dbReady = databaseStatus();
    res.status(dbReady ? 200 : 503).json({
      status: dbReady ? "ok" : "degraded",
      database: dbReady ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/blogs", asyncHandler(async (req, res) => {
    res.json({ blogs: await blogService.listPublic() });
  }));
  app.get("/api/blogs/:slug", asyncHandler(async (req, res) => {
    res.json({ blog: await blogService.getPublic(req.params.slug) });
  }));

  app.post(
    "/api/contact",
    limiter(60 * 60 * 1000, 5, "Too many contact requests. Please try again later."),
    validateBody(contactSchema),
    asyncHandler(async (req, res) => {
      const message = await contactService.create(req.validatedBody, req.get("user-agent") || "");
      const emailSent = message.notificationEmailStatus === "sent";
      res.status(201).json({
        message: emailSent
          ? "Thank you. Your request has been saved and sent to our team."
          : "Thank you. Your request has been saved. Our email notification is temporarily delayed.",
        reference: message.id,
        emailSent
      });
    })
  );

  app.post(
    "/api/auth/login",
    limiter(15 * 60 * 1000, 10, "Too many login attempts. Please try again later."),
    validateBody(loginSchema),
    asyncHandler(async (req, res) => {
      const admin = await authService.authenticate(req.validatedBody.email, req.validatedBody.password);
      const csrfToken = session.issue(res, admin);
      res.json({ admin: { email: admin.email }, csrfToken });
    })
  );
  app.get("/api/auth/session", session.requireAuth, (req, res) => {
    res.json({ admin: { email: req.admin.email }, csrfToken: req.admin.csrf });
  });
  app.post("/api/auth/logout", session.requireAuth, session.requireCsrf, (req, res) => {
    session.clear(res);
    res.status(204).end();
  });
  app.patch("/api/auth/password", session.requireAuth, session.requireCsrf, validateBody(passwordChangeSchema), asyncHandler(async (req, res) => {
    await authService.changePassword(req.admin.sub, req.validatedBody.currentPassword, req.validatedBody.newPassword);
    session.clear(res);
    res.status(204).end();
  }));

  app.use("/api/admin", session.requireAuth);
  app.get("/api/admin/blogs", asyncHandler(async (req, res) => {
    res.json({ blogs: await blogService.listAdmin() });
  }));
  app.post("/api/admin/blogs", session.requireCsrf, validateBody(blogSchema), asyncHandler(async (req, res) => {
    res.status(201).json({ blog: await blogService.create(req.validatedBody) });
  }));
  app.put("/api/admin/blogs/:id", session.requireCsrf, validateBody(blogSchema), asyncHandler(async (req, res) => {
    res.json({ blog: await blogService.update(req.params.id, req.validatedBody) });
  }));
  app.delete("/api/admin/blogs/:id", session.requireCsrf, asyncHandler(async (req, res) => {
    await blogService.remove(req.params.id);
    res.status(204).end();
  }));
  app.post(
    "/api/admin/uploads/blog-cover",
    limiter(60 * 60 * 1000, 30, "Upload limit reached. Please try again later."),
    session.requireCsrf,
    upload.single("image"),
    asyncHandler(async (req, res) => {
      if (!req.file) throw new AppError(400, "Choose an image to upload.", "IMAGE_REQUIRED");
      res.status(201).json({ asset: await uploadService.upload(req.file) });
    })
  );
  app.get("/api/admin/messages", asyncHandler(async (req, res) => {
    res.json(await contactService.list(req.query));
  }));
  app.patch("/api/admin/messages/:id", session.requireCsrf, validateBody(messageStatusSchema), asyncHandler(async (req, res) => {
    res.json({ message: await contactService.updateStatus(req.params.id, req.validatedBody.status) });
  }));
  app.delete("/api/admin/messages/:id", session.requireCsrf, asyncHandler(async (req, res) => {
    await contactService.remove(req.params.id);
    res.status(204).end();
  }));

  app.use((req, res, next) => next(new AppError(404, "Endpoint not found.", "NOT_FOUND")));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    let status = error.status || 500;
    let code = error.code || "INTERNAL_ERROR";
    let message = error.message || "Something went wrong.";

    if (error instanceof multer.MulterError) {
      status = 400;
      code = error.code;
      message = error.code === "LIMIT_FILE_SIZE" ? "The image must be 5 MB or smaller." : error.message;
    } else if (status >= 500 && config.isProduction) {
      message = "An unexpected server error occurred.";
    }

    if (status >= 500) console.error(`[${req.id}]`, error);
    res.status(status).json({ error: message, code, requestId: req.id });
  });

  return app;
}
