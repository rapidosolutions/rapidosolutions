import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlogAdmin from "./BlogAdmin";
import { getAdminSession } from "../utils/blogApi";

vi.mock("../utils/blogApi", () => ({
  changeAdminPassword: vi.fn(), createBlog: vi.fn(), deleteBlog: vi.fn(), deleteMessage: vi.fn(), deleteReview: vi.fn(),
  getAdminSession: vi.fn(), listAdminReviews: vi.fn(), listBlogs: vi.fn(), listMessages: vi.fn(), loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(), updateBlog: vi.fn(), updateMessageStatus: vi.fn(), updateReviewStatus: vi.fn(), uploadBlogCover: vi.fn()
}));

describe("Blog Admin login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminSession.mockRejectedValue(new Error("Not authenticated"));
  });

  it("starts with blank credentials while preserving browser autocomplete", async () => {
    render(<MemoryRouter><BlogAdmin /></MemoryRouter>);

    const email = await screen.findByLabelText("Administrator Email");
    const password = screen.getByLabelText("Password");
    expect(email).toHaveValue("");
    expect(email).toHaveAttribute("autocomplete", "username");
    expect(password).toHaveValue("");
    expect(password).toHaveAttribute("autocomplete", "current-password");
  });
});
