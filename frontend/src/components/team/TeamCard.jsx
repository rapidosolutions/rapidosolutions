import ScrollReveal from "../common/ScrollReveal";
import { FaLinkedinIn } from "react-icons/fa";

export default function TeamCard({ member, index = 0 }) {
  return (
    <ScrollReveal
      delay={index * 0.04}
      data-team-card="true"
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-premium lg:min-h-[320px] lg:flex-row"
    >
      <div
        data-team-media="true"
        className="relative aspect-square w-full shrink-0 overflow-hidden bg-rapido-mist lg:aspect-auto lg:w-[42%]"
      >
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            data-team-image="true"
            loading="lazy"
            style={{ objectPosition: member.imagePosition || "center" }}
            className={`h-full w-full ${
              member.imageFit === "contain" ? "object-contain" : "object-cover"
            } ${member.imageClass || ""}`}
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-rapido-mist to-blue-100">
            <div className="grid h-24 w-24 place-items-center rounded-lg bg-white text-3xl font-extrabold text-rapido-blue shadow-sm">
              {member.initials}
            </div>
          </div>
        )}
      </div>
      <div data-team-content="true" className="flex min-w-0 flex-1 flex-col p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 data-team-name className="text-xl font-extrabold leading-7 text-rapido-navy">{member.name}</h3>
          {member.linkedinUrl ? (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              data-linkedin="true"
              aria-label={`Open ${member.name}'s LinkedIn profile`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-blue-100 bg-rapido-mist text-rapido-blue transition hover:border-rapido-blue hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-rapido-blue focus:ring-offset-2"
            >
              <FaLinkedinIn aria-hidden="true" className="h-4 w-4" />
            </a>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-rapido-slate lg:min-h-[4.5rem]">{member.summary}</p>
        <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {member.expertise.map((item) => (
            <span key={item} className="shrink-0 rounded-full bg-rapido-mist px-3 py-1 text-xs font-extrabold text-rapido-blue">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-slate">Worked At</p>
          <div className="mt-2 flex min-h-12 items-center gap-2" aria-label={`${member.name}'s previous workplaces`}>
            {member.workedAt.map((workplace) => (
              <div
                key={workplace.name}
                className="grid h-12 min-w-14 max-w-20 flex-1 place-items-center rounded-md border border-slate-200 bg-white px-2 py-1.5"
              >
                <img
                  src={workplace.logo}
                  alt={workplace.name}
                  loading="lazy"
                  className="max-h-9 max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
