// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createReviewService, isTrustworthyReview } from "./reviewService.js";

const trustworthyInput = {
  name: "Verified Client",
  email: "client@example.com",
  company: "Example Co.",
  role: "Owner",
  service: "Web Services",
  rating: 5,
  review: "Rapido delivered the agreed website work clearly, professionally, and on schedule.",
  consent: true,
  website: ""
};

function adminRecord(overrides = {}) {
  return {
    id: "review-1",
    ...trustworthyInput,
    status: "approved",
    featured: false,
    notification_email_status: "sent",
    email_error: "",
    approved_at: "2026-08-10T10:00:00.000Z",
    created_at: "2026-08-10T09:00:00.000Z",
    updated_at: "2026-08-10T10:00:00.000Z",
    ...overrides
  };
}

function createSubmissionService(recentResult = { data: [], error: null }) {
  let insertedPayload;
  const recentQuery = {
    gte: vi.fn(() => recentQuery),
    limit: vi.fn(async () => recentResult)
  };
  const insert = vi.fn((payload) => {
    insertedPayload = payload;
    return { select: () => ({ single: async () => ({ data: adminRecord({ ...payload }), error: null }) }) };
  });
  const update = vi.fn((payload) => ({
    eq: () => ({
      select: () => ({ single: async () => ({ data: adminRecord({ ...insertedPayload, ...payload }), error: null }) })
    })
  }));
  let call = 0;
  const supabase = {
    from: vi.fn(() => {
      call += 1;
      if (call === 1) return { select: vi.fn(() => recentQuery) };
      if (call === 2) return { insert };
      return { update };
    })
  };
  const emailService = { sendReviewNotification: vi.fn(async () => ({ notificationEmailStatus: "sent", emailError: "" })) };
  return { service: createReviewService({ supabase, emailService }), insert, getInserted: () => insertedPayload };
}

function queryChain(result) {
  const query = {};
  for (const method of ["select", "eq", "gte", "order", "range", "update", "delete"]) query[method] = vi.fn(() => query);
  query.limit = vi.fn(async () => result);
  query.maybeSingle = vi.fn(async () => result);
  query.single = vi.fn(async () => result);
  return query;
}

describe("review trust moderation", () => {
  it("auto-approves trustworthy text without using rating as a moderation signal", () => {
    expect(isTrustworthyReview({ ...trustworthyInput, rating: 1 })).toBe(true);
    expect(isTrustworthyReview({ ...trustworthyInput, rating: 5 })).toBe(true);
  });

  it("keeps spam, excessive links, duplicate, and uncertain checks pending", () => {
    expect(isTrustworthyReview({ ...trustworthyInput, review: "Buy now free money at https://spam.com today please." })).toBe(false);
    expect(isTrustworthyReview({ ...trustworthyInput, review: "Read https://one.com and https://two.com for this detailed customer experience." })).toBe(false);
    expect(isTrustworthyReview(trustworthyInput, { duplicate: true })).toBe(false);
    expect(isTrustworthyReview(trustworthyInput, { duplicateCheckFailed: true })).toBe(false);
  });

  it("stores trustworthy submissions as approved and suspicious or duplicate submissions as pending", async () => {
    const trusted = createSubmissionService();
    await trusted.service.create(trustworthyInput, "test-agent");
    expect(trusted.getInserted()).toMatchObject({ status: "approved", featured: false, user_agent: "test-agent" });
    expect(trusted.getInserted().approved_at).toBeTruthy();

    const suspicious = createSubmissionService();
    await suspicious.service.create({ ...trustworthyInput, review: "Buy now free money at https://spam.com today please." }, "test-agent");
    expect(suspicious.getInserted()).toMatchObject({ status: "pending", approved_at: null, featured: false });

    const duplicate = createSubmissionService({ data: [{ email: trustworthyInput.email, review: "Different review text" }], error: null });
    await duplicate.service.create(trustworthyInput, "test-agent");
    expect(duplicate.getInserted().status).toBe("pending");
  });
});

