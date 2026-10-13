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
  FiExternalLink,
  FiPlus
} from "react-icons/fi";
import { createProject, updateProject, uploadProjectImage } from "../utils/projectApi";
import { projectCategories, projects as staticProjects } from "../data/portfolioData";
import Badge from "../components/common/Badge";
import LaptopMockup from "../components/portfolio/LaptopMockup";
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

const SUGGESTED_SUBCATEGORIES = {
  web: ["E-Commerce", "CMS & Blog", "Lead Generation", "Hospitality UI", "Property Listings", "Conversion Landing", "CRO Redesign", "Site Hygiene"],
  financial: ["Bookkeeping Ops", "Property Ledgers", "AR/AP Tracking", "Financial Reporting", "QuickBooks Setup"],
  human: ["Recruitment Pipeline", "Corporate Documentation", "Staff Onboarding", "Performance Management"]
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
    subCategory: "",
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
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Additional Gallery Images (Point 2)
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    if (editingProject) {
      const initialCat = editingProject.category || "Shopify Stores";
      const knownCats = [
        ...(CATEGORY_MAP.web || []),
        ...(CATEGORY_MAP.financial || []),
        ...(CATEGORY_MAP.human || [])
      ];
      const isCustom = !knownCats.includes(initialCat);

      setFormData({
        title: editingProject.title || "",
        slug: editingProject.slug || "",
        type: editingProject.type || "web",
        category: initialCat,
        subCategory: editingProject.subCategory || "",
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

      if (isCustom) {
        setIsCustomCategory(true);
        setCustomCategoryInput(initialCat);
      }

      // Initialize gallery images
      const rawGallery = Array.isArray(editingProject.galleryImages) ? editingProject.galleryImages : [];
      setGalleryImages(rawGallery.map((img) => (typeof img === "string" ? { url: img, alt: "" } : img)));

      const slugKey = (editingProject.slug || editingProject.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const matchedStatic = staticProjects.find(
        (p) =>
          (p.slug || p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slugKey ||
          p.title.toLowerCase() === editingProject.title?.toLowerCase()
      );
      const fallbackSrc = matchedStatic?.coverImage;

      if (editingProject.coverImage) {
        setCoverImage(editingProject.coverImage);
        setImagePreview(
          typeof editingProject.coverImage === "string"
            ? editingProject.coverImage
            : editingProject.coverImage.url || fallbackSrc
        );
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
      category: isCustomCategory ? prev.category : validCats[0] || prev.category
    }));
  };

  const handleCategorySelectChange = (val) => {
    if (val === "__custom__") {
      setIsCustomCategory(true);
      if (customCategoryInput) {
        setFormData((prev) => ({ ...prev, category: customCategoryInput }));
      }
    } else {
      setIsCustomCategory(false);
      setFormData((prev) => ({ ...prev, category: val }));
    }
  };

  const handleCustomCategoryInputChange = (val) => {
    setCustomCategoryInput(val);
    setFormData((prev) => ({ ...prev, category: val }));
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

  // Main Cover Image Upload
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

  // Multiple Gallery Images Upload (Point 2)
  const handleGalleryFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingGallery(true);
    setErrorNotice("");

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const response = await uploadProjectImage(file);
        if (response?.asset) {
          const newImg = {
            url: response.asset.url,
            publicId: response.asset.publicId || "",
            storageType: response.asset.storageType || "local",
            alt: `${formData.title} screenshot`
          };
          setGalleryImages((prev) => [...prev, newImg]);
        }
      }
    } catch (err) {
      setErrorNotice(err.message || "Failed to upload gallery images.");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleRemoveGalleryImage = (idxToRemove) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorNotice("");
    setSuccessNotice("");

    if (!formData.title.trim()) {
      setErrorNotice("Project title is required.");
      return;
    }
    if (!formData.category.trim()) {
      setErrorNotice("Project category is required.");
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
        category: formData.category.trim(),
        subCategory: formData.subCategory.trim(),
        description: formData.description.trim(),
        metric: formData.metric.trim(),
        coverImage: coverImage
          ? {
              url: coverImage.url,
              publicId: coverImage.publicId || "",
              storageType: coverImage.storageType || "local",
              alt: formData.coverAlt || formData.title
            }
          : null,
        galleryImages: galleryImages.map((g) => ({
          url: typeof g === "string" ? g : g.url,
          publicId: g.publicId || "",
          storageType: g.storageType || "local",
          alt: g.alt || `${formData.title} screenshot`
        })),
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

  const availableCategoriesForType = CATEGORY_MAP[formData.type] || [];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className={`group mb-2 inline-flex items-center gap-2 text-xs font-semibold transition ${
              isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            <span>Back to All Projects</span>
          </button>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-display ${isDark ? "text-white" : "text-slate-900"}`}>
            {editingProject ? `Edit Project: ${editingProject.title}` : "Add New Project to Website"}
          </h1>
          <p className={`mt-1 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Configure project details, custom categories, live project URL, and upload multiple screenshots.
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
            disabled={submitting || uploadingImage || uploadingGallery}
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
                <span>{editingProject ? "Save Changes" : "Publish Project"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notices */}
      <AnimatePresence>
        {errorNotice ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-400"
          >
            <FiAlertCircle className="shrink-0 text-base" />
            <span>{errorNotice}</span>
          </motion.div>
        ) : null}

        {successNotice ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400"
          >
            <FiCheckCircle className="shrink-0 text-base text-emerald-400" />
            <span>{successNotice}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Classification & Custom Category / Sub-Category */}
        <div className={`rounded-2xl border p-6 backdrop-blur-xl shadow-xl transition ${isDark ? "border-white/10 bg-[#0d1b2e]/90 text-white" : "border-slate-200 bg-white shadow-sm text-slate-900"}`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-rapido-sky text-sm">
              <FiLayers />
            </span>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>1. Category &amp; Classification</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Choose service branch, custom category, and sub-category</p>
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {/* Service Type Selection */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Service Branch *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "web", label: "Web Services", desc: "Shopify, WordPress, Web Apps" },
                  { id: "financial", label: "Financial Services", desc: "Bookkeeping & Reconciliations" },
                  { id: "human", label: "Human Resources", desc: "Hiring, SOPs, Training" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTypeChange(item.id)}
                    className={`flex flex-col rounded-xl border p-3.5 text-left transition ${
                      formData.type === item.id
                        ? "border-rapido-sky bg-rapido-blue/15 shadow-sm ring-1 ring-rapido-sky/40"
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

            {/* Category & Customized Category (Point 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="project-category" className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(!isCustomCategory);
                      if (!isCustomCategory && !customCategoryInput) {
                        setCustomCategoryInput("Custom " + (availableCategoriesForType[0] || "Category"));
                        setFormData((prev) => ({ ...prev, category: "Custom " + (availableCategoriesForType[0] || "Category") }));
                      }
                    }}
                    className="text-[11px] font-bold text-rapido-sky hover:underline flex items-center gap-1"
                  >
                    <FiPlus className="text-xs" />
                    <span>{isCustomCategory ? "Choose Predefined" : "+ Add Custom Category"}</span>
                  </button>
                </div>

                {!isCustomCategory ? (
                  <select
                    id="project-category"
                    value={formData.category}
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                      isDark
                        ? "border-white/10 bg-[#091526] text-white focus:border-rapido-sky focus:ring-2 focus:ring-rapido-sky/20"
                        : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                    }`}
                  >
                    {availableCategoriesForType.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">+ Enter Custom Category...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => handleCustomCategoryInputChange(e.target.value)}
                      placeholder="Type custom category name..."
                      className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                        isDark
                          ? "border-rapido-sky bg-white/[0.04] text-white focus:ring-2 focus:ring-rapido-sky/20"
                          : "border-blue-500 bg-white text-slate-900"
                      }`}
                    />
                    <span className="text-[10px] text-rapido-sky font-medium">Custom category active</span>
                  </div>
                )}
              </div>

              {/* Sub-Category (Point 4) */}
              <div>
                <label htmlFor="project-subcategory" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Sub-Category (Optional)
                </label>
                <input
                  id="project-subcategory"
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  placeholder="e.g. E-Commerce, Hospitality UI, Luxury Estates..."
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky"
                      : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                  }`}
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Suggestions:</span>
                  {(SUGGESTED_SUBCATEGORIES[formData.type] || []).slice(0, 4).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setFormData({ ...formData, subCategory: sub })}
                      className="text-[10px] font-medium text-rapido-sky hover:underline"
                    >
                      {sub},
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Project Details, Live URL & Tags */}
        <div className={`rounded-2xl border p-6 backdrop-blur-xl shadow-xl transition ${isDark ? "border-white/10 bg-[#0d1b2e]/90 text-white" : "border-slate-200 bg-white shadow-sm text-slate-900"}`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">
              <FiTag />
            </span>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>2. Project Information</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Title, live project URL, description, tags, and outcome metric</p>
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
                  placeholder="auto-generated-from-title"
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-mono text-xs outline-none transition ${
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-slate-300 placeholder-slate-600 focus:border-rapido-sky"
                      : "border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
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
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the business challenge and delivery highlights..."
                required
                className={`w-full rounded-xl border p-4 text-sm font-medium outline-none transition leading-relaxed ${
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky focus:bg-white/[0.07] focus:ring-2 focus:ring-rapido-sky/20"
                    : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                }`}
              />
            </div>

            {/* Metric & Live Project URL (Point 1) */}
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
                        ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky"
                        : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="project-url" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Live Project URL (Point 1 - Displayed on website)
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
                    placeholder="https://example.com or client store URL"
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm font-medium outline-none transition ${
                      isDark
                        ? "border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:border-rapido-sky"
                        : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Services / Tags */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Services &amp; Technology Tags *
              </label>

              <div className={`flex flex-wrap gap-2 mb-3 min-h-[38px] p-2 rounded-xl border ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-300 bg-slate-50"}`}>
                {formData.services.map((tag, idx) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rapido-blue/30 border border-rapido-sky/30 px-3 py-1 text-xs font-bold text-rapido-sky"
                  >
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(idx)} className="text-slate-400 hover:text-white transition">
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
                  placeholder={formData.services.length === 0 ? "Type service tag and press Enter..." : "Add another..."}
                  className={`flex-1 min-w-[140px] bg-transparent text-sm outline-none px-2 py-1 ${isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"}`}
                />
              </div>

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

        {/* Section 3: Project Media (Main Image + Multiple Pictures Gallery) */}
        <div className={`rounded-2xl border p-6 backdrop-blur-xl shadow-xl transition ${isDark ? "border-white/10 bg-[#0d1b2e]/90 text-white" : "border-slate-200 bg-white shadow-sm text-slate-900"}`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 text-sm">
              <FiImage />
            </span>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>3. Project Media &amp; Gallery</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Main picture (mockup laptop screen) and option to add multiple pictures (Point 2)</p>
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {/* Primary Cover Image (Shown on Laptop Mockup) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Main Picture (Laptop Mockup Landing View) *
                </label>
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
                    <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>Upload Main Image</p>
                    <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Shown inside the laptop mockup frame on project cards</p>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900 group">
                    <img src={imagePreview} alt="Cover preview" className="h-52 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-end justify-between p-4">
                      <span className="text-xs font-semibold text-white truncate max-w-[200px]">Main Mockup Cover</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="rounded-lg bg-red-600/90 hover:bg-red-600 px-3 py-1 text-xs font-bold text-white transition flex items-center gap-1"
                      >
                        <FiX /> Remove
                      </button>
                    </div>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Uploading…
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Live Laptop Mockup Preview of Main Image (Point 3) */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Live Mockup Laptop Preview
                </label>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <LaptopMockup
                    imageSrc={imagePreview}
                    imageAlt={formData.coverAlt || formData.title}
                    projectUrl={formData.projectUrl}
                    title={formData.title || "Project Preview"}
                    accent={formData.accent}
                  />
                  <p className="mt-2 text-center text-[11px] text-slate-400">
                    Exact unified format displayed on the website card
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Pictures Upload Section (Point 2) */}
            <div className={`rounded-xl border p-5 ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-800"}`}>
                    Additional Project Pictures / Screenshots ({galleryImages.length})
                  </h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Add multiple screenshots for project gallery &amp; lightbox viewer
                  </p>
                </div>

                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleGalleryFilesChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
                >
                  <FiPlus />
                  <span>{uploadingGallery ? "Uploading Pictures..." : "Upload More Pictures"}</span>
                </button>
              </div>

              {/* Gallery Grid */}
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {galleryImages.map((img, idx) => {
                    const src = typeof img === "string" ? img : img.url;
                    return (
                      <div key={idx} className="group relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 aspect-video">
                        <img src={src} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm flex items-center gap-1"
                          >
                            <FiX /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`text-xs italic text-center py-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  No additional pictures uploaded yet. Click &quot;Upload More Pictures&quot; to add screenshots for this project.
                </p>
              )}
            </div>

            {/* Accent Theme Selection */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Card Accent Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                    <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${preset.value} shadow-inner shrink-0`} />
                    <span className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-slate-800"}`}>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Visibility & Display Settings */}
        <div className={`rounded-2xl border p-6 backdrop-blur-xl shadow-xl transition ${isDark ? "border-white/10 bg-[#0d1b2e]/90 text-white" : "border-slate-200 bg-white shadow-sm text-slate-900"}`}>
          <div className={`flex items-center gap-2.5 pb-4 border-b ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-sm">
              <FiStar />
            </span>
            <div>
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>4. Visibility &amp; Ordering</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Status, featured badge, and ordering position</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Publication Status
              </label>
              <div className="space-y-2">
                {[
                  { id: "published", label: "Published (Live on Site)", desc: "Visible immediately to visitors" },
                  { id: "draft", label: "Draft (Hidden)", desc: "Saved in admin only" },
                  { id: "archived", label: "Archived", desc: "Retired from live portfolio" }
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      formData.status === s.id
                        ? "border-rapido-sky bg-rapido-blue/15"
                        : isDark
                        ? "border-white/10 bg-white/[0.02]"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === s.id}
                      onChange={() => setFormData({ ...formData, status: s.id })}
                      className="mt-0.5 text-rapido-blue"
                    />
                    <div>
                      <span className={`block text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{s.label}</span>
                      <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="display-order" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Display Order Ranking
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

              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 rounded text-rapido-blue"
                  />
                  <span className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    Featured Showcase Project
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                SEO Title (Optional)
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="Custom title for Google search"
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition ${
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-white focus:border-rapido-sky"
                    : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
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
                Will be saved as {formData.status} (draft)
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
              disabled={submitting || uploadingImage || uploadingGallery}
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
