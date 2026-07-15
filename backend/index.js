import http from "node:http";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { connectDatabase, databaseStatus, disconnectDatabase } from "./db.js";
import { createAuthService } from "./services/authService.js";
import { createBlogService } from "./services/blogService.js";
import { createContactService } from "./services/contactService.js";
import { createEmailService } from "./services/emailService.js";
import { createUploadService } from "./services/uploadService.js";

async function start() {
  const supabase = await connectDatabase(config);

  const uploadService = createUploadService(config);
  const authService = createAuthService({ supabase, config });
  const blogService = createBlogService({ supabase, uploadService });
  const contactService = createContactService({ supabase, emailService: createEmailService(config) });

  await authService.bootstrapAdmin();
  await blogService.seed();

  const app = createApp({ config, authService, blogService, contactService, uploadService, databaseStatus });
  const server = http.createServer(app);
  server.listen(config.port, () => console.log(`Rapido API listening on http://localhost:${config.port}`));

  const shutdown = (signal) => {
    console.log(`${signal} received. Closing Rapido API.`);
    server.close(async () => {
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
