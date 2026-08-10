import { useEffect, useState } from "react";
import Button from "../common/Button";
import SectionHeader from "../common/SectionHeader";
import ReviewCard from "../reviews/ReviewCard";
import { listPublicReviews } from "../../utils/blogApi";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    let active = true;
    listPublicReviews({ limit: 4, featured: true })
      .then((data) => active && setReviews(data.reviews || []))
      .catch(() => active && setReviews([]));
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
          <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        ) : null}
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
