import { useState } from "react";
import Icon from "../ui/Icon";

export default function LaptopMockup({
  imageSrc = null,
  imageAlt = "Project landing page",
  projectUrl = "",
  title = "Project Preview",
  accent = "from-slate-200 to-blue-400",
  className = "",
  interactive = false,
  onClick = null
}) {
  const [imgError, setImgError] = useState(false);
  const cleanUrl = projectUrl
    ? projectUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "")
    : "rapidosolutions.co/preview";

  const hasImage = Boolean(imageSrc) && !imgError;

  return (
    <div
      onClick={interactive && onClick ? onClick : undefined}
      className={`group relative mx-auto w-full select-none transition-transform duration-500 ${
        interactive ? "cursor-pointer hover:-translate-y-1" : ""
      } ${className}`}
    >
      {/* LAPTOP DISPLAY LID */}
      <div className="relative mx-auto w-[92%] rounded-t-[14px] sm:rounded-t-[18px] border-[7px] sm:border-[10px] border-[#181d26] bg-[#0c1017] shadow-2xl transition duration-500 group-hover:border-[#131821]">
        {/* Top Bezel Camera Dot */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
          <div className="h-1.5 w-1.5 rounded-full bg-[#05070a] ring-1 ring-white/10 flex items-center justify-center">
            <span className="h-0.5 w-0.5 rounded-full bg-emerald-400/80" />
          </div>
        </div>

        {/* SCREEN DISPLAY (16:10 Aspect Ratio) */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
          {/* Subtle Screen Glare / Reflection */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-transparent to-white/10" />

          {/* Browser Address Bar inside Mockup */}
          <div className="relative z-10 flex h-6 w-full items-center justify-between border-b border-white/10 bg-[#0f172a]/95 px-2.5 backdrop-blur-sm sm:h-7">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500/80 sm:h-2 sm:w-2" />
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80 sm:h-2 sm:w-2" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 sm:h-2 sm:w-2" />
            </div>

            {projectUrl ? (
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={`Open ${projectUrl} in new window`}
                className="group/url flex max-w-[65%] items-center gap-1.5 overflow-hidden rounded-md bg-white/[0.08] px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-slate-300 hover:bg-white/[0.2] hover:text-white transition cursor-pointer"
              >
                <Icon name="FiLock" className="h-2.5 w-2.5 shrink-0 text-emerald-400" />
                <span className="truncate">{cleanUrl}</span>
                <Icon name="FiExternalLink" className="h-2.5 w-2.5 shrink-0 text-slate-400 group-hover/url:text-white" />
              </a>
            ) : (
              <div className="flex max-w-[65%] items-center gap-1.5 overflow-hidden rounded-md bg-white/[0.08] px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-slate-300">
                <Icon name="FiLock" className="h-2.5 w-2.5 shrink-0 text-emerald-400" />
                <span className="truncate">{cleanUrl}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="hidden sm:inline text-[9px] text-slate-500 font-mono">100%</span>
            </div>
          </div>

          {/* Mockup Screen Content */}
          <div className="relative h-[calc(100%-24px)] sm:h-[calc(100%-28px)] w-full overflow-hidden bg-slate-950">
            {hasImage ? (
              <img
                src={imageSrc}
                alt={imageAlt || title}
                loading="lazy"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              /* High-end Styled Project Landing Page Fallback */
              <div
                className={`relative flex h-full w-full flex-col justify-between bg-gradient-to-br ${accent} p-4 text-slate-900`}
              >
                <div className="flex items-center justify-between">
                  <div className="h-2.5 w-16 rounded-full bg-slate-900/30 backdrop-blur" />
                  <div className="flex gap-1.5">
                    <div className="h-2 w-8 rounded-full bg-slate-900/20" />
                    <div className="h-2 w-8 rounded-full bg-slate-900/20" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-[85%]">
                  <div className="inline-block rounded bg-rapido-navy/80 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    {title}
                  </div>
                  <div className="h-3 w-4/5 rounded bg-slate-900/40" />
                  <div className="h-2 w-3/5 rounded bg-slate-900/20" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="h-4 w-14 rounded-full bg-rapido-blue text-[8px] font-bold text-white flex items-center justify-center shadow-sm">
                    Live Demo
                  </div>
                  <div className="h-2 w-10 rounded bg-slate-900/20" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LAPTOP LOWER CHASSIS & KEYBOARD DECK */}
      <div className="relative mx-auto w-full">
        {/* Main Base Bar */}
        <div className="relative h-2.5 sm:h-3.5 w-full rounded-b-xl bg-gradient-to-b from-[#b0bccb] via-[#8594a6] to-[#607185] shadow-md border-t border-white/20">
          {/* Aluminum Display Hinge / Inset Center Groove */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 sm:h-1.5 w-14 sm:w-20 rounded-b-md bg-[#242d38] shadow-inner" />
        </div>

        {/* Realistic Under-Chassis Floating Drop Shadow */}
        <div className="mx-auto -mt-0.5 h-2 w-[92%] rounded-full bg-slate-950/25 blur-sm sm:h-3" />
      </div>
    </div>
  );
}
