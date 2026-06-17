import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import ContactForm from "../components/contact/ContactForm";
import ContactInfo from "../components/contact/ContactInfo";
import SectionHeader from "../components/common/SectionHeader";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function Contact() {
  usePageMeta(
    "Contact",
    "Contact Rapido Solutions Co. for web development, Shopify, WordPress, SEO, UI/UX optimization, maintenance, and financial services."
  );

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Contact"
        title="Tell Us What You Want to Build, Fix, Improve, or Organize"
        description="Use the form to share your project, service interest, company details, and budget range. This version uses a polished mock submission state and is ready for EmailJS or backend integration later."
      />

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Project Request"
            title="Start with a Clear Conversation"
            description="A focused intake form helps Rapido understand whether you need a website, store, SEO support, maintenance, or financial help."
          />
          <div className="grid gap-8 lg:grid-cols-[1fr_0.42fr]">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </section>
    </motion.main>
  );
}
