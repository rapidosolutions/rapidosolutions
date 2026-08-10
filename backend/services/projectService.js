import { assertDatabaseResult } from "../utils/database.js";
import { AppError, slugify } from "../utils/http.js";

function serialize(value, includeAdmin = false) {
  const project = {
    id: String(value.id),
    title: value.title,
    slug: value.slug,
    type: value.type,
    category: value.category,
    description: value.description,
    services: value.services || [],
    metric: value.metric,
    coverImage: value.cover_image?.url ? value.cover_image : null,
    coverAlt: value.cover_alt,
    accent: value.accent,
    projectUrl: value.project_url,
    featured: Boolean(value.featured),
    displayOrder: value.display_order,
    publishedAt: value.published_at,
    updatedAt: value.updated_at
  };
  if (includeAdmin) {
    project.status = value.status;
    project.seoTitle = value.seo_title;
    project.seoDescription = value.seo_description;
    project.createdAt = value.created_at;
  }
  return project;
}

async function uniqueSlug(supabase, title, requestedSlug, excludeId) {
  const base = slugify(requestedSlug || title) || `project-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  while (true) {
    let query = supabase.from("projects").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    assertDatabaseResult(error, "Project slug could not be checked.");
    if (!data?.length) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

function databaseInput(input) {
  return {
    title: input.title,
    slug: input.slug,
    type: input.type,
    category: input.category,
    description: input.description,
    services: input.services,
    metric: input.metric,
    cover_image: input.coverImage || null,
    cover_alt: input.coverAlt,
    accent: input.accent || "from-slate-200 to-blue-400",
    project_url: input.projectUrl,
    featured: input.featured,
    display_order: input.displayOrder,
    status: input.status,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    published_at: input.status === "published" ? new Date().toISOString() : null
  };
}

export function createProjectService({ supabase, uploadService }) {
  return {
    async listPublic() {
      const { data, error } = await supabase.from("projects").select("*").eq("status", "published")
        .order("featured", { ascending: false }).order("display_order", { ascending: true }).order("created_at", { ascending: true });
      assertDatabaseResult(error, "Projects could not be loaded.");
      return (data || []).map((value) => serialize(value));
    },
    async getPublic(slug) {
      const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      assertDatabaseResult(error, "Project could not be loaded.");
      if (!data) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      return serialize(data);
    },
    async listAdmin() {
      const { data, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
      assertDatabaseResult(error, "Projects could not be loaded.");
      return (data || []).map((value) => serialize(value, true));
    },
    async getAdmin(id) {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      assertDatabaseResult(error, "Project could not be loaded.");
      if (!data) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      return serialize(data, true);
    },
    async create(input) {
      const values = databaseInput({ ...input, slug: await uniqueSlug(supabase, input.title, input.slug) });
      const { data, error } = await supabase.from("projects").insert(values).select("*").single();
      assertDatabaseResult(error, "Project could not be created.");
      return serialize(data, true);
    },
    async update(id, input) {
      const { data: existing, error: findError } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      assertDatabaseResult(findError, "Project could not be loaded.");
      if (!existing) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      const coverImage = input.coverImage === undefined ? existing.cover_image : input.coverImage;
      const publishedAt = input.status === "published" ? existing.published_at || new Date().toISOString() : null;
      const values = { ...databaseInput({ ...input, coverImage, slug: await uniqueSlug(supabase, input.title, input.slug, id) }), published_at: publishedAt };
      const { data, error } = await supabase.from("projects").update(values).eq("id", id).select("*").single();
      assertDatabaseResult(error, "Project could not be updated.");
      if (existing.cover_image?.publicId && input.coverImage !== undefined && existing.cover_image.publicId !== input.coverImage?.publicId) {
        await uploadService.remove(existing.cover_image).catch(() => undefined);
      }
      return serialize(data, true);
    },
    async updateStatus(id, status) {
      const { data, error } = await supabase.from("projects").update({ status, published_at: status === "published" ? new Date().toISOString() : null })
        .eq("id", id).select("*").maybeSingle();
      assertDatabaseResult(error, "Project status could not be updated.");
      if (!data) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      return serialize(data, true);
    },
    async archive(id) {
      return this.updateStatus(id, "archived");
    },
    async remove(id, confirmationTitle) {
      const { data: existing, error: findError } = await supabase
        .from("projects")
        .select("id,title,cover_image")
        .eq("id", id)
        .maybeSingle();
      assertDatabaseResult(findError, "Project could not be loaded.");
      if (!existing) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");
      if (confirmationTitle !== existing.title) {
        throw new AppError(400, "The project title confirmation does not match.", "PROJECT_DELETE_CONFIRMATION_MISMATCH");
      }

      let removeCoverAfterDelete = false;
      if (existing.cover_image?.publicId) {
        const { data: sharedCoverReferences, error: ownershipError } = await supabase
          .from("projects")
          .select("id")
          .neq("id", existing.id)
          .eq("cover_image->>publicId", existing.cover_image.publicId)
          .limit(1);
        removeCoverAfterDelete = !ownershipError && !sharedCoverReferences?.length;
      }

      const { data: deleted, error } = await supabase
        .from("projects")
        .delete()
        .eq("id", existing.id)
        .select("id")
        .maybeSingle();
      assertDatabaseResult(error, "Project could not be deleted.");
      if (!deleted) throw new AppError(404, "Project not found.", "PROJECT_NOT_FOUND");

      if (removeCoverAfterDelete) {
        await uploadService.remove(existing.cover_image).catch(() => undefined);
      }
    }
  };
}
