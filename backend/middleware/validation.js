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
  status: z.enum(["pending", "approved", "hidden", "rejected"])
});

export const reviewFeaturedSchema = z.object({
  featured: z.boolean()
});

export const reviewDeleteSchema = z.object({
  confirmationName: z.string().min(1).max(120)
});

const projectImageSchema = z.object({
  url: z.string().url().max(2000),
  publicId: z.string().max(500).optional().default(""),
  storageType: z.enum(["cloudinary", "local"]).optional().default("cloudinary"),
  alt: z.string().trim().max(200).optional().default("")
});

export const projectSchema = z.object({
  title: shortText(160),
  slug: optionalText(100),
  type: z.enum(["web", "financial", "human"]),
  category: shortText(100),
  description: shortText(1000),
  services: z.array(shortText(80)).min(1).max(12),
  metric: shortText(160),
  coverImage: projectImageSchema.nullable().optional(),
  coverAlt: optionalText(200),
  accent: optionalText(120),
  projectUrl: z.union([z.string().trim().url().max(2000), z.literal("")]).optional().default(""),
  featured: z.boolean().optional().default(false),
  displayOrder: z.number().int().min(0).max(10000).optional().default(0),
  status: z.enum(["draft", "published", "archived"]).optional().default("draft"),
  seoTitle: optionalText(160),
  seoDescription: optionalText(300)
});

export const projectStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"])
});

export const projectDeleteSchema = z.object({
  confirmationTitle: z.string().min(1).max(160)
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

const resumeList = (maxItems, itemMax = 200) => z.array(z.string().trim().min(1).max(itemMax)).max(maxItems).default([]);
const quantifiedAchievementSchema = z.object({ action: optionalText(500), result: optionalText(500), metric: optionalText(120), businessImpact: optionalText(500) });
const workExperienceSchema = z.object({
  jobTitle: shortText(160), company: shortText(160), location: optionalText(160),
  employmentType: z.enum(["", "Full-time", "Part-time", "Contract", "Freelance", "Internship", "Temporary"]).optional().default(""),
  department: optionalText(160), startDate: shortText(40), endDate: optionalText(40), current: z.boolean().optional().default(false), roleScope: optionalText(1000),
  responsibilities: resumeList(30, 500),
  achievements: z.union([z.string().trim().min(1).max(3000), z.array(quantifiedAchievementSchema).max(20)]).default([]),
  tools: resumeList(30, 100), skills: resumeList(30, 100)
}).transform((entry) => ({ ...entry, responsibilities: typeof entry.achievements === "string" && !entry.responsibilities.length ? entry.achievements.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) : entry.responsibilities, achievements: typeof entry.achievements === "string" ? [] : entry.achievements }))
  .refine((entry) => entry.responsibilities.length || entry.achievements.some((item) => Object.values(item).some(Boolean)), { message: "Add at least one responsibility or achievement." });

const educationSchema = z.object({
  degree: shortText(200), field: optionalText(200), institution: shortText(200), location: optionalText(160), startDate: optionalText(40), graduationDate: shortText(40),
  gpa: optionalText(40), honors: optionalText(500), coursework: resumeList(30, 200), achievements: resumeList(20, 500)
});
const projectResumeSchema = z.object({ name: shortText(200), role: optionalText(160), type: optionalText(120), description: optionalText(2000), contributions: resumeList(20, 500), technologies: resumeList(30, 100), skills: resumeList(30, 100), result: optionalText(1000), metric: optionalText(200), projectUrl: optionalText(500), githubUrl: optionalText(500) });
const certificationSchema = z.object({ name: shortText(200), issuer: optionalText(200), issueDate: optionalText(40), expirationDate: optionalText(40), credentialId: optionalText(200), credentialUrl: optionalText(500) });
const awardSchema = z.object({ title: shortText(200), issuer: optionalText(200), date: optionalText(40), description: optionalText(1000), significance: optionalText(1000) });
const experienceExtraSchema = z.object({ organization: shortText(200), role: optionalText(160), dates: optionalText(100), contributions: resumeList(20, 500), achievements: resumeList(20, 500) });

export const generateResumeSchema = z.object({
  personalInfo: z.object({
    name: shortText(120),
    email: z.string().trim().toLowerCase().email().max(254),
    phone: optionalText(50), location: optionalText(160), linkedin: optionalText(500), portfolio: optionalText(500),
    github: optionalText(500), website: optionalText(500), professionalHeadline: optionalText(200)
  }),
  targetRole: optionalText(160),
  professionalSummary: optionalText(2000),
  targetPosition: z.object({ targetRole: optionalText(160), targetIndustry: optionalText(160), targetCompany: optionalText(200), jobDescription: optionalText(12000) }).optional().default({}),
  professionalProfile: z.object({ professionalSummary: optionalText(2000), yearsExperience: optionalText(50), primarySpecialization: optionalText(200), coreExpertise: resumeList(30, 100), keyStrengths: resumeList(30, 150), majorAchievement: optionalText(1500), valueProposition: optionalText(1500) }).optional().default({}),
  workExperience: z.array(workExperienceSchema).min(1).max(12),
  education: z.array(educationSchema).min(1).max(8),
  skills: z.union([z.array(shortText(100)).min(3).max(50), z.object({ technical: resumeList(50, 100), tools: resumeList(50, 100), industry: resumeList(50, 100), professional: resumeList(50, 100) })]),
  projects: z.array(projectResumeSchema).max(20).default([]),
  certifications: z.union([z.array(z.string().trim().min(1).max(200)).max(20), z.array(certificationSchema).max(20)]).default([]),
  achievements: z.array(awardSchema).max(20).default([]),
  languages: z.array(z.object({ language: shortText(100), proficiency: optionalText(100) })).max(20).default([]),
  volunteerExperience: z.array(experienceExtraSchema).max(20).default([]), leadershipExperience: z.array(experienceExtraSchema).max(20).default([]),
  publications: z.array(z.object({ title: shortText(300), publisher: optionalText(200), date: optionalText(40), url: optionalText(500) })).max(30).default([]),
  professionalAssociations: z.array(z.object({ organization: shortText(200), role: optionalText(160), dates: optionalText(100) })).max(20).default([])
}).refine((value) => value.targetPosition.targetRole || value.targetRole, { message: "Target role is required.", path: ["targetPosition", "targetRole"] })
  .refine((value) => Array.isArray(value.skills) ? value.skills.length >= 3 : Object.values(value.skills).flat().length >= 3, { message: "Enter at least three skills.", path: ["skills"] })
  .transform((value) => ({
    ...value,
    targetPosition: { ...value.targetPosition, targetRole: value.targetPosition.targetRole || value.targetRole },
    professionalProfile: { ...value.professionalProfile, professionalSummary: value.professionalProfile.professionalSummary || value.professionalSummary },
    skills: Array.isArray(value.skills) ? { technical: value.skills, tools: [], industry: [], professional: [] } : value.skills,
    certifications: value.certifications.map((item) => typeof item === "string" ? { name: item, issuer: "", issueDate: "", expirationDate: "", credentialId: "", credentialUrl: "" } : item)
  }));

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
