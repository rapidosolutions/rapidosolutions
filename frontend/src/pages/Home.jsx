import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Hero from "../components/home/Hero";
import ServicesBento from "../components/home/ServicesBento";
import FinancialServicesPreview from "../components/home/FinancialServicesPreview";
import HumanResourceServicesPreview from "../components/home/HumanResourceServicesPreview";
import WhyChooseRapido from "../components/home/WhyChooseRapido";
import ProcessSection from "../components/home/ProcessSection";
import ReviewsSection from "../components/home/ReviewsSection";
import HomeCTA from "../components/home/HomeCTA";
import Icon from "../components/ui/Icon";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

function MobileScrollCue() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY < 80);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <div
      className={`relative z-20 flex justify-center bg-white pb-2 pt-4 md:hidden transition duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <a
        href="#home-services"
        aria-label="Scroll to more content"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-blue-100 bg-white text-rapido-blue shadow-premium transition hover:-translate-y-0.5 hover:bg-rapido-mist"
      >
        <Icon name="FiChevronDown" className="h-6 w-6" />
      </a>
    </div>
  );
}

export default function Home() {
  usePageMeta(
    "Digital Solutions Built for Business Growth",
    "Rapido Solutions Co. builds responsive websites, SEO-ready digital systems, and financial support solutions for growing businesses."
  );

  return (
    <motion.main {...pageTransition}>
      <Hero />
      <MobileScrollCue />
      <ServicesBento />
      <FinancialServicesPreview />
      <HumanResourceServicesPreview />
      <WhyChooseRapido />
      <ProcessSection />
      <ReviewsSection />
      <HomeCTA />
    </motion.main>
  );
}
