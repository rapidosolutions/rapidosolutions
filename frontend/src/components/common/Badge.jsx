import Icon from "../ui/Icon";

export default function Badge({ children, icon = "FiCheckCircle", tone = "blue", className = "" }) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-rapido-blue",
    dark: "border-white/[0.15] bg-white/10 text-white",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    slate: "border-slate-200 bg-white text-slate-700"
  };

  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] ${tones[tone]} ${className}`}
    >
      {icon ? <Icon name={icon} className="h-3.5 w-3.5 shrink-0" /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
