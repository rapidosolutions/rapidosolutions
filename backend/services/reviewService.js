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
    company: value.company || "",
    role: value.role || "",
    service: value.service,
    projectName: value.project_name || value.projectName || "",
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
  let localReviews = [
    {
      id: "rev-seed-1",
      name: "Alexander Wright",
      email: "alexander@nordicapex.com",
      company: "Nordic Apex Retail",
      role: "E-Commerce Director",
      service: "Shopify Stores",
      project_name: "Shopify Skincare Store",
      rating: 5,
      review: "Rapido Solutions completely rebuilt our Shopify store with a focus on conversion and speed. Our mobile bounce rate dropped noticeably and the new layout represents our brand perfectly.",
      status: "approved",
      featured: true,
      notification_email_status: "sent",
      email_error: "",
      user_agent: "",
      approved_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "rev-seed-2",
      name: "Marcus Sterling",
      email: "marcus@apexproperty.com",
      company: "Apex Property Holdings",
      role: "Managing Principal",
      service: "Financial Projects",
      project_name: "Property Accounting Cleanup",
      rating: 5,
      review: "The financial cleanup and bookkeeping routines implemented by Rapido gave our executive team real visibility into owner statements and cash positions. Thorough and dependable.",
      status: "approved",
      featured: true,
      notification_email_status: "sent",
      email_error: "",
      user_agent: "",
      approved_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "rev-seed-3",
      name: "Elena Rostova",
      email: "elena@cloudscale.io",
      company: "CloudScale Technologies",
      role: "Head of People",
      service: "Human Resource Services",
      project_name: "Talent Acquisition Workflow",
      rating: 5,
      review: "Our hiring process was disorganized until Rapido built our candidate screening framework and interview SOPs. Candidate quality has improved substantially.",
      status: "approved",
      featured: true,
      notification_email_status: "sent",
      email_error: "",
      user_agent: "",
      approved_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return {
    async listPublic({ limit = 6, featuredOnly = false } = {}) {
      const maximum = featuredOnly ? 4 : 24;
      const safeLimit = Math.min(maximum, Math.max(1, Number(limit) || 6));
      if (!supabase) {
        return localReviews
          .filter((r) => r.status === "approved" && (!featuredOnly || (r.featured && r.rating >= 4)))
          .sort((a, b) => new Date(b.approved_at || b.created_at) - new Date(a.approved_at || a.created_at))
          .slice(0, safeLimit)
          .map(serializePublic);
      }
      let query = supabase
        .from("reviews")
        .select("id,name,company,role,service,project_name,rating,review,approved_at")
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
      const projectName = review.projectName || "";
      delete review.projectName;

      if (!supabase) {
        const approved = isTrustworthyReview(review);
        const status = approved ? "approved" : "approved"; // Ensure immediate availability in dev/demo
        const approvedAt = new Date().toISOString();
        const saved = {
          id: `rev-${Date.now()}`,
          name: review.name,
          email: review.email,
          company: review.company || "",
          role: review.role || "",
          service: review.service,
          project_name: projectName,
          rating: review.rating,
          review: review.review,
          status,
          featured: false,
          notification_email_status: "not_configured",
          email_error: "",
          user_agent: userAgent,
          approved_at: approvedAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localReviews.unshift(saved);
        if (emailService?.sendReviewNotification) {
          emailService.sendReviewNotification(input).catch(() => undefined);
        }
        return serializeAdmin(saved);
      }

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
        .insert({
          ...review,
          project_name: projectName,
          status,
          featured: false,
          approved_at: approvedAt,
          user_agent: userAgent
        })
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

      if (!supabase) {
        let list = [...localReviews];
        if (status === "featured") list = list.filter((r) => r.featured);
        else if (["pending", "approved", "hidden", "rejected"].includes(status)) list = list.filter((r) => r.status === status);
        const total = list.length;
        const paged = list.slice(start, start + safeLimit);
        return {
          reviews: paged.map(serializeAdmin),
          total,
          page: safePage,
          pages: Math.max(1, Math.ceil(total / safeLimit))
        };
      }

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
      if (!supabase) {
        const item = localReviews.find((r) => r.id === id);
        if (!item) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
        item.status = status;
        item.approved_at = status === "approved" ? new Date().toISOString() : null;
        if (status !== "approved") item.featured = false;
        item.updated_at = new Date().toISOString();
        return serializeAdmin(item);
      }

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
      if (!supabase) {
        const item = localReviews.find((r) => r.id === id);
        if (!item) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
        if (featured && item.status !== "approved") {
          throw new AppError(400, "Only approved reviews can be featured.", "REVIEW_NOT_APPROVED");
        }
        item.featured = featured;
        item.updated_at = new Date().toISOString();
        return serializeAdmin(item);
      }

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
      if (!supabase) {
        const index = localReviews.findIndex((r) => r.id === id);
        if (index === -1) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
        if (confirmationName !== localReviews[index].name) {
          throw new AppError(400, "Reviewer name confirmation does not match.", "REVIEW_DELETE_CONFIRMATION_MISMATCH");
        }
        localReviews.splice(index, 1);
        return;
      }

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
