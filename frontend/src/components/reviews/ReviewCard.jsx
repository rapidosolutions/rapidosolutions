import Icon from "../ui/Icon";

export default function ReviewCard({ review }) {
  const details = [review.role, review.company].filter(Boolean).join(" at ");

  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-premium">
      <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Icon
            key={index}
            name="FiStar"
            className={`h-4 w-4 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
          />
        ))}
      </div>
      <blockquote className="mt-5 flex-1 text-base leading-7 text-rapido-slate">
        <p>"{review.review}"</p>
      </blockquote>
      <footer className="mt-6 border-t border-slate-100 pt-4">
        <p className="font-extrabold text-rapido-navy">{review.name}</p>
        {details ? <p className="mt-1 text-sm font-semibold text-rapido-slate">{details}</p> : null}
        <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-blue">{review.service}</p>
      </footer>
    </article>
  );
}
