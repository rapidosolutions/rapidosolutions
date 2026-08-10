import { assertDatabaseResult } from "../utils/database.js";
import { AppError } from "../utils/http.js";

const duplicateWindowMs = 24 * 60 * 60 * 1000;
const spamPhrases = /\b(?:buy now|free money|guaranteed income|casino|cryptocurrency investment|crypto giveaway|payday loan|click here|limited time offer)\b/i;
const disposableEmailDomains = new Set(["mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com"]);

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function isTrustworthyReview(input, { duplicate = false, duplicateCheckFailed = false } = {}) {
  const text = normalizeText(input.review);
  const words = text.split(/\s+/).filter(Boolean);
  const links = text.match(/(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io)\b)/gi) || [];
  const emailDomain = normalizeText(input.email).split("@")[1] || "";

  return !duplicate
    && !duplicateCheckFailed
    && text.length >= 40
    && words.length >= 7
    && (text.match(/[a-z]/gi) || []).length >= 20
    && links.length <= 1
    && !spamPhrases.test(text)
    && !/(.)\1{7,}/i.test(text)
    && !/\b(\w+)(?:\s+\1){4,}\b/i.test(text)
    && !disposableEmailDomains.has(emailDomain);
}

function serializePublic(value) {
  return {
    id: value.id,
    name: value.name,
    company: value.company,
    role: value.role,
    service: value.service,
    rating: value.rating,
    review: value.review,
    approvedAt: value.approved_at
  };
}

function serializeAdmin(value) {
  return {
    ...serializePublic(value),
    email: value.email,
    status: value.status,
    featured: Boolean(value.featured),
    notificationEmailStatus: value.notification_email_status,
    emailError: value.email_error,
    createdAt: value.created_at,
    updatedAt: value.updated_at
  };
}

export function createReviewService({ supabase, emailService }) {
  return {
    async listPublic({ limit = 6, featuredOnly = false } = {}) {
      const maximum = featuredOnly ? 4 : 24;
      const safeLimit = Math.min(maximum, Math.max(1, Number(limit) || 6));
      let query = supabase
        .from("reviews")
        .select("id,name,company,role,service,rating,review,approved_at")
        .eq("status", "approved");

      if (featuredOnly) {
        query = query
          .eq("featured", true)
          .gte("rating", 4)
          .order("rating", { ascending: false });
      }

      const { data, error } = await query
        .order("approved_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(safeLimit);
      assertDatabaseResult(error, "Reviews could not be loaded.");
      return (data || []).map(serializePublic);
    },

    async create(input, userAgent = "") {
      const { website, ...review } = input;
      const recentSince = new Date(Date.now() - duplicateWindowMs).toISOString();
      const recentResult = await supabase
        .from("reviews")
        .select("email,review")
        .gte("created_at", recentSince)
        .limit(100);
      const normalizedEmail = normalizeText(review.email);
      const normalizedReview = normalizeText(review.review);
      const duplicate = (recentResult.data || []).some((item) => (
        normalizeText(item.email) === normalizedEmail || normalizeText(item.review) === normalizedReview
      ));
      const approved = isTrustworthyReview(review, { duplicate, duplicateCheckFailed: Boolean(recentResult.error) });
      const status = approved ? "approved" : "pending";
      const approvedAt = approved ? new Date().toISOString() : null;

      const { data: created, error: createError } = await supabase
        .from("reviews")
        .insert({ ...review, status, featured: false, approved_at: approvedAt, user_agent: userAgent })
        .select("*")
        .single();
      assertDatabaseResult(createError, "Your review could not be saved.");

      const delivery = await emailService.sendReviewNotification(input).catch((error) => ({
        notificationEmailStatus: "failed",
        emailError: error.message.slice(0, 500)
      }));
      const { data: saved, error: updateError } = await supabase
        .from("reviews")
        .update({
          notification_email_status: delivery.notificationEmailStatus,
          email_error: delivery.emailError
        })
        .eq("id", created.id)
        .select("*")
        .single();
      assertDatabaseResult(updateError, "Review notification status could not be saved.");
      return serializeAdmin(saved);
    },

    async listAdmin({ status, page = 1, limit = 50 } = {}) {
      const safePage = Math.max(1, Number(page) || 1);
      const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
      const start = (safePage - 1) * safeLimit;
      let query = supabase
        .from("reviews")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(start, start + safeLimit - 1);
      if (status === "featured") query = query.eq("featured", true);
      else if (["pending", "approved", "hidden", "rejected"].includes(status)) query = query.eq("status", status);

      const { data, count, error } = await query;
      assertDatabaseResult(error, "Reviews could not be loaded.");
      const total = Number(count || 0);
      return {
        reviews: (data || []).map(serializeAdmin),
        total,
        page: safePage,
        pages: Math.max(1, Math.ceil(total / safeLimit))
      };
    },

    async updateStatus(id, status) {
      const updates = {
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null
      };
      if (status !== "approved") updates.featured = false;
      const { data, error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      assertDatabaseResult(error, "Review status could not be updated.");
      if (!data) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
      return serializeAdmin(data);
    },

    async updateFeatured(id, featured) {
      const { data: existing, error: findError } = await supabase
        .from("reviews")
        .select("id,status")
        .eq("id", id)
        .maybeSingle();
      assertDatabaseResult(findError, "Review could not be loaded.");
      if (!existing) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
      if (featured && existing.status !== "approved") {
        throw new AppError(400, "Only approved reviews can be featured.", "REVIEW_NOT_APPROVED");
      }

      const { data, error } = await supabase
        .from("reviews")
        .update({ featured })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      assertDatabaseResult(error, "Featured status could not be updated.");
      if (!data) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
      return serializeAdmin(data);
    },

    async remove(id, confirmationName) {
      const { data: existing, error: findError } = await supabase
        .from("reviews")
        .select("id,name")
        .eq("id", id)
        .maybeSingle();
      assertDatabaseResult(findError, "Review could not be loaded.");
      if (!existing) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
      if (confirmationName !== existing.name) {
        throw new AppError(400, "Reviewer name confirmation does not match.", "REVIEW_DELETE_CONFIRMATION_MISMATCH");
      }

      const { data, error } = await supabase.from("reviews").delete().eq("id", existing.id).select("id").maybeSingle();
      assertDatabaseResult(error, "Review could not be deleted.");
      if (!data) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
    }
  };
}
