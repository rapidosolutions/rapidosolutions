import { SiQuickbooks, SiXero } from "react-icons/si";

const brandIcons = {
  quickbooks: SiQuickbooks,
  xero: SiXero
};

function SoftwareLogo({ item }) {
  const BrandIcon = brandIcons[item.icon];

  if (BrandIcon) {
    return (
      <div className="flex items-center gap-3">
        <BrandIcon className="h-10 w-10 shrink-0" style={{ color: item.brandColor }} aria-hidden="true" />
        <span className="text-lg font-extrabold text-rapido-navy">{item.name}</span>
      </div>
    );
  }

  if (item.logoUrl) {
    return (
      <img
        src={item.logoUrl}
        alt={`${item.name} logo`}
        className={`max-h-11 max-w-[155px] object-contain ${item.logoClassName || ""}`}
        loading="eager"
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-lg font-black text-[#1f3f8b]">
        D
      </span>
      <span className="text-2xl font-black tracking-normal text-[#1f3f8b]">
        {item.wordmark?.primary}
        <span className="text-[#18cf88]">{item.wordmark?.accent}</span>
      </span>
    </div>
  );
}

function LogoGroup({ software, duplicate = false }) {
  return (
    <div className="flex shrink-0 gap-4 pr-4" aria-hidden={duplicate ? "true" : undefined}>
      {software.map((item) => (
        <article
          key={`${duplicate ? "duplicate-" : ""}${item.name}`}
          className="flex h-24 min-w-[190px] items-center justify-center rounded-lg border border-slate-200 bg-white px-5 shadow-sm sm:h-28 sm:min-w-[230px]"
        >
          <SoftwareLogo item={item} />
        </article>
      ))}
    </div>
  );
}

export default function SoftwareSupportGrid({ software }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white/70 p-3 shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-20" />
      <div className="software-logo-track flex w-max py-1" aria-label="Accounting and property software Rapido supports">
        <LogoGroup software={software} />
        <LogoGroup software={software} duplicate />
      </div>
    </div>
  );
}
