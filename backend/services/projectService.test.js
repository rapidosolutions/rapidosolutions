// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createProjectService } from "./projectService.js";

const publishedRow = {
  id: "project-1", title: "Published", slug: "published", type: "web", category: "Business Websites",
  description: "Published description", services: ["Web Development"], metric: "More leads", cover_image: null,
  cover_alt: "", accent: "from-blue-100 to-blue-300", project_url: "", featured: false, display_order: 1,
  status: "published", seo_title: "", seo_description: "", published_at: "2026-08-09T00:00:00.000Z",
  created_at: "2026-08-09T00:00:00.000Z", updated_at: "2026-08-09T00:00:00.000Z"
};

describe("Supabase project service", () => {
  it("requests and serializes published projects only without admin fields", async () => {
    const query = {
      eq: vi.fn(() => query),
      order: vi.fn(() => query),
      then(resolve) { return Promise.resolve({ data: [publishedRow], error: null }).then(resolve); }
    };
    const supabase = { from: vi.fn(() => ({ select: vi.fn(() => query) })) };
    const service = createProjectService({ supabase, uploadService: { remove: vi.fn() } });
    const projects = await service.listPublic();

    expect(query.eq).toHaveBeenCalledWith("status", "published");
    expect(projects).toHaveLength(1);
    expect(projects[0]).not.toHaveProperty("status");
    expect(projects[0]).not.toHaveProperty("seoTitle");
  });

  it("soft-archives instead of permanently deleting a project", async () => {
    const maybeSingle = vi.fn(async () => ({ data: { ...publishedRow, status: "archived", published_at: null }, error: null }));
    const update = vi.fn(() => ({ eq: () => ({ select: () => ({ maybeSingle }) }) }));
    const supabase = { from: vi.fn(() => ({ update })) };
    const service = createProjectService({ supabase, uploadService: { remove: vi.fn() } });
    const result = await service.archive("project-1");

    expect(update).toHaveBeenCalledWith({ status: "archived", published_at: null });
    expect(result.status).toBe("archived");
  });

  it("permanently deletes only the selected project and removes its owned cover asset", async () => {
    const coverImage = { url: "https://example.com/project.jpg", publicId: "rapido/projects/project-1", storageType: "cloudinary" };
    const findSingle = vi.fn(async () => ({ data: { id: "project-1", title: "Published", cover_image: coverImage }, error: null }));
    const deleteSingle = vi.fn(async () => ({ data: { id: "project-1" }, error: null }));
    const ownershipQuery = { neq: vi.fn(() => ownershipQuery), eq: vi.fn(() => ownershipQuery), limit: vi.fn(async () => ({ data: [], error: null })) };
    const deleteQuery = vi.fn(() => ({ eq: vi.fn((field, value) => {
      expect(field).toBe("id");
      expect(value).toBe("project-1");
      return { select: () => ({ maybeSingle: deleteSingle }) };
    }) }));
    const supabase = {
      from: vi.fn()
        .mockReturnValueOnce({ select: () => ({ eq: () => ({ maybeSingle: findSingle }) }) })
        .mockReturnValueOnce({ select: () => ownershipQuery })
        .mockReturnValueOnce({ delete: deleteQuery })
    };
    const uploadService = { remove: vi.fn(async () => undefined) };
    const service = createProjectService({ supabase, uploadService });

    await service.remove("project-1", "Published");

    expect(deleteQuery).toHaveBeenCalledOnce();
    expect(uploadService.remove).toHaveBeenCalledWith(coverImage);
  });

  it("does not delete when the exact title confirmation is wrong", async () => {
    const supabase = {
      from: vi.fn().mockReturnValueOnce({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "project-1", title: "Published", cover_image: null }, error: null }) }) })
      })
    };
    const service = createProjectService({ supabase, uploadService: { remove: vi.fn() } });

    await expect(service.remove("project-1", "published")).rejects.toMatchObject({ status: 400, code: "PROJECT_DELETE_CONFIRMATION_MISMATCH" });
    expect(supabase.from).toHaveBeenCalledOnce();
  });

  it("returns a safe database error and leaves media intact when deletion fails", async () => {
    const findResult = { data: { id: "project-1", title: "Published", cover_image: null }, error: null };
    const supabase = {
      from: vi.fn()
        .mockReturnValueOnce({ select: () => ({ eq: () => ({ maybeSingle: async () => findResult }) }) })
        .mockReturnValueOnce({ delete: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: { code: "DATABASE_UNAVAILABLE" } }) }) }) }) })
    };
    const uploadService = { remove: vi.fn() };
    const service = createProjectService({ supabase, uploadService });

    await expect(service.remove("project-1", "Published")).rejects.toMatchObject({ status: 500, code: "DATABASE_ERROR" });
    expect(uploadService.remove).not.toHaveBeenCalled();
  });

  it("preserves a cover asset referenced by another project", async () => {
    const coverImage = { url: "https://example.com/shared.jpg", publicId: "rapido/projects/shared", storageType: "cloudinary" };
    const ownershipQuery = { neq: vi.fn(() => ownershipQuery), eq: vi.fn(() => ownershipQuery), limit: vi.fn(async () => ({ data: [{ id: "project-2" }], error: null })) };
    const supabase = {
      from: vi.fn()
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: "project-1", title: "Published", cover_image: coverImage }, error: null })
            })
          })
        })
        .mockReturnValueOnce({ select: () => ownershipQuery })
        .mockReturnValueOnce({ delete: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: "project-1" }, error: null }) }) }) }) })
    };
    const uploadService = { remove: vi.fn() };
    const service = createProjectService({ supabase, uploadService });

    await service.remove("project-1", "Published");
    expect(uploadService.remove).not.toHaveBeenCalled();
  });
});
