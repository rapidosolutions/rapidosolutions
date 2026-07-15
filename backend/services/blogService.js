import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AppError, estimateReadTime, slugify } from "../utils/http.js";
import { assertDatabaseResult } from "../utils/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "../data/blogs.json");

function serialize(value) {
  return {
    id: String(value.id),
    title: value.title,
    slug: value.slug,
    category: value.category,
    summary: value.summary,
    content: value.content,
    author: value.author,
    readTime: value.read_time,
    published: Boolean(value.published),
    coverImage: value.cover_image?.url ? value.cover_image : null,
    createdAt: value.created_at,
    updatedAt: value.updated_at
  };
}

async function uniqueSlug(supabase, title, requestedSlug, excludeId) {
  const base = slugify(requestedSlug || title) || `post-${Date.now()}`;
  let candidate = base;
  let suffix = 2;

  while (true) {
    let query = supabase.from("legacy_blogs").select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    assertDatabaseResult(error, "Blog slug could not be checked.");
    if (!data?.length) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function toDatabaseInput(input) {
  return {
    title: input.title,
    slug: input.slug,
    category: input.category,
    summary: input.summary,
    content: input.content,
    author: input.author,
    read_time: input.readTime,
    published: input.published,
    cover_image: input.coverImage || null
  };
}

export function createBlogService({ supabase, uploadService }) {
  return {
    async seed() {
      const { count, error: countError } = await supabase
        .from("legacy_blogs")
        .select("id", { count: "exact", head: true });
      assertDatabaseResult(countError, "Legacy blog count could not be checked.");
      if (count) return;

      const seed = JSON.parse(await fs.readFile(seedPath, "utf8"));
      const rows = seed.map(({ id, createdAt, updatedAt, coverImage, ...post }) => ({
        title: post.title,
        slug: slugify(post.slug || post.title),
        category: post.category,
        summary: post.summary,
        content: post.content,
        author: post.author,
        read_time: post.readTime || estimateReadTime(post.content),
        published: post.published,
        cover_image: coverImage || null,
        created_at: createdAt,
        updated_at: updatedAt
      }));
      const { error } = await supabase.from("legacy_blogs").insert(rows);
      assertDatabaseResult(error, "Legacy blogs could not be initialized.");
    },

    async listPublic() {
      const { data, error } = await supabase
        .from("legacy_blogs")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      assertDatabaseResult(error, "Blog posts could not be loaded.");
      return (data || []).map(serialize);
    },

    async getPublic(slug) {
      const { data, error } = await supabase
        .from("legacy_blogs")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      assertDatabaseResult(error, "Blog post could not be loaded.");
      if (!data) throw new AppError(404, "Blog post not found.", "BLOG_NOT_FOUND");
      return serialize(data);
    },

    async listAdmin() {
      const { data, error } = await supabase
        .from("legacy_blogs")
        .select("*")
        .order("created_at", { ascending: false });
      assertDatabaseResult(error, "Blog posts could not be loaded.");
      return (data || []).map(serialize);
    },

    async create(input) {
      const values = toDatabaseInput({
        ...input,
        slug: await uniqueSlug(supabase, input.title, input.slug),
        readTime: input.readTime || estimateReadTime(input.content)
      });
      const { data, error } = await supabase.from("legacy_blogs").insert(values).select("*").single();
      assertDatabaseResult(error, "Blog post could not be created.");
      return serialize(data);
    },

    async update(id, input) {
      const { data: existing, error: findError } = await supabase
        .from("legacy_blogs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      assertDatabaseResult(findError, "Blog post could not be loaded.");
      if (!existing) throw new AppError(404, "Blog post not found.", "BLOG_NOT_FOUND");

      const coverImage = input.coverImage === undefined ? existing.cover_image : input.coverImage;
      const values = toDatabaseInput({
        ...input,
        slug: await uniqueSlug(supabase, input.title, input.slug, id),
        readTime: input.readTime || estimateReadTime(input.content),
        coverImage
      });
      const { data, error } = await supabase
        .from("legacy_blogs")
        .update(values)
        .eq("id", id)
        .select("*")
        .single();
      assertDatabaseResult(error, "Blog post could not be updated.");

      const oldCover = existing.cover_image?.url ? existing.cover_image : null;
      if (oldCover?.publicId && input.coverImage !== undefined && oldCover.publicId !== input.coverImage?.publicId) {
        await uploadService.remove(oldCover).catch(() => undefined);
      }
      return serialize(data);
    },

    async remove(id) {
      const { data, error } = await supabase
        .from("legacy_blogs")
        .delete()
        .eq("id", id)
        .select("id,cover_image")
        .maybeSingle();
      assertDatabaseResult(error, "Blog post could not be deleted.");
      if (!data) throw new AppError(404, "Blog post not found.", "BLOG_NOT_FOUND");
      await uploadService.remove(data.cover_image).catch(() => undefined);
    }
  };
}
