import Icon from "../ui/Icon";

export default function ReviewCard({ review, isNew = false }) {
  const details = [review.role, review.company].filter(Boolean).join(" at ");

  return (
    <article
      className={`relative flex h-full flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium ${
        isNew
          ? "border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-50/20"
          : "border-slate-200/90 hover:border-blue-200"
      }`}
    >
      {isNew ? (
        <div className="absolute -top-3 right-4 rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
          <Icon name="FiCheckCircle" className="h-3 w-3" />
          <span>Just Submitted</span>
        </div>
      ) : null}

      <div>
        <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, index) => (
            <Icon
              key={index}
              name="FiStar"
              className={`h-4 w-4 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
            />
          ))}
        </div>
        <blockquote className="mt-4 text-base leading-7 text-rapido-slate">
          <p>"{review.review}"</p>
        </blockquote>
      </div>

      <footer className="mt-6 border-t border-slate-100 pt-4">
        <p className="font-extrabold text-rapido-navy">{review.name}</p>
        {details ? <p className="mt-0.5 text-xs font-semibold text-rapido-slate">{details}</p> : null}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs font-bold text-rapido-blue">
          <span className="rounded-md bg-blue-50 px-2 py-0.5 uppercase tracking-wider text-[10px] text-rapido-blue border border-blue-100">
            {review.service}
          </span>
          {review.projectName ? (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {review.projectName}
            </span>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
