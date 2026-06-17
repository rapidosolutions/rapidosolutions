import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

const dataFile = path.join(__dirname, "data", "blogs.json");
const port = Number(process.env.PORT || 4174);
const app = express();

let BlogModel = null;
let storageMode = "file";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, default: "Business" },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Rapido Editorial" },
    readTime: { type: String, default: "3 min read" },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Admin-Key");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.use(express.json({ limit: "1mb" }));

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function estimateReadTime(content) {
  const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function normalizeBlog(input, existing = {}) {
  const title = String(input.title || existing.title || "").trim();
  const summary = String(input.summary || existing.summary || "").trim();
  const content = String(input.content || existing.content || "").trim();

  if (!title || !summary || !content) {
    const error = new Error("Title, summary, and content are required.");
    error.status = 400;
    throw error;
  }

  return {
    id: existing.id || input.id || crypto.randomUUID(),
    title,
    slug: slugify(input.slug || existing.slug || title),
    category: String(input.category || existing.category || "Business").trim(),
    summary,
    content,
    author: String(input.author || existing.author || "Rapido Editorial").trim(),
    readTime: String(input.readTime || existing.readTime || estimateReadTime(content)).trim(),
    published: Boolean(input.published ?? existing.published ?? true),
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function toClientBlog(blog) {
  const source = typeof blog.toObject === "function" ? blog.toObject() : blog;
  return {
    id: String(source._id || source.id),
    title: source.title,
    slug: source.slug,
    category: source.category,
    summary: source.summary,
    content: source.content,
    author: source.author,
    readTime: source.readTime,
    published: Boolean(source.published),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    path: `/blogs/${source.slug}`
  };
}

async function ensureDataFile() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]\n", "utf8");
  }
}

async function readFileBlogs() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw);
}

async function writeFileBlogs(blogs) {
  await ensureDataFile();
  await fs.writeFile(dataFile, `${JSON.stringify(blogs, null, 2)}\n`, "utf8");
}

async function listBlogs(includeDrafts = false) {
  const blogs =
    storageMode === "mongo"
      ? await BlogModel.find(includeDrafts ? {} : { published: true }).sort({ createdAt: -1 })
      : (await readFileBlogs()).filter((blog) => includeDrafts || blog.published);

  return blogs.map(toClientBlog).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getBlogBySlug(slug, includeDrafts = false) {
  const normalizedSlug = slugify(slug);
  if (storageMode === "mongo") {
    const blog = await BlogModel.findOne(includeDrafts ? { slug: normalizedSlug } : { slug: normalizedSlug, published: true });
    return blog ? toClientBlog(blog) : null;
  }

  const blogs = await readFileBlogs();
  const blog = blogs.find((item) => item.slug === normalizedSlug && (includeDrafts || item.published));
  return blog ? toClientBlog(blog) : null;
}

async function uniqueSlug(baseSlug, currentId = null) {
  const initial = slugify(baseSlug) || "blog-post";
  const allBlogs = storageMode === "mongo" ? await BlogModel.find({}).select("slug") : await readFileBlogs();
  const taken = new Set(
    allBlogs
      .filter((blog) => String(blog._id || blog.id) !== String(currentId || ""))
      .map((blog) => blog.slug)
  );

  let candidate = initial;
  let index = 2;
  while (taken.has(candidate)) {
    candidate = `${initial}-${index}`;
    index += 1;
  }
  return candidate;
}

async function createBlog(input) {
  const blog = normalizeBlog(input);
  blog.slug = await uniqueSlug(blog.slug);

  if (storageMode === "mongo") {
    const created = await BlogModel.create(blog);
    return toClientBlog(created);
  }

  const blogs = await readFileBlogs();
  blogs.unshift(blog);
  await writeFileBlogs(blogs);
  return toClientBlog(blog);
}

async function updateBlog(id, input) {
  if (storageMode === "mongo") {
    const existing = await BlogModel.findById(id);
    if (!existing) return null;
    const normalized = normalizeBlog(input, toClientBlog(existing));
    normalized.slug = await uniqueSlug(normalized.slug, id);
    const updated = await BlogModel.findByIdAndUpdate(id, normalized, { new: true });
    return toClientBlog(updated);
  }

  const blogs = await readFileBlogs();
  const index = blogs.findIndex((blog) => String(blog.id) === String(id));
  if (index === -1) return null;
  const normalized = normalizeBlog(input, blogs[index]);
  normalized.slug = await uniqueSlug(normalized.slug, id);
  blogs[index] = normalized;
  await writeFileBlogs(blogs);
  return toClientBlog(normalized);
}

async function deleteBlog(id) {
  if (storageMode === "mongo") {
    const deleted = await BlogModel.findByIdAndDelete(id);
    return Boolean(deleted);
  }

  const blogs = await readFileBlogs();
  const nextBlogs = blogs.filter((blog) => String(blog.id) !== String(id));
  if (nextBlogs.length === blogs.length) return false;
  await writeFileBlogs(nextBlogs);
  return true;
}

function requireAdminKey(req, res, next) {
  if (hasValidAdminKey(req)) {
    next();
    return;
  }

  res.status(401).json({ message: "Invalid blog admin key." });
}

function hasValidAdminKey(req) {
  const requiredKey = process.env.BLOG_ADMIN_KEY;
  if (!requiredKey) {
    return true;
  }

  return req.get("X-Admin-Key") === requiredKey;
}

function requireDraftAccess(req, res, next) {
  if (req.query.status !== "all" || hasValidAdminKey(req)) {
    next();
    return;
  }

  res.status(401).json({ message: "Invalid blog admin key." });
}

async function startStorage() {
  if (!process.env.MONGODB_URI) {
    await ensureDataFile();
    storageMode = "file";
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  BlogModel = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
  storageMode = "mongo";
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, storage: storageMode });
});

app.get("/api/blogs", requireDraftAccess, async (req, res, next) => {
  try {
    const includeDrafts = req.query.status === "all";
    res.json({ blogs: await listBlogs(includeDrafts), storage: storageMode });
  } catch (error) {
    next(error);
  }
});

app.get("/api/blogs/:slug", requireDraftAccess, async (req, res, next) => {
  try {
    const blog = await getBlogBySlug(req.params.slug, req.query.status === "all");
    if (!blog) {
      res.status(404).json({ message: "Blog post not found." });
      return;
    }
    res.json({ blog });
  } catch (error) {
    next(error);
  }
});

app.post("/api/blogs", requireAdminKey, async (req, res, next) => {
  try {
    res.status(201).json({ blog: await createBlog(req.body) });
  } catch (error) {
    next(error);
  }
});

app.put("/api/blogs/:id", requireAdminKey, async (req, res, next) => {
  try {
    const blog = await updateBlog(req.params.id, req.body);
    if (!blog) {
      res.status(404).json({ message: "Blog post not found." });
      return;
    }
    res.json({ blog });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/blogs/:id", requireAdminKey, async (req, res, next) => {
  try {
    const deleted = await deleteBlog(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Blog post not found." });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({ message: error.message || "Something went wrong." });
});

startStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`Blog API running on http://localhost:${port} using ${storageMode} storage`);
    });
  })
  .catch((error) => {
    console.error("Unable to start blog API", error);
    process.exit(1);
  });
