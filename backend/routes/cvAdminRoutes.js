import { z } from "zod";
import { AppError, asyncHandler } from "../utils/http.js";
import { createCvSessionManager } from "../middleware/cvAdminAuth.js";
import { validateBody } from "../middleware/validation.js";

const shortText = (max) => z.string().trim().min(1).max(max);
const optionalText = (max) => z.string().trim().max(max).optional().default("");

export const cvLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(10).max(200)
});

export const totpSchema = z.object({
  token: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code.")
});

export const createCvAdminSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  fullName: shortText(160),
  role: z.enum(["admin", "super_admin"]).default("admin")
});

export const cvManualSchema = z.object({
  fullName: shortText(160),
  email: optionalText(254),
  phone: optionalText(50),
  designation: optionalText(160),
  category: optionalText(80).default("General"),
  cvScore: z.union([z.number(), z.string(), z.null()]).optional(),
  geminiSummary: optionalText(8000),
  status: z.enum(["new", "shortlisted", "hired", "rejected"]).optional().default("new"),
  cvUrl: z.string().url().max(2000).optional().nullable()
});

export const cvStatusSchema = z.object({
  status: z.enum(["new", "shortlisted", "hired", "rejected"])
});

export const emailSendSchema = z.object({
  to: z.string().trim().email().max(254).optional(),
  subject: shortText(300),
  message: shortText(10000)
});

export const whatsappLogSchema = z.object({
  message: shortText(10000)
});

export const whatsappSendSchema = z.object({
  phone: shortText(40),
  message: shortText(10000),
  cvId: z.string().uuid().optional().nullable()
});

export const brandingSchema = z.object({
  collegeName: optionalText(200),
  address: optionalText(1000),
  footerText: optionalText(1000),
  primaryColor: optionalText(20),
  secondaryColor: optionalText(20),
  logoUrl: optionalText(2000),
  logoPublicId: optionalText(500),
  signatureImageUrl: optionalText(2000),
  signaturePublicId: optionalText(500)
});

export const templateUpdateSchema = z.object({
  title: shortText(160),
  bodyHtml: shortText(200000)
});

export const documentPreviewSchema = z.object({
  templateId: z.string().uuid().optional(),
  templateType: z
    .enum(["appointment_letter", "internship_certificate", "experience_letter", "explanation_letter"])
    .optional(),
  cvId: z.string().uuid().optional().nullable(),
  custom: z
    .object({
      fullName: optionalText(160),
      email: optionalText(254),
      phone: optionalText(50),
      designation: optionalText(160),
      department: optionalText(160),
      category: optionalText(80),
      date: optionalText(40),
      joiningDate: optionalText(40),
      salary: optionalText(120),
      conditions: optionalText(20000)
    })
    .optional()
    .default({}),
  conditions: optionalText(20000).optional()
});

export const documentSaveSchema = z.object({
  cvId: z.string().uuid().optional().nullable(),
  templateId: z.string().uuid().optional().nullable(),
  templateType: optionalText(80),
  finalContentHtml: shortText(200000)
});

