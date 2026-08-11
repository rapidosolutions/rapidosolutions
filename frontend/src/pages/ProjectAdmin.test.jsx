import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import ProjectAdmin from "./ProjectAdmin";
import { getAdminSession, loginAdmin } from "../utils/blogApi";
import { deleteProjectPermanently, listAdminProjects } from "../utils/projectApi";

vi.mock("../utils/blogApi", () => ({
  deleteReview: vi.fn(),
  getAdminSession: vi.fn(),
  listAdminReviews: vi.fn(async () => ({ reviews: [] })),
  loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
  updateReviewFeatured: vi.fn(),
  updateReviewStatus: vi.fn()
}));

vi.mock("../utils/projectApi", () => ({
  archiveProject: vi.fn(),
  createProject: vi.fn(),
  deleteProjectPermanently: vi.fn(),
  listAdminProjects: vi.fn(),
  updateProject: vi.fn(),
  updateProjectStatus: vi.fn(),
  uploadProjectImage: vi.fn()
}));

const managedProjects = [
  {
    id: "project-1", title: "Shopify Skincare Store", slug: "shopify-skincare-store", type: "web",
    category: "Shopify Stores", description: "A managed storefront project.", services: ["Shopify"],
    metric: "Cleaner purchase journey", coverImage: null, coverAlt: "", accent: "from-blue-100 to-blue-300",
    projectUrl: "", featured: false, displayOrder: 1, status: "published", seoTitle: "", seoDescription: "",
    createdAt: "2026-08-01T00:00:00.000Z", updatedAt: "2026-08-09T00:00:00.000Z"
  },
  {
    id: "project-2", title: "Unrelated Project", slug: "unrelated-project", type: "web",
    category: "Business Websites", description: "This project must remain untouched.", services: ["Web Development"],
    metric: "More leads", coverImage: null, coverAlt: "", accent: "from-slate-100 to-blue-300",
    projectUrl: "", featured: false, displayOrder: 2, status: "draft", seoTitle: "", seoDescription: "",
    createdAt: "2026-08-02T00:00:00.000Z", updatedAt: "2026-08-08T00:00:00.000Z"
  }
];

function renderAdmin() {
  return render(<MemoryRouter><ProjectAdmin /></MemoryRouter>);
}

describe("Project Admin permanent deletion", () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getAdminSession.mockResolvedValue({ admin: { email: "admin@example.com", canManageProjects: true } });
    listAdminProjects.mockResolvedValue({ projects: managedProjects });
    deleteProjectPermanently.mockResolvedValue(null);
  });

  it("shows deletion only in Edit, requires exact confirmation, and Cancel preserves the project", async () => {
    renderAdmin();
    await screen.findByText("Shopify Skincare Store");
    expect(screen.queryByRole("button", { name: "Delete Project" })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    const deleteTrigger = screen.getByRole("button", { name: "Delete Project" });
    expect(screen.getByRole("heading", { name: "Danger Zone" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("heading", { name: "Edit Project" })).toHaveFocus());
    deleteTrigger.focus();
    fireEvent.click(deleteTrigger);

    const dialog = screen.getByRole("dialog", { name: /Delete “Shopify Skincare Store”/ });
    const confirmInput = within(dialog).getByLabelText("Type the project title to confirm");
    const permanentButton = within(dialog).getByRole("button", { name: "Delete Permanently" });
    expect(confirmInput).toHaveFocus();
    expect(permanentButton).toBeDisabled();
    fireEvent.change(confirmInput, { target: { value: "shopify skincare store" } });
    expect(permanentButton).toBeDisabled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(deleteProjectPermanently).not.toHaveBeenCalled();
    expect(screen.getByText("Shopify Skincare Store")).toBeVisible();
    expect(deleteTrigger).toHaveFocus();
  });

  it("deletes the selected project after exact confirmation and keeps unrelated projects", async () => {
    renderAdmin();
    await screen.findByText("Shopify Skincare Store");
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Delete Project" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Type the project title to confirm"), { target: { value: "Shopify Skincare Store" } });
    const permanentButton = within(dialog).getByRole("button", { name: "Delete Permanently" });
    expect(permanentButton).toBeEnabled();
    fireEvent.click(permanentButton);

    await screen.findByText("Project deleted successfully.");
    expect(deleteProjectPermanently).toHaveBeenCalledWith("project-1", "Shopify Skincare Store");
    expect(screen.queryByText("Shopify Skincare Store")).not.toBeInTheDocument();
    expect(screen.getByText("Unrelated Project")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Projects (1)" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Danger Zone" })).not.toBeInTheDocument();
  });

  it("keeps Projects and Reviews inside the same authenticated admin dashboard", async () => {
    renderAdmin();
    await screen.findByRole("heading", { name: "Projects (2)" });
    expect(screen.getByRole("navigation", { name: "Admin sections" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reviews" }));
    expect(await screen.findByRole("heading", { name: "Customer Reviews (0)" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    expect(screen.getByRole("heading", { name: "Projects (2)" })).toBeInTheDocument();
  });
});

describe("Project Admin login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminSession.mockRejectedValue(new Error("Not authenticated"));
    loginAdmin.mockResolvedValue({ admin: { email: "admin@example.com", canManageProjects: true } });
    listAdminProjects.mockResolvedValue({ projects: [] });
  });

  it("does not prefill credentials and preserves password-manager and visibility behavior", async () => {
    renderAdmin();

    const email = await screen.findByLabelText("Administrator Email");
    const password = screen.getByLabelText("Password");
    expect(email).toHaveValue("");
    expect(email).toHaveAttribute("autocomplete", "username");
    expect(password).toHaveValue("");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(password).toHaveAttribute("type", "password");

    fireEvent.change(email, { target: { value: "admin@example.com" } });
    fireEvent.change(password, { target: { value: "valid-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Show" }));
    expect(password).toHaveAttribute("type", "text");
    fireEvent.submit(screen.getByRole("button", { name: "Sign In" }).closest("form"));

    await waitFor(() => expect(loginAdmin).toHaveBeenCalledWith({ email: "admin@example.com", password: "valid-password" }));
  });
});
