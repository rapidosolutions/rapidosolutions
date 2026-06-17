import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navLinks } from "../../data/navLinks";
import Button from "../common/Button";
import Icon from "../ui/Icon";
import MobileMenu from "./MobileMenu";
import rapidoIcon from "../../assets/logo/rapido-icon-cropped.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    setProjectMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
        <div
          className={`mx-auto flex h-[72px] max-w-7xl items-center justify-between rounded-lg border px-4 transition duration-300 ${
            scrolled
              ? "border-slate-200 bg-white/[0.95] shadow-premium backdrop-blur-xl"
              : "border-white/[0.16] bg-white/[0.92] shadow-sm backdrop-blur-xl"
          }`}
        >
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Rapido Solutions Co. home">
            <img src={rapidoIcon} alt="Rapido Solutions Co." className="h-11 w-11 rounded-lg object-contain" />
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-extrabold leading-5 text-rapido-navy">Rapido</p>
              <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.16em] text-rapido-slate">
                Solutions Co.
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.path}
                  className="relative"
                  onMouseEnter={() => setProjectMenuOpen(true)}
                  onMouseLeave={() => setProjectMenuOpen(false)}
                >
                  <button
                    aria-expanded={projectMenuOpen}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
                      location.pathname === link.path
                        ? "bg-rapido-mist text-rapido-blue"
                        : "text-slate-700 hover:bg-slate-50 hover:text-rapido-blue"
                    }`}
                    type="button"
                    onClick={() => setProjectMenuOpen((current) => !current)}
                  >
                    {link.label}
                    <Icon name="FiChevronDown" className="h-4 w-4" />
                  </button>
                  <div
                    className={`absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-premium transition duration-200 ${
                      projectMenuOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
                    }`}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setProjectMenuOpen(false)}
                        className="block rounded-lg px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-rapido-mist hover:text-rapido-blue"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-bold transition ${
                      isActive ? "bg-rapido-mist text-rapido-blue" : "text-slate-700 hover:bg-slate-50 hover:text-rapido-blue"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button to="/contact" size="sm">
              Book a Free Consultation
            </Button>
          </div>

          <button
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 text-rapido-navy lg:hidden"
            type="button"
            onClick={() => setOpen(true)}
          >
            <Icon name="FiMenu" className="h-5 w-5" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              aria-label="Close menu overlay"
              className="fixed inset-0 z-40 bg-rapido-navy/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setOpen(false)}
            />
            <MobileMenu open={open} onClose={() => setOpen(false)} />
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
