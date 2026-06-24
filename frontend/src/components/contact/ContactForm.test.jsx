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
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Message is required.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit project request/i })).toBeDisabled();
  });

  it("keeps the submit button disabled until required fields are valid", () => {
    render(<ContactForm />);
    const submitButton = screen.getByRole("button", { name: /submit project request/i });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Samar Khan" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    fireEvent.blur(screen.getByLabelText("Email"));
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Too short" } });
    fireEvent.blur(screen.getByLabelText("Message"));

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("submits valid project requests to the API", async () => {
    submitContact.mockResolvedValue({ reference: "message-1", message: "Thank you. Your request has been saved and sent to our team." });
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Samar Khan" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "samar@example.com" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I need a business website." } });
    const submitButton = screen.getByRole("button", { name: /submit project request/i });
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);
    await waitFor(() => expect(submitContact).toHaveBeenCalledOnce());
    expect(await screen.findByText(/saved and sent to our team/i)).toBeInTheDocument();
  });
});
