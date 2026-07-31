// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createReviewService } from "./reviewService.js";

describe("Supabase review service", () => {
  it("stores pending reviews and never exposes private email through the public serializer", async () => {
    const created = {
      id: "review-1",
      name: "Verified Client",
      email: "client@example.com",
      company: "Example Co.",
      role: "Owner",
      service: "Web Services",
      rating: 5,
      review: "Rapido delivered the agreed work clearly and professionally.",
      status: "pending",
      consent: true,
      notification_email_status: "pending",
      email_error: "",
      approved_at: null,
      created_at: "2026-07-29T10:00:00.000Z",
      updated_at: "2026-07-29T10:00:00.000Z"
    };
    const saved = { ...created, notification_email_status: "sent" };
    const publicRecord = { ...saved, status: "approved", approved_at: "2026-07-29T11:00:00.000Z" };
    const insert = vi.fn(() => ({ select: () => ({ single: async () => ({ data: created, error: null }) }) }));
    const update = vi.fn(() => ({ eq: () => ({ select: () => ({ single: async () => ({ data: saved, error: null }) }) }) }));
    const publicQuery = {
      eq: vi.fn(() => publicQuery),
      order: vi.fn(() => publicQuery),
      limit: vi.fn(async () => ({ data: [publicRecord], error: null }))
    };
    const supabase = {
      from: vi.fn(() => ({
        insert,
        update,
        select: vi.fn(() => publicQuery)
      }))
    };
    const emailService = {
      sendReviewNotification: vi.fn(async () => ({ notificationEmailStatus: "sent", emailError: "" }))
    };
    const service = createReviewService({ supabase, emailService });

    const result = await service.create({
      name: created.name,
      email: created.email,
      company: created.company,
      role: created.role,
      service: created.service,
      rating: created.rating,
      review: created.review,
      consent: true,
      website: ""
    }, "test-agent");
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ status: "pending", user_agent: "test-agent" }));
    expect(result).toMatchObject({ id: created.id, email: created.email, status: "pending" });

    const publicReviews = await service.listPublic({ limit: 3 });
    expect(publicReviews[0]).not.toHaveProperty("email");
    expect(publicReviews[0]).not.toHaveProperty("status");
  });
});
