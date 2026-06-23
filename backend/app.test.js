// @vitest-environment node
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app.js";
import { AppError } from "./utils/http.js";

const config = {
  isProduction: false,
  frontendOrigins: ["http://localhost:5173"],
  trustProxy: false,
  cookieName: "test_session",
  cookieSecure: false,
  cookieSameSite: "lax",
  jwtSecret: "test-secret-that-is-long-enough-for-automated-tests",
  jwtExpiresIn: "1h",
  maxUploadBytes: 5 * 1024 * 1024,
  uploadDir: "D:/nonexistent-rapido-test-uploads"
};

function buildApp() {
  const services = {
    authService: {
      authenticate: vi.fn(async (email, password) => {
        if (password !== "correct-password") throw new AppError(401, "Invalid email or password.");
        return { id: "admin-1", email };
      }),
      changePassword: vi.fn(async () => undefined)
    },
    blogService: {
      listPublic: vi.fn(async () => [{ id: "blog-1", title: "Public" }]),
      getPublic: vi.fn(async (slug) => ({ id: "blog-1", slug })),
      listAdmin: vi.fn(async () => [{ id: "draft-1", published: false }]),
      create: vi.fn(async (blog) => ({ id: "new-1", ...blog })),
      update: vi.fn(async (id, blog) => ({ id, ...blog })),
      remove: vi.fn(async () => undefined)
    },
    contactService: {
      create: vi.fn(async () => ({ id: "message-1", notificationEmailStatus: "sent" })),
      list: vi.fn(async () => ({ messages: [], total: 0, page: 1, pages: 1 })),
      updateStatus: vi.fn(async (id, status) => ({ id, status })),
      remove: vi.fn(async () => undefined)
    },
    uploadService: {
      upload: vi.fn(async () => ({ url: "https://example.com/cover.jpg", publicId: "cover", storageType: "cloudinary" }))
    }
  };
  const app = createApp({ config, ...services, databaseStatus: () => 1 });
  return { app, services };
}

const validContact = {
  name: "Samar Khan",
  email: "samar@example.com",
  phone: "",
  company: "Rapido",
  service: "Web Development",
  budget: "$1,000 - $3,000",
  message: "Please contact me about a new website.",
  website: ""
};

const validBlog = {
  title: "A production-ready article",
  slug: "",
  category: "Web Strategy",
  summary: "A useful summary for the blog article.",
  content: "This is the full body of the article with enough useful content.",
  author: "Rapido Editorial",
  readTime: "",
  published: true,
  coverImage: null
};

describe("Rapido API", () => {
  let context;
  beforeEach(() => {
    context = buildApp();
  });

  it("reports healthy database state", async () => {
    const response = await request(context.app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("returns public blog posts without authentication", async () => {
    const response = await request(context.app).get("/api/blogs");
    expect(response.status).toBe(200);
    expect(response.body.blogs[0].title).toBe("Public");
  });

  it("validates and saves contact requests", async () => {
    const invalid = await request(context.app).post("/api/contact").send({ ...validContact, email: "invalid" });
    expect(invalid.status).toBe(400);

    const response = await request(context.app).post("/api/contact").send(validContact);
    expect(response.status).toBe(201);
    expect(response.body.reference).toBe("message-1");
    expect(context.services.contactService.create).toHaveBeenCalledOnce();
  });

  it("rejects protected routes without a session", async () => {
    const response = await request(context.app).get("/api/admin/blogs");
    expect(response.status).toBe(401);
  });

  it("creates an authenticated session and enforces CSRF", async () => {
    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({
      email: "rapidosolutionsco@outlook.com",
      password: "correct-password"
    });
    expect(login.status).toBe(200);
    expect(login.headers["set-cookie"][0]).toContain("HttpOnly");

    const missingCsrf = await agent.post("/api/admin/blogs").send(validBlog);
    expect(missingCsrf.status).toBe(403);

    const created = await agent.post("/api/admin/blogs").set("X-CSRF-Token", login.body.csrfToken).send(validBlog);
    expect(created.status).toBe(201);
    expect(created.body.blog.title).toBe(validBlog.title);
  });

  it("accepts a protected cover upload", async () => {
    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({ email: "rapidosolutionsco@outlook.com", password: "correct-password" });
    const response = await agent
      .post("/api/admin/uploads/blog-cover")
      .set("X-CSRF-Token", login.body.csrfToken)
      .attach("image", Buffer.from("test-image"), { filename: "cover.jpg", contentType: "image/jpeg" });
    expect(response.status).toBe(201);
    expect(response.body.asset.storageType).toBe("cloudinary");
  });

  it("changes the administrator password only with authentication and CSRF", async () => {
    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({ email: "rapidosolutionsco@outlook.com", password: "correct-password" });
    const response = await agent.patch("/api/auth/password").set("X-CSRF-Token", login.body.csrfToken).send({
      currentPassword: "correct-password",
      newPassword: "a-new-secure-password"
    });
    expect(response.status).toBe(204);
    expect(context.services.authService.changePassword).toHaveBeenCalledWith("admin-1", "correct-password", "a-new-secure-password");
  });
});
