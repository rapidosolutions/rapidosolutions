import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { services } from "../../data/servicesData";
import { staggerContainer, fadeUp } from "../../utils/animations";
import SectionHeader from "../common/SectionHeader";
import ServicePickerButton from "../common/ServicePickerButton";
import Icon from "../ui/Icon";

export default function ServicesBento() {
  const featuredServices = services.filter((service) => service.featured).slice(0, 4);

  return (
    <section className="section-padding bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Solutions Command Center"
          title="Web Services Designed to Move Your Business Forward"
          description="A focused service stack for companies that need clearer websites, better store experiences, stronger search visibility, and reliable ongoing support."
        />

        <motion.div
          className="grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {featuredServices.map((service) => (
            <motion.article
              key={service.id}
              variants={fadeUp}
              className="group h-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-premium"
            >
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-rapido-mist text-rapido-blue">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-rapido-navy">{service.title}</h3>
              <p className="mt-3 leading-7 text-rapido-slate">{service.summary}</p>
              <Link
                to={`/web-services#${service.id}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-rapido-blue"
              >
                Explore service
                <Icon name="FiArrowRight" className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </motion.article>
          ))}
        </motion.div>

        <div className="mt-8 text-center">
          <ServicePickerButton>
            Explore Web Services
          </ServicePickerButton>
        </div>
      </div>
    </section>
  );
}
