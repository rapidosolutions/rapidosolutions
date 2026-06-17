export default function GradientBackground({ className = "" }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-grid-light blueprint opacity-55" />
      <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-br from-blue-100/70 via-transparent to-transparent" />
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-cyan-100/60 via-transparent to-transparent" />
    </div>
  );
}
