import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUploadCloud,
  FiImage,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowLeft,
  FiGlobe,
  FiTag,
  FiLayers,
  FiTrendingUp,
  FiStar,
  FiExternalLink
} from "react-icons/fi";
import { createProject, updateProject, uploadProjectImage } from "../utils/projectApi";
import { projectCategories, projects as staticProjects } from "../data/portfolioData";
import Badge from "../components/common/Badge";
import { usePortal } from "./PortalContext";

const ACCENT_PRESETS = [
  { label: "Ocean Blue", value: "from-slate-200 to-blue-400" },
  { label: "Sky Horizon", value: "from-slate-200 to-sky-300" },
  { label: "Emerald Breeze", value: "from-blue-100 to-emerald-300" },
  { label: "Cyan Glow", value: "from-blue-200 to-cyan-300" },
  { label: "Indigo Deep", value: "from-indigo-200 to-blue-300" },
  { label: "Finance Green", value: "from-emerald-100 to-blue-200" }
];

const CATEGORY_MAP = {
  web: [
    "Shopify Stores",
    "WordPress Websites",
    "Business Websites",
    "Restaurant Websites",
    "Real Estate Websites",
    "SaaS Landing Pages",
    "UI/UX Improvements",
    "SEO/Performance Projects"
  ],
  financial: ["Financial Projects"],
  human: ["Human Resource Projects"]
};

const SUGGESTED_SERVICES = {
  web: ["Shopify", "WordPress", "Web Design", "UI/UX", "SEO", "CRO", "Performance", "Full-Stack", "Mobile Responsive"],
  financial: ["Bookkeeping", "Property Accounting", "Reconciliations", "AR/AP", "Financial Reporting", "Month-End Close", "Payroll", "QuickBooks", "Xero"],
  human: ["Talent Acquisition", "HR Policies", "SOPs", "Onboarding", "Training", "Team Development", "Screening", "Hiring Pipeline"]
};

