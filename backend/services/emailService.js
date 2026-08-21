import { Resend } from "resend";
import { escapeHtml } from "../utils/http.js";

export function createEmailService(config) {
  const configured = Boolean(config.resendApiKey && config.emailFrom);
  const resend = configured ? new Resend(config.resendApiKey) : null;

  return {
    configured,

    async sendContactEmails(message) {
      if (!configured) {
        return {
          notificationEmailStatus: "not_configured",
          confirmationEmailStatus: "not_configured",
          emailError: "Email delivery is not configured in this environment."
        };
      }

      const safe = Object.fromEntries(
        Object.entries(message).map(([key, value]) => [key, escapeHtml(value)])
      );

      const notification = resend.emails.send({
        from: config.emailFrom,
        to: config.contactRecipientEmail,
        replyTo: message.email,
        subject: `New Rapido enquiry from ${message.name}`,
        html: `<h2>New project request</h2><p><strong>Name:</strong> ${safe.name}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Phone:</strong> ${safe.phone || "Not provided"}</p><p><strong>Company:</strong> ${safe.company || "Not provided"}</p><p><strong>Service:</strong> ${safe.service}</p><p><strong>Budget:</strong> ${safe.budget}</p><p><strong>Message:</strong></p><p>${safe.message.replaceAll("\n", "<br>")}</p>`
      });

      const confirmation = resend.emails.send({
        from: config.emailFrom,
        to: message.email,
        subject: "We received your Rapido Solutions request",
        html: `<p>Hello ${safe.name},</p><p>Thank you for contacting Rapido Solutions Co. We received your request about <strong>${safe.service}</strong>.</p><p>Our team will review the details and respond using the contact information you provided.</p><p>Rapido Solutions Co.</p>`
      });

      const [notificationResult, confirmationResult] = await Promise.allSettled([notification, confirmation]);
      const delivered = (result) => result.status === "fulfilled" && !result.value?.error;
      const errors = [notificationResult, confirmationResult]
        .filter((result) => !delivered(result))
        .map((result) => result.status === "rejected"
          ? result.reason?.message || "Email delivery failed."
          : result.value?.error?.message || "Email delivery failed.");

      return {
        notificationEmailStatus: delivered(notificationResult) ? "sent" : "failed",
        confirmationEmailStatus: delivered(confirmationResult) ? "sent" : "failed",
        emailError: errors.join(" ").slice(0, 500)
      };
    },

    async sendCustom({ to, subject, html, replyTo }) {
      if (!configured) {
        throw new Error("Email delivery is not configured in this environment.");
      }
      const result = await resend.emails.send({
        from: config.emailFrom,
        to,
        subject,
        html,
        ...(replyTo ? { replyTo } : {})
      });
      if (result?.error) throw new Error(result.error.message || "Email delivery failed.");
      return result;
    },

    async sendCvAdminInvite({ email, fullName, temporaryPassword }) {
      if (!configured) {
        return { status: "not_configured" };
      }
      const safeName = escapeHtml(fullName || email);
      const result = await resend.emails.send({
        from: config.emailFrom,
        to: email,
        subject: "Your Rapido CV Admin invitation",
        html: `<p>Hello ${safeName},</p><p>You have been invited to the Rapido CV Admin panel.</p><p>Sign in with this email and temporary password:</p><p><strong>${escapeHtml(temporaryPassword)}</strong></p><p>Change your password and enable 2FA after first login.</p><p>Rapido Solutions Co.</p>`
      });
      return result?.error
        ? { status: "failed", error: result.error.message }
        : { status: "sent" };
    },

    async sendReviewNotification(review) {
      if (!configured) {
        return {
          notificationEmailStatus: "not_configured",
          emailError: "Email delivery is not configured in this environment."
        };
      }

      const safe = Object.fromEntries(
        Object.entries(review).map(([key, value]) => [key, escapeHtml(String(value ?? ""))])
      );
      const result = await resend.emails.send({
        from: config.emailFrom,
        to: config.contactRecipientEmail,
        replyTo: review.email,
        subject: `New Rapido review awaiting approval from ${review.name}`,
        html: `<h2>New review awaiting moderation</h2><p><strong>Name:</strong> ${safe.name}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Company:</strong> ${safe.company || "Not provided"}</p><p><strong>Role:</strong> ${safe.role || "Not provided"}</p><p><strong>Service:</strong> ${safe.service}</p><p><strong>Rating:</strong> ${safe.rating}/5</p><p><strong>Review:</strong></p><p>${safe.review.replaceAll("\n", "<br>")}</p>`
      });
      return result?.error
        ? { notificationEmailStatus: "failed", emailError: result.error.message.slice(0, 500) }
        : { notificationEmailStatus: "sent", emailError: "" };
    }
  };
}
