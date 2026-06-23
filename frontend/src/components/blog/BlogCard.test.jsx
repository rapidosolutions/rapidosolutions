import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import BlogCard from "./BlogCard";

describe("BlogCard", () => {
  it("renders a cover image and links to the article", () => {
    render(
      <MemoryRouter>
        <BlogCard post={{
          title: "Better financial reporting",
          slug: "better-financial-reporting",
          category: "Finance",
          readTime: "4 min read",
          summary: "A practical guide.",
          coverImage: { url: "https://example.com/cover.jpg", alt: "Financial report" }
        }} />
      </MemoryRouter>
    );
    expect(screen.getByRole("img", { name: "Financial report" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read more/i })).toHaveAttribute("href", "/blogs/better-financial-reporting");
  });
});
