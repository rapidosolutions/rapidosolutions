import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReviewsSection from "./ReviewsSection";
import { listPublicReviews } from "../../utils/blogApi";

vi.mock("../../utils/blogApi", () => ({ listPublicReviews: vi.fn() }));

const eligible = Array.from({ length: 4 }, (_, index) => ({
  id: `review-${index}`,
  name: `Featured Client ${index + 1}`,
  company: "Example Co",
  role: "Owner",
  service: "Web Services",
  rating: 5 - (index % 2),
  review: "Detailed approved and featured customer feedback."
}));

describe("Home reviews section", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requests and displays at most four featured approved reviews rated four or higher", async () => {
    listPublicReviews.mockResolvedValue({ reviews: eligible });
    render(<MemoryRouter><ReviewsSection /></MemoryRouter>);
    expect(await screen.findAllByText(/Featured Client/)).toHaveLength(4);
    expect(listPublicReviews).toHaveBeenCalledWith({ limit: 4, featured: true });
  });

  it("shows no fake card or old empty-state message when no review is eligible", async () => {
    listPublicReviews.mockResolvedValue({ reviews: [] });
    render(<MemoryRouter><ReviewsSection /></MemoryRouter>);
    await waitFor(() => expect(listPublicReviews).toHaveBeenCalled());
    expect(screen.queryByText("Approved client feedback will appear here after verification.")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See More Reviews" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Add Your Review" })).toBeVisible();
  });
});
