import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import Button from "../components/common/Button";
import Icon from "../components/ui/Icon";
import HomeCTA from "../components/home/HomeCTA";
import { humanResourceServices } from "../data/humanResourceServicesData";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function HumanResourceServices() {
  usePageMeta(
    "Human Resource Services",
    "Human resource services from Rapido Solutions Co. for talent acquisition, HR policies, SOPs, training, and development support."
  );

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Human Resource Services"
        title="HR Support for Clearer Team Operations"
        description="Rapido helps growing businesses organize hiring, workplace policies, SOPs, onboarding, and training systems with practical HR support."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/contact">Request HR Support</Button>
          <Button to="/projects?type=human" variant="light">
            View HR Projects
          </Button>
        </div>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="HR Services"
            title="Human Resource Services Built for Growing Teams"
            description="A focused HR support layer for businesses that need better hiring flow, clearer internal documents, and practical employee development."
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
                <h2 className="mt-5 text-xl font-extrabold text-rapido-navy">{service.title}</h2>
                <p className="mt-3 leading-7 text-rapido-slate">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-rapido-mist">
        <div className="container-shell grid gap-5 md:grid-cols-3">
          {["Hiring Clarity", "Policy Structure", "Team Development"].map((item) => (
            <div key={item} className="rounded-lg border border-blue-100 bg-white p-6 shadow-sm">
              <Icon name="FiCheckCircle" className="h-6 w-6 text-emerald-600" />
              <p className="mt-4 text-lg font-extrabold text-rapido-navy">{item}</p>
              <p className="mt-2 leading-7 text-rapido-slate">
                Practical support designed to make people operations easier to manage and explain.
              </p>
            </div>
          ))}
        </div>
      </section>

      <HomeCTA />
    </motion.main>
  );
}
