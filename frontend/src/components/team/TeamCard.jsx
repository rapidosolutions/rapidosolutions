import ScrollReveal from "../common/ScrollReveal";
import Icon from "../ui/Icon";

export default function TeamCard({ member, index = 0 }) {
  return (
    <ScrollReveal
      delay={index * 0.04}
      data-team-card="true"
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="relative h-72 overflow-hidden bg-rapido-mist">
        {member.image ? (
          <img src={member.image} alt={`${member.name}, ${member.role}`} className="h-full w-full object-cover object-center" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-rapido-mist to-blue-100">
            <div className="grid h-24 w-24 place-items-center rounded-lg bg-white text-3xl font-extrabold text-rapido-blue shadow-sm">
              {member.initials}
            </div>
          </div>
        )}
        <div className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-lg bg-white/90 text-rapido-blue shadow-sm backdrop-blur">
          <Icon name={member.icon} className="h-5 w-5" />
        </div>
      </div>
      <div className="p-6">
        <h3 data-team-name className="text-xl font-extrabold text-rapido-navy">{member.name}</h3>
        <p data-team-role className="mt-2 text-sm font-extrabold uppercase tracking-[0.12em] text-rapido-blue">{member.role}</p>
        <p className="mt-4 leading-7 text-rapido-slate">{member.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {member.expertise.map((item) => (
            <span key={item} className="rounded-full bg-rapido-mist px-3 py-1 text-xs font-extrabold text-rapido-blue">
              {item}
            </span>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
