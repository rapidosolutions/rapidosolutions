import { processSteps } from "../../data/processData";
import SectionHeader from "../common/SectionHeader";
import ScrollReveal from "../common/ScrollReveal";
import Icon from "../ui/Icon";

export default function ProcessSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Simple Process"
          title="Our Simple Process"
          description="A clear path from business clarity to delivery and support, designed to keep web, finance, and HR work organized."
        />
        <div className="relative">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-blue-100 lg:left-0 lg:right-0 lg:top-16 lg:mx-auto lg:block lg:h-px lg:w-full" />
          <div className="grid gap-5 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <ScrollReveal
                key={step.title}
                delay={index * 0.06}
                className="relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-rapido-blue text-white shadow-blue-soft">
                  <Icon name={step.icon} className="h-5 w-5" />
                </span>
                <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.16em] text-rapido-blue">{step.number}</p>
                <h3 className="mt-2 text-lg font-extrabold text-rapido-navy">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-rapido-slate">{step.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
