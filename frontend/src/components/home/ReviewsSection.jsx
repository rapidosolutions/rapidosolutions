import { testimonials } from "../../data/testimonialsData";
import SectionHeader from "../common/SectionHeader";
import ScrollReveal from "../common/ScrollReveal";
import Icon from "../ui/Icon";

export default function ReviewsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Reviews"
          title="Client-Ready Feedback"
          description="A simple review area built for social proof without overwhelming the page."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((review, index) => (
            <ScrollReveal
              key={review.author}
              delay={index * 0.05}
              className="rounded-lg border border-slate-200 bg-slate-50 p-6"
            >
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Icon key={starIndex} name="FiStar" className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 leading-7 text-rapido-slate">"{review.quote}"</p>
              <p className="mt-5 font-extrabold text-rapido-navy">{review.author}</p>
              <p className="text-sm font-semibold text-rapido-blue">{review.role}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
