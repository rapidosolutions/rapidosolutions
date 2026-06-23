import { AppError } from "../utils/http.js";

function serialize(message) {
  const value = message.toObject ? message.toObject() : message;
  return {
    id: String(value._id || value.id),
    name: value.name,
    email: value.email,
    phone: value.phone,
    company: value.company,
    service: value.service,
    budget: value.budget,
    message: value.message,
    status: value.status,
    notificationEmailStatus: value.notificationEmailStatus,
    confirmationEmailStatus: value.confirmationEmailStatus,
    emailError: value.emailError,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt
  };
}

export function createContactService({ ContactMessage, emailService }) {
  return {
    async create(input, userAgent = "") {
      const message = await ContactMessage.create({ ...input, website: undefined, userAgent });
      const delivery = await emailService.sendContactEmails(input).catch((error) => ({
        notificationEmailStatus: "failed",
        confirmationEmailStatus: "failed",
        emailError: error.message.slice(0, 500)
      }));
      Object.assign(message, delivery);
      await message.save();
      return serialize(message);
    },

    async list({ status, page = 1, limit = 25 } = {}) {
      const safePage = Math.max(1, Number(page) || 1);
      const safeLimit = Math.min(100, Math.max(1, Number(limit) || 25));
      const filter = status ? { status } : {};
      const [messages, total] = await Promise.all([
        ContactMessage.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
        ContactMessage.countDocuments(filter)
      ]);
      return { messages: messages.map(serialize), total, page: safePage, pages: Math.max(1, Math.ceil(total / safeLimit)) };
    },

    async updateStatus(id, status) {
      const message = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
      if (!message) throw new AppError(404, "Message not found.", "MESSAGE_NOT_FOUND");
      return serialize(message);
    },

    async remove(id) {
      const message = await ContactMessage.findByIdAndDelete(id);
      if (!message) throw new AppError(404, "Message not found.", "MESSAGE_NOT_FOUND");
    }
  };
}
