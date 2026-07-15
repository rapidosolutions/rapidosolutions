import { AppError } from "../utils/http.js";
import { assertDatabaseResult } from "../utils/database.js";

function serialize(value) {
  return {
    id: String(value.id),
    name: value.name,
    email: value.email,
    phone: value.phone,
    company: value.company,
    service: value.service,
    budget: value.budget,
    message: value.message,
    status: value.status,
    notificationEmailStatus: value.notification_email_status,
    confirmationEmailStatus: value.confirmation_email_status,
    emailError: value.email_error,
    createdAt: value.created_at,
    updatedAt: value.updated_at
  };
}

export function createContactService({ supabase, emailService }) {
  return {
    async create(input, userAgent = "") {
      const { website, ...contact } = input;
      const { data: created, error: createError } = await supabase
        .from("contact_messages")
        .insert({ ...contact, user_agent: userAgent })
        .select("*")
        .single();
      assertDatabaseResult(createError, "Your request could not be saved.");

      const delivery = await emailService.sendContactEmails(input).catch((error) => ({
        notificationEmailStatus: "failed",
        confirmationEmailStatus: "failed",
        emailError: error.message.slice(0, 500)
      }));
      const { data: message, error: updateError } = await supabase
        .from("contact_messages")
        .update({
          notification_email_status: delivery.notificationEmailStatus,
          confirmation_email_status: delivery.confirmationEmailStatus,
          email_error: delivery.emailError
        })
        .eq("id", created.id)
        .select("*")
        .single();
      assertDatabaseResult(updateError, "Email delivery status could not be saved.");
      return serialize(message);
    },

    async list({ status, page = 1, limit = 25 } = {}) {
      const safePage = Math.max(1, Number(page) || 1);
      const safeLimit = Math.min(100, Math.max(1, Number(limit) || 25));
      const start = (safePage - 1) * safeLimit;
      let query = supabase
        .from("contact_messages")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(start, start + safeLimit - 1);
      if (status) query = query.eq("status", status);

      const { data, count, error } = await query;
      assertDatabaseResult(error, "Contact messages could not be loaded.");
      const total = Number(count || 0);
      return {
        messages: (data || []).map(serialize),
        total,
        page: safePage,
        pages: Math.max(1, Math.ceil(total / safeLimit))
      };
    },

    async updateStatus(id, status) {
      const { data, error } = await supabase
        .from("contact_messages")
        .update({ status })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      assertDatabaseResult(error, "Contact message status could not be updated.");
      if (!data) throw new AppError(404, "Message not found.", "MESSAGE_NOT_FOUND");
      return serialize(data);
    },

    async remove(id) {
      const { data, error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();
      assertDatabaseResult(error, "Contact message could not be deleted.");
      if (!data) throw new AppError(404, "Message not found.", "MESSAGE_NOT_FOUND");
    }
  };
}
