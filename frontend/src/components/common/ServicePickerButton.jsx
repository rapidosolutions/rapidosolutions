import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "./Button";
import Icon from "../ui/Icon";

const serviceLinks = [
  {
    label: "Web Services",
    description: "Websites, Shopify, WordPress, SEO, UI/UX, and maintenance.",
    path: "/web-services",
    icon: "FiMonitor"
  },
  {
    label: "Financial Services",
    description: "Bookkeeping, reporting, reconciliations, AR/AP, and property accounting.",
    path: "/financial-services",
    icon: "FiPieChart"
  },
  {
    label: "Human Resource Services",
    description: "Talent acquisition, policies, SOPs, training, and development.",
    path: "/human-resource-services",
    icon: "FiUsers"
  }
];

export default function ServicePickerButton({
  children = "Explore Our Services",
  variant = "primary",
  size = "lg",
  className = "",
  icon = "FiArrowRight"
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} icon={icon} onClick={() => setOpen(true)}>
        {children}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-rapido-navy/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Choose a service"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 text-rapido-navy shadow-premium sm:p-6"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-blue">Services</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-rapido-navy">Choose the support you need</h2>
                </div>
                <button
                  type="button"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-rapido-navy transition hover:bg-rapido-mist"
                  aria-label="Close services popup"
                  onClick={() => setOpen(false)}
                >
                  <Icon name="FiX" className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {serviceLinks.map((service) => (
                  <Link
                    key={service.path}
                    to={service.path}
                    className="group flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rapido-blue hover:shadow-blue-soft"
                    onClick={() => setOpen(false)}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-rapido-mist text-rapido-blue">
                      <Icon name={service.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-extrabold text-rapido-navy group-hover:text-rapido-blue">{service.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-rapido-slate">{service.description}</span>
                    </span>
                    <Icon name="FiArrowRight" className="ml-auto mt-1 h-4 w-4 shrink-0 text-rapido-blue" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
