import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiRefreshCw,
  FiStar,
  FiCheckCircle,
  FiLayers,
  FiTrendingUp,
  FiAlertCircle,
  FiArchive,
  FiGlobe
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { usePortal } from "./PortalContext";
import { listAdminProjects, updateProjectStatus, archiveProject, deleteProjectPermanently } from "../utils/projectApi";
import { projectCategories, projects as staticProjects } from "../data/portfolioData";

const TYPE_LABELS = {
  web: "Web & Tech",
  financial: "Financial",
  human: "HR Support"
};

const TYPE_COLORS = {
  web: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  financial: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  human: "bg-purple-500/10 text-purple-400 border-purple-500/30"
};

export default function PortalProjectsList({ onAddNew, onEditProject }) {
  const { isDark } = usePortal();
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [notice, setNotice] = useState("");
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);
  const [deleteInputTitle, setDeleteInputTitle] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await listAdminProjects();
      if (response?.projects?.length) {
        setProjectsList(response.projects);
      } else {
        // Fallback to static projects if API returns empty
        setProjectsList(staticProjects.map((p, i) => ({
          ...p,
          id: `static-${i}`,
          status: "published",
          displayOrder: i + 1
        })));
      }
    } catch (err) {
      // In case of network glitch, use static projects
      setProjectsList(staticProjects.map((p, i) => ({
        ...p,
        id: `static-${i}`,
        status: "published",
        displayOrder: i + 1
      })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleStatus = async (project) => {
    const nextStatus = project.status === "published" ? "draft" : "published";
    try {
      await updateProjectStatus(project.id, nextStatus);
      setProjectsList((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, status: nextStatus } : p))
      );
      setNotice(`"${project.title}" status updated to ${nextStatus}.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setNotice(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeletePermanent = async () => {
    if (!deleteConfirmProject) return;
    setDeleting(true);
    try {
      await deleteProjectPermanently(deleteConfirmProject.id, deleteInputTitle);
      setProjectsList((prev) => prev.filter((p) => p.id !== deleteConfirmProject.id));
      setDeleteConfirmProject(null);
      setDeleteInputTitle("");
      setNotice(`"${deleteConfirmProject.title}" has been deleted.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setNotice(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projectsList.filter((project) => {
      const matchesSearch =
        !searchQuery.trim() ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.services || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === "all" || project.type === selectedType;
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;

      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  }, [projectsList, searchQuery, selectedType, selectedCategory, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = projectsList.length;
    const published = projectsList.filter((p) => p.status === "published").length;
    const drafts = projectsList.filter((p) => p.status === "draft").length;
    const featured = projectsList.filter((p) => p.featured).length;
    return { total, published, drafts, featured };
  }, [projectsList]);

  // Static image fallback lookup map by slug or title
  const staticImageBySlug = useMemo(() => {
    const map = new Map();
    staticProjects.forEach((p) => {
      const slugKey = (p.slug || p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (p.coverImage) {
        map.set(slugKey, p.coverImage);
        map.set(p.title.toLowerCase(), p.coverImage);
      }
    });
    return map;
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display flex items-center gap-3 ${isDark ? "text-white" : "text-slate-900"}`}>
            <span>Portfolio Projects</span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Synced Live ({stats.total})
            </span>
          </h1>
          <p className={`mt-1 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            All projects listed across Web, Financial, and HR services. Any changes made here sync immediately to the live site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchProjects(true)}
            disabled={refreshing}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition disabled:opacity-50 ${
              isDark
                ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 shadow-sm"
            }`}
            title="Refresh from server"
          >
            <FiRefreshCw className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/projects"
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
              isDark
                ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 shadow-sm"
            }`}
          >
            <FiGlobe className="text-xs text-rapido-sky" />
            <span>Open /projects</span>
            <FiExternalLink className="text-[10px]" />
          </Link>

          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rapido-blue via-blue-600 to-rapido-sky px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-[0.98] transition"
          >
            <FiPlus className="text-base" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-6 flex items-center justify-between rounded-xl border border-rapido-sky/30 bg-rapido-sky/10 p-3.5 text-xs font-semibold text-rapido-sky"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle className="text-sm shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice("")} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`rounded-2xl border p-4 backdrop-blur-xl transition ${isDark ? "border-white/10 bg-[#0d1b2e]/80" : "border-slate-200 bg-white shadow-sm"}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>Total Projects</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-display ${isDark ? "text-white" : "text-slate-900"}`}>{stats.total}</span>
            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>all types</span>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-xl transition ${isDark ? "border-emerald-500/20 bg-emerald-950/20" : "border-emerald-200 bg-emerald-50/80 shadow-sm"}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>Published Live</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-display ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>{stats.published}</span>
            <span className={`text-xs ${isDark ? "text-emerald-400/80" : "text-emerald-600"}`}>on /projects</span>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-xl transition ${isDark ? "border-amber-500/20 bg-amber-950/20" : "border-amber-200 bg-amber-50/80 shadow-sm"}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-amber-400" : "text-amber-700"}`}>Drafts</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-display ${isDark ? "text-amber-300" : "text-amber-700"}`}>{stats.drafts}</span>
            <span className={`text-xs ${isDark ? "text-amber-400/80" : "text-amber-600"}`}>hidden</span>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 backdrop-blur-xl transition ${isDark ? "border-blue-500/20 bg-blue-950/20" : "border-blue-200 bg-blue-50/80 shadow-sm"}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-blue-400" : "text-blue-700"}`}>Featured</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-display ${isDark ? "text-blue-300" : "text-blue-700"}`}>{stats.featured}</span>
            <span className={`text-xs ${isDark ? "text-blue-400/80" : "text-blue-600"}`}>top pins</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`mb-6 rounded-2xl border p-4 backdrop-blur-xl shadow-lg transition ${isDark ? "border-white/10 bg-[#0d1b2e]/90" : "border-slate-200 bg-white shadow-sm"}`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <FiSearch className="text-sm" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project title, service tag, or keyword..."
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-xs font-medium outline-none transition ${
                isDark
                  ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky focus:bg-white/[0.07]"
                  : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
              }`}
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Domains" },
              { id: "web", label: "Web" },
              { id: "financial", label: "Financial" },
              { id: "human", label: "HR" }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition whitespace-nowrap ${
                  selectedType === t.id
                    ? "bg-rapido-blue text-white shadow-sm"
                    : isDark
                    ? "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="min-w-[170px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-xs font-semibold outline-none transition ${
                isDark
                  ? "border-white/10 bg-[#091526] text-white focus:border-rapido-sky"
                  : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
              }`}
            >
              <option value="All">All Categories</option>
              {projectCategories
                .filter((c) => c !== "All")
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="min-w-[130px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2.5 text-xs font-semibold outline-none transition ${
                isDark
                  ? "border-white/10 bg-[#091526] text-white focus:border-rapido-sky"
                  : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid / Directory */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-[#0d1b2e]/50">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-rapido-sky" />
            <p className="text-xs font-semibold text-slate-400">Loading live site projects…</p>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-slate-400 mb-3 text-xl">
            <FiLayers />
          </div>
          <h3 className="text-sm font-bold text-white">No projects found matching filters</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            Try resetting your search query or category filters, or add a new project now.
          </p>
          <button
            type="button"
            onClick={onAddNew}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rapido-blue px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition"
          >
            <FiPlus /> Add New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project, idx) => {
            const slugKey = (project.slug || project.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            const fallbackStatic = staticImageBySlug.get(slugKey) || staticImageBySlug.get(project.title?.toLowerCase());
            const coverSrc =
              project.coverImage?.url ||
              (typeof project.coverImage === "string" ? project.coverImage : null) ||
              (typeof fallbackStatic === "string" ? fallbackStatic : fallbackStatic?.url || null);
            return (
              <motion.div
                key={project.id || project.slug || idx}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl flex flex-col justify-between transition duration-300 ${
                  isDark
                    ? "border-white/10 bg-[#0c182c]/85 hover:border-white/20 hover:shadow-2xl text-white"
                    : "border-slate-200 bg-white hover:border-blue-300 shadow-sm hover:shadow-lg text-slate-900"
                }`}
              >
                <div>
                  {/* Card Media Preview */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={project.coverAlt || project.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`h-full w-full bg-gradient-to-br ${project.accent || "from-slate-200 to-blue-400"}`} />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${TYPE_COLORS[project.type] || "bg-white/10 text-white border-white/20"}`}>
                        {TYPE_LABELS[project.type] || project.type}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {project.featured && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow-sm" title="Featured project">
                            <FiStar className="text-[9px]" /> Featured
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            project.status === "published"
                              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                              : project.status === "archived"
                              ? "bg-slate-700/60 border border-slate-600 text-slate-300"
                              : "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                          }`}
                        >
                          {project.status || "published"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-xs">
                      <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className={`text-base font-bold transition ${isDark ? "text-white group-hover:text-rapido-sky" : "text-slate-900 group-hover:text-blue-600"}`}>
                      {project.title}
                    </h3>
                    <p className={`mt-2 text-xs line-clamp-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {project.description}
                    </p>

                    {/* Services Tags */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {(project.services || []).slice(0, 4).map((service) => (
                        <span
                          key={service}
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                            isDark
                              ? "bg-white/[0.04] border-white/10 text-slate-300"
                              : "bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          {service}
                        </span>
                      ))}
                      {(project.services || []).length > 4 && (
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${isDark ? "bg-white/[0.04] text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                          +{(project.services || []).length - 4}
                        </span>
                      )}
                    </div>

                    {/* Metric pill */}
                    {project.metric && (
                      <div className={`mt-3.5 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${
                        isDark
                          ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-300"
                          : "bg-emerald-50 border-emerald-200 text-emerald-800"
                      }`}>
                        <FiTrendingUp className="text-emerald-500 shrink-0 text-xs" />
                        <span className="font-semibold truncate text-[11px]">{project.metric}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className={`border-t p-3 px-5 flex items-center justify-between gap-2 transition ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-100 bg-slate-50/80"}`}>
                  <div className="flex items-center gap-1">
                    <Link
                      to="/projects"
                      target="_blank"
                      rel="noreferrer"
                      className={`p-1.5 rounded-lg transition ${isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"}`}
                      title="View on live website"
                    >
                      <FiExternalLink className="text-sm" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(project)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-md transition ${
                        project.status === "published"
                          ? isDark ? "text-slate-400 hover:text-amber-400" : "text-slate-600 hover:text-amber-600"
                          : "text-emerald-500 hover:underline font-bold"
                      }`}
                      title={project.status === "published" ? "Switch to Draft" : "Publish Live"}
                    >
                      {project.status === "published" ? "Unpublish" : "Go Live"}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditProject(project)}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        isDark
                          ? "border-white/10 bg-white/[0.05] text-slate-200 hover:border-rapido-sky hover:text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                      }`}
                    >
                      <FiEdit2 className="text-xs" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmProject(project)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                      title="Delete permanently"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition ${isDark ? "border-red-500/30 bg-[#0d1626] text-white" : "border-red-200 bg-white text-slate-900"}`}>
            <h3 className="text-lg font-bold">Delete Project</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">&quot;{deleteConfirmProject.title}&quot;</strong>? This cannot be undone.
            </p>
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Type the project title to confirm:
              </label>
              <input
                type="text"
                value={deleteInputTitle}
                onChange={(e) => setDeleteInputTitle(e.target.value)}
                placeholder={deleteConfirmProject.title}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-red-400"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmProject(null);
                  setDeleteInputTitle("");
                }}
                disabled={deleting}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePermanent}
                disabled={deleting || deleteInputTitle !== deleteConfirmProject.title}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40"
              >
                {deleting ? "Deleting…" : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
