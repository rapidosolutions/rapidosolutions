import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import Button from "../components/common/Button";
import Icon from "../components/ui/Icon";
import { createBlog, deleteBlog, listBlogs, updateBlog } from "../utils/blogApi";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

const emptyForm = {
  title: "",
  slug: "",
  category: "Web Strategy",
  summary: "",
  content: "",
  author: "Rapido Editorial",
  readTime: "",
  published: true
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rapido-navy outline-none transition focus:border-rapido-blue focus:ring-2 focus:ring-blue-100";

export default function BlogAdmin() {
  const [adminKey, setAdminKey] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storage, setStorage] = useState("");

  usePageMeta("Blog Admin", "Create, update, publish, and manage Rapido Solutions Co. blog posts.");

  const sortedBlogs = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [blogs]
  );

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function loadPosts(key = adminKey) {
    setLoading(true);
    setError("");
    try {
      const data = await listBlogs({ includeDrafts: true, adminKey: key });
      setBlogs(data.blogs);
      setStorage(data.storage);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts("");
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
  }

  function editPost(post) {
    setEditingId(post.id);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      category: post.category || "Web Strategy",
      summary: post.summary || "",
      content: post.content || "",
      author: post.author || "Rapido Editorial",
      readTime: post.readTime || "",
      published: Boolean(post.published)
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = { ...form, readTime: form.readTime.trim() };
      if (editingId) {
        await updateBlog(editingId, payload, adminKey);
        setMessage("Blog post updated.");
      } else {
        await createBlog(payload, adminKey);
        setMessage("Blog post published.");
      }
      resetForm();
      await loadPosts(adminKey);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removePost(post) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await deleteBlog(post.id, adminKey);
      setMessage("Blog post deleted.");
      if (editingId === post.id) resetForm();
      await loadPosts(adminKey);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Blog Admin"
        title="Create and Manage Blog Posts"
        description="A focused editor for publishing Rapido articles about web services, financial support, operations, and growth."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/blogs" variant="light" icon="FiArrowLeft" iconPosition="left">
            View Blogs
          </Button>
          <Button to="/contact">Plan Content</Button>
        </div>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-premium">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rapido-blue">
                  {editingId ? "Editing" : "New Post"}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-rapido-navy">
                  {editingId ? "Update Article" : "Write Article"}
                </h2>
              </div>
              {editingId ? (
                <Button type="button" variant="secondary" size="sm" icon="FiX" onClick={resetForm}>
                  Cancel Edit
                </Button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                Title
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Article title"
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                  Category
                  <input
                    className={inputClass}
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    placeholder="Web Strategy"
                  />
                </label>
                <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                  Author
                  <input
                    className={inputClass}
                    value={form.author}
                    onChange={(event) => updateField("author", event.target.value)}
                    placeholder="Rapido Editorial"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                  Slug
                  <input
                    className={inputClass}
                    value={form.slug}
                    onChange={(event) => updateField("slug", event.target.value)}
                    placeholder="auto-generated-if-blank"
                  />
                </label>
                <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                  Read Time
                  <input
                    className={inputClass}
                    value={form.readTime}
                    onChange={(event) => updateField("readTime", event.target.value)}
                    placeholder="Auto if blank"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                Summary
                <textarea
                  className={`${inputClass} min-h-28 resize-y leading-7`}
                  value={form.summary}
                  onChange={(event) => updateField("summary", event.target.value)}
                  placeholder="Short preview text for cards"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                Article Content
                <textarea
                  className={`${inputClass} min-h-72 resize-y leading-7`}
                  value={form.content}
                  onChange={(event) => updateField("content", event.target.value)}
                  placeholder="Write the full article here"
                  required
                />
              </label>

              <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-extrabold text-rapido-navy">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => updateField("published", event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rapido-blue"
                />
                Published
              </label>

              <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                Admin Key
                <input
                  className={inputClass}
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  placeholder="Required only when configured"
                  type="password"
                />
              </label>

              {message ? <p className="rounded-lg bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{message}</p> : null}
              {error ? <p className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p> : null}

              <Button type="submit" icon="FiSave" disabled={saving}>
                {saving ? "Saving" : editingId ? "Update Post" : "Publish Post"}
              </Button>
            </div>
          </form>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rapido-blue">Library</p>
                <h2 className="mt-2 text-2xl font-extrabold text-rapido-navy">Blog Posts</h2>
              </div>
              <Button type="button" variant="secondary" size="sm" icon="FiRefreshCw" onClick={() => loadPosts(adminKey)}>
                Refresh
              </Button>
            </div>

            <div className="mt-5 grid gap-4">
              {loading ? <p className="text-sm font-bold text-rapido-slate">Loading posts...</p> : null}
              {!loading && !sortedBlogs.length ? (
                <p className="rounded-lg bg-white p-4 text-sm font-bold text-rapido-slate">No blog posts found.</p>
              ) : null}
              {storage ? (
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-slate">
                  <Icon name={storage === "mongo" ? "FiDatabase" : "FiFileText"} className="h-4 w-4 text-rapido-blue" />
                  {storage} storage
                </div>
              ) : null}

              {sortedBlogs.map((post) => (
                <article key={post.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-slate">
                        <span>{post.category}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{post.published ? "Published" : "Draft"}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-extrabold text-rapido-navy">{post.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-rapido-slate">{post.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" icon="FiEdit3" onClick={() => editPost(post)}>
                        Edit
                      </Button>
                      <Button type="button" size="sm" variant="ghost" icon="FiTrash2" onClick={() => removePost(post)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
