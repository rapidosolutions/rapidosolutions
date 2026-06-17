import { industries } from "../../data/industriesData";
import SectionHeader from "../common/SectionHeader";
import ScrollReveal from "../common/ScrollReveal";
import Icon from "../ui/Icon";

export default function IndustriesSection() {
  return (
    <section className="section-padding bg-rapido-mist">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Industries Served"
          title="Built for Businesses Across Different Industries"
          description="Rapido can adapt the same high-standard digital thinking across eCommerce, local service, real estate, restaurant, SaaS, and operational teams."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {industries.map((industry, index) => (
            <ScrollReveal
              key={industry.name}
              delay={index * 0.03}
              className="group rounded-lg border border-blue-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-rapido-mist text-rapido-blue transition group-hover:bg-rapido-blue group-hover:text-white">
                <Icon name={industry.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-extrabold text-rapido-navy">{industry.name}</h3>
              <p className="mt-2 text-sm leading-6 text-rapido-slate">{industry.detail}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
