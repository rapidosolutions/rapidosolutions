// @vitest-environment node
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, isAllowedOrigin } from "./app.js";
import { loadConfig } from "./config.js";
import { AppError } from "./utils/http.js";

const config = {
  isProduction: false,
  frontendOrigins: ["http://localhost:5173", "https://rapidosolutions.vercel.app"],
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
        return { id: "admin-1", email, canManageProjects: true };
      }),
      changePassword: vi.fn(async () => undefined),
      assertProjectAccess: vi.fn(async () => undefined)
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
      updateFeatured: vi.fn(async (id, featured) => ({ id, status: "approved", featured })),
      remove: vi.fn(async () => undefined)
    },
    projectService: {
      listPublic: vi.fn(async () => [{ id: "project-1", slug: "published-project", title: "Published Project" }]),
      getPublic: vi.fn(async (slug) => ({ id: "project-1", slug, title: "Published Project" })),
      listAdmin: vi.fn(async () => [{ id: "project-1", status: "published", title: "Published Project" }]),
      getAdmin: vi.fn(async (id) => ({ id, status: "draft", title: "Draft Project" })),
      create: vi.fn(async (project) => ({ id: "project-new", ...project })),
      update: vi.fn(async (id, project) => ({ id, ...project })),
      updateStatus: vi.fn(async (id, status) => ({ id, status })),
      archive: vi.fn(async (id) => ({ id, status: "archived" })),
      remove: vi.fn(async (id, confirmationTitle) => {
        if (id === "missing-project") throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
        if (confirmationTitle !== "Updated project") throw new AppError(400, "The project title confirmation does not match.", "PROJECT_DELETE_CONFIRMATION_MISMATCH");
      })
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

const validProject = {
  title: "A managed project",
  slug: "",
  type: "web",
  category: "Business Websites",
  description: "A useful project description that appears on the public Projects page.",
  services: ["Web Development", "SEO"],
  metric: "Clearer customer journey",
  coverImage: null,
  coverAlt: "Project preview",
  accent: "from-slate-200 to-blue-400",
  projectUrl: "",
  featured: false,
  displayOrder: 10,
  status: "draft",
  seoTitle: "",
  seoDescription: ""
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

  it("returns 200 with degraded status when database is disconnected", async () => {
    const degradedApp = createApp({ config, ...context.services, databaseStatus: () => 0 });
    const response = await request(degradedApp).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("degraded");
    expect(response.body.database).toBe("disconnected");
  });

  it("returns public blog posts without authentication", async () => {
    const response = await request(context.app).get("/api/blogs");
    expect(response.status).toBe(200);
    expect(response.body.blogs[0].title).toBe("Public");
  });

  it("returns published projects through the public project API", async () => {
    const response = await request(context.app).get("/api/projects");
    expect(response.status).toBe(200);
    expect(response.body.projects[0].slug).toBe("published-project");
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
    expect(created.body.message).toBe("Thank you. Your review was submitted successfully.");
    expect(context.services.reviewService.listPublic).toHaveBeenCalledWith({ limit: "3", featuredOnly: false });
  });

  it("protects review administration and supports moderation, featuring, and confirmed deletion", async () => {
    expect((await request(context.app).get("/api/admin/reviews")).status).toBe(401);
    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({ email: "rapidosolutionsco@outlook.com", password: "correct-password" });
    const csrf = login.body.csrfToken;

    expect((await agent.get("/api/admin/reviews")).status).toBe(200);
    expect((await agent.patch("/api/admin/reviews/review-1").send({ status: "approved" })).status).toBe(403);
    for (const status of ["approved", "hidden", "approved", "rejected"]) {
      const response = await agent.patch("/api/admin/reviews/review-1").set("X-CSRF-Token", csrf).send({ status });
      expect(response.status).toBe(200);
      expect(response.body.review.status).toBe(status);
    }

    const featured = await agent.patch("/api/admin/reviews/review-1/featured").set("X-CSRF-Token", csrf).send({ featured: true });
    expect(featured.status).toBe(200);
    expect(featured.body.review.featured).toBe(true);
    const unfeatured = await agent.patch("/api/admin/reviews/review-1/featured").set("X-CSRF-Token", csrf).send({ featured: false });
    expect(unfeatured.status).toBe(200);
    expect(unfeatured.body.review.featured).toBe(false);

    context.services.reviewService.updateFeatured.mockRejectedValueOnce(new AppError(400, "Only approved reviews can be featured.", "REVIEW_NOT_APPROVED"));
    const invalidFeature = await agent.patch("/api/admin/reviews/pending-review/featured").set("X-CSRF-Token", csrf).send({ featured: true });
    expect(invalidFeature.status).toBe(400);
    expect(invalidFeature.body.code).toBe("REVIEW_NOT_APPROVED");

    expect((await agent.delete("/api/admin/reviews/review-1").set("X-CSRF-Token", csrf).send({})).status).toBe(400);
    const deleted = await agent.delete("/api/admin/reviews/review-1").set("X-CSRF-Token", csrf).send({ confirmationName: "Verified Client" });
    expect(deleted.status).toBe(204);
    expect(context.services.reviewService.remove).toHaveBeenCalledWith("review-1", "Verified Client");
  });

  it("handles deletion of a nonexistent review safely", async () => {
    context.services.reviewService.remove.mockRejectedValueOnce(new AppError(404, "Review not found.", "REVIEW_NOT_FOUND"));
    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({ email: "rapidosolutionsco@outlook.com", password: "correct-password" });
    const response = await agent.delete("/api/admin/reviews/missing-review")
      .set("X-CSRF-Token", login.body.csrfToken)
      .send({ confirmationName: "Missing Client" });
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("REVIEW_NOT_FOUND");
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

    const structured = await request(context.app).post("/api/resume/generate").send({
      personalInfo: { name: "Alex Morgan", email: "alex@example.com" },
      targetPosition: { targetRole: "Frontend Engineer", targetIndustry: "Software", targetCompany: "", jobDescription: "Build accessible React products." },
      professionalProfile: { coreExpertise: ["Accessibility"], keyStrengths: ["Collaboration"] },
      workExperience: [{ jobTitle: "Developer", company: "Example Co", startDate: "2022", responsibilities: ["Built interfaces"], achievements: [{ action: "Reduced bundle size", result: "Faster loads", metric: "32%", businessImpact: "" }], tools: ["Vite"], skills: ["React"] }],
      education: [{ degree: "BSc", institution: "Example University", graduationDate: "2021", coursework: [], achievements: [] }],
      skills: { technical: ["React", "JavaScript"], tools: ["Vite"], industry: [], professional: [] }
    });
    expect(structured.status).toBe(200);
    expect(context.services.resumeService.generate).toHaveBeenLastCalledWith(expect.objectContaining({
      targetPosition: expect.objectContaining({ targetRole: "Frontend Engineer", jobDescription: "Build accessible React products." }),
      skills: expect.objectContaining({ technical: ["React", "JavaScript"] })
    }));

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

  it("fails invalid administrator credentials without exposing account details", async () => {
    const response = await request(context.app).post("/api/auth/login").send({
      email: "rapidosolutionsco@outlook.com",
      password: "incorrect-password"
    });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid email or password.");
  });

  it("protects project management and supports create, edit, lifecycle, and archive operations", async () => {
    expect((await request(context.app).get("/api/admin/projects")).status).toBe(401);
    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({ email: "rapidosolutionsco@outlook.com", password: "correct-password" });
    const csrf = login.body.csrfToken;

    expect((await agent.post("/api/admin/projects").send(validProject)).status).toBe(403);
    const invalid = await agent.post("/api/admin/projects").set("X-CSRF-Token", csrf).send({ ...validProject, services: [] });
    expect(invalid.status).toBe(400);

    const created = await agent.post("/api/admin/projects").set("X-CSRF-Token", csrf).send(validProject);
    expect(created.status).toBe(201);
    const edited = await agent.put("/api/admin/projects/project-new").set("X-CSRF-Token", csrf).send({ ...validProject, title: "Updated project" });
    expect(edited.status).toBe(200);
    const published = await agent.patch("/api/admin/projects/project-new/status").set("X-CSRF-Token", csrf).send({ status: "published" });
    expect(published.body.project.status).toBe("published");
    const unpublished = await agent.patch("/api/admin/projects/project-new/status").set("X-CSRF-Token", csrf).send({ status: "draft" });
    expect(unpublished.body.project.status).toBe("draft");
    const archived = await agent.delete("/api/admin/projects/project-new").set("X-CSRF-Token", csrf);
    expect(archived.body.project.status).toBe("archived");
  });

  it("protects permanent deletion with authentication, authorization, CSRF, and title confirmation", async () => {
    const path = "/api/admin/projects/project-new/permanent";
    expect((await request(context.app).delete(path).send({ confirmationTitle: "Updated project" })).status).toBe(401);

    const limitedAgent = request.agent(context.app);
    context.services.authService.authenticate.mockResolvedValueOnce({ id: "admin-2", email: "limited@example.com", canManageProjects: false });
    const limitedLogin = await limitedAgent.post("/api/auth/login").send({ email: "limited@example.com", password: "correct-password" });
    expect(limitedLogin.status).toBe(200);
    expect((await limitedAgent.delete(path).set("X-CSRF-Token", limitedLogin.body.csrfToken).send({ confirmationTitle: "Updated project" })).status).toBe(403);

    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({ email: "rapidosolutionsco@outlook.com", password: "correct-password" });
    expect((await agent.delete(path).send({ confirmationTitle: "Updated project" })).status).toBe(403);
    expect((await agent.delete(path).set("X-CSRF-Token", login.body.csrfToken).send({ confirmationTitle: "Wrong title" })).status).toBe(400);

    const deleted = await agent.delete(path).set("X-CSRF-Token", login.body.csrfToken).send({ confirmationTitle: "Updated project" });
    expect(deleted.status).toBe(204);
    expect(context.services.projectService.remove).toHaveBeenCalledWith("project-new", "Updated project");
  });

  it("handles permanent deletion of a nonexistent project safely", async () => {
    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({ email: "rapidosolutionsco@outlook.com", password: "correct-password" });
    const response = await agent.delete("/api/admin/projects/missing-project/permanent")
      .set("X-CSRF-Token", login.body.csrfToken)
      .send({ confirmationTitle: "Updated project" });
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("PROJECT_NOT_FOUND");
  });

  it("rejects authenticated administrators without project authorization", async () => {
    context.services.authService.authenticate.mockResolvedValueOnce({ id: "admin-2", email: "limited@example.com", canManageProjects: false });
    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({ email: "limited@example.com", password: "correct-password" });
    expect(login.status).toBe(200);
    expect((await agent.get("/api/admin/projects")).status).toBe(403);
  });

  it("rechecks project authorization against the database for active sessions", async () => {
    const agent = request.agent(context.app);
    await agent.post("/api/auth/login").send({ email: "rapidosolutionsco@outlook.com", password: "correct-password" });
    context.services.authService.assertProjectAccess.mockRejectedValueOnce(new AppError(403, "You are not authorized to manage projects.", "PROJECT_ADMIN_REQUIRED"));
    expect((await agent.get("/api/admin/projects")).status).toBe(403);
  });

  it("logs out and rejects the cleared or expired administrator session", async () => {
    const agent = request.agent(context.app);
    const login = await agent.post("/api/auth/login").send({ email: "rapidosolutionsco@outlook.com", password: "correct-password" });
    expect((await agent.post("/api/auth/logout").set("X-CSRF-Token", login.body.csrfToken)).status).toBe(204);
    expect((await agent.get("/api/admin/projects")).status).toBe(401);
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

    const vercelAllowed = await request(context.app).get("/api/reviews").set("Origin", "https://rapidosolutions.vercel.app");
    expect(vercelAllowed.headers["access-control-allow-origin"]).toBe("https://rapidosolutions.vercel.app");

    const preflight = await request(context.app)
      .options("/api/reviews?limit=3")
      .set("Origin", "https://rapidosolutions.vercel.app")
      .set("Access-Control-Request-Method", "GET");
    expect(preflight.status).toBe(200);
    expect(preflight.headers["access-control-allow-origin"]).toBe("https://rapidosolutions.vercel.app");

    const disallowed = await request(context.app).get("/api/reviews").set("Origin", "https://unauthorized-domain.com");
    expect(disallowed.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("validates origins with isAllowedOrigin matching wildcards, domain-only patterns, and slashes", () => {
    expect(isAllowedOrigin("https://rapidosolutions.vercel.app", ["https://rapidosolutions.vercel.app"])).toBe(true);
    expect(isAllowedOrigin("https://rapidosolutions.vercel.app/", ["rapidosolutions.vercel.app"])).toBe(true);
    expect(isAllowedOrigin("https://rapidosolutions-git-main.vercel.app", ["*.vercel.app"])).toBe(true);
    expect(isAllowedOrigin("https://malicious.com", ["https://rapidosolutions.vercel.app"])).toBe(false);
  });

  it("cleans quoted and trailing slash environment variables in loadConfig", () => {
    const loaded = loadConfig({
      FRONTEND_URLS: '"https://rapidosolutions.vercel.app/", https://custom.com/'
    });
    expect(loaded.frontendOrigins).toContain("https://rapidosolutions.vercel.app");
    expect(loaded.frontendOrigins).toContain("https://custom.com");
  });
});
