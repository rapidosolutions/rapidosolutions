import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, index: true },
    phone: { type: String, default: "", maxlength: 50 },
    company: { type: String, default: "", maxlength: 160 },
    service: { type: String, required: true, maxlength: 120 },
    budget: { type: String, required: true, maxlength: 80 },
    message: { type: String, required: true, maxlength: 5000 },
    status: { type: String, enum: ["new", "read", "replied", "archived"], default: "new", index: true },
    notificationEmailStatus: { type: String, enum: ["pending", "sent", "failed", "not_configured"], default: "pending" },
    confirmationEmailStatus: { type: String, enum: ["pending", "sent", "failed", "not_configured"], default: "pending" },
    emailError: { type: String, default: "", maxlength: 500 },
    userAgent: { type: String, default: "", maxlength: 500 }
  },
  { timestamps: true }
);

contactMessageSchema.index({ createdAt: -1 });

export const ContactMessage = mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);
