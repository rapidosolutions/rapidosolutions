import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHero from "../components/common/PageHero";
import SectionHeader from "../components/common/SectionHeader";
import Button from "../components/common/Button";
import BlogCard from "../components/blog/BlogCard";
import HomeCTA from "../components/home/HomeCTA";
import { blogPosts } from "../data/blogsData";
import { listBlogs } from "../utils/blogApi";
import { pageTransition } from "../utils/animations";
import { usePageMeta } from "../utils/usePageMeta";

export default function Blogs() {
  const [posts, setPosts] = useState(blogPosts);
  const [status, setStatus] = useState("loading");

  usePageMeta(
    "Blogs",
    "Read practical Rapido Solutions Co. notes about websites, eCommerce, SEO, operations, bookkeeping, and financial support."
  );

  useEffect(() => {
    let active = true;
    listBlogs()
      .then((data) => {
        if (!active) return;
        setPosts(data.blogs.length ? data.blogs : blogPosts);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setPosts(blogPosts);
        setStatus("offline");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <motion.main {...pageTransition}>
      <PageHero
        eyebrow="Blogs"
        title="Practical Notes for Better Websites and Operations"
        description="Clear ideas for improving business websites, digital performance, financial organization, and long-term growth systems."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/contact">Ask About a Topic</Button>
        </div>
      </PageHero>

      <section className="section-padding bg-white">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Latest Posts"
            title="Insights for Business Growth"
            description="Browse web, eCommerce, operations, and finance articles written for business owners who want clearer systems."
          />
          {status === "offline" ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              Showing seed posts while Sanity is unavailable or has no published posts yet.
            </div>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard key={post.id || post.slug || post.title} post={post} index={index} />
            ))}
          </div>
        </div>
      </section>

      <HomeCTA />
    </motion.main>
  );
}
