import http from "node:http";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { connectDatabase, databaseStatus, disconnectDatabase } from "./db.js";
import { createAuthService } from "./services/authService.js";
import { createBlogService } from "./services/blogService.js";
import { createContactService } from "./services/contactService.js";
import { createEmailService } from "./services/emailService.js";
import { createUploadService } from "./services/uploadService.js";
import { createReviewService } from "./services/reviewService.js";
import { createResumeService } from "./services/resumeService.js";
import { createProjectService } from "./services/projectService.js";
import { createCvAdminAuthService } from "./services/cvAdminAuthService.js";
import { createCvService } from "./services/cvService.js";
import { createCvDocumentService } from "./services/cvDocumentService.js";
import { createWhatsAppService } from "./services/whatsappService.js";

async function start() {
  const supabase = await connectDatabase(config);

  const uploadService = createUploadService(config);
  const authService = createAuthService({ supabase, config });
  const blogService = createBlogService({ supabase, uploadService });
  const emailService = createEmailService(config);
  const contactService = createContactService({ supabase, emailService });
  const reviewService = createReviewService({ supabase, emailService });
  const resumeService = createResumeService(config);
  const projectService = createProjectService({ supabase, uploadService });
  const cvAdminAuthService = createCvAdminAuthService({ supabase, config, emailService });
  const cvService = createCvService({ supabase, uploadService });
  const cvDocumentService = createCvDocumentService({ supabase, uploadService, emailService });
  const whatsappService = createWhatsAppService({ config, cvDocumentService });

  if (supabase && databaseStatus()) {
    await authService.bootstrapAdmin().catch((err) => console.warn("[Admin Bootstrap Warning]", err.message));
    await blogService.seed().catch((err) => console.warn("[Blog Seed Warning]", err.message));
    await cvAdminAuthService
      .bootstrapSuperAdmin()
      .catch((err) => console.warn("[CV Admin Bootstrap Warning]", err.message));
  }

  const app = createApp({
    config,
    authService,
    blogService,
    contactService,
    reviewService,
    resumeService,
    projectService,
    uploadService,
    databaseStatus,
    cvAdminAuthService,
    cvService,
    cvDocumentService,
    whatsappService
  });
  const server = http.createServer(app);
  const host = process.env.HOST || "0.0.0.0";
  server.listen(config.port, host, () => console.log(`Rapido API listening on http://${host}:${config.port}`));

  const shutdown = (signal) => {
    console.log(`${signal} received. Closing Rapido API.`);
    server.close(async () => {
      await whatsappService.disconnect({ logout: false }).catch(() => undefined);
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((error) => {
  console.error("Rapido API failed to start:", error);
  process.exit(1);
});
