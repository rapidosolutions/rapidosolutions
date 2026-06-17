import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import Button from "../components/common/Button";
import HomeCTA from "../components/home/HomeCTA";
import { blogPosts } from "../data/blogsData";
import { getBlog } from "../utils/blogApi";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function BlogDetail() {
  const { slug } = useParams();
  const fallbackPost = useMemo(() => blogPosts.find((post) => post.slug === slug), [slug]);
  const [post, setPost] = useState(fallbackPost);
  const [status, setStatus] = useState("loading");

  usePageMeta(
    post?.title || "Blog",
    post?.summary || "Read practical Rapido Solutions Co. notes about websites, operations, and finance."
  );

  useEffect(() => {
    let active = true;
    getBlog(slug)
      .then((data) => {
        if (!active) return;
        setPost(data.blog);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setPost(fallbackPost);
        setStatus(fallbackPost ? "offline" : "missing");
      });

    return () => {
      active = false;
    };
  }, [fallbackPost, slug]);

  if (!post) {
    return (
      <motion.main {...pageTransition}>
        <PageHero
          eyebrow="Blog"
          title="Blog Post Not Found"
          description="The article may have moved, been unpublished, or not been created yet."
        >
          <Button to="/blogs">Back to Blogs</Button>
        </PageHero>
      </motion.main>
    );
  }

  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);

  return (
    <motion.main {...pageTransition}>
      <PageHero eyebrow={post.category} title={post.title} description={post.summary}>
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-blue-100">
          <span>{post.author}</span>
          <span className="h-1 w-1 rounded-full bg-blue-200" />
          <span>{post.readTime}</span>
        </div>
      </PageHero>

      <article className="section-padding bg-white">
        <div className="container-shell max-w-3xl">
          {status === "offline" ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              Showing seed content while the blog API is unavailable.
            </div>
          ) : null}
          <div className="space-y-6 text-lg leading-9 text-rapido-slate">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-10">
            <Button to="/blogs" variant="secondary" icon="FiArrowLeft" iconPosition="left">
              Back to Blogs
            </Button>
          </div>
        </div>
      </article>

      <HomeCTA />
    </motion.main>
  );
}
