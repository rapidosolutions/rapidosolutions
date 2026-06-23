import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import Button from "../components/common/Button";
import {
  createBlog,
  changeAdminPassword,
  deleteBlog,
  deleteMessage,
  getAdminSession,
  listBlogs,
  listMessages,
  loginAdmin,
  logoutAdmin,
  updateBlog,
  updateMessageStatus,
  uploadBlogCover
} from "../utils/blogApi";
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
  published: true,
  coverImage: null
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rapido-navy outline-none transition focus:border-rapido-blue focus:ring-2 focus:ring-blue-100";

function Notice({ type = "success", children }) {
  const classes = type === "error" ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800";
  return <p className={`rounded-lg p-4 text-sm font-bold ${classes}`}>{children}</p>;
}

export default function BlogAdmin() {
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [credentials, setCredentials] = useState({ email: "rapidosolutionsco@outlook.com", password: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [activeTab, setActiveTab] = useState("posts");
  const [blogs, setBlogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [editingId, setEditingId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  usePageMeta("Blog Admin", "Securely manage Rapido blog posts and customer enquiries.");

  const sortedBlogs = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [blogs]
  );

  useEffect(() => {
    getAdminSession()
      .then((data) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!admin) return;
    loadPosts();
    loadInbox();
  }, [admin]);

  function clearFeedback() {
    setNotice("");
    setError("");
  }

  async function loadPosts() {
    try {
      const data = await listBlogs({ includeDrafts: true });
      setBlogs(data.blogs);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  async function loadInbox() {
    try {
      const data = await listMessages({ limit: "100" });
      setMessages(data.messages);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      const data = await loginAdmin(credentials);
      setAdmin(data.admin);
      setCredentials((current) => ({ ...current, password: "" }));
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await logoutAdmin();
      setAdmin(null);
      setBlogs([]);
      setMessages([]);
    } catch (logoutError) {
      setError(logoutError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    clearFeedback();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("The new password confirmation does not match.");
      return;
    }
    setLoading(true);
    try {
      await changeAdminPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setAdmin(null);
    } catch (passwordError) {
      setError(passwordError.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setCoverFile(null);
    setFileKey((value) => value + 1);
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
      published: Boolean(post.published),
      coverImage: post.coverImage || null
    });
    setCoverFile(null);
    clearFeedback();
    window.scrollTo({ top: 320, behavior: "smooth" });
  }

  async function savePost(event) {
    event.preventDefault();
    setLoading(true);
    clearFeedback();
    try {
      let coverImage = form.coverImage;
      if (coverFile) {
        const upload = await uploadBlogCover(coverFile);
        coverImage = { ...upload.asset, alt: form.title };
      }
      const payload = { ...form, readTime: form.readTime.trim(), coverImage };
      if (editingId) {
        await updateBlog(editingId, payload);
        setNotice("Blog post updated.");
      } else {
        await createBlog(payload);
        setNotice("Blog post created.");
      }
      resetForm();
      await loadPosts();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  }

  async function removePost(post) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    setLoading(true);
    clearFeedback();
    try {
      await deleteBlog(post.id);
      if (editingId === post.id) resetForm();
      setNotice("Blog post deleted.");
      await loadPosts();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeMessageStatus(id, status) {
    clearFeedback();
    try {
      const data = await updateMessageStatus(id, status);
      setMessages((current) => current.map((item) => (item.id === id ? data.message : item)));
      setNotice("Message status updated.");
    } catch (statusError) {
      setError(statusError.message);
    }
  }

  async function removeMessage(message) {
    if (!window.confirm(`Delete the enquiry from ${message.name}?`)) return;
    clearFeedback();
    try {
      await deleteMessage(message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
      setNotice("Message deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (authLoading) {
    return <main className="section-padding min-h-[70vh] bg-white text-center font-bold text-rapido-slate">Checking administrator session...</main>;
  }

  if (!admin) {
    return (
      <motion.main {...pageTransition}>
        <PageHero eyebrow="Private Area" title="Blog Administrator Login" description="Sign in to publish articles, upload cover images, and review customer enquiries." />
        <section className="section-padding bg-white">
          <form onSubmit={handleLogin} className="container-shell max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-premium md:p-8">
            <div className="grid gap-5">
              <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                Administrator Email
                <input className={inputClass} type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} autoComplete="username" required />
              </label>
              <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">
                Password
                <input className={inputClass} type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} autoComplete="current-password" minLength={10} required />
              </label>
              {error ? <Notice type="error">{error}</Notice> : null}
              <Button type="submit" icon="FiLogIn" disabled={loading}>{loading ? "Signing In" : "Sign In"}</Button>
            </div>
          </form>
        </section>
      </motion.main>
    );
  }

  return (
    <motion.main {...pageTransition}>
      <PageHero eyebrow="Blog Admin" title="Content and Enquiry Dashboard" description="Publish blog posts, add cover images, and manage messages from one private workspace.">
        <div className="flex flex-wrap gap-3">
          <Button to="/blogs" variant="light" icon="FiArrowLeft" iconPosition="left">View Blogs</Button>
          <Button type="button" variant="light" icon="FiLogOut" onClick={handleLogout} disabled={loading}>Sign Out</Button>
        </div>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell">
          <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            <Button type="button" size="sm" variant={activeTab === "posts" ? "primary" : "secondary"} icon="FiEdit3" onClick={() => setActiveTab("posts")}>Blog Posts</Button>
            <Button type="button" size="sm" variant={activeTab === "messages" ? "primary" : "secondary"} icon="FiMail" onClick={() => setActiveTab("messages")}>Messages ({messages.filter((item) => item.status === "new").length})</Button>
            <Button type="button" size="sm" variant={activeTab === "security" ? "primary" : "secondary"} icon="FiShield" onClick={() => setActiveTab("security")}>Security</Button>
          </div>
          <div className="mb-6 grid gap-3">
            {notice ? <Notice>{notice}</Notice> : null}
            {error ? <Notice type="error">{error}</Notice> : null}
          </div>

          {activeTab === "posts" ? (
            <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
              <form onSubmit={savePost} className="rounded-lg border border-slate-200 bg-white p-6 shadow-premium">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <h2 className="text-2xl font-extrabold text-rapido-navy">{editingId ? "Update Article" : "Write Article"}</h2>
                  {editingId ? <Button type="button" variant="secondary" size="sm" icon="FiX" onClick={resetForm}>Cancel</Button> : null}
                </div>
                <div className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Title<input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Category<input className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required /></label>
                    <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Author<input className={inputClass} value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} required /></label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Slug<input className={inputClass} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Generated when blank" /></label>
                    <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Read Time<input className={inputClass} value={form.readTime} onChange={(event) => setForm({ ...form, readTime: event.target.value })} placeholder="Calculated when blank" /></label>
                  </div>
                  <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Cover Image<input key={fileKey} className={inputClass} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} />
                    <span className="text-xs font-semibold text-rapido-slate">JPG, PNG, or WebP. Maximum 5 MB.</span>
                  </label>
                  {form.coverImage?.url ? <div className="relative overflow-hidden rounded-lg border border-slate-200"><img src={form.coverImage.url} alt="Current blog cover" className="aspect-video w-full object-cover" /><button type="button" className="absolute right-3 top-3 rounded bg-white px-3 py-2 text-xs font-extrabold text-rose-700 shadow" onClick={() => setForm({ ...form, coverImage: null })}>Remove</button></div> : null}
                  <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Summary<textarea className={`${inputClass} min-h-28 resize-y leading-7`} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} required /></label>
                  <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Article Content<textarea className={`${inputClass} min-h-72 resize-y leading-7`} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required /></label>
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-extrabold text-rapido-navy"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} className="h-4 w-4" />Published</label>
                  <Button type="submit" icon="FiSave" disabled={loading}>{loading ? "Saving" : editingId ? "Update Post" : "Publish Post"}</Button>
                </div>
              </form>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-5"><h2 className="text-2xl font-extrabold text-rapido-navy">Blog Posts</h2><Button type="button" variant="secondary" size="sm" icon="FiRefreshCw" onClick={loadPosts}>Refresh</Button></div>
                <div className="mt-5 grid gap-4">
                  {!sortedBlogs.length ? <p className="rounded-lg bg-white p-4 text-sm font-bold text-rapido-slate">No blog posts found.</p> : null}
                  {sortedBlogs.map((post) => (
                    <article key={post.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                      {post.coverImage?.url ? <img src={post.coverImage.url} alt={post.coverImage.alt || post.title} className="aspect-[2.4/1] w-full object-cover" /> : null}
                      <div className="p-5"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-slate">{post.category} · {post.published ? "Published" : "Draft"}</p><h3 className="mt-3 text-lg font-extrabold text-rapido-navy">{post.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-rapido-slate">{post.summary}</p><div className="mt-4 flex flex-wrap gap-2"><Button type="button" size="sm" variant="secondary" icon="FiEdit3" onClick={() => editPost(post)}>Edit</Button><Button type="button" size="sm" variant="ghost" icon="FiTrash2" onClick={() => removePost(post)}>Delete</Button></div></div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === "messages" ? (
            <div className="grid gap-5">
              {!messages.length ? <p className="rounded-lg border border-slate-200 bg-slate-50 p-6 font-bold text-rapido-slate">No customer enquiries yet.</p> : null}
              {messages.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-blue">{item.service} · {new Date(item.createdAt).toLocaleString()}</p><h2 className="mt-2 text-xl font-extrabold text-rapido-navy">{item.name}</h2><p className="mt-1 font-semibold text-rapido-slate"><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone ? ` · ${item.phone}` : ""}{item.company ? ` · ${item.company}` : ""}</p></div><div className="flex flex-wrap gap-2"><select aria-label={`Status for ${item.name}`} className={inputClass} value={item.status} onChange={(event) => changeMessageStatus(item.id, event.target.value)}><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select><Button type="button" size="sm" variant="ghost" icon="FiTrash2" onClick={() => removeMessage(item)}>Delete</Button></div></div>
                  <p className="mt-5 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 leading-7 text-rapido-slate">{item.message}</p><p className="mt-3 text-xs font-bold text-rapido-slate">Budget: {item.budget} · Team email: {item.notificationEmailStatus} · Customer confirmation: {item.confirmationEmailStatus}</p>
                </article>
              ))}
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-premium md:p-8">
              <h2 className="text-2xl font-extrabold text-rapido-navy">Change Administrator Password</h2>
              <p className="mt-2 leading-7 text-rapido-slate">Use at least 12 characters. After the change, you will be signed out and can log in with the new password.</p>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Current Password<input className={inputClass} type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} autoComplete="current-password" minLength={10} required /></label>
                <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">New Password<input className={inputClass} type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} autoComplete="new-password" minLength={12} required /></label>
                <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Confirm New Password<input className={inputClass} type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} autoComplete="new-password" minLength={12} required /></label>
                <Button type="submit" icon="FiShield" disabled={loading}>{loading ? "Updating Password" : "Update Password"}</Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </motion.main>
  );
}
