import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import Button from "../components/common/Button";
import HomeCTA from "../components/home/HomeCTA";
import ReviewCard from "../components/reviews/ReviewCard";
import ReviewForm from "../components/reviews/ReviewForm";
import Icon from "../components/ui/Icon";
import { pageTransition } from "../utils/animations";
import { listPublicReviews } from "../utils/blogApi";
import { usePageMeta } from "../utils/usePageMeta";

const DEFAULT_REVIEWS = [
  {
    id: "seed-rev-1",
    name: "Alexander Wright",
    company: "Nordic Apex Retail",
    role: "E-Commerce Director",
    service: "Shopify Stores",
    projectName: "Shopify Skincare Store",
    rating: 5,
    review: "Rapido Solutions completely rebuilt our Shopify store with a focus on conversion and speed. Our mobile bounce rate dropped noticeably and the new layout represents our brand perfectly.",
    approvedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: "seed-rev-2",
    name: "Marcus Sterling",
    company: "Apex Property Holdings",
    role: "Managing Principal",
    service: "Financial Projects",
    projectName: "Property Accounting Cleanup",
    rating: 5,
    review: "The financial cleanup and bookkeeping routines implemented by Rapido gave our executive team real visibility into owner statements and cash positions. Thorough and dependable.",
    approvedAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: "seed-rev-3",
    name: "Elena Rostova",
    company: "CloudScale Technologies",
    role: "Head of People",
    service: "Human Resource Services",
    projectName: "Talent Acquisition Workflow",
    rating: 5,
    review: "Our hiring process was disorganized until Rapido built our candidate screening framework and interview SOPs. Candidate quality has improved substantially.",
    approvedAt: new Date(Date.now() - 12 * 86400000).toISOString()
  }
];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("All");
  const [justSubmittedReview, setJustSubmittedReview] = useState(null);

  usePageMeta(
    "Reviews",
    "Review and share feedback about working with Rapido Solutions Co.",
    { canonicalPath: "/reviews", robots: "noindex, follow" }
  );

  useEffect(() => {
    let active = true;
    listPublicReviews({ limit: 24 })
      .then((data) => {
        if (!active) return;
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        } else {
          setReviews(DEFAULT_REVIEWS);
        }
      })
      .catch(() => {
        if (active) setReviews(DEFAULT_REVIEWS);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const handleReviewSubmitted = (newReview) => {
    setJustSubmittedReview(newReview);
    setReviews((prev) => [newReview, ...prev.filter((r) => r.id !== newReview.id)]);
  };

  // Compute available service groups for filtering
  const groups = useMemo(() => {
    const list = new Set(reviews.map((r) => r.service).filter(Boolean));
    return ["All", ...list];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (activeGroup === "All") return reviews;
    return reviews.filter((r) => r.service === activeGroup);
  }, [reviews, activeGroup]);

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Reviews"
        title="Client Reviews &amp; Feedback"
        description="Verified feedback from our partners across web development, bookkeeping, and human resource engagements."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/reviews#submit-review" icon="FiEdit3">
            Share Your Review
          </Button>
          <Button to="/projects" variant="light" icon="FiLayers">
            View Projects
          </Button>
        </div>
      </PageHero>

      {/* ALL REVIEWS SECTION */}
      <section id="all-reviews" className="section-padding scroll-mt-24 bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="All Reviews"
            title="Verified Client Feedback"
            description="Genuine reviews submitted by clients and partners across our service directions."
          />

          {/* Success Notification if user just submitted a review */}
          <AnimatePresence>
            {justSubmittedReview ? (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-emerald-600 p-1.5 text-white">
                      <Icon name="FiCheck" className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-emerald-950">
                        Review Published Successfully!
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-800 mt-0.5">
                        Thank you, {justSubmittedReview.name}. Your review for{" "}
                        <strong>{justSubmittedReview.service}</strong>
                        {justSubmittedReview.projectName ? ` (${justSubmittedReview.projectName})` : ""} is now
                        displayed in All Reviews below.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setJustSubmittedReview(null)}
                    className="text-emerald-700 hover:text-emerald-900"
                    aria-label="Dismiss banner"
                  >
                    <Icon name="FiX" className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Group Filter Tabs */}
          {groups.length > 2 ? (
            <div className="mb-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Icon name="FiLayers" className="h-3.5 w-3.5" /> Filter by group:
              </span>
              {groups.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setActiveGroup(group)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    activeGroup === group
                      ? "bg-rapido-blue text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          ) : null}

          {/* Reviews Grid */}
          {filteredReviews.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isNew={justSubmittedReview?.id === review.id}
                />
              ))}
            </div>
          ) : (
            <p className="mx-auto max-w-2xl rounded-xl border border-blue-100 bg-rapido-mist p-6 text-center font-semibold leading-7 text-rapido-slate">
              {loading
                ? "Loading approved reviews..."
                : "No reviews match the selected group filter."}
            </p>
          )}
        </div>
      </section>

      {/* SUBMIT REVIEW SECTION */}
      <section id="submit-review" className="section-padding scroll-mt-24 bg-gradient-to-b from-rapido-mist to-slate-50">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Share Feedback"
            title="Add Your Review"
            description="Submit your review for your project or service group. Your review appears immediately in our All Reviews section."
          />
          <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
        </div>
      </section>

      <HomeCTA />
    </motion.main>
  );
}
