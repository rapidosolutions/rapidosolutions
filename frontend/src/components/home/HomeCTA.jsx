import Button from "../common/Button";
import Badge from "../common/Badge";
import ScrollReveal from "../common/ScrollReveal";

export default function HomeCTA() {
  return (
    <section className="section-padding bg-rapido-mist">
      <div className="container-shell">
        <ScrollReveal className="relative overflow-hidden rounded-lg bg-rapido-navy p-8 text-white shadow-premium md:p-12">
          <div className="absolute inset-0 bg-grid-dark blueprint opacity-30" aria-hidden="true" />
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <Badge tone="dark" icon="FiMessageCircle">
                Start the next move
              </Badge>
              <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight text-balance md:text-5xl">
                Ready to Build a Better Digital Presence?
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100">
                Whether you need a new website, Shopify store, SEO support, UI/UX improvement, maintenance, or
                financial support, Rapido Solutions Co. is ready to help.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-72 lg:grid-cols-1">
              <Button to="/contact" variant="primary" size="lg">
                Book a Free Consultation
              </Button>
              <Button to="/contact" variant="light" size="lg" icon="FiPieChart">
                Request Financial Support
              </Button>
              <Button to="/contact" variant="light" size="lg" icon="FiSearch">
                Request a Website Review
              </Button>
              <Button to="/contact" variant="secondary" size="lg" className="bg-white text-rapido-navy">
                Start Your Project
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
