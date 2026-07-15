// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createContactService } from "./contactService.js";

describe("Supabase contact service", () => {
  it("stores a validated request without the honeypot and records email delivery", async () => {
    const created = {
      id: "5da27f5a-b030-4db7-bc8a-25bb6a24b406",
      name: "Samar Khan",
      email: "samar@example.com",
      phone: "",
      company: "Rapido",
      service: "Web Development",
      budget: "$1,000 - $3,000",
      message: "Please contact me about a new website.",
      status: "new",
      notification_email_status: "pending",
      confirmation_email_status: "pending",
      email_error: "",
      created_at: "2026-07-15T10:00:00.000Z",
      updated_at: "2026-07-15T10:00:00.000Z"
    };
    const saved = {
      ...created,
      notification_email_status: "sent",
      confirmation_email_status: "sent"
    };
    const insert = vi.fn(() => ({
      select: () => ({ single: async () => ({ data: created, error: null }) })
    }));
    const update = vi.fn(() => ({
      eq: () => ({
        select: () => ({ single: async () => ({ data: saved, error: null }) })
      })
    }));
    const supabase = { from: vi.fn(() => ({ insert, update })) };
    const emailService = {
      sendContactEmails: vi.fn(async () => ({
        notificationEmailStatus: "sent",
        confirmationEmailStatus: "sent",
        emailError: ""
      }))
    };
    const service = createContactService({ supabase, emailService });

    const result = await service.create({
      name: created.name,
      email: created.email,
      phone: created.phone,
      company: created.company,
      service: created.service,
      budget: created.budget,
      message: created.message,
      website: ""
    }, "test-agent");

    expect(insert).toHaveBeenCalledWith(expect.not.objectContaining({ website: expect.anything() }));
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_agent: "test-agent" }));
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ notification_email_status: "sent" }));
    expect(result).toMatchObject({ id: created.id, notificationEmailStatus: "sent" });
  });
});
