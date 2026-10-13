import { useState } from "react";
import { motion } from "framer-motion";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import LaptopMockup from "./LaptopMockup";
import ProjectModal from "./ProjectModal";

const typeLabels = {
  financial: "Financial",
  human: "Human Resource",
  web: "Web"
};

export default function PortfolioCard({ project, index = 0 }) {
  const [modalOpen, setModalOpen] = useState(false);

  const coverSrc = typeof project.coverImage === "string" ? project.coverImage : project.coverImage?.url || null;
  const rawGallery = Array.isArray(project.galleryImages) ? project.galleryImages : [];
  const galleryCount = rawGallery.length;
  const projectUrl = project.projectUrl?.trim();
  const cleanDomain = projectUrl ? projectUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "") : "";
  const reviewLink = `/reviews?service=${encodeURIComponent(project.category || "Web Services")}&project=${encodeURIComponent(project.title)}#submit-review`;

  return (
    <>
      <motion.article
        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-premium"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, delay: index * 0.04 }}
      >
        <div>
          {/* UNIFIED LAPTOP MOCKUP DISPLAY SECTION */}
          <div className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-100/70 to-slate-200/50 p-4 pb-3 sm:p-5 sm:pb-3">
            {/* Top Info Bar */}
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rapido-blue shadow-xs border border-blue-100">
                {typeLabels[project.type] || "Project"}
              </span>

              {galleryCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs hover:bg-slate-950 transition"
                >
                  <Icon name="FiImage" className="h-3 w-3 text-rapido-sky" />
                  <span>+{galleryCount} Photos</span>
                </button>
              ) : (
                <span className="rounded-full border border-slate-300/80 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Concept Frame
                </span>
              )}
            </div>

            {/* Laptop Mockup (Unified format for all projects) */}
            <div className="pt-1">
              <LaptopMockup
                imageSrc={coverSrc}
                imageAlt={project.coverAlt || project.title}
                projectUrl={projectUrl}
                title={project.title}
                accent={project.accent}
                interactive
                onClick={() => setModalOpen(true)}
              />
            </div>

            {/* Overlay hint button on hover */}
            <div className="mt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-rapido-blue opacity-80 hover:opacity-100 transition"
              >
                <Icon name="FiMaximize2" className="h-3 w-3" />
                <span>Enlarge Screen &amp; Gallery</span>
              </button>
            </div>
          </div>

          {/* PROJECT CONTENT BODY */}
          <div className="p-5 sm:p-6">
            {/* Category and Sub-category Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="slate" icon="FiLayers">
                {project.category}
              </Badge>
              {project.subCategory ? (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-rapido-blue border border-blue-100">
                  {project.subCategory}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3.5 text-xl font-extrabold text-rapido-navy line-clamp-1">{project.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-rapido-slate line-clamp-2">{project.description}</p>

            {/* Project URL Display (Point 1) */}
            {projectUrl ? (
              <div className="mt-3.5 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-rapido-navy truncate max-w-[210px]">
                  <Icon name="FiGlobe" className="h-3.5 w-3.5 shrink-0 text-rapido-blue" />
                  <span className="truncate">{cleanDomain}</span>
                </span>
                <a
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-extrabold text-rapido-blue hover:text-blue-800 transition shrink-0 ml-2"
                >
                  <span>Visit</span>
                  <Icon name="FiExternalLink" className="h-3 w-3" />
                </a>
              </div>
            ) : null}

            {/* Services Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(project.services || []).slice(0, 4).map((service) => (
                <span key={service} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {service}
                </span>
              ))}
            </div>

            {/* Metric / Result Focus */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
              <span className="text-xs font-bold text-rapido-slate">Result focus</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rapido-navy">
                <Icon name="FiTrendingUp" className="h-3.5 w-3.5 text-emerald-600" />
                {project.metric}
              </span>
            </div>
          </div>
        </div>

        {/* CARD ACTIONS FOOTER */}
        <div className="border-t border-slate-100 p-5 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            {projectUrl ? (
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rapido-blue hover:text-blue-800 transition"
              >
                <Icon name="FiExternalLink" className="h-3.5 w-3.5" />
                <span>Visit Live Project</span>
              </a>
            ) : (
              <Button to="/contact" variant="ghost" className="px-0 text-xs" icon="FiExternalLink">
                Start Similar Project
              </Button>
            )}

            {/* Option to get review from client for this specific group/project (Point 3) */}
            <Button
              to={reviewLink}
              variant="ghost"
              className="px-0 text-xs text-amber-700 hover:text-amber-800"
              icon="FiStar"
            >
              Review This Project
            </Button>
          </div>
        </div>
      </motion.article>

      {/* Lightbox / Full Project Modal */}
      <ProjectModal project={project} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
