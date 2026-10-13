import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import Badge from "../common/Badge";
import Button from "../common/Button";
import LaptopMockup from "./LaptopMockup";

export default function ProjectModal({ project, isOpen, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (project) {
      const mainCover = typeof project.coverImage === "string" ? project.coverImage : project.coverImage?.url || null;
      setSelectedImage(mainCover);
    }
  }, [project]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const mainCover = typeof project.coverImage === "string" ? project.coverImage : project.coverImage?.url || null;
  const rawGallery = Array.isArray(project.galleryImages) ? project.galleryImages : [];
  const galleryUrls = rawGallery.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);

  // Combine cover image + gallery images
  const allImages = [];
  if (mainCover) allImages.push({ url: mainCover, label: "Main Landing View" });
  galleryUrls.forEach((url, i) => {
    if (url !== mainCover) {
      allImages.push({ url, label: `Screen ${i + 1}` });
    }
  });

  const activeImg = selectedImage || mainCover;
  const projectLink = project.projectUrl?.trim();
  const reviewLink = `/reviews?service=${encodeURIComponent(project.category || "Web Services")}&project=${encodeURIComponent(project.title)}#submit-review`;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} details and gallery`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25 }}
          className="relative my-auto w-full max-w-4xl rounded-2xl border border-slate-700/50 bg-slate-900 text-white shadow-2xl overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-slate-900/90">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-rapido-blue/20 px-3 py-1 text-xs font-bold text-rapido-sky">
                {project.category}
              </span>
              {project.subCategory ? (
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {project.subCategory}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition focus:outline-none"
              aria-label="Close modal"
            >
              <Icon name="FiX" className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Project Title & Live Link */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {project.title}
                </h2>
                <p className="mt-1 text-sm text-slate-300">{project.description}</p>
              </div>

              {projectLink ? (
                <a
                  href={projectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition shrink-0"
                >
                  <Icon name="FiExternalLink" className="h-4 w-4" />
                  <span>Visit Live Project</span>
                </a>
              ) : null}
            </div>

            {/* Laptop Mockup Presentation (Unified Format) */}
            <div className="py-2">
              <div className="text-center mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Interactive Laptop Presentation
                </span>
              </div>
              <LaptopMockup
                imageSrc={activeImg}
                imageAlt={project.coverAlt || project.title}
                projectUrl={project.projectUrl}
                title={project.title}
                accent={project.accent}
                className="max-w-2xl"
              />
            </div>

            {/* Gallery Thumbnails (if multiple pictures exist) */}
            {allImages.length > 1 ? (
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-4 border border-white/5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Icon name="FiImage" className="h-4 w-4 text-rapido-sky" />
                    Project Screenshots ({allImages.length} available)
                  </span>
                  <span className="text-slate-400 text-[11px]">Click to view in laptop mockup</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative h-18 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        activeImg === img.url
                          ? "border-rapido-sky ring-2 ring-blue-500/30 scale-105"
                          : "border-white/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt={`Screenshot ${idx + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 py-0.5 text-[9px] font-medium text-white text-center truncate px-1">
                        {img.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Project Details Footer */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-white/10">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tech &amp; Services</span>
                <div className="flex flex-wrap gap-1.5">
                  {(project.services || []).map((s) => (
                    <span key={s} className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:items-end justify-center gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Icon name="FiTrendingUp" className="h-4 w-4" />
                  <span>{project.metric || "High-impact delivery"}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    to={reviewLink}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                  >
                    <Icon name="FiStar" className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    <span>Review This Project</span>
                  </Link>
                  <Button to="/contact" size="sm" onClick={onClose}>
                    Inquire Similar Project
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
