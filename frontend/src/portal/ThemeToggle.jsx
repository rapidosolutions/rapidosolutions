import { motion } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { usePortal } from "./PortalContext";

export default function ThemeToggle({ className = "", compact = false }) {
  const { theme, toggleTheme, isDark } = usePortal();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`group relative inline-flex items-center gap-2 rounded-xl border p-1.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rapido-sky/50 ${
        isDark
          ? "border-white/10 bg-white/[0.06] text-slate-300 hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
      } ${className}`}
    >
      {/* Sliding pill indicator */}
      <div
        className={`relative flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold transition-all ${
          isDark ? "bg-[#0b172a] text-rapido-sky shadow-inner" : "bg-amber-50 text-amber-600 shadow-sm"
        }`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -45, scale: 0.7, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          {isDark ? <FiMoon className="text-sm text-rapido-sky" /> : <FiSun className="text-sm text-amber-500" />}
        </motion.div>

        {!compact && (
          <span className="text-[11px] font-semibold tracking-wide capitalize">
            {isDark ? "Dark" : "Light"}
          </span>
        )}
      </div>

      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
