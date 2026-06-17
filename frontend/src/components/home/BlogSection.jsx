import { useEffect, useState } from "react";
import { blogPosts } from "../../data/blogsData";
import SectionHeader from "../common/SectionHeader";
import Button from "../common/Button";
import BlogCard from "../blog/BlogCard";
import { listBlogs } from "../../utils/blogApi";

export default function BlogSection() {
  const [posts, setPosts] = useState(blogPosts);

  useEffect(() => {
    let active = true;
    listBlogs()
      .then((data) => {
        if (!active) return;
        setPosts(data.blogs.length ? data.blogs.slice(0, 3) : blogPosts);
      })
      .catch(() => {
        if (!active) return;
        setPosts(blogPosts);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section-padding bg-rapido-mist">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Blog"
          title="Practical Notes for Better Websites and Operations"
          description="Fresh ideas for improving websites, eCommerce journeys, operations, and financial clarity."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post, index) => (
            <BlogCard key={post.id || post.slug || post.title} post={post} index={index} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button to="/blogs" variant="secondary">
            View All Blogs
          </Button>
        </div>
      </div>
    </section>
  );
}
