import { useState } from "react";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiDroplet,
  FiType,
  FiRotateCcw
} from "react-icons/fi";

const TEXT_COLORS = [
  { label: "Dark Slate", color: "#0f172a" },
  { label: "Rapido Blue", color: "#1D63ED" },
  { label: "Navy", color: "#071529" },
  { label: "Muted Gray", color: "#64748b" },
  { label: "Emerald Green", color: "#10b981" },
  { label: "Crimson Red", color: "#ef4444" },
  { label: "Indigo", color: "#4f46e5" }
];

const BG_COLORS = [
  { label: "No Highlight", color: "transparent" },
  { label: "Yellow Tint", color: "#fef08a" },
  { label: "Blue Tint", color: "#dbeafe" },
  { label: "Green Tint", color: "#dcfce7" },
  { label: "Pink Tint", color: "#fce7f3" },
  { label: "Purple Tint", color: "#ede9fe" }
];

export default function RichTextToolbar({ onCommand, isDark = false }) {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const handleCommand = (command, value = null) => {
    if (onCommand) {
      onCommand(command, value);
    } else {
      document.execCommand(command, false, value);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1 p-2 rounded-t-xl border-b transition-colors ${
        isDark ? "bg-[#111f35] border-white/10 text-slate-200" : "bg-slate-100/90 border-slate-200 text-slate-700"
      }`}
    >
      {/* Bold */}
      <button
        type="button"
        onClick={() => handleCommand("bold")}
        className={`p-1.5 rounded-lg text-sm font-bold transition hover:bg-rapido-blue hover:text-white ${
          isDark ? "hover:bg-rapido-blue" : "hover:bg-rapido-blue"
        }`}
        title="Bold (Ctrl+B)"
      >
        <FiBold className="h-4 w-4" />
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => handleCommand("italic")}
        className="p-1.5 rounded-lg text-sm transition hover:bg-rapido-blue hover:text-white"
        title="Italic (Ctrl+I)"
      >
        <FiItalic className="h-4 w-4" />
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => handleCommand("underline")}
        className="p-1.5 rounded-lg text-sm transition hover:bg-rapido-blue hover:text-white"
        title="Underline (Ctrl+U)"
      >
        <FiUnderline className="h-4 w-4" />
      </button>

      <span className={`h-4 w-px mx-1 ${isDark ? "bg-white/15" : "bg-slate-300"}`} />

      {/* Text Color Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowTextColorPicker(!showTextColorPicker);
            setShowBgColorPicker(false);
          }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition hover:bg-rapido-blue hover:text-white"
          title="Change Text Color"
        >
          <FiType className="h-3.5 w-3.5" />
          <span>Color</span>
        </button>

        {showTextColorPicker && (
          <div
            className={`absolute left-0 top-full mt-1 z-30 p-2.5 rounded-xl border shadow-xl flex flex-col gap-2 min-w-[190px] ${
              isDark ? "bg-[#0b1728] border-white/15 text-white" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Text Colors</div>
            <div className="grid grid-cols-4 gap-1.5">
              {TEXT_COLORS.map((tc) => (
                <button
                  key={tc.color}
                  type="button"
                  onClick={() => {
                    handleCommand("foreColor", tc.color);
                    setShowTextColorPicker(false);
                  }}
                  className="h-6 w-6 rounded-md border border-slate-300 transition hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: tc.color }}
                  title={tc.label}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
              <span className="text-[11px] text-slate-400">Custom:</span>
              <input
                type="color"
                onChange={(e) => {
                  handleCommand("foreColor", e.target.value);
                  setShowTextColorPicker(false);
                }}
                className="h-6 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Background / Highlight Color */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowBgColorPicker(!showBgColorPicker);
            setShowTextColorPicker(false);
          }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition hover:bg-rapido-blue hover:text-white"
          title="Highlight / Background Color"
        >
          <FiDroplet className="h-3.5 w-3.5" />
          <span>Highlight</span>
        </button>

        {showBgColorPicker && (
          <div
            className={`absolute left-0 top-full mt-1 z-30 p-2.5 rounded-xl border shadow-xl flex flex-col gap-2 min-w-[200px] ${
              isDark ? "bg-[#0b1728] border-white/15 text-white" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Background Colors</div>
            <div className="grid grid-cols-3 gap-1.5">
              {BG_COLORS.map((bg) => (
                <button
                  key={bg.color}
                  type="button"
                  onClick={() => {
                    handleCommand("hiliteColor", bg.color);
                    setShowBgColorPicker(false);
                  }}
                  className="h-6 rounded-md border border-slate-300 text-[10px] font-bold px-1 truncate flex items-center justify-center transition hover:scale-105"
                  style={{ backgroundColor: bg.color === "transparent" ? "#f1f5f9" : bg.color, color: "#1e293b" }}
                  title={bg.label}
                >
                  {bg.label.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50">
              <span className="text-[11px] text-slate-400">Custom:</span>
              <input
                type="color"
                onChange={(e) => {
                  handleCommand("hiliteColor", e.target.value);
                  setShowBgColorPicker(false);
                }}
                className="h-6 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0"
              />
            </div>
          </div>
        )}
      </div>

      <span className={`h-4 w-px mx-1 ${isDark ? "bg-white/15" : "bg-slate-300"}`} />

      {/* Bullet Points */}
      <button
        type="button"
        onClick={() => handleCommand("insertUnorderedList")}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition hover:bg-rapido-blue hover:text-white"
        title="Bulleted List (•)"
      >
        <FiList className="h-3.5 w-3.5" />
        <span>Bullets</span>
      </button>

      {/* Numbering Points */}
      <button
        type="button"
        onClick={() => handleCommand("insertOrderedList")}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition hover:bg-rapido-blue hover:text-white"
        title="Numbered List (1, 2, 3)"
      >
        <span className="font-mono text-xs font-bold">1.</span>
        <span>Numbers</span>
      </button>

      <span className={`h-4 w-px mx-1 ${isDark ? "bg-white/15" : "bg-slate-300"}`} />

      {/* Reset Formatting */}
      <button
        type="button"
        onClick={() => handleCommand("removeFormat")}
        className="p-1.5 rounded-lg text-xs transition hover:bg-red-500/20 hover:text-red-500"
        title="Clear Formatting"
      >
        <FiRotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
