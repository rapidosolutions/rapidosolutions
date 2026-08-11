import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import Button from "../components/common/Button";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import ReviewAdminPanel from "../components/reviews/ReviewAdminPanel";
import { getAdminSession, loginAdmin, logoutAdmin } from "../utils/blogApi";
import { archiveProject, createProject, deleteProjectPermanently, listAdminProjects, updateProject, updateProjectStatus, uploadProjectImage } from "../utils/projectApi";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

const emptyProject = {
  title: "", slug: "", type: "web", category: "Business Websites", description: "", services: "",
  metric: "", coverImage: null, coverAlt: "", accent: "from-slate-200 to-blue-400", projectUrl: "",
  featured: false, displayOrder: 0, status: "draft", seoTitle: "", seoDescription: ""
};
const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rapido-navy outline-none transition focus:border-rapido-blue focus:ring-2 focus:ring-blue-100";

function Notice({ error, children }) {
  return <p role={error ? "alert" : "status"} className={`rounded-lg p-4 text-sm font-bold ${error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{children}</p>;
}

function statusClass(status) {
  return status === "published" ? "bg-emerald-100 text-emerald-800" : status === "archived" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-800";
}

function DeleteProjectDialog({ project, confirmation, error, loading, fallbackFocusRef, onConfirmationChange, onCancel, onDelete }) {
  const dialogRef = useRef(null);
  const confirmationRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    confirmationRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!loading) onCancel();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement && document.contains(previousFocus)) previousFocus.focus();
      else fallbackFocusRef.current?.focus();
    };
  }, [fallbackFocusRef, loading, onCancel]);

  const confirmed = confirmation === project.title;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-rapido-navy/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onCancel(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="delete-project-title" aria-describedby="delete-project-description" className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-premium md:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-700">Permanent deletion</p>
        <h2 id="delete-project-title" className="mt-2 text-2xl font-extrabold text-rapido-navy">Delete “{project.title}”?</h2>
        <p id="delete-project-description" className="mt-3 leading-7 text-rapido-slate">This permanently removes the project and cannot be undone.</p>
        <label className="mt-5 grid gap-2 text-sm font-extrabold text-rapido-navy">
          Type the project title to confirm
          <input ref={confirmationRef} className={inputClass} value={confirmation} onChange={(event) => onConfirmationChange(event.target.value)} autoComplete="off" aria-describedby="delete-project-confirmation-help" />
        </label>
        <p id="delete-project-confirmation-help" className="mt-2 text-sm text-rapido-slate">Enter exactly: <strong>{project.title}</strong></p>
        {error ? <div className="mt-4"><Notice error>{error}</Notice></div> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
          <button type="button" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" onClick={onDelete} disabled={!confirmed || loading}>
            {loading ? "Deleting" : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectAdmin() {
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeSection, setActiveSection] = useState("projects");
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState("");
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const formHeading = useRef(null);

  usePageMeta("Project Admin", "Securely manage Rapido project content.", { canonicalPath: "/project-admin", robots: "noindex, nofollow" });

  const sortedProjects = useMemo(() => [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), [projects]);
  const editingProject = useMemo(() => projects.find((project) => project.id === editingId) || null, [editingId, projects]);

  useEffect(() => {
    getAdminSession().then(({ admin: value }) => setAdmin(value)).catch(() => setAdmin(null)).finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => { if (admin?.canManageProjects) loadProjects(); }, [admin]);

  async function loadProjects() {
    try { setProjects((await listAdminProjects()).projects); }
    catch (loadError) { if (loadError.status === 401) setAdmin(null); setError(loadError.message); }
  }
  function clearFeedback() { setNotice(""); setError(""); }
  function resetForm() { setForm(emptyProject); setEditingId(""); setImageFile(null); setFileKey((key) => key + 1); }
  async function handleLogin(event) {
    event.preventDefault(); setLoading(true); clearFeedback();
    try {
      const data = await loginAdmin(credentials);
      if (!data.admin.canManageProjects) { await logoutAdmin(); throw new Error("This administrator is not authorized to manage projects."); }
      setAdmin(data.admin); setCredentials((value) => ({ ...value, password: "" }));
    } catch (loginError) { setError(loginError.message); }
    finally { setLoading(false); }
  }
  async function handleLogout() {
    setLoading(true); clearFeedback();
    try { await logoutAdmin(); setAdmin(null); setProjects([]); resetForm(); }
    catch (logoutError) { setError(logoutError.message); }
    finally { setLoading(false); }
  }
  function edit(project) {
    setEditingId(project.id);
    setForm({ ...emptyProject, ...project, services: (project.services || []).join(", ") });
    setImageFile(null); clearFeedback();
    requestAnimationFrame(() => { formHeading.current?.focus(); formHeading.current?.scrollIntoView({ behavior: "smooth", block: "start" }); });
  }
  function previewProject(project = form) {
    setPreview({ ...project, services: Array.isArray(project.services) ? project.services : project.services.split(",").map((value) => value.trim()).filter(Boolean) });
  }
  async function save(event) {
    event.preventDefault(); setLoading(true); clearFeedback();
    try {
      let coverImage = form.coverImage;
      if (imageFile) coverImage = { ...(await uploadProjectImage(imageFile)).asset, alt: form.coverAlt || form.title };
      const payload = { ...form, coverImage, services: form.services.split(",").map((value) => value.trim()).filter(Boolean), displayOrder: Number(form.displayOrder) };
      if (editingId) { await updateProject(editingId, payload); setNotice("Project updated."); }
      else { await createProject(payload); setNotice("Project created."); }
      resetForm(); await loadProjects();
    } catch (saveError) { if (saveError.status === 401) setAdmin(null); setError(saveError.message); }
    finally { setLoading(false); }
  }
  async function setStatus(project, status) {
    clearFeedback(); setLoading(true);
    try { await updateProjectStatus(project.id, status); setNotice(`Project ${status === "published" ? "published" : status === "draft" ? "unpublished" : "archived"}.`); await loadProjects(); }
    catch (statusError) { if (statusError.status === 401) setAdmin(null); setError(statusError.message); }
    finally { setLoading(false); }
  }
  async function archive(project) {
    if (!window.confirm(`Archive "${project.title}"? It will no longer appear publicly.`)) return;
    clearFeedback(); setLoading(true);
    try { await archiveProject(project.id); setNotice("Project archived."); await loadProjects(); }
    catch (archiveError) { setError(archiveError.message); }
    finally { setLoading(false); }
  }
  function openDeleteDialog() {
    if (!editingProject) return;
    setDeleteConfirmation("");
    setDeleteError("");
    setDeleteTarget({ id: editingProject.id, title: editingProject.title });
  }
  function closeDeleteDialog() {
    if (deleteLoading) return;
    setDeleteTarget(null);
    setDeleteConfirmation("");
    setDeleteError("");
  }
  async function permanentlyDeleteProject() {
    if (!deleteTarget || deleteConfirmation !== deleteTarget.title) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteProjectPermanently(deleteTarget.id, deleteConfirmation);
      setProjects((current) => current.filter((project) => project.id !== deleteTarget.id));
      resetForm();
      setDeleteTarget(null);
      setDeleteConfirmation("");
      setNotice("Project deleted successfully.");
      setError("");
    } catch (deleteProjectError) {
      if (deleteProjectError.status === 401) setAdmin(null);
      setDeleteError(deleteProjectError.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (authLoading) return <main className="section-padding min-h-[70vh] bg-white text-center font-bold text-rapido-slate">Checking administrator session...</main>;
  if (!admin) return (
    <motion.main {...pageTransition}>
      <PageHero eyebrow="Private Area" title="Project Administrator Login" description="Sign in with an authorized Rapido administrator account to manage public projects." />
      <section className="section-padding bg-white"><form onSubmit={handleLogin} className="container-shell max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-premium md:p-8"><div className="grid gap-5">
        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Administrator Email<input className={inputClass} type="email" autoComplete="username" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} required /></label>
        <label className="grid gap-2 text-sm font-extrabold text-rapido-navy">Password
          <span className="relative">
            <input className={`${inputClass} pr-20`} type={showPassword ? "text" : "password"} autoComplete="current-password" minLength="10" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} required />
            <button className="absolute inset-y-0 right-0 px-4 text-xs font-extrabold text-rapido-blue hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rapido-blue" type="button" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
        </label>
        {error ? <Notice error>{error}</Notice> : null}<Button type="submit" icon="FiLogIn" disabled={loading}>{loading ? "Signing In" : "Sign In"}</Button>
      </div></form></section>
    </motion.main>
  );
  if (!admin.canManageProjects) return <main className="section-padding min-h-[70vh] bg-white"><div className="container-shell max-w-xl"><Notice error>This administrator is not authorized to manage projects.</Notice><div className="mt-4"><Button type="button" onClick={handleLogout}>Sign Out</Button></div></div></main>;

  return (
    <motion.main {...pageTransition}>
      <PageHero eyebrow="Project Admin" title={activeSection === "projects" ? "Project Management" : "Review Management"} description={activeSection === "projects" ? "Create, preview, publish, unpublish, and archive Rapido project content." : "Moderate customer feedback and select approved reviews for the Home page."}><div className="flex flex-wrap gap-3"><Button to={activeSection === "projects" ? "/projects" : "/reviews"} variant="light">View Public {activeSection === "projects" ? "Projects" : "Reviews"}</Button><Button type="button" variant="light" icon="FiLogOut" onClick={handleLogout} disabled={loading}>Sign Out</Button></div></PageHero>
      <section className="section-padding bg-slate-50"><div className="container-shell">
        <nav className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4" aria-label="Admin sections">
          <Button type="button" size="sm" variant={activeSection === "projects" ? "primary" : "secondary"} onClick={() => setActiveSection("projects")}>Projects</Button>
          <Button type="button" size="sm" variant={activeSection === "reviews" ? "primary" : "secondary"} onClick={() => setActiveSection("reviews")}>Reviews</Button>
        </nav>
        {activeSection === "projects" ? <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
        <div><div className="mb-5 flex items-center justify-between gap-4"><div><p className="eyebrow">Dashboard</p><h2 className="mt-2 text-2xl font-extrabold text-rapido-navy">Projects ({projects.length})</h2></div><Button type="button" size="sm" onClick={() => { resetForm(); formHeading.current?.scrollIntoView({ behavior: "smooth" }); }}>Create Project</Button></div>
          {notice ? <Notice>{notice}</Notice> : null}{error ? <div className="mt-3"><Notice error>{error}</Notice></div> : null}
          <div className="mt-5 grid gap-4">{sortedProjects.length ? sortedProjects.map((project) => <article key={project.id} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[88px_1fr]">
            <div className="h-20 overflow-hidden rounded-md bg-slate-100">{project.coverImage?.url ? <img src={project.coverImage.url} alt="" className="h-full w-full object-cover" /> : <div className={`h-full bg-gradient-to-br ${project.accent}`} />}</div>
            <div><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-extrabold text-rapido-navy">{project.title}</h3><p className="mt-1 text-xs font-semibold text-rapido-slate">Updated {new Date(project.updatedAt).toLocaleDateString()}</p></div><div className="flex gap-2"><span className={`rounded-full px-2 py-1 text-xs font-extrabold capitalize ${statusClass(project.status)}`}>{project.status}</span>{project.featured ? <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-extrabold text-rapido-blue">Featured</span> : null}</div></div>
              <div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => edit(project)}>Edit</Button><Button type="button" size="sm" variant="ghost" onClick={() => previewProject(project)}>Preview</Button>{project.status !== "published" ? <Button type="button" size="sm" variant="ghost" onClick={() => setStatus(project, "published")} disabled={loading}>Publish</Button> : <Button type="button" size="sm" variant="ghost" onClick={() => setStatus(project, "draft")} disabled={loading}>Unpublish</Button>}{project.status !== "archived" ? <Button type="button" size="sm" variant="ghost" onClick={() => archive(project)} disabled={loading}>Archive</Button> : null}</div>
            </div></article>) : <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-rapido-slate">No projects yet. Create the first project.</div>}</div>
        </div>
        <form onSubmit={save} className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-premium"><h2 ref={formHeading} tabIndex="-1" className="text-2xl font-extrabold text-rapido-navy outline-none">{editingId ? "Edit Project" : "Create Project"}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-rapido-navy sm:col-span-2">Title<input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy">Slug<input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Generated when blank" /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy">Type<select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="web">Web</option><option value="financial">Financial</option><option value="human">Human Resource</option></select></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy">Category<input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy">Status<select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy sm:col-span-2">Short Description<textarea className={inputClass} rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy sm:col-span-2">Services (comma separated)<input className={inputClass} value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} required /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy">Result Focus<input className={inputClass} value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} required /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy">Display Order<input className={inputClass} type="number" min="0" max="10000" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy sm:col-span-2">Project Image<input key={fileKey} className={inputClass} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy sm:col-span-2">Image Alt Text<input className={inputClass} value={form.coverAlt} onChange={(e) => setForm({ ...form, coverAlt: e.target.value })} /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy sm:col-span-2">Project URL<input className={inputClass} type="url" value={form.projectUrl} onChange={(e) => setForm({ ...form, projectUrl: e.target.value })} placeholder="https://" /></label>
          <label className="flex items-center gap-3 text-sm font-bold text-rapido-navy sm:col-span-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured project</label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy sm:col-span-2">SEO Title<input className={inputClass} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} /></label>
          <label className="grid gap-2 text-sm font-bold text-rapido-navy sm:col-span-2">SEO Description<textarea className={inputClass} rows="3" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} /></label>
        </div><div className="mt-6 flex flex-wrap gap-3"><Button type="submit" disabled={loading}>{loading ? "Saving" : editingId ? "Update Project" : "Create Project"}</Button><Button type="button" variant="secondary" onClick={() => previewProject()}>Preview</Button>{editingId ? <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button> : null}</div>
        {editingProject ? <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5" aria-labelledby="danger-zone-title"><h3 id="danger-zone-title" className="text-lg font-extrabold text-red-900">Danger Zone</h3><p className="mt-2 text-sm leading-6 text-red-800">Delete this project permanently. This action cannot be undone.</p><button type="button" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-red-700 bg-white px-4 text-sm font-extrabold text-red-800 transition hover:bg-red-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2" onClick={openDeleteDialog}>Delete Project</button></section> : null}
        </form>
        </div> : <ReviewAdminPanel onUnauthorized={() => setAdmin(null)} />}
      </div></section>
      {preview ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-rapido-navy/70 p-4" role="dialog" aria-modal="true" aria-label="Project preview" onMouseDown={(e) => { if (e.target === e.currentTarget) setPreview(null); }}><div className="w-full max-w-md rounded-lg bg-white p-4"><div className="mb-3 flex justify-end"><Button type="button" size="sm" variant="secondary" onClick={() => setPreview(null)}>Close Preview</Button></div><PortfolioCard project={preview} /></div></div> : null}
      {deleteTarget ? <DeleteProjectDialog project={deleteTarget} confirmation={deleteConfirmation} error={deleteError} loading={deleteLoading} fallbackFocusRef={formHeading} onConfirmationChange={setDeleteConfirmation} onCancel={closeDeleteDialog} onDelete={permanentlyDeleteProject} /> : null}
    </motion.main>
  );
}
