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
    }
  };
}