export function registerCvAdminRoutes(app, {
  config,
  cvAdminAuthService,
  cvService,
  cvDocumentService,
  uploadService,
  limiter,
  imageUpload,
  pdfUpload,
  whatsappService
}) {
  const session = createCvSessionManager(config);
  const auth = session.requireAuth;
  const csrf = session.requireCsrf;
  const superAdmin = session.requireRole("super_admin");

  app.post(
    "/api/cv-admin/auth/login",
    limiter(15 * 60 * 1000, 10, "Too many login attempts. Please try again later."),
    validateBody(cvLoginSchema),
    asyncHandler(async (req, res) => {
      const admin = await cvAdminAuthService.authenticate(req.validatedBody.email, req.validatedBody.password);
      if (admin.totpEnabled) {
        const csrfToken = session.issue(res, admin, { pending2fa: true });
        res.json({ requires2fa: true, csrfToken, admin: { email: admin.email } });
        return;
      }
      const full = await cvAdminAuthService.completeLogin(admin.id);
      const csrfToken = session.issue(res, full, { pending2fa: false });
      res.json({
        requires2fa: false,
        requires2faSetup: !full.totpEnabled,
        csrfToken,
        admin: { id: full.id, email: full.email, role: full.role, fullName: full.fullName, totpEnabled: full.totpEnabled }
      });
    })
  );

  app.post(
    "/api/cv-admin/auth/verify-2fa",
    limiter(15 * 60 * 1000, 20, "Too many 2FA attempts. Please try again later."),
    session.requirePending2fa,
    validateBody(totpSchema),
    asyncHandler(async (req, res) => {
      await cvAdminAuthService.verifyTotp(req.cvAdmin.sub, req.validatedBody.token);
      const full = await cvAdminAuthService.completeLogin(req.cvAdmin.sub);
      const csrfToken = session.issue(res, full, { pending2fa: false });
      res.json({
        csrfToken,
        admin: { id: full.id, email: full.email, role: full.role, fullName: full.fullName, totpEnabled: full.totpEnabled }
      });
    })
  );

  app.get("/api/cv-admin/auth/session", auth, (req, res) => {
    res.json({
      admin: {
        id: req.cvAdmin.sub,
        email: req.cvAdmin.email,
        role: req.cvAdmin.role,
        fullName: req.cvAdmin.fullName,
        totpEnabled: true
      },
      csrfToken: req.cvAdmin.csrf
    });
  });

  app.post("/api/cv-admin/auth/logout", auth, csrf, (req, res) => {
    session.clear(res);
    res.status(204).end();
  });

  app.post(
    "/api/cv-admin/auth/2fa/setup",
    auth,
    csrf,
    asyncHandler(async (req, res) => {
      res.json(await cvAdminAuthService.setupTotp(req.cvAdmin.sub));
    })
  );

  app.post(
    "/api/cv-admin/auth/2fa/confirm",
    auth,
    csrf,
    validateBody(totpSchema),
    asyncHandler(async (req, res) => {
      const admin = await cvAdminAuthService.confirmTotp(req.cvAdmin.sub, req.validatedBody.token);
      res.json({ admin });
    })
  );

  app.get(
    "/api/cv-admin/cvs",
    auth,
    asyncHandler(async (req, res) => {
      res.json(await cvService.list(req.query));
    })
  );

  app.get(
    "/api/cv-admin/cvs/:id",
    auth,
    asyncHandler(async (req, res) => {
      res.json({
        cv: await cvService.get(req.params.id),
        communications: await cvDocumentService.listCommunications(req.params.id),
        documents: await cvDocumentService.listGenerated(req.params.id)
      });
    })
  );

  app.post(
    "/api/cv-admin/cvs",
    auth,
    csrf,
    validateBody(cvManualSchema),
    asyncHandler(async (req, res) => {
      res.status(201).json({ cv: await cvService.createManual(req.validatedBody) });
    })
  );

  app.patch(
    "/api/cv-admin/cvs/:id/status",
    auth,
    csrf,
    validateBody(cvStatusSchema),
    asyncHandler(async (req, res) => {
      res.json({ cv: await cvService.updateStatus(req.params.id, req.validatedBody.status) });
    })
  );

  app.patch(
    "/api/cv-admin/cvs/:id",
    auth,
    csrf,
    validateBody(cvManualSchema.partial()),
    asyncHandler(async (req, res) => {
      res.json({ cv: await cvService.update(req.params.id, req.validatedBody) });
    })
  );

  app.post(
    "/api/cv-admin/cvs/:id/email",
    auth,
    csrf,
    validateBody(emailSendSchema),
    asyncHandler(async (req, res) => {
      const cv = await cvService.get(req.params.id);
      const to = req.validatedBody.to || cv.email;
      if (!to) throw new AppError(400, "This CV has no email address.", "EMAIL_REQUIRED");
      const log = await cvDocumentService.sendEmail(
        {
          cvId: cv.id,
          to,
          subject: req.validatedBody.subject,
          message: req.validatedBody.message
        },
        req.cvAdmin.sub
      );
      res.status(201).json({ communication: log });
    })
  );

  app.post(
    "/api/cv-admin/cvs/:id/whatsapp-log",
    auth,
    csrf,
    validateBody(whatsappLogSchema),
    asyncHandler(async (req, res) => {
      const log = await cvDocumentService.logWhatsApp(
        { cvId: req.params.id, message: req.validatedBody.message },
        req.cvAdmin.sub
      );
      res.status(201).json({ communication: log });
    })
  );

  app.get(
    "/api/cv-admin/branding",
    auth,
    asyncHandler(async (req, res) => {
      res.json({ branding: await cvDocumentService.getBranding() });
    })
  );

  app.put(
    "/api/cv-admin/branding",
    auth,
    csrf,
    superAdmin,
    validateBody(brandingSchema),
    asyncHandler(async (req, res) => {
      res.json({ branding: await cvDocumentService.updateBranding(req.validatedBody, req.cvAdmin.sub) });
    })
  );

  app.post(
    "/api/cv-admin/uploads/branding",
    auth,
    csrf,
    superAdmin,
    limiter(60 * 60 * 1000, 30, "Upload limit reached. Please try again later."),
    imageUpload.single("image"),
    asyncHandler(async (req, res) => {
      if (!req.file) throw new AppError(400, "Choose an image to upload.", "IMAGE_REQUIRED");
      const asset = await uploadService.upload(req.file);
      res.status(201).json({ asset });
    })
  );

  app.get(
    "/api/cv-admin/templates",
    auth,
    asyncHandler(async (req, res) => {
      res.json({ templates: await cvDocumentService.listTemplates() });
    })
  );

  app.put(
    "/api/cv-admin/templates/:id",
    auth,
    csrf,
    superAdmin,
    validateBody(templateUpdateSchema),
    asyncHandler(async (req, res) => {
      res.json({
        template: await cvDocumentService.updateTemplate(req.params.id, req.validatedBody, req.cvAdmin.sub)
      });
    })
  );

  app.post(
    "/api/cv-admin/documents/preview",
    auth,
    csrf,
    validateBody(documentPreviewSchema),
    asyncHandler(async (req, res) => {
      const cv = req.validatedBody.cvId ? await cvService.get(req.validatedBody.cvId) : null;
      const preview = await cvDocumentService.previewDocument({
        templateId: req.validatedBody.templateId,
        templateType: req.validatedBody.templateType,
        cv,
        custom: req.validatedBody.custom,
        conditions: req.validatedBody.conditions
      });
      res.json(preview);
    })
  );

  app.post(
    "/api/cv-admin/documents/generate",
    auth,
    csrf,
    pdfUpload.single("pdf"),
    asyncHandler(async (req, res) => {
      const body = {
        cvId: req.body.cvId || null,
        templateId: req.body.templateId || null,
        templateType: req.body.templateType || "",
        finalContentHtml: req.body.finalContentHtml || ""
      };
      const parsed = documentSaveSchema.safeParse(body);
      if (!parsed.success) {
        throw new AppError(400, parsed.error.issues?.[0]?.message || "Invalid document payload.", "VALIDATION_ERROR");
      }
      const pdfBuffer = req.file?.buffer || null;
      const doc = await cvDocumentService.saveGenerated(
        {
          ...parsed.data,
          pdfBuffer,
          fileName: req.file?.originalname
        },
        req.cvAdmin.sub
      );
      res.status(201).json({ document: doc });
    })
  );

  app.get(
    "/api/cv-admin/admins",
    auth,
    superAdmin,
    asyncHandler(async (req, res) => {
      res.json({ admins: await cvAdminAuthService.listAdmins() });
    })
  );

  app.post(
    "/api/cv-admin/admins",
    auth,
    csrf,
    superAdmin,
    validateBody(createCvAdminSchema),
    asyncHandler(async (req, res) => {
      const result = await cvAdminAuthService.createAdmin(req.validatedBody, req.cvAdmin.sub);
      res.status(201).json(result);
    })
  );

  app.patch(
    "/api/cv-admin/admins/:id/active",
    auth,
    csrf,
    superAdmin,
    validateBody(z.object({ isActive: z.boolean() })),
    asyncHandler(async (req, res) => {
      res.json({ admin: await cvAdminAuthService.setActive(req.params.id, req.validatedBody.isActive) });
    })
  );

  app.post(
    "/api/cv-admin/admins/:id/reset-password",
    auth,
    csrf,
    superAdmin,
    asyncHandler(async (req, res) => {
      res.json(await cvAdminAuthService.resetPassword(req.params.id));
    })
  );

  if (whatsappService) {
    app.get(
      "/api/cv-admin/whatsapp/status",
      auth,
      asyncHandler(async (req, res) => {
        res.json(whatsappService.getStatus());
      })
    );

    app.post(
      "/api/cv-admin/whatsapp/connect",
      auth,
      csrf,
      limiter(15 * 60 * 1000, 30, "Too many WhatsApp connect attempts."),
      asyncHandler(async (req, res) => {
        res.json(await whatsappService.start());
      })
    );

    app.post(
      "/api/cv-admin/whatsapp/disconnect",
      auth,
      csrf,
      asyncHandler(async (req, res) => {
        res.json(await whatsappService.disconnect({ logout: true }));
      })
    );

    app.post(
      "/api/cv-admin/whatsapp/send",
      auth,
      csrf,
      limiter(60 * 60 * 1000, 120, "WhatsApp send limit reached. Try again later."),
      validateBody(whatsappSendSchema),
      asyncHandler(async (req, res) => {
        const entry = await whatsappService.sendMessage({
          phone: req.validatedBody.phone,
          message: req.validatedBody.message,
          cvId: req.validatedBody.cvId,
          sentBy: req.cvAdmin.sub
        });
        res.status(201).json({ message: entry, status: whatsappService.getStatus() });
      })
    );
  }

  return session;
}
