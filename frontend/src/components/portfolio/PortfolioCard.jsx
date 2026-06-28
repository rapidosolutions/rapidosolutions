import { motion } from "framer-motion";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../ui/Icon";

const typeLabels = {
  financial: "Financial",
  human: "Human Resource",
  web: "Web"
};

export default function PortfolioCard({ project, index = 0 }) {
  return (
    <motion.article
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.04 }}
    >
      <div className="relative h-56 overflow-hidden bg-slate-100">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.coverAlt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${project.accent}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-rapido-navy/72 via-rapido-navy/18 to-transparent" />
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-blue shadow-sm">
            {typeLabels[project.type] || "Project"}
          </span>
          <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
            Concept
          </span>
        </div>
      </div>
      <div className="p-6">
        <Badge tone="slate" icon="FiLayers">
          {project.category}
        </Badge>
        <h3 className="mt-4 text-xl font-extrabold text-rapido-navy">{project.title}</h3>
        <p className="mt-3 leading-7 text-rapido-slate">{project.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.services.map((service) => (
            <span key={service} className="rounded-full bg-rapido-mist px-3 py-1 text-xs font-extrabold text-rapido-blue">
              {service}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4">
          <span className="text-sm font-bold text-rapido-slate">Result focus</span>
          <span className="inline-flex items-center gap-2 text-sm font-extrabold text-rapido-navy">
            <Icon name="FiTrendingUp" className="h-4 w-4 text-emerald-600" />
            {project.metric}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button to="/contact" variant="ghost" className="px-0" icon="FiExternalLink">
            Start Similar Project
          </Button>
          <Button to="/reviews" variant="ghost" className="px-0" icon="FiStar">
            View Reviews
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