describe("review publication and administration", () => {
  it("restricts the Home query to four approved featured reviews rated at least four", async () => {
    const result = { data: [adminRecord({ featured: true })], error: null };
    const query = queryChain(result);
    const service = createReviewService({ supabase: { from: () => query }, emailService: {} });
    const reviews = await service.listPublic({ limit: 20, featuredOnly: true });

    expect(query.eq).toHaveBeenCalledWith("status", "approved");
    expect(query.eq).toHaveBeenCalledWith("featured", true);
    expect(query.gte).toHaveBeenCalledWith("rating", 4);
    expect(query.order).toHaveBeenNthCalledWith(1, "rating", { ascending: false });
    expect(query.limit).toHaveBeenCalledWith(4);
    expect(reviews[0]).not.toHaveProperty("email");
    expect(reviews[0]).not.toHaveProperty("featured");
  });

  it("keeps the full Reviews query approved-only without rating or featured restrictions", async () => {
    const query = queryChain({ data: [adminRecord({ rating: 1, featured: false })], error: null });
    const service = createReviewService({ supabase: { from: () => query }, emailService: {} });
    const reviews = await service.listPublic({ limit: 24 });
    expect(query.eq).toHaveBeenCalledTimes(1);
    expect(query.eq).toHaveBeenCalledWith("status", "approved");
    expect(query.gte).not.toHaveBeenCalled();
    expect(reviews[0].rating).toBe(1);
  });

  it("clears featured when an approved review is hidden or rejected", async () => {
    const query = queryChain({ data: adminRecord({ status: "hidden", featured: false, approved_at: null }), error: null });
    const service = createReviewService({ supabase: { from: () => query }, emailService: {} });
    await service.updateStatus("review-1", "hidden");
    expect(query.update).toHaveBeenCalledWith({ status: "hidden", approved_at: null, featured: false });
    expect(query.eq).toHaveBeenCalledWith("id", "review-1");
  });

  it("prevents non-approved reviews from being featured", async () => {
    const find = queryChain({ data: { id: "review-1", status: "pending" }, error: null });
    const service = createReviewService({ supabase: { from: () => find }, emailService: {} });
    await expect(service.updateFeatured("review-1", true)).rejects.toMatchObject({ status: 400, code: "REVIEW_NOT_APPROVED" });
    expect(find.update).not.toHaveBeenCalled();
  });

  it("features an approved review and deletes only the confirmed selected review", async () => {
    const findFeature = queryChain({ data: { id: "review-1", status: "approved" }, error: null });
    const saveFeature = queryChain({ data: adminRecord({ featured: true }), error: null });
    const findDelete = queryChain({ data: { id: "review-1", name: "Verified Client" }, error: null });
    const deleteQuery = queryChain({ data: { id: "review-1" }, error: null });
    const queries = [findFeature, saveFeature, findDelete, deleteQuery];
    const service = createReviewService({ supabase: { from: vi.fn(() => queries.shift()) }, emailService: {} });

    const featured = await service.updateFeatured("review-1", true);
    expect(featured.featured).toBe(true);
    expect(saveFeature.update).toHaveBeenCalledWith({ featured: true });
    await service.remove("review-1", "Verified Client");
    expect(deleteQuery.eq).toHaveBeenCalledWith("id", "review-1");
  });

  it("does not delete before exact reviewer-name confirmation", async () => {
    const find = queryChain({ data: { id: "review-1", name: "Verified Client" }, error: null });
    const service = createReviewService({ supabase: { from: () => find }, emailService: {} });
    await expect(service.remove("review-1", "verified client")).rejects.toMatchObject({ status: 400, code: "REVIEW_DELETE_CONFIRMATION_MISMATCH" });
    expect(find.delete).not.toHaveBeenCalled();
  });

  it("reports a safe database error without claiming deletion", async () => {
    const find = queryChain({ data: { id: "review-1", name: "Verified Client" }, error: null });
    const failedDelete = queryChain({ data: null, error: { code: "DATABASE_UNAVAILABLE", message: "private database detail" } });
    const queries = [find, failedDelete];
    const service = createReviewService({ supabase: { from: () => queries.shift() }, emailService: {} });
    await expect(service.remove("review-1", "Verified Client")).rejects.toMatchObject({
      status: 500,
      code: "DATABASE_ERROR",
      message: "Review could not be deleted."
    });
  });
});