export default function PortalProjectForm({ editingProject = null, onSaved, onCancel }) {
  const { isDark } = usePortal();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    type: "web",
    category: "Shopify Stores",
    description: "",
    services: [],
    metric: "",
    projectUrl: "",
    accent: "from-slate-200 to-blue-400",
    coverAlt: "",
    featured: false,
    displayOrder: 0,
    status: "published",
    seoTitle: "",
    seoDescription: ""
  });

  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title || "",
        slug: editingProject.slug || "",
        type: editingProject.type || "web",
        category: editingProject.category || "Shopify Stores",
        description: editingProject.description || "",
        services: Array.isArray(editingProject.services) ? editingProject.services : [],
        metric: editingProject.metric || "",
        projectUrl: editingProject.projectUrl || "",
        accent: editingProject.accent || "from-slate-200 to-blue-400",
        coverAlt: editingProject.coverAlt || "",
        featured: Boolean(editingProject.featured),
        displayOrder: editingProject.displayOrder || 0,
        status: editingProject.status || "published",
        seoTitle: editingProject.seoTitle || "",
        seoDescription: editingProject.seoDescription || ""
      });

      const slugKey = (editingProject.slug || editingProject.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const matchedStatic = staticProjects.find(
        (p) => (p.slug || p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slugKey ||
               p.title.toLowerCase() === editingProject.title?.toLowerCase()
      );
      const fallbackSrc = matchedStatic?.coverImage;

      if (editingProject.coverImage) {
        setCoverImage(editingProject.coverImage);
        setImagePreview(typeof editingProject.coverImage === "string" ? editingProject.coverImage : editingProject.coverImage.url || fallbackSrc);
      } else if (fallbackSrc) {
        setImagePreview(typeof fallbackSrc === "string" ? fallbackSrc : fallbackSrc?.url);
      }
    }
  }, [editingProject]);

  const handleTitleChange = (val) => {
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (!editingProject) {
        updated.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      return updated;
    });
  };

  const handleTypeChange = (type) => {
    const validCats = CATEGORY_MAP[type] || [];
    setFormData((prev) => ({
      ...prev,
      type,
      category: validCats[0] || prev.category
    }));
  };

  const handleAddTag = (tagToAdd) => {
    const trimmed = (tagToAdd || tagInput).trim();
    if (!trimmed) return;
    if (!formData.services.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, trimmed]
      }));
    }
    setTagInput("");
  };

  const handleRemoveTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorNotice("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorNotice("Image file size must be less than 5MB.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploadingImage(true);
    setErrorNotice("");

    try {
      const response = await uploadProjectImage(file);
      if (response?.asset) {
        setCoverImage({
          url: response.asset.url,
          publicId: response.asset.publicId,
          storageType: response.asset.storageType || "local",
          alt: formData.coverAlt || formData.title
        });
      }
    } catch (err) {
      setErrorNotice(err.message || "Failed to upload image to server.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorNotice("");
    setSuccessNotice("");

    if (!formData.title.trim()) {
      setErrorNotice("Project title is required.");
      return;
    }
    if (!formData.description.trim()) {
      setErrorNotice("Project description is required.");
      return;
    }
    if (!formData.services.length) {
      setErrorNotice("Please add at least one service/skill tag.");
      return;
    }
    if (!formData.metric.trim()) {
      setErrorNotice("Please provide a result/metric focus (e.g., 'Cleaner purchase journey').");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        slug: formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: formData.description.trim(),
        metric: formData.metric.trim(),
        coverImage: coverImage ? {
          url: coverImage.url,
          publicId: coverImage.publicId || "",
          storageType: coverImage.storageType || "local",
          alt: formData.coverAlt || formData.title
        } : null,
        coverAlt: formData.coverAlt || formData.title,
        projectUrl: formData.projectUrl.trim() || "",
        displayOrder: Number(formData.displayOrder) || 0
      };

      if (editingProject?.id) {
        await updateProject(editingProject.id, payload);
        setSuccessNotice("Project updated successfully and synced with the live website!");
      } else {
        await createProject(payload);
        setSuccessNotice("Project published successfully! It is now live on the website under the selected category.");
      }

      setTimeout(() => {
        if (onSaved) onSaved();
      }, 1200);
    } catch (err) {
      setErrorNotice(err.message || "Failed to save project. Please check fields.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className={`group mb-2 inline-flex items-center gap-2 text-xs font-semibold transition ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            <span>Back to All Projects</span>
          </button>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${isDark ? "text-white" : "text-slate-900"}`}>
            {editingProject ? `Edit Project: ${editingProject.title}` : "Add New Project to Website"}
          </h1>
          <p className={`mt-1 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Publish projects in any category. Submitted projects sync directly with the live portfolio on Rapido Solutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
              isDark
                ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 shadow-sm"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploadingImage}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rapido-blue via-blue-600 to-rapido-sky px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition"
          >
            {submitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Saving to Live Site…</span>
              </>
            ) : (
              <>
                <FiCheckCircle className="text-sm" />
                <span>{editingProject ? "Update Project" : "Publish Project Live"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {errorNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500"
          >
            <FiAlertCircle className="shrink-0 text-base text-red-400" />
            <span>{errorNotice}</span>
          </motion.div>
        )}
        {successNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-500"
          >
            <FiCheckCircle className="shrink-0 text-base text-emerald-400" />
            <span>{successNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Category & Type Selection */}
        <div className={`rounded-2xl border p-6 backdrop-blur-xl shadow-xl transition ${isDark ? "border-white/10 bg-[#0d1b2e]/90 text-white" : "border-slate-200 bg-white shadow-sm text-slate-900"}`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rapido-blue/20 text-rapido-sky text-sm">
              <FiLayers />
            </span>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>1. Service Type & Category</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Choose where this project will appear in the main site filter</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Type Selection */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Service Domain
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "web", label: "Web & Tech", desc: "Development, SEO, E-commerce" },
                  { id: "financial", label: "Financial", desc: "Bookkeeping & Accounting" },
                  { id: "human", label: "HR Support", desc: "People & Talent Workflows" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTypeChange(item.id)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                      formData.type === item.id
                        ? "border-rapido-sky bg-rapido-blue/20 text-white shadow-sm ring-1 ring-rapido-sky/40"
                        : isDark
                        ? "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <span className={`text-xs font-bold ${formData.type === item.id ? "text-rapido-sky font-extrabold" : ""}`}>{item.label}</span>
                    <span className={`text-[10px] mt-0.5 line-clamp-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="project-category" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Project Category
              </label>
              <select
                id="project-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                  isDark
                    ? "border-white/10 bg-[#091526] text-white focus:border-rapido-sky focus:ring-2 focus:ring-rapido-sky/20"
                    : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                }`}
              >
                {(CATEGORY_MAP[formData.type] || []).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {/* Fallback to all categories in case custom */}
                {projectCategories
                  .filter((cat) => cat !== "All" && !(CATEGORY_MAP[formData.type] || []).includes(cat))
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} (Other)
                    </option>
                  ))}
              </select>
              <p className={`mt-1.5 text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Matches the filter buttons on the live <span className="text-rapido-sky font-semibold">/projects</span> page.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Project Details & Content */}
        <div className={`rounded-2xl border p-6 backdrop-blur-xl shadow-xl transition ${isDark ? "border-white/10 bg-[#0d1b2e]/90 text-white" : "border-slate-200 bg-white shadow-sm text-slate-900"}`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">
              <FiTag />
            </span>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>2. Project Information</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Title, description, services tags, and outcome metric</p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="project-title" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Project Title *
                </label>
                <input
                  id="project-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Modern Shopify Skincare Boutique"
                  required
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition ${
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky focus:bg-white/[0.07] focus:ring-2 focus:ring-rapido-sky/20"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                  }`}
                />
              </div>

              <div>
                <label htmlFor="project-slug" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  URL Slug
                </label>
                <input
                  id="project-slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="modern-shopify-skincare-boutique"
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition ${
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky focus:bg-white/[0.07] focus:ring-2 focus:ring-rapido-sky/20"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="project-desc" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Project Description *
              </label>
              <textarea
                id="project-desc"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the client context, challenge, solution implemented, and measurable business improvements..."
                required
                className={`w-full rounded-xl border p-4 text-sm font-medium outline-none transition leading-relaxed ${
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky focus:bg-white/[0.07] focus:ring-2 focus:ring-rapido-sky/20"
                    : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                }`}
              />
            </div>

            {/* Metric & Live URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="project-metric" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Result Focus / Key Metric *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-500">
                    <FiTrendingUp />
                  </span>
                  <input
                    id="project-metric"
                    type="text"
                    value={formData.metric}
                    onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                    placeholder="e.g. Cleaner purchase journey or 40% faster month-end"
                    required
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-medium outline-none transition ${
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky focus:bg-white/[0.07] focus:ring-2 focus:ring-rapido-sky/20"
                        : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="project-url" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Live Project URL (Optional)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <FiGlobe />
                  </span>
                  <input
                    id="project-url"
                    type="url"
                    value={formData.projectUrl}
                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                    placeholder="https://example.com"
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-medium outline-none transition ${
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky focus:bg-white/[0.07] focus:ring-2 focus:ring-rapido-sky/20"
                        : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Services / Tags */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Services & Technology Tags *
              </label>

              {/* Tag input and active list */}
              <div className={`flex flex-wrap gap-2 mb-3 min-h-[38px] p-2 rounded-xl border ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-300 bg-slate-50"}`}>
                {formData.services.map((tag, idx) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rapido-blue/30 border border-rapido-sky/30 px-3 py-1 text-xs font-bold text-rapido-sky"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-slate-400 hover:text-white transition"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder={formData.services.length === 0 ? "Type service (e.g. Shopify, SEO) and press Enter..." : "Add another..."}
                  className={`flex-1 min-w-[140px] bg-transparent text-sm outline-none px-2 py-1 ${isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"}`}
                />
              </div>

              {/* Suggested tags chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className={`text-[11px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Quick add:</span>
                {(SUGGESTED_SERVICES[formData.type] || []).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddTag(suggestion)}
                    disabled={formData.services.includes(suggestion)}
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition disabled:opacity-40 ${
                      isDark
                        ? "border-white/10 bg-white/[0.03] text-slate-300 hover:border-rapido-sky/50 hover:text-white"
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:border-blue-400 hover:text-blue-700"
                    }`}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Project Media & Image Upload */}
        <div className={`rounded-2xl border p-6 backdrop-blur-xl shadow-xl transition ${isDark ? "border-white/10 bg-[#0d1b2e]/90 text-white" : "border-slate-200 bg-white shadow-sm text-slate-900"}`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 text-sm">
              <FiImage />
            </span>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>3. Project Cover Media</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Upload high-resolution project cover mockup or screenshot</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Dropzone */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
                    isDark
                      ? "border-white/15 bg-white/[0.02] hover:border-rapido-sky/50 hover:bg-white/[0.04]"
                      : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rapido-blue/20 text-rapido-sky mb-3 text-xl">
                    <FiUploadCloud />
                  </div>
                  <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>Click or drag image to upload</p>
                  <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Supports JPG, PNG, WebP up to 5MB</p>
                  <span className={`mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    isDark ? "border-white/10 bg-white/[0.05] text-slate-300" : "border-slate-300 bg-white text-slate-700 shadow-sm"
                  }`}>
                    Browse File
                  </span>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900 group">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="h-56 w-full object-cover transition group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex items-end justify-between p-4">
                    <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                      {formData.title || "Uploaded Image"}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="rounded-lg bg-red-600/80 hover:bg-red-600 px-3 py-1 text-xs font-bold text-white transition flex items-center gap-1"
                    >
                      <FiX /> Remove
                    </button>
                  </div>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Uploading to server…
                    </div>
                  )}
                </div>
              )}

              {/* Alt text field */}
              <div className="mt-4">
                <label htmlFor="cover-alt" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Image Alt Text (SEO & Accessibility)
                </label>
                <input
                  id="cover-alt"
                  type="text"
                  value={formData.coverAlt}
                  onChange={(e) => setFormData({ ...formData, coverAlt: e.target.value })}
                  placeholder="e.g. Laptop screen showcasing the new e-commerce store layout"
                  className={`w-full rounded-xl border px-4 py-2.5 text-xs font-medium outline-none transition ${
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Accent Gradient Color Presets */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Card Gradient Theme
              </label>
              <p className={`text-xs mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Used as card backdrop accent and fallback when image is loading.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, accent: preset.value })}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                      formData.accent === preset.value
                        ? "border-rapido-sky bg-rapido-blue/20 ring-1 ring-rapido-sky/40"
                        : isDark
                        ? "border-white/10 bg-white/[0.03] hover:border-white/20"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${preset.value} shadow-inner shrink-0`} />
                    <span className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-slate-800"}`}>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Publishing Status & Settings */}
        <div className={`rounded-2xl border p-6 backdrop-blur-xl shadow-xl transition ${isDark ? "border-white/10 bg-[#0d1b2e]/90 text-white" : "border-slate-200 bg-white shadow-sm text-slate-900"}`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm">
              <FiStar />
            </span>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>4. Visibility & Settings</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Publish immediately to live site or save as draft</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Radio */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Publication Status
              </label>
              <div className="space-y-2">
                {[
                  { id: "published", label: "Published (Live on Site)", desc: "Visible immediately to visitors", color: "text-emerald-500" },
                  { id: "draft", label: "Draft (Hidden)", desc: "Saved in admin only", color: "text-amber-500" },
                  { id: "archived", label: "Archived", desc: "Retired from live portfolio", color: "text-slate-500" }
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      formData.status === s.id
                        ? isDark ? "border-rapido-sky bg-rapido-blue/20" : "border-blue-500 bg-blue-50/70"
                        : isDark ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]" : "border-slate-200 bg-slate-50 hover:bg-slate-100/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s.id}
                      checked={formData.status === s.id}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-0.5 text-rapido-blue"
                    />
                    <div>
                      <span className={`block text-xs font-bold ${s.color}`}>{s.label}</span>
                      <span className={`block text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Featured toggle */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Featured Showcase
              </label>
              <div
                onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
                  formData.featured
                    ? isDark ? "border-amber-400/50 bg-amber-400/10" : "border-amber-400 bg-amber-50"
                    : isDark ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]" : "border-slate-200 bg-slate-50 hover:bg-slate-100/60"
                }`}
              >
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  formData.featured ? "border-amber-400 bg-amber-400 text-slate-900" : isDark ? "border-white/20 bg-white/10" : "border-slate-300 bg-white"
                }`}>
                  {formData.featured && <FiCheck className="text-xs" />}
                </div>
                <div>
                  <span className={`block text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Feature in Hero & Top of Portfolio</span>
                  <span className={`block text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Featured projects are pinned at the top and highlighted across service landing pages.
                  </span>
                </div>
              </div>

              {/* Display Order */}
              <div className="mt-4">
                <label htmlFor="display-order" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Display Order Ranking (Lower = First)
                </label>
                <input
                  id="display-order"
                  type="number"
                  min="0"
                  max="999"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  className={`w-full rounded-xl border px-4 py-2.5 text-xs font-semibold outline-none transition ${
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white focus:border-rapido-sky"
                      : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* SEO Metadata */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                SEO Metadata (Optional)
              </label>
              <div className="space-y-3">
                <div>
                  <span className={`block text-[11px] mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>SEO Title</span>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="Custom page title for search engines"
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition ${
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky"
                        : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
                <div>
                  <span className={`block text-[11px] mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Meta Description</span>
                  <textarea
                    rows={2}
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Brief summary for Google search results"
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition ${
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky"
                        : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 backdrop-blur-xl transition ${
          isDark ? "border-white/10 bg-[#0c182c]/90 text-white" : "border-slate-200 bg-white shadow-sm text-slate-900"
        }`}>
          <div className="text-xs">
            {formData.status === "published" ? (
              <span className="text-emerald-500 flex items-center gap-1.5 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Will immediately go live under &quot;{formData.category}&quot; on /projects
              </span>
            ) : (
              <span className="text-amber-500 font-semibold">
                Will be saved as {formData.status} (not visible to public)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                isDark
                  ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 shadow-sm"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rapido-blue via-blue-600 to-rapido-sky px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="text-sm" />
                  <span>{editingProject ? "Update Project" : "Publish Project Live"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
