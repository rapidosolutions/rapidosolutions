import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
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

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  const dialog = (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-rapido-navy/60 px-3 pb-4 pt-[7.5rem] backdrop-blur-sm sm:p-6"
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
            className="w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-rapido-navy shadow-premium max-sm:max-h-[calc(100dvh-8.5rem)] sm:my-auto sm:max-h-[calc(100dvh-3rem)] sm:p-6"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-rapido-blue sm:text-sm">Services</p>
                <h2 className="mt-1 text-lg font-extrabold leading-tight text-rapido-navy sm:mt-2 sm:text-2xl">Choose the support you need</h2>
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

            <div className="mt-3 grid gap-2 sm:mt-5 sm:gap-3">
              {serviceLinks.map((service) => (
                <Link
                  key={service.path}
                  to={service.path}
                  className="group flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-rapido-blue hover:shadow-blue-soft sm:gap-4 sm:p-4"
                  onClick={() => setOpen(false)}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rapido-mist text-rapido-blue sm:h-11 sm:w-11">
                    <Icon name={service.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-extrabold leading-snug text-rapido-navy group-hover:text-rapido-blue sm:text-lg">{service.label}</span>
                    <span className="mt-1 block text-sm leading-5 text-rapido-slate sm:text-base sm:leading-6">{service.description}</span>
                  </span>
                  <Icon name="FiArrowRight" className="mt-1 h-4 w-4 shrink-0 text-rapido-blue" />
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} icon={icon} onClick={() => setOpen(true)}>
        {children}
      </Button>

      {typeof document === "undefined" ? null : createPortal(dialog, document.body)}
    </>
  );
}
