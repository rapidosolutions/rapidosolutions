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

export const reviewSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  company: optionalText(160),
  role: optionalText(120),
  service: z.enum(["Web Services", "Bookkeeping & Finance", "Human Resource Services", "General Experience"]),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().min(20).max(2000),
  consent: z.literal(true),
  website: optionalText(0)
});

export const reviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"])
});

const resumeAnalysisShape = z.object({
  isResume: z.boolean(),
  reason: z.string().max(1000),
  score: z.number().int().min(0).max(10),
  strengths: z.array(z.string().max(500)).max(12),
  weaknesses: z.array(z.string().max(500)).max(12),
  missingKeywords: z.array(z.string().max(120)).max(30),
  actionSteps: z.array(z.string().max(500)).max(12)
});

export const sampleResumeSchema = z.object({
  targetRole: optionalText(160)
});

export const rebuildResumeSchema = z.object({
  resumeText: z.string().trim().min(140).max(12000),
  targetRole: optionalText(160),
  analysis: resumeAnalysisShape.optional()
});

const workExperienceSchema = z.object({
  jobTitle: shortText(160),
  company: shortText(160),
  startDate: shortText(40),
  endDate: optionalText(40),
  achievements: shortText(3000)
});

const educationSchema = z.object({
  degree: shortText(200),
  institution: shortText(200),
  graduationDate: shortText(40)
});

export const generateResumeSchema = z.object({
  personalInfo: z.object({
    name: shortText(120),
    email: z.string().trim().toLowerCase().email().max(254),
    phone: optionalText(50),
    location: optionalText(160),
    linkedin: optionalText(500),
    portfolio: optionalText(500)
  }),
  targetRole: shortText(160),
  professionalSummary: optionalText(2000),
  workExperience: z.array(workExperienceSchema).min(1).max(12),
  education: z.array(educationSchema).min(1).max(8),
  skills: z.array(shortText(100)).min(3).max(50),
  certifications: z.array(z.string().trim().max(200)).max(20).default([])
});

export const exportResumeSchema = z.object({
  markdown: z.string().trim().min(100).max(30000),
  fileName: optionalText(120)
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
