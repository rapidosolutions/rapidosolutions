import Badge from "../common/Badge";
import Button from "../common/Button";
import ServicePickerButton from "../common/ServicePickerButton";
import ScrollReveal from "../common/ScrollReveal";
import Icon from "../ui/Icon";

const serviceBenefits = [
  {
    title: "Modern and Responsive Design",
    description: "Websites designed to work clearly across desktop, tablet, and mobile devices."
  },
  {
    title: "Conversion-Focused Websites",
    description: "Clear page structures and calls to action that guide visitors toward the next step."
  },
  {
    title: "SEO-Friendly Structure",
    description: "Search-focused headings, metadata, internal links, and technical foundations."
  },
  {
    title: "Shopify and WordPress Expertise",
    description: "Professional development and optimization for leading website and ecommerce platforms."
  },
  {
    title: "Organized Bookkeeping Support",
    description: "Structured support for transactions, reconciliations, payables, and reporting."
  },
  {
    title: "Property Accounting Support",
    description: "Reliable assistance with ledgers, owner statements, reporting, and property workflows."
  },
  {
    title: "Practical HR Processes",
    description: "Clear support for hiring, policies, SOPs, onboarding, and employee development."
  },
  {
    title: "Reliable Ongoing Support",
    description: "Continued assistance for websites, SEO, bookkeeping, finance, and HR needs."
  }
];

export default function WhyChooseRapido() {
  return (
    <section className="bg-rapido-mist py-12 md:py-16">
      <div className="container-shell grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <ScrollReveal>
          <Badge icon="FiTarget">Why choose Rapido</Badge>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight text-rapido-navy text-balance md:text-5xl">
            Why Businesses Choose Rapido Solutions Co.
          </h2>
          <p className="mt-5 text-lg leading-8 text-rapido-slate">
            Rapido combines digital expertise with practical business support. We build professional websites, improve
            search foundations, organize financial workflows, and strengthen HR processes through clear communication
            and reliable delivery.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/about">Learn About Rapido</Button>
            <ServicePickerButton variant="secondary" size="md">
              Explore Services
            </ServicePickerButton>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {serviceBenefits.map((benefit, index) => (
            <ScrollReveal
              key={benefit.title}
              delay={index * 0.04}
              className="group rounded-lg border border-blue-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Icon name="FiCheckCircle" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-rapido-navy">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-rapido-slate">{benefit.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
