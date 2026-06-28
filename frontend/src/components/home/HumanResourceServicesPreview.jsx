import { humanResourceServices } from "../../data/humanResourceServicesData";
import SectionHeader from "../common/SectionHeader";
import ServicePickerButton from "../common/ServicePickerButton";
import Icon from "../ui/Icon";

export default function HumanResourceServicesPreview() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Human Resource Services"
          title="HR Support Built for Better Team Structure"
          description="Practical talent acquisition, policy, SOP, training, and development support for businesses that need clearer people operations."
        />

        <div className="grid gap-5 md:grid-cols-3">
          {humanResourceServices.map((service) => (
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
            Explore Human Resource Services
          </ServicePickerButton>
        </div>
      </div>
    </section>
  );
}
