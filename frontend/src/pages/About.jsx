import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import ScrollReveal from "../components/common/ScrollReveal";
import Button from "../components/common/Button";
import LogoCloud from "../components/ui/LogoCloud";
import Icon from "../components/ui/Icon";
import HomeCTA from "../components/home/HomeCTA";
import TeamSection from "../components/about/TeamSection";
import { pageTransition } from "../utils/animations";
import { brandStatement } from "../utils/constants";
import { usePageMeta } from "../utils/usePageMeta";

const values = ["Quality", "Reliability", "Speed", "Transparency", "Growth", "Professionalism"];

const differences = [
  "Technology and business support under one roof",
  "Conversion-focused approach",
  "Long-term partnership mindset",
  "Clean communication and scalable solutions"
];

export default function About() {
  usePageMeta(
    "About",
    "Learn how Rapido Solutions Co. combines technology, design, SEO, eCommerce, web support, and financial support for growing businesses."
  );

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="About Rapido"
        title="A Modern Solutions Company for Growing Businesses"
        description="Rapido Solutions Co. combines technology, design, SEO, eCommerce, maintenance, and financial expertise to help businesses build stronger digital systems and manage growth more professionally."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/web-services">Explore Web Services</Button>
          <Button to="/financial-services" variant="secondary">
            Explore Financial Services
          </Button>
          <Button to="/contact" variant="light">
            Book a Free Consultation
          </Button>
        </div>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal>
            <SectionHeader
              align="left"
              eyebrow="Company Story"
              title="Built to make business growth feel more organized."
              description={brandStatement}
              className="mb-0"
            />
            <p className="mt-6 text-lg leading-8 text-rapido-slate">
              Rapido was created to help businesses move beyond scattered digital work. The company supports websites,
              stores, search visibility, operational systems, maintenance, and financial organization so owners can
              grow with more confidence and fewer disconnected tools.
            </p>
          </ScrollReveal>
          <LogoCloud />
        </div>
      </section>

      <section className="section-padding bg-rapido-mist">
        <div className="container-shell grid gap-6 md:grid-cols-2">
          <ScrollReveal className="rounded-lg bg-white p-8 shadow-premium">
            <Icon name="FiTarget" className="h-9 w-9 text-rapido-blue" />
            <h2 className="mt-5 text-3xl font-extrabold text-rapido-navy">Mission</h2>
            <p className="mt-4 leading-8 text-rapido-slate">
              Help businesses grow through reliable digital and operational solutions that improve presence,
              performance, systems, and financial visibility.
            </p>
          </ScrollReveal>
          <ScrollReveal className="rounded-lg bg-rapido-navy p-8 text-white shadow-premium">
            <Icon name="FiCompass" className="h-9 w-9 text-rapido-cyan" />
            <h2 className="mt-5 text-3xl font-extrabold">Vision</h2>
            <p className="mt-4 leading-8 text-blue-100">
              Become a trusted growth partner for businesses that need technology, design, SEO, web support, and
              financial support in one practical relationship.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeader
            align="left"
            eyebrow="Different By Design"
            title="What Makes Rapido Different"
            description="The company is positioned as a digital growth partner, not a task shop. Each service should connect back to trust, conversion, clarity, reliability, and business control."
            className="mb-0"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {differences.map((item, index) => (
              <ScrollReveal key={item} delay={index * 0.05} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <Icon name="FiCheckCircle" className="h-6 w-6 text-emerald-600" />
                <p className="mt-4 font-extrabold leading-7 text-rapido-navy">{item}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-rapido-mist">
        <div className="container-shell">
          <SectionHeader eyebrow="Values" title="The Standards Behind the Work" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {values.map((value, index) => (
              <ScrollReveal
                key={value}
                delay={index * 0.04}
                className="rounded-lg border border-blue-100 bg-white p-5 text-center font-extrabold text-rapido-navy shadow-sm"
              >
                {value}
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <TeamSection />
      <HomeCTA />
    </motion.main>
  );
}
