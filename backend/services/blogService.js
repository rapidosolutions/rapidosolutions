import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AppError, estimateReadTime, slugify } from "../utils/http.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "../data/blogs.json");

function serialize(blog) {
  const value = blog.toObject ? blog.toObject() : blog;
  return {
    id: String(value._id || value.id),
    title: value.title,
    slug: value.slug,
    category: value.category,
    summary: value.summary,
    content: value.content,
    author: value.author,
    readTime: value.readTime,
    published: Boolean(value.published),
    coverImage: value.coverImage?.url ? value.coverImage : null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt
  };
}

async function uniqueSlug(Blog, title, requestedSlug, excludeId) {
  const base = slugify(requestedSlug || title) || `post-${Date.now()}`;
  let candidate = base;
  let suffix = 2;

  while (await Blog.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export function createBlogService({ Blog, uploadService }) {
  return {
    async seed() {
      if (await Blog.exists({})) return;
      const seed = JSON.parse(await fs.readFile(seedPath, "utf8"));
      await Blog.insertMany(
        seed.map(({ id, ...post }) => ({
          ...post,
          slug: slugify(post.slug || post.title),
          readTime: post.readTime || estimateReadTime(post.content)
        }))
      );
    },

    async listPublic() {
      const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 }).lean();
      return blogs.map(serialize);
    },

    async getPublic(slug) {
      const blog = await Blog.findOne({ slug, published: true }).lean();
      if (!blog) throw new AppError(404, "Blog post not found.", "BLOG_NOT_FOUND");
      return serialize(blog);
    },

    async listAdmin() {
      const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
      return blogs.map(serialize);
    },

    async create(input) {
      const blog = await Blog.create({
        ...input,
        slug: await uniqueSlug(Blog, input.title, input.slug),
        readTime: input.readTime || estimateReadTime(input.content),
        coverImage: input.coverImage || null
      });
      return serialize(blog);
    },

    async update(id, input) {
      const existing = await Blog.findById(id);
      if (!existing) throw new AppError(404, "Blog post not found.", "BLOG_NOT_FOUND");

      const oldCover = existing.coverImage?.url ? existing.coverImage.toObject() : null;
      Object.assign(existing, {
        ...input,
        slug: await uniqueSlug(Blog, input.title, input.slug, id),
        readTime: input.readTime || estimateReadTime(input.content),
        coverImage: input.coverImage === undefined ? existing.coverImage : input.coverImage
      });
      await existing.save();

      if (oldCover?.publicId && input.coverImage !== undefined && oldCover.publicId !== input.coverImage?.publicId) {
        await uploadService.remove(oldCover).catch(() => undefined);
      }
      return serialize(existing);
    },

    async remove(id) {
      const blog = await Blog.findByIdAndDelete(id);
      if (!blog) throw new AppError(404, "Blog post not found.", "BLOG_NOT_FOUND");
      await uploadService.remove(blog.coverImage).catch(() => undefined);
    }
  };
}
