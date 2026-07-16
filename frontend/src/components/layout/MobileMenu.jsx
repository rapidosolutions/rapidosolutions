import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { navLinks } from "../../data/navLinks";
import { drawerVariants } from "../../utils/animations";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import rapidoWordmark from "../../assets/logo/rapido-wordmark-cropped.png";

export default function MobileMenu({ open, onClose }) {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState("");

  const isChildActive = (childPath) => {
    const [pathname, search = ""] = childPath.split("?");
    return location.pathname === pathname && (!search || location.search === `?${search}`);
  };

  const getActiveGroup = () => {
    const activeLink = navLinks.find((link) => link.children?.some((child) => isChildActive(child.path)));
    return activeLink?.path || "";
  };

  useEffect(() => {
    if (open) setOpenGroup(getActiveGroup());
  }, [open, location.pathname, location.search]);

  return (
    <motion.aside
      className="mobile-menu-scroll fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto overscroll-contain bg-white p-6 shadow-premium lg:hidden"
      variants={drawerVariants}
      initial="closed"
      animate={open ? "open" : "closed"}
    >
      <div className="flex items-center justify-between">
        <img
          src={rapidoWordmark}
          alt="Rapido Solutions Co."
          className="h-12 w-auto max-w-[190px] object-contain"
        />
        <button
          aria-label="Close menu"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-rapido-navy"
          type="button"
          onClick={onClose}
        >
          <Icon name="FiX" className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-8 grid gap-2 pb-6">
        {navLinks.map((link) =>
          link.children ? (
            <div key={link.path} className="rounded-lg border border-slate-200 p-2">
              <button
                type="button"
                aria-expanded={openGroup === link.path}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-base font-bold transition ${
                  openGroup === link.path || link.children.some((child) => isChildActive(child.path))
                    ? "bg-rapido-mist text-rapido-blue"
                    : "text-rapido-navy hover:bg-slate-50"
                }`}
                onClick={() => setOpenGroup((current) => (current === link.path ? "" : link.path))}
              >
                <span>{link.label}</span>
                <Icon
                  name="FiChevronDown"
                  className={`h-4 w-4 shrink-0 transition ${openGroup === link.path ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openGroup === link.path ? (
                  <motion.div
                    className="mt-1 grid gap-1 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {link.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `rounded-lg px-3 py-2 text-sm font-bold transition ${
                            isActive || isChildActive(child.path)
                              ? "bg-rapido-mist text-rapido-blue"
                              : "text-rapido-slate hover:bg-rapido-mist hover:text-rapido-blue"
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-4 py-3 text-base font-bold transition ${
                  isActive ? "bg-rapido-mist text-rapido-blue" : "text-rapido-navy hover:bg-slate-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="mt-auto grid gap-3 pb-2">
        <Button to="/contact" size="lg" onClick={onClose}>
          Book a Free Consultation
        </Button>
        <p className="text-sm leading-6 text-rapido-slate">
          Focused web, financial, and human resource support for clearer business growth.
        </p>
      </div>
    </motion.aside>
  );
}
