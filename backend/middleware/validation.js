import { z } from "zod";
import { AppError } from "../utils/http.js";

const shortText = (max) => z.string().trim().min(1).max(max);
const optionalText = (max) => z.string().trim().max(max).optional().default("");

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(10).max(200)
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(10).max(200),
  newPassword: z.string().min(12).max(200)
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "The new password must be different from the current password.",
  path: ["newPassword"]
});

export const blogSchema = z.object({
  title: shortText(160),
  slug: optionalText(100),
  category: shortText(80).default("Business"),
  summary: shortText(500),
  content: shortText(50000),
  author: shortText(100).default("Rapido Editorial"),
  readTime: optionalText(30),
  published: z.boolean().default(true),
  coverImage: z
    .object({
      url: z.string().url().max(2000),
      publicId: z.string().max(500).optional().default(""),
      storageType: z.enum(["cloudinary", "local"]).optional().default("cloudinary"),
      alt: z.string().trim().max(200).optional().default("")
    })
    .nullable()
    .optional()
});

export const contactSchema = z.object({
  name: shortText(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: optionalText(50),
  company: optionalText(160),
  service: shortText(120),
  budget: shortText(80),
  message: shortText(5000),
  website: optionalText(0)
});

export const messageStatusSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"])
});

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join("; ");
      next(new AppError(400, message, "VALIDATION_ERROR"));
      return;
    }
    req.validatedBody = result.data;
    next();
  };
}
