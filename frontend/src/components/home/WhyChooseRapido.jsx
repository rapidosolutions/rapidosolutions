import { serviceBenefits } from "../../data/servicesData";
import Badge from "../common/Badge";
import Button from "../common/Button";
import ScrollReveal from "../common/ScrollReveal";
import Icon from "../ui/Icon";

export default function WhyChooseRapido() {
  return (
    <section className="section-padding bg-rapido-mist">
      <div className="container-shell grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <ScrollReveal>
          <Badge icon="FiTarget">Why choose Rapido</Badge>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight text-rapido-navy text-balance md:text-5xl">
            Why Businesses Choose Rapido Solutions Co.
          </h2>
          <p className="mt-5 text-lg leading-8 text-rapido-slate">
            Rapido is built for business owners who want their digital presence to feel polished, work reliably, and
            support real customer action. The goal is not just a better-looking website. The goal is a stronger system.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/about">Learn About Rapido</Button>
            <Button to="/projects" variant="secondary">
              View Projects
            </Button>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {serviceBenefits.map((benefit, index) => (
            <ScrollReveal
              key={benefit}
              delay={index * 0.04}
              className="group rounded-lg border border-blue-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Icon name="FiCheckCircle" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-extrabold text-rapido-navy">{benefit}</p>
                  <p className="mt-2 text-sm leading-6 text-rapido-slate">
                    Practical execution with a clean path from business need to digital result.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
