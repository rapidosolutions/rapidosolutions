import { testimonials, trustIndicators } from "../../data/testimonialsData";
import { faqs } from "../../data/faqsData";
import SectionHeader from "../common/SectionHeader";
import ScrollReveal from "../common/ScrollReveal";
import FAQAccordion from "../ui/FAQAccordion";
import Icon from "../ui/Icon";

export default function TrustSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Trust Ready"
          title="Built for Clear Communication, Reliable Delivery, and Long-Term Support"
          description="This testimonial-ready section is structured for real client proof as the company grows, while still communicating the standards buyers expect now."
        />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {testimonials.map((testimonial, index) => (
              <ScrollReveal key={testimonial.author} delay={index * 0.06} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Icon key={starIndex} name="FiStar" className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 leading-7 text-rapido-slate">"{testimonial.quote}"</p>
                <p className="mt-5 font-extrabold text-rapido-navy">{testimonial.author}</p>
                <p className="text-sm font-semibold text-rapido-blue">{testimonial.role}</p>
              </ScrollReveal>
            ))}
          </div>

          <div className="grid gap-6">
            <ScrollReveal className="rounded-lg bg-rapido-navy p-6 text-white shadow-premium">
              <h3 className="text-2xl font-extrabold">Trust indicators</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {trustIndicators.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-white/[0.08] p-4">
                    <Icon name="FiCheckCircle" className="h-5 w-5 text-rapido-cyan" />
                    <span className="font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <FAQAccordion items={faqs} />
          </div>
        </div>
      </div>
    </section>
  );
}
