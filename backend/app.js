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
  reviewSchema,
  reviewStatusSchema,
  reviewFeaturedSchema,
  reviewDeleteSchema,
  projectSchema,
  projectStatusSchema,
  projectDeleteSchema,
  exportResumeSchema,
  generateResumeSchema,
  rebuildResumeSchema,
  sampleResumeSchema,
  validateBody
} from "./middleware/validation.js";
import { AppError, asyncHandler } from "./utils/http.js";
import { sampleResumeText } from "./services/resumeService.js";

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
  reviewService,
  projectService,
  resumeService,
  uploadService,
  databaseStatus
}) {
  const app = express();
  const session = createSessionManager(config);
  const requireProjectAuthorization = asyncHandler(async (req, res, next) => {
    await authService.assertProjectAccess(req.admin.sub);
    next();
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 1 },
    fileFilter: (req, file, callback) => {
      callback(imageTypes.has(file.mimetype) ? null : new AppError(400, "Use a JPG, PNG, or WebP image.", "INVALID_FILE_TYPE"), imageTypes.has(file.mimetype));
    }
  });
  const resumeUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxResumeBytes, files: 1 },
    fileFilter: (req, file, callback) => {
      const isPdf = file.mimetype === "application/pdf";
      callback(isPdf ? null : new AppError(400, "Upload a PDF resume.", "INVALID_FILE_TYPE"), isPdf);
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
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (config.frontendOrigins.includes(normalizedOrigin)) return callback(null, true);
      return callback(null, false);
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

  app.get("/api/projects", asyncHandler(async (req, res) => {
    res.json({ projects: await projectService.listPublic() });
  }));
  app.get("/api/projects/:slug", asyncHandler(async (req, res) => {
    res.json({ project: await projectService.getPublic(req.params.slug) });
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

  app.get("/api/reviews", asyncHandler(async (req, res) => {
    res.json({ reviews: await reviewService.listPublic({ limit: req.query.limit, featuredOnly: req.query.featured === "true" }) });
  }));
  app.post(
    "/api/reviews",
    limiter(60 * 60 * 1000, 3, "Too many review submissions. Please try again later."),
    validateBody(reviewSchema),
    asyncHandler(async (req, res) => {
      const review = await reviewService.create(req.validatedBody, req.get("user-agent") || "");
      res.status(201).json({
        message: "Thank you. Your review was submitted successfully.",
        reference: review.id
      });
    })
  );

  app.post(
    "/api/resume/analyze",
    limiter(60 * 60 * 1000, 10, "Resume analysis limit reached. Please try again later."),
    resumeUpload.single("resume"),
    validateBody(sampleResumeSchema),
    asyncHandler(async (req, res) => {
      res.json(await resumeService.analyzePdf(req.file, req.validatedBody));
    })
  );
  app.post(
    "/api/resume/analyze/sample",
    limiter(60 * 60 * 1000, 10, "Resume analysis limit reached. Please try again later."),
    validateBody(sampleResumeSchema),
    asyncHandler(async (req, res) => {
      res.json(await resumeService.analyzeText(sampleResumeText, req.validatedBody));
    })
  );
  app.post(
    "/api/resume/rebuild",
    limiter(60 * 60 * 1000, 6, "Resume rebuild limit reached. Please try again later."),
    validateBody(rebuildResumeSchema),
    asyncHandler(async (req, res) => {
      res.json(await resumeService.rebuild(req.validatedBody));
    })
  );
  app.post(
    "/api/resume/generate",
    limiter(60 * 60 * 1000, 6, "Resume generation limit reached. Please try again later."),
    validateBody(generateResumeSchema),
    asyncHandler(async (req, res) => {
      res.json(await resumeService.generate(req.validatedBody));
    })
  );
  app.post(
    "/api/resume/export/pdf",
    limiter(60 * 60 * 1000, 30, "Resume export limit reached. Please try again later."),
    validateBody(exportResumeSchema),
    asyncHandler(async (req, res) => {
      const safeName = (req.validatedBody.fileName || "ats-resume").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "ats-resume";
      const pdf = await resumeService.exportPdf(req.validatedBody.markdown);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Content-Length": String(pdf.length)
      });
      res.send(pdf);
    })
  );

  app.post(
    "/api/auth/login",
    limiter(15 * 60 * 1000, 10, "Too many login attempts. Please try again later."),
    validateBody(loginSchema),
    asyncHandler(async (req, res) => {
      const admin = await authService.authenticate(req.validatedBody.email, req.validatedBody.password);
      const csrfToken = session.issue(res, admin);
      res.json({ admin: { email: admin.email, canManageProjects: admin.canManageProjects }, csrfToken });
    })
  );
  app.get("/api/auth/session", session.requireAuth, (req, res) => {
    res.json({ admin: { email: req.admin.email, canManageProjects: Boolean(req.admin.canManageProjects) }, csrfToken: req.admin.csrf });
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
  app.get("/api/admin/reviews", asyncHandler(async (req, res) => {
    res.json(await reviewService.listAdmin(req.query));
  }));
  app.patch("/api/admin/reviews/:id", session.requireCsrf, validateBody(reviewStatusSchema), asyncHandler(async (req, res) => {
    res.json({ review: await reviewService.updateStatus(req.params.id, req.validatedBody.status) });
  }));
  app.patch("/api/admin/reviews/:id/featured", session.requireCsrf, validateBody(reviewFeaturedSchema), asyncHandler(async (req, res) => {
    res.json({ review: await reviewService.updateFeatured(req.params.id, req.validatedBody.featured) });
  }));
  app.delete(
    "/api/admin/reviews/:id",
    session.requireCsrf,
    limiter(60 * 60 * 1000, 20, "Review deletion limit reached. Please try again later."),
    validateBody(reviewDeleteSchema),
    asyncHandler(async (req, res) => {
      await reviewService.remove(req.params.id, req.validatedBody.confirmationName);
      res.status(204).end();
    })
  );
  app.get("/api/admin/projects", session.requireProjectAdmin, requireProjectAuthorization, asyncHandler(async (req, res) => {
    res.json({ projects: await projectService.listAdmin() });
  }));
  app.get("/api/admin/projects/:id", session.requireProjectAdmin, requireProjectAuthorization, asyncHandler(async (req, res) => {
    res.json({ project: await projectService.getAdmin(req.params.id) });
  }));
  app.post("/api/admin/projects", session.requireProjectAdmin, requireProjectAuthorization, session.requireCsrf, validateBody(projectSchema), asyncHandler(async (req, res) => {
    res.status(201).json({ project: await projectService.create(req.validatedBody) });
  }));
  app.put("/api/admin/projects/:id", session.requireProjectAdmin, requireProjectAuthorization, session.requireCsrf, validateBody(projectSchema), asyncHandler(async (req, res) => {
    res.json({ project: await projectService.update(req.params.id, req.validatedBody) });
  }));
  app.patch("/api/admin/projects/:id/status", session.requireProjectAdmin, requireProjectAuthorization, session.requireCsrf, validateBody(projectStatusSchema), asyncHandler(async (req, res) => {
    res.json({ project: await projectService.updateStatus(req.params.id, req.validatedBody.status) });
  }));
  app.delete("/api/admin/projects/:id", session.requireProjectAdmin, requireProjectAuthorization, session.requireCsrf, asyncHandler(async (req, res) => {
    res.json({ project: await projectService.archive(req.params.id) });
  }));
  app.delete(
    "/api/admin/projects/:id/permanent",
    session.requireProjectAdmin,
    requireProjectAuthorization,
    session.requireCsrf,
    limiter(60 * 60 * 1000, 10, "Project deletion limit reached. Please try again later."),
    validateBody(projectDeleteSchema),
    asyncHandler(async (req, res) => {
      await projectService.remove(req.params.id, req.validatedBody.confirmationTitle);
      res.status(204).end();
    })
  );
  app.post(
    "/api/admin/uploads/project-image",
    limiter(60 * 60 * 1000, 30, "Upload limit reached. Please try again later."),
    session.requireProjectAdmin,
    requireProjectAuthorization,
    session.requireCsrf,
    upload.single("image"),
    asyncHandler(async (req, res) => {
      if (!req.file) throw new AppError(400, "Choose an image to upload.", "IMAGE_REQUIRED");
      res.status(201).json({ asset: await uploadService.upload(req.file, { folder: "rapido/projects" }) });
    })
  );

  app.use((req, res, next) => next(new AppError(404, "Endpoint not found.", "NOT_FOUND")));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    let status = error.status || 500;
    let code = error.code || "INTERNAL_ERROR";
    let message = error.message || "Something went wrong.";

    if (error instanceof multer.MulterError) {
      status = 400;
      code = error.code;
      message = error.code === "LIMIT_FILE_SIZE" ? "The uploaded file must be 5 MB or smaller." : error.message;
    } else if (status >= 500 && config.isProduction && code !== "AI_NOT_CONFIGURED") {
      message = "An unexpected server error occurred.";
    }

    if (status >= 500) console.error(`[${req.id}]`, error);
    res.status(status).json({ error: message, code, requestId: req.id });
  });

  return app;
}
