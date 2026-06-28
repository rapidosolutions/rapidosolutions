import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import Button from "../components/common/Button";
import Icon from "../components/ui/Icon";
import HomeCTA from "../components/home/HomeCTA";
import { testimonials } from "../data/testimonialsData";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function Reviews() {
  usePageMeta(
    "Reviews",
    "Read client reviews for Rapido Solutions Co. web services, SEO support, financial support, and human resource services."
  );

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Reviews"
        title="Client Feedback Across Web, Finance, and HR"
        description="A simple place to review what clients say about Rapido's website, SEO, financial support, and human resource service work."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/contact">Share Your Review</Button>
          <Button to="/projects" variant="light">
            View Projects
          </Button>
        </div>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="All Reviews"
            title="What Clients Notice Most"
            description="Clear communication, cleaner systems, better customer journeys, and practical support are the themes clients mention most."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((review) => (
              <article key={review.author} className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Icon key={starIndex} name="FiStar" className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 leading-7 text-rapido-slate">"{review.quote}"</p>
                <p className="mt-5 font-extrabold text-rapido-navy">{review.author}</p>
                <p className="text-sm font-semibold text-rapido-blue">{review.role}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button to="/contact" icon="FiMessageCircle">
              Add Your Review
            </Button>
          </div>
        </div>
      </section>

      <HomeCTA />
    </motion.main>
  );
}
