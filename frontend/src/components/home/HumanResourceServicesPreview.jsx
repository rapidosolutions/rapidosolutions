import { humanResourceServices } from "../../data/humanResourceServicesData";
import SectionHeader from "../common/SectionHeader";
import ServicePickerButton from "../common/ServicePickerButton";
import Icon from "../ui/Icon";

export default function HumanResourceServicesPreview() {
  const homepageServices = humanResourceServices.map((service) => {
    if (service.title === "Talent Acquisition") {
      return {
        ...service,
        description: "Structured hiring support for sourcing, screening, shortlisting, and improving the candidate experience."
      };
    }

    if (service.title === "HR Policies and SOPs") {
      return {
        ...service,
        description: "Clear HR policies, process documents, and SOPs that improve consistency across growing teams."
      };
    }

    return service;
  });

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Human Resource Services"
          title="HR Support for Stronger People Operations"
          description="Practical support for hiring, HR policies, SOPs, onboarding, training, and employee development for growing businesses."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {homepageServices.map((service) => (
            <article
              key={service.title}
              className="h-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium"
            >
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-rapido-blue">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-rapido-navy">{service.title}</h3>
              <p className="mt-3 leading-7 text-rapido-slate">{service.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <ServicePickerButton>
            Explore HR Services
          </ServicePickerButton>
        </div>
      </div>
    </section>
  );
}
