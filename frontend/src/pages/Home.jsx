import { motion } from "framer-motion";
import Hero from "../components/home/Hero";
import ServicesBento from "../components/home/ServicesBento";
import FinancialServicesPreview from "../components/home/FinancialServicesPreview";
import WhyChooseRapido from "../components/home/WhyChooseRapido";
import ProcessSection from "../components/home/ProcessSection";
import ReviewsSection from "../components/home/ReviewsSection";
import HomeCTA from "../components/home/HomeCTA";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function Home() {
  usePageMeta(
    "Digital Solutions Built for Business Growth",
    "Rapido Solutions Co. helps businesses design, develop, optimize, and maintain modern websites, eCommerce stores, SEO systems, and financial operations."
  );

  return (
    <motion.main {...pageTransition}>
      <Hero />
      <ServicesBento />
      <FinancialServicesPreview />
      <WhyChooseRapido />
      <ProcessSection />
      <ReviewsSection />
      <HomeCTA />
    </motion.main>
  );
}
