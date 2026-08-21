import { AppError } from "../utils/http.js";
import { assertDatabaseResult } from "../utils/database.js";

const columns =
  "id,full_name,email,phone,designation,category,cv_url,cv_public_id,cv_score,gemini_summary,status,source,created_at,updated_at";

function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    designation: row.designation,
    category: row.category,
    cvUrl: row.cv_url,
    cvPublicId: row.cv_public_id,
    cvScore: row.cv_score == null ? null : Number(row.cv_score),
    geminiSummary: row.gemini_summary,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function extractContactFromResumeText(text = "") {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
  const fullName = lines[0] && !lines[0].includes("@") && lines[0].length <= 80 ? lines[0] : "";

  return {
    fullName: fullName.slice(0, 160),
    email: (emailMatch?.[0] || "").toLowerCase().slice(0, 254),
    phone: (phoneMatch?.[0] || "").replace(/\s+/g, " ").trim().slice(0, 50)
  };
}

function buildSummary(analysis) {
  if (!analysis) return "";
  const parts = [];
  if (analysis.reason) parts.push(analysis.reason);
  if (analysis.strengths?.length) parts.push(`Strengths: ${analysis.strengths.join("; ")}`);
  if (analysis.weaknesses?.length) parts.push(`Weaknesses: ${analysis.weaknesses.join("; ")}`);
  if (analysis.actionSteps?.length) parts.push(`Actions: ${analysis.actionSteps.join("; ")}`);
  return parts.join("\n\n").slice(0, 8000);
}

export function createCvService({ supabase, uploadService }) {
  if (!supabase) {
    return {
      persistAnalyzedResume: async () => null,
      list: async () => ({ items: [], total: 0, page: 1, pages: 1 }),
      get: async () => {
        throw new AppError(503, "Database unavailable.", "DATABASE_UNAVAILABLE");
      },
      createManual: async () => {
        throw new AppError(503, "Database unavailable.", "DATABASE_UNAVAILABLE");
      },
      updateStatus: async () => {
        throw new AppError(503, "Database unavailable.", "DATABASE_UNAVAILABLE");
      },
      update: async () => {
        throw new AppError(503, "Database unavailable.", "DATABASE_UNAVAILABLE");
      }
    };
  }

  return {
    serialize,

    async persistAnalyzedResume({ file, resumeText, analysis, targetRole = "", source = "public_upload" }) {
      if (!analysis?.isResume) return null;

      const contact = extractContactFromResumeText(resumeText);
      let cvUrl = null;
      let cvPublicId = "";

      if (file?.buffer && uploadService?.uploadRaw) {
        try {
          const asset = await uploadService.uploadRaw(file, { folder: "rapido/cvs", resourceType: "raw" });
          cvUrl = asset.url;
          cvPublicId = asset.publicId || "";
        } catch (err) {
          console.warn("[CV Persist] Cloudinary upload failed:", err.message);
        }
      }

      const row = {
        full_name: contact.fullName || "Unknown candidate",
        email: contact.email,
        phone: contact.phone,
        designation: String(targetRole || "").trim().slice(0, 160),
        category: "General",
        cv_url: cvUrl,
        cv_public_id: cvPublicId,
        cv_score: Number(analysis.score ?? 0),
        gemini_summary: buildSummary(analysis),
        status: "new",
        source
      };

      const { data, error } = await supabase.from("cvs").insert(row).select(columns).single();
      if (error) {
        if (error.code === "42P01" || /relation .* does not exist/i.test(error.message || "")) {
          console.warn("[CV Persist] cvs table missing. Run migration 005_cv_admin.sql.");
          return null;
        }
        console.warn("[CV Persist] insert failed:", error.message);
        return null;
      }
      return serialize(data);
    },

    async list(query = {}) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let builder = supabase.from("cvs").select(columns, { count: "exact" });

      if (query.status) builder = builder.eq("status", query.status);
      if (query.category) builder = builder.ilike("category", query.category);
      if (query.designation) builder = builder.ilike("designation", `%${query.designation}%`);
      if (query.minScore != null && query.minScore !== "") builder = builder.gte("cv_score", Number(query.minScore));
      if (query.maxScore != null && query.maxScore !== "") builder = builder.lte("cv_score", Number(query.maxScore));
      if (query.fromDate) builder = builder.gte("created_at", new Date(query.fromDate).toISOString());
      if (query.toDate) {
        const end = new Date(query.toDate);
        end.setHours(23, 59, 59, 999);
        builder = builder.lte("created_at", end.toISOString());
      }
      if (query.search) {
        const term = `%${String(query.search).trim()}%`;
        builder = builder.or(`full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
      }

      const sortBy = query.sort === "score" ? "cv_score" : "created_at";
      builder = builder.order(sortBy, { ascending: false, nullsFirst: false }).range(from, to);

      const { data, error, count } = await builder;
      assertDatabaseResult(error, "Could not list CVs.");
      const total = count || 0;
      return {
        items: (data || []).map(serialize),
        total,
        page,
        pages: Math.max(1, Math.ceil(total / limit))
      };
    },

    async get(id) {
      const { data, error } = await supabase.from("cvs").select(columns).eq("id", id).maybeSingle();
      assertDatabaseResult(error, "Could not load CV.");
      if (!data) throw new AppError(404, "CV not found.", "NOT_FOUND");
      return serialize(data);
    },

    async createManual(payload) {
      const row = {
        full_name: payload.fullName,
        email: payload.email || "",
        phone: payload.phone || "",
        designation: payload.designation || "",
        category: payload.category || "General",
        cv_url: payload.cvUrl || null,
        cv_public_id: "",
        cv_score: payload.cvScore == null || payload.cvScore === "" ? null : Number(payload.cvScore),
        gemini_summary: payload.geminiSummary || "",
        status: payload.status || "new",
        source: "manual"
      };
      const { data, error } = await supabase.from("cvs").insert(row).select(columns).single();
      assertDatabaseResult(error, "Could not create CV entry.");
      return serialize(data);
    },

    async updateStatus(id, status) {
      const { data, error } = await supabase.from("cvs").update({ status }).eq("id", id).select(columns).single();
      assertDatabaseResult(error, "Could not update CV status.");
      return serialize(data);
    },

    async update(id, payload) {
      const row = {};
      if (payload.fullName != null) row.full_name = payload.fullName;
      if (payload.email != null) row.email = payload.email;
      if (payload.phone != null) row.phone = payload.phone;
      if (payload.designation != null) row.designation = payload.designation;
      if (payload.category != null) row.category = payload.category;
      if (payload.status != null) row.status = payload.status;
      if (payload.cvScore != null) row.cv_score = payload.cvScore === "" ? null : Number(payload.cvScore);
      if (payload.geminiSummary != null) row.gemini_summary = payload.geminiSummary;

      const { data, error } = await supabase.from("cvs").update(row).eq("id", id).select(columns).single();
      assertDatabaseResult(error, "Could not update CV.");
      return serialize(data);
    }
  };
}
