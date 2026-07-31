import { useEffect, useState } from "react";
import Button from "../common/Button";
import SectionHeader from "../common/SectionHeader";
import ReviewCard from "../reviews/ReviewCard";
import { listPublicReviews } from "../../utils/blogApi";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listPublicReviews({ limit: 3 })
      .then((data) => active && setReviews(data.reviews || []))
      .catch(() => active && setReviews([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <section className="section-padding bg-white">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Client Reviews"
          title="What Clients Say About Working With Rapido"
          description="Feedback from clients who used our web development, SEO, bookkeeping, finance, and HR services."
        />
        {reviews.length ? (
          <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        ) : (
          <p className="mx-auto mb-8 max-w-2xl rounded-lg border border-blue-100 bg-rapido-mist p-5 text-center font-semibold leading-7 text-rapido-slate">
            {loading ? "Loading approved client feedback..." : "Approved client feedback will appear here after verification."}
          </p>
        )}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/reviews" variant="secondary">
            See More Reviews
          </Button>
          <Button to="/reviews#submit-review" icon="FiMessageCircle">
            Add Your Review
          </Button>
        </div>
      </div>
    </section>
  );
}
