import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { navLinks } from "../../data/navLinks";
import { drawerVariants } from "../../utils/animations";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import rapidoIcon from "../../assets/logo/rapido-icon-cropped.png";

export default function MobileMenu({ open, onClose }) {
  return (
    <motion.aside
      className="mobile-menu-scroll fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto overscroll-contain bg-white p-6 shadow-premium lg:hidden"
      variants={drawerVariants}
      initial="closed"
      animate={open ? "open" : "closed"}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={rapidoIcon} alt="Rapido Solutions Co." className="h-11 w-11 rounded-lg object-contain" />
          <div>
            <p className="font-display text-lg font-extrabold text-rapido-navy">Rapido</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rapido-slate">Solutions Co.</p>
          </div>
        </div>
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
              <NavLink
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-base font-bold transition ${
                    isActive ? "bg-rapido-mist text-rapido-blue" : "text-rapido-navy hover:bg-slate-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
              <div className="mt-1 grid gap-1">
                {link.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={onClose}
                    className="rounded-lg px-3 py-2 text-sm font-bold text-rapido-slate transition hover:bg-rapido-mist hover:text-rapido-blue"
                  >
                    {child.label}
                  </NavLink>
                ))}
              </div>
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
          Focused web services and financial support for clearer business growth.
        </p>
      </div>
    </motion.aside>
  );
}
