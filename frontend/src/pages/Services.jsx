import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import Button from "../components/common/Button";
import ServiceTabs from "../components/services/ServiceTabs";
import ServiceDetailBlock from "../components/services/ServiceDetailBlock";
import ServiceCard from "../components/services/ServiceCard";
import HomeCTA from "../components/home/HomeCTA";
import Icon from "../components/ui/Icon";
import { services } from "../data/servicesData";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function Services() {
  const [activeId, setActiveId] = useState(services[0].id);

  usePageMeta(
    "Web Services",
    "Explore Rapido Solutions Co. web services across web development, Shopify, WordPress, SEO, UI/UX, and maintenance."
  );

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setActiveId(id);
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 120);
    }
  }, []);

  const jumpToService = (id) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Web Services"
        title="Web Services for Modern Business Growth"
        description="Rapido Solutions Co. helps businesses build professional websites, improve conversion paths, optimize search visibility, and maintain reliable web systems."
      >
        <Button to="/contact">Request a Web Services Plan</Button>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Service Overview"
            title="Focused Web Services Without the Noise"
            description="Each category is built around website quality, customer clarity, performance, and long-term digital reliability."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-rapido-mist">
        <div className="container-shell grid min-w-0 gap-8 lg:grid-cols-[280px_1fr]">
          <ServiceTabs activeId={activeId} onChange={jumpToService} />
          <div className="min-w-0 max-w-full overflow-hidden lg:hidden">
            <div className="hide-scrollbar flex max-w-full gap-2 overflow-x-auto rounded-lg border border-blue-100 bg-white p-2 shadow-sm">
              {services.map((service) => (
                <button
                  key={service.id}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-extrabold ${
                    activeId === service.id ? "bg-rapido-blue text-white" : "text-rapido-slate"
                  }`}
                  type="button"
                  onClick={() => jumpToService(service.id)}
                >
                  <Icon name={service.icon} className="h-4 w-4" />
                  {service.shortTitle}
                </button>
              ))}
            </div>
          </div>
          <div className="grid min-w-0 gap-6">
            {services.map((service) => (
              <ServiceDetailBlock key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <HomeCTA />
    </motion.main>
  );
}
