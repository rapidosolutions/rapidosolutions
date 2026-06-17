import Button from "../common/Button";
import ScrollReveal from "../common/ScrollReveal";
import Icon from "../ui/Icon";

export default function ServiceDetailBlock({ service }) {
  return (
    <ScrollReveal
      as="section"
      className="min-w-0 scroll-mt-32 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      id={service.id}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-rapido-mist text-rapido-blue">
              <Icon name={service.icon} className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-slate">
              {service.category}
            </span>
          </div>
          <h2 className="mt-5 font-display text-3xl font-extrabold text-rapido-navy">{service.title}</h2>
          <p className="mt-4 text-lg leading-8 text-rapido-slate">{service.summary}</p>
        </div>
        <Button to="/contact" variant="secondary">
          Discuss This Web Service
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {service.items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-lg bg-rapido-mist p-4">
            <Icon name="FiCheckCircle" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <span className="text-sm font-bold leading-6 text-rapido-navy">{item}</span>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
