import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Reviews from "./Reviews";
import { listPublicReviews } from "../utils/blogApi";

vi.mock("../utils/blogApi", () => ({
  listPublicReviews: vi.fn(),
  submitReview: vi.fn()
}));

describe("public Reviews page", () => {
  it("requests all approved reviews without featured or rating restrictions", async () => {
    listPublicReviews.mockResolvedValue({ reviews: [{
      id: "low-rating-approved",
      name: "Approved Three Star Client",
      company: "Example Co",
      role: "Owner",
      service: "General Experience",
      rating: 3,
      review: "This legitimate approved review remains visible on the full Reviews page."
    }] });
    render(<MemoryRouter><Reviews /></MemoryRouter>);
    expect(await screen.findByText("Approved Three Star Client")).toBeInTheDocument();
    expect(listPublicReviews).toHaveBeenCalledWith({ limit: 24 });
  });
});
