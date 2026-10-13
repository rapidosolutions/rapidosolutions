import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./Icon";

export default function ModernDropdown({
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option",
  label = null,
  isDark = false,
  className = "",
  buttonClassName = "",
  disabled = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options: allow string array or object array with { label, value, description, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { label: opt, value: opt };
    }
    return {
      label: opt.label || opt.name || opt.value,
      value: opt.value ?? opt.id ?? opt.label,
      description: opt.description,
      icon: opt.icon
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {label ? (
        <label className={`block mb-1.5 text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-rapido-navy"}`}>
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
      ) : null}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition focus:outline-none ${
          isDark
            ? isOpen
              ? "border-rapido-sky bg-[#0d1a2d] text-white ring-2 ring-rapido-sky/20"
              : "border-white/10 bg-[#091526] text-white hover:border-white/20"
            : isOpen
            ? "border-rapido-blue bg-white text-rapido-navy shadow-sm ring-2 ring-blue-100"
            : "border-slate-300 bg-white text-rapido-navy hover:border-slate-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${buttonClassName}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon ? (
            <Icon name={selectedOption.icon} className="h-4 w-4 shrink-0 text-rapido-blue" />
          ) : null}
          <span className={selectedOption ? "" : isDark ? "text-slate-400" : "text-slate-500"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-slate-400"
        >
          <Icon name="FiChevronDown" className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="listbox"
            className={`absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border p-1.5 shadow-2xl backdrop-blur-lg scrollbar-thin ${
              isDark
                ? "border-white/15 bg-[#0b172a]/95 text-white"
                : "border-slate-200 bg-white/95 text-slate-800 shadow-premium"
            }`}
          >
            {normalizedOptions.length === 0 ? (
              <div className="p-3 text-center text-xs font-medium text-slate-400">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                      isSelected
                        ? isDark
                          ? "bg-rapido-blue text-white"
                          : "bg-blue-50 text-rapido-blue"
                        : isDark
                        ? "text-slate-200 hover:bg-white/10"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        {opt.icon ? (
                          <Icon name={opt.icon} className={`h-4 w-4 ${isSelected ? "text-white" : "text-rapido-blue"}`} />
                        ) : null}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {opt.description ? (
                        <span
                          className={`text-xs mt-0.5 truncate ${
                            isSelected ? "text-blue-100" : isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {opt.description}
                        </span>
                      ) : null}
                    </div>

                    {isSelected ? (
                      <Icon
                        name="FiCheck"
                        className={`h-4 w-4 shrink-0 ${isSelected && !isDark ? "text-rapido-blue" : "text-white"}`}
                      />
                    ) : null}
                  </button>
                );
              })
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
