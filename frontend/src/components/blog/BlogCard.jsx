import ScrollReveal from "../common/ScrollReveal";
import Button from "../common/Button";

export default function BlogCard({ post, index = 0 }) {
  return (
    <ScrollReveal
      delay={index * 0.05}
      className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-premium"
    >
      <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase tracking-[0.12em] text-rapido-slate">
        <span>{post.category}</span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span>{post.readTime}</span>
      </div>
      <h3 className="mt-4 text-xl font-extrabold text-rapido-navy">{post.title}</h3>
      <p className="mt-3 leading-7 text-rapido-slate">{post.summary}</p>
      <div className="mt-auto pt-5">
        <Button to={post.path || `/blogs/${post.slug}`} variant="ghost" className="px-0" icon="FiArrowRight">
          Read More
        </Button>
      </div>
    </ScrollReveal>
  );
}
