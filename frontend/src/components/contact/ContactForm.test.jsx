import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactForm from "./ContactForm";
import { submitContact } from "../../utils/blogApi";

vi.mock("../../utils/blogApi", () => ({ submitContact: vi.fn() }));

describe("ContactForm", () => {
  beforeEach(() => submitContact.mockReset());

  it("shows validation messages for required visitor details", () => {
    render(<ContactForm />);
    fireEvent.submit(screen.getByRole("button", { name: /submit project request/i }).closest("form"));
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email.")).toBeInTheDocument();
    expect(screen.getByText("Tell us what you need help with.")).toBeInTheDocument();
  });

  it("submits valid project requests to the API", async () => {
    submitContact.mockResolvedValue({ reference: "message-1", message: "Thank you. Your request has been saved and sent to our team." });
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Samar Khan" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "samar@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I need a business website." } });
    fireEvent.click(screen.getByRole("button", { name: /submit project request/i }));
    await waitFor(() => expect(submitContact).toHaveBeenCalledOnce());
    expect(await screen.findByText(/saved and sent to our team/i)).toBeInTheDocument();
  });
});
