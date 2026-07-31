import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import Button from "../components/common/Button";
import HomeCTA from "../components/home/HomeCTA";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewForm from "../components/reviews/ReviewForm";
import { pageTransition } from "../utils/animations";
import { listPublicReviews } from "../utils/blogApi";
import { usePageMeta } from "../utils/usePageMeta";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageMeta(
    "Reviews",
    "Review and share feedback about working with Rapido Solutions Co.",
    { canonicalPath: "/reviews", robots: "noindex, follow" }
  );

  useEffect(() => {
    let active = true;
    listPublicReviews({ limit: 24 })
      .then((data) => active && setReviews(data.reviews || []))
      .catch(() => active && setReviews([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Reviews"
        title="Client Reviews"
        description="Verified feedback will be published here after it has been submitted and reviewed."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/reviews#submit-review">Share Your Review</Button>
          <Button to="/projects" variant="light">
            View Projects
          </Button>
        </div>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="All Reviews"
            title="Verified Client Feedback"
            description="Only genuine reviews approved by the Rapido team are displayed publicly."
          />
          {reviews.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          ) : (
            <p className="mx-auto max-w-2xl rounded-lg border border-blue-100 bg-rapido-mist p-6 text-center font-semibold leading-7 text-rapido-slate">
              {loading ? "Loading approved reviews..." : "No approved reviews have been published yet. Be the first to share an honest experience."}
            </p>
          )}
        </div>
      </section>

      <section id="submit-review" className="section-padding scroll-mt-32 bg-rapido-mist">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Share Feedback"
            title="Add Your Review"
            description="Your review will be checked before publication. Your email address is used for verification and is never displayed publicly."
          />
          <ReviewForm />
        </div>
      </section>

      <HomeCTA />
    </motion.main>
  );
}
