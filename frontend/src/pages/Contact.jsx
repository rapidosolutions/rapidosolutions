import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import ContactForm from "../components/contact/ContactForm";
import ContactInfo from "../components/contact/ContactInfo";
import SectionHeader from "../components/common/SectionHeader";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";
import { createBreadcrumbSchema, createWebPageSchema } from "../utils/seo";
import { useStructuredData } from "../utils/useStructuredData";

export default function Contact() {
  const description =
    "Contact Rapido Solutions Co. about web development, Shopify, WordPress, SEO, bookkeeping, finance, or human resource support for your business.";
  usePageMeta("Contact Rapido Solutions | Web, Finance & HR Support", description, {
    absoluteTitle: true,
    canonicalPath: "/contact"
  });
  useStructuredData(
    "contact-page",
    createWebPageSchema({ name: "Contact Rapido Solutions Co.", description, path: "/contact", type: "ContactPage" })
  );
  useStructuredData(
    "contact-breadcrumbs",
    createBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])
  );

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Contact"
        title="Tell Us What You Want to Build, Fix, Improve, or Organize"
        description="Share your project, service interest, company details, and budget range. Your request is securely saved and sent directly to the Rapido team."
      />

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Project Request"
            title="Start with a Clear Conversation"
            description="A focused intake form helps Rapido understand whether you need web, SEO, bookkeeping, finance, or HR support."
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
