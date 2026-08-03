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
  maxResumeBytes: 5 * 1024 * 1024,
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
    reviewService: {
      listPublic: vi.fn(async () => [{ id: "review-1", name: "Verified Client", rating: 5, review: "A genuine approved review." }]),
      create: vi.fn(async () => ({ id: "review-2", status: "pending" })),
      listAdmin: vi.fn(async () => ({ reviews: [], total: 0, page: 1, pages: 1 })),
      updateStatus: vi.fn(async (id, status) => ({ id, status })),
      remove: vi.fn(async () => undefined)
    },
    resumeService: {
      analyzePdf: vi.fn(async () => ({
        resumeText: "Sample resume text",
        analysis: { isResume: true, reason: "Valid resume", score: 6, strengths: [], weaknesses: [], missingKeywords: [], actionSteps: [] }
      })),
      analyzeText: vi.fn(async () => ({
        resumeText: "Sample resume text",
        analysis: { isResume: true, reason: "Valid resume", score: 6, strengths: [], weaknesses: [], missingKeywords: [], actionSteps: [] }
      })),
      rebuild: vi.fn(async () => ({ resumeMarkdown: "# Sample Resume", analysis: { score: 9 }, attempts: 2 })),
      generate: vi.fn(async () => ({ resumeMarkdown: "# Generated Resume", analysis: { score: 9 }, attempts: 2 })),
      exportPdf: vi.fn(async () => Buffer.from("%PDF-test"))
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

const validReview = {
  name: "Verified Client",
  email: "client@example.com",
  company: "Example Co.",
  role: "Owner",
  service: "Web Services",
  rating: 5,
  review: "Rapido delivered the agreed work clearly and professionally.",
  consent: true,
  website: ""
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

  it("lists approved reviews and accepts moderated review submissions", async () => {
    const listed = await request(context.app).get("/api/reviews?limit=3");
    expect(listed.status).toBe(200);
    expect(listed.body.reviews[0].name).toBe("Verified Client");

    const invalid = await request(context.app).post("/api/reviews").send({ ...validReview, rating: 6 });
    expect(invalid.status).toBe(400);

    const created = await request(context.app).post("/api/reviews").send(validReview);
    expect(created.status).toBe(201);
    expect(created.body.message).toMatch(/after approval/i);
  });

  it("analyzes PDF resumes and rejects non-PDF uploads", async () => {
    const invalid = await request(context.app)
      .post("/api/resume/analyze")
      .attach("resume", Buffer.from("plain text"), { filename: "resume.txt", contentType: "text/plain" });
    expect(invalid.status).toBe(400);

    const response = await request(context.app)
      .post("/api/resume/analyze")
      .field("targetRole", "Frontend Developer")
      .attach("resume", Buffer.from("%PDF-test"), { filename: "resume.pdf", contentType: "application/pdf" });
    expect(response.status).toBe(200);
    expect(response.body.analysis.score).toBe(6);
    expect(context.services.resumeService.analyzePdf).toHaveBeenCalledOnce();
  });

  it("supports sample analysis, rebuild, generation, and PDF export", async () => {
    const sample = await request(context.app).post("/api/resume/analyze/sample").send({ targetRole: "Product Manager" });
    expect(sample.status).toBe(200);

    const resumeText = `${"Experience Education Skills Summary ".repeat(8)}Delivered projects and improved customer workflows.`;
    const rebuild = await request(context.app).post("/api/resume/rebuild").send({ resumeText, targetRole: "Product Manager" });
    expect(rebuild.status).toBe(200);
    expect(rebuild.body.analysis.score).toBe(9);

    const generated = await request(context.app).post("/api/resume/generate").send({
      personalInfo: { name: "Alex Morgan", email: "alex@example.com", phone: "", location: "", linkedin: "", portfolio: "" },
      targetRole: "Product Manager",
      professionalSummary: "Product professional focused on practical customer outcomes.",
      workExperience: [{ jobTitle: "Product Associate", company: "Example Co", startDate: "2022", endDate: "Present", achievements: "Supported launches and coordinated delivery across teams." }],
      education: [{ degree: "BS Business", institution: "Example University", graduationDate: "2022" }],
      skills: ["Roadmapping", "Research", "Analytics"],
      certifications: []
    });
    expect(generated.status).toBe(200);

    const exported = await request(context.app).post("/api/resume/export/pdf").send({ markdown: `# Alex Morgan\n\n${"Professional experience and qualifications. ".repeat(4)}`, fileName: "Alex Resume" });
    expect(exported.status).toBe(200);
    expect(exported.headers["content-type"]).toContain("application/pdf");
    expect(exported.headers["content-disposition"]).toContain("Alex-Resume.pdf");
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

  it("handles CORS headers correctly for allowed and disallowed origins", async () => {
    const allowed = await request(context.app).get("/api/reviews").set("Origin", "http://localhost:5173");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");

    const disallowed = await request(context.app).get("/api/reviews").set("Origin", "https://unauthorized-domain.com");
    expect(disallowed.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
