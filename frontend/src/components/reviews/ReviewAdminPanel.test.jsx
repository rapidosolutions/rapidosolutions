import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReviewAdminPanel from "./ReviewAdminPanel";
import { deleteReview, listAdminReviews, updateReviewFeatured, updateReviewStatus } from "../../utils/blogApi";

vi.mock("../../utils/blogApi", () => ({
  deleteReview: vi.fn(),
  listAdminReviews: vi.fn(),
  updateReviewFeatured: vi.fn(),
  updateReviewStatus: vi.fn()
}));

const reviews = [
  { id: "pending", name: "Pending Client", email: "pending@example.com", company: "Pending Co", role: "Owner", service: "Web Services", rating: 3, review: "A pending review with enough detailed customer feedback.", createdAt: "2026-08-10T09:00:00Z", status: "pending", featured: false },
  { id: "approved", name: "Approved Client", email: "approved@example.com", company: "Approved Co", role: "Manager", service: "Bookkeeping & Finance", rating: 5, review: "An approved review with enough detailed customer feedback.", createdAt: "2026-08-10T10:00:00Z", status: "approved", featured: false },
  { id: "featured", name: "Featured Client", email: "featured@example.com", company: "Featured Co", role: "Director", service: "Web Services", rating: 5, review: "A featured approved review with detailed customer feedback.", createdAt: "2026-08-10T11:00:00Z", status: "approved", featured: true },
  { id: "hidden", name: "Hidden Client", email: "hidden@example.com", company: "", role: "", service: "General Experience", rating: 4, review: "A hidden review with enough detailed customer feedback.", createdAt: "2026-08-10T12:00:00Z", status: "hidden", featured: false }
];

function articleFor(name) {
  return screen.getByRole("heading", { name }).closest("article");
}

describe("Review Admin panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listAdminReviews.mockResolvedValue({ reviews, total: reviews.length });
    updateReviewStatus.mockImplementation(async (id, status) => ({ review: { ...reviews.find((item) => item.id === id), status, featured: status === "approved" ? false : false } }));
    updateReviewFeatured.mockImplementation(async (id, featured) => ({ review: { ...reviews.find((item) => item.id === id), featured } }));
    deleteReview.mockResolvedValue(null);
  });

  it("displays private review details and supports moderation actions", async () => {
    render(<ReviewAdminPanel />);
    await screen.findByText("pending@example.com");
    expect(screen.getByText("Pending Co", { exact: false })).toBeVisible();
    expect(screen.getByText(/3\/5 stars/)).toBeVisible();

    fireEvent.click(within(articleFor("Pending Client")).getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(updateReviewStatus).toHaveBeenCalledWith("pending", "approved"));
    fireEvent.click(within(articleFor("Approved Client")).getByRole("button", { name: "Hide" }));
    await waitFor(() => expect(updateReviewStatus).toHaveBeenCalledWith("approved", "hidden"));
    fireEvent.click(within(articleFor("Hidden Client")).getByRole("button", { name: "Restore" }));
    await waitFor(() => expect(updateReviewStatus).toHaveBeenCalledWith("hidden", "approved"));
    fireEvent.click(within(articleFor("Featured Client")).getByRole("button", { name: "Reject" }));
    await waitFor(() => expect(updateReviewStatus).toHaveBeenCalledWith("featured", "rejected"));
  });

  it("features and unfeatures approved reviews but offers no Feature action for pending reviews", async () => {
    render(<ReviewAdminPanel />);
    await screen.findByText("approved@example.com");
    expect(within(articleFor("Pending Client")).queryByRole("button", { name: "Feature" })).not.toBeInTheDocument();
    fireEvent.click(within(articleFor("Approved Client")).getByRole("button", { name: "Feature" }));
    await waitFor(() => expect(updateReviewFeatured).toHaveBeenCalledWith("approved", true));
    fireEvent.click(within(articleFor("Featured Client")).getByRole("button", { name: "Unfeature" }));
    await waitFor(() => expect(updateReviewFeatured).toHaveBeenCalledWith("featured", false));
  });

  it("requires exact confirmation, Cancel preserves the review, and confirmed deletion removes only its target", async () => {
    render(<ReviewAdminPanel />);
    await screen.findByText("pending@example.com");
    fireEvent.click(within(articleFor("Pending Client")).getByRole("button", { name: "Delete Permanently" }));
    let dialog = screen.getByRole("dialog", { name: /Delete Pending Client's review/ });
    const input = within(dialog).getByLabelText("Type the reviewer name to confirm");
    const deleteButton = within(dialog).getByRole("button", { name: "Delete Permanently" });
    expect(deleteButton).toBeDisabled();
    fireEvent.change(input, { target: { value: "pending client" } });
    expect(deleteButton).toBeDisabled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(deleteReview).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Pending Client" })).toBeVisible();

    fireEvent.click(within(articleFor("Pending Client")).getByRole("button", { name: "Delete Permanently" }));
    dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Type the reviewer name to confirm"), { target: { value: "Pending Client" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete Permanently" }));
    await screen.findByText("Review deleted permanently.");
    expect(deleteReview).toHaveBeenCalledWith("pending", "Pending Client");
    expect(screen.queryByRole("heading", { name: "Pending Client" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Approved Client" })).toBeVisible();
  });
});
