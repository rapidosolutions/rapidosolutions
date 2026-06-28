import { testimonials } from "../../data/testimonialsData";
import Button from "../common/Button";
import SectionHeader from "../common/SectionHeader";
import ScrollReveal from "../common/ScrollReveal";
import Icon from "../ui/Icon";

export default function ReviewsSection() {
  const featuredReviews = testimonials.slice(0, 3);

  return (
    <section className="section-padding bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Reviews"
          title="What Clients Say About Working With Rapido"
          description="Realistic feedback themes from website, SEO, financial support, and HR service work."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featuredReviews.map((review, index) => (
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
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/reviews" variant="secondary">
            See More Reviews
          </Button>
          <Button to="/contact" icon="FiMessageCircle">
            Add Your Review
          </Button>
        </div>
      </div>
    </section>
  );
}
