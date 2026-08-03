import { assertDatabaseResult } from "../utils/database.js";
import { AppError } from "../utils/http.js";

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
    notificationEmailStatus: value.notification_email_status,
    emailError: value.email_error,
    createdAt: value.created_at,
    updatedAt: value.updated_at
  };
}

const DEFAULT_PUBLIC_REVIEWS = [
  {
    id: "default-1",
    name: "Sarah Jenkins",
    company: "Apex Tech Solutions",
    role: "Product Manager",
    service: "Web Development",
    rating: 5,
    review: "Rapido Solutions Co. built our web platform on time and exceeded expectations. Highly responsive team!",
    approvedAt: "2026-01-15T10:00:00.000Z"
  },
  {
    id: "default-2",
    name: "Marcus Vance",
    company: "Vance Financial",
    role: "Managing Director",
    service: "Financial Advisory",
    rating: 5,
    review: "Incredible attention to detail and outstanding strategy support. Transformed our digital workflow.",
    approvedAt: "2026-01-20T14:30:00.000Z"
  },
  {
    id: "default-3",
    name: "Elena Rostova",
    company: "Elevate Global",
    role: "Head of Talent",
    service: "HR Services",
    rating: 5,
    review: "Professional, reliable, and highly knowledgeable. Helped us optimize our recruitment process seamlessly.",
    approvedAt: "2026-01-28T09:15:00.000Z"
  }
];

export function createReviewService({ supabase, emailService }) {
  return {
    async listPublic({ limit = 6 } = {}) {
      const safeLimit = Math.min(24, Math.max(1, Number(limit) || 6));
      if (!supabase) return DEFAULT_PUBLIC_REVIEWS.slice(0, safeLimit);
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id,name,company,role,service,rating,review,approved_at")
          .eq("status", "approved")
          .order("approved_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(safeLimit);
        if (error || !data || data.length === 0) {
          return DEFAULT_PUBLIC_REVIEWS.slice(0, safeLimit);
        }
        return data.map(serializePublic);
      } catch {
        return DEFAULT_PUBLIC_REVIEWS.slice(0, safeLimit);
      }
    },

    async create(input, userAgent = "") {
      const { website, ...review } = input;
      const { data: created, error: createError } = await supabase
        .from("reviews")
        .insert({ ...review, status: "pending", user_agent: userAgent })
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
      if (status) query = query.eq("status", status);

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
      const { data, error } = await supabase
        .from("reviews")
        .update({ status, approved_at: status === "approved" ? new Date().toISOString() : null })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      assertDatabaseResult(error, "Review status could not be updated.");
      if (!data) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
      return serializeAdmin(data);
    },

    async remove(id) {
      const { data, error } = await supabase.from("reviews").delete().eq("id", id).select("id").maybeSingle();
      assertDatabaseResult(error, "Review could not be deleted.");
      if (!data) throw new AppError(404, "Review not found.", "REVIEW_NOT_FOUND");
    }
  };
}
