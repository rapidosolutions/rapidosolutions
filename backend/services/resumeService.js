import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import PDFDocument from "pdfkit";
import { AppError } from "../utils/http.js";

const MAX_RESUME_TEXT_LENGTH = 12000;
const MIN_RESUME_TEXT_LENGTH = 140;
const TARGET_SCORE = 9;
const MAX_REWRITE_ATTEMPTS = 3;

const analysisSchema = {
  type: "object",
  properties: {
    isResume: { type: "boolean" },
    reason: { type: "string" },
    score: { type: "integer", minimum: 0, maximum: 10 },
    strengths: { type: "array", items: { type: "string" } },
    weaknesses: { type: "array", items: { type: "string" } },
    missingKeywords: { type: "array", items: { type: "string" } },
    actionSteps: { type: "array", items: { type: "string" } }
  },
  required: ["isResume", "reason", "score", "strengths", "weaknesses", "missingKeywords", "actionSteps"]
};

const rewriteSchema = {
  type: "object",
  properties: {
    resumeMarkdown: { type: "string" }
  },
  required: ["resumeMarkdown"]
};

export const sampleResumeText = `
Alex Morgan
alex.morgan@example.com | +1 555 010 4200 | Austin, TX | linkedin.com/in/alexmorgan

PROFESSIONAL SUMMARY
Web developer with four years of experience creating responsive business websites and ecommerce storefronts.

EXPERIENCE
Web Developer, Northstar Digital | 2022 - Present
- Built and maintained React and WordPress websites for small business clients.
- Improved page speed and worked with designers to deliver accessible interfaces.
- Supported Shopify theme updates, product pages, and analytics implementation.

Junior Developer, Brightline Studio | 2020 - 2022
- Developed reusable frontend components and resolved cross-browser issues.
- Collaborated with account managers to translate client requests into releases.

EDUCATION
Bachelor of Science in Computer Science, Central State University | 2020

SKILLS
React, JavaScript, HTML, CSS, WordPress, Shopify, Git, Technical SEO
`.trim();

function normalizeText(value) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_RESUME_TEXT_LENGTH);
}

function countMatches(text, patterns) {
  return patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
}

export function validateExtractedResumeText(value) {
  const text = normalizeText(value);
  if (text.length < MIN_RESUME_TEXT_LENGTH) {
    throw new AppError(
      400,
      "We could not read enough resume text from this PDF. Upload a text-based resume rather than a blank or scanned image PDF.",
      "RESUME_TEXT_UNREADABLE"
    );
  }

  const resumeSignals = countMatches(text, [
    /\b(experience|employment|work history)\b/i,
    /\b(education|academic)\b/i,
    /\b(skills|competencies|technologies)\b/i,
    /\b(summary|profile|objective)\b/i,
    /\b(certifications?|projects?)\b/i
  ]);
  const invoiceSignals = countMatches(text, [
    /\binvoice\b/i,
    /\bamount due\b/i,
    /\bsubtotal\b/i,
    /\bbill to\b/i,
    /\bpayment terms\b/i
  ]);
  const coverLetterSignals = countMatches(text, [/\bdear (hiring|recruiting|recruiter|sir|madam)\b/i, /\bsincerely\b/i]);

  if (resumeSignals < 2 || invoiceSignals >= 2 || coverLetterSignals >= 2) {
    throw new AppError(400, "This PDF does not appear to be a resume or CV.", "NOT_A_RESUME");
  }

  return text;
}

async function defaultParsePdf(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new AppError(400, "Upload a valid PDF file.", "INVALID_PDF");
  }

  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } catch {
    throw new AppError(400, "This PDF is corrupt, password-protected, or could not be read.", "PDF_PARSE_FAILED");
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

function parseStructuredResponse(response) {
  const raw = response?.text;
  if (!raw) throw new AppError(502, "The AI service returned an empty response.", "AI_EMPTY_RESPONSE");

  try {
    return JSON.parse(raw);
  } catch {
    throw new AppError(502, "The AI service returned an invalid structured response.", "AI_INVALID_RESPONSE");
  }
}

function createGeminiGenerator(config) {
  if (!config.geminiApiKey) {
    return async () => {
      throw new AppError(503, "Resume AI is not configured yet. Add GEMINI_API_KEY to the backend environment.", "AI_NOT_CONFIGURED");
    };
  }

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  return async ({ prompt, schema, temperature = 0.2 }) => {
    const response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: prompt,
      config: {
        temperature,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return parseStructuredResponse(response);
  };
}

function analysisPrompt(resumeText, targetRole = "") {
  // Keep the evaluation rubric in one prompt so validation and scoring use one paid model call.
  return `You are a strict ATS resume reviewer. First decide whether the supplied text is a real resume or CV.
Reject invoices, reports, essays, cover-letter-only documents, blank content, and unrelated files.
If it is not a resume, set isResume=false, explain why in reason, set score=0, and return empty arrays.
If it is a resume, set isResume=true and score it from 0 to 10. Be demanding: an ordinary usable resume normally scores 5 to 7, and 9 or 10 requires excellent ATS structure, specificity, quantified impact, clarity, and role alignment.
Assess standard headings, reverse chronology, readable wording, accomplishment-focused bullets, useful keywords, and factual consistency. Never invent experience or credentials.
Infer missing keywords only from the target role and evidence in the resume.
Target role: ${targetRole || "Not provided; assess general professional readiness."}

RESUME TEXT
${resumeText}`;
}

function rewritePrompt({ resumeText, targetRole, feedback, previousResume = "" }) {
  const refinement = previousResume
    ? `Improve the previous draft using the weaknesses and missing keywords below. Preserve every factual detail and do not invent metrics.\n\nPREVIOUS DRAFT\n${previousResume}`
    : "Create the first improved draft from the source resume.";

  // The constraints intentionally prohibit layouts that commonly break ATS parsing.
  return `You are an expert ATS resume writer. ${refinement}
Return only a complete resume in Markdown inside resumeMarkdown.
Use one column, standard headings, reverse chronological work history, concise accomplishment-oriented bullets, and natural role-relevant keywords.
Do not use tables, columns, icons, graphics, HTML, fabricated metrics, fabricated skills, or fabricated experience.
Keep contact details from the source. Omit information that is not present rather than guessing.
Target role: ${targetRole || "General professional role"}
Weaknesses to address: ${(feedback?.weaknesses || []).join("; ") || "None supplied"}
Relevant missing keywords to consider only when factually supported: ${(feedback?.missingKeywords || []).join("; ") || "None supplied"}

SOURCE RESUME
${resumeText}`;
}

function profileToSourceText(profile) {
  const work = profile.workExperience
    .map((entry) => `${entry.jobTitle} at ${entry.company} | ${entry.startDate} - ${entry.endDate || "Present"}\n${entry.achievements}`)
    .join("\n\n");
  const education = profile.education
    .map((entry) => `${entry.degree}, ${entry.institution} | ${entry.graduationDate}`)
    .join("\n");

  return normalizeText(`${profile.personalInfo.name}
${profile.personalInfo.email} | ${profile.personalInfo.phone} | ${profile.personalInfo.location}
${profile.personalInfo.linkedin} ${profile.personalInfo.portfolio}

TARGET ROLE
${profile.targetRole}

PROFESSIONAL SUMMARY
${profile.professionalSummary}

WORK EXPERIENCE
${work}

EDUCATION
${education}

SKILLS
${profile.skills.join(", ")}

CERTIFICATIONS
${profile.certifications.join(", ")}`);
}

function generationPrompt(profile) {
  return `You are an expert ATS resume writer. Build a complete one-column resume in Markdown from the supplied candidate data.
Use standard headings, reverse chronological experience, concise accomplishment-oriented bullets, and natural keywords for the target role.
Do not use tables, columns, icons, graphics, HTML, fabricated metrics, fabricated skills, or fabricated experience. Omit empty fields.

CANDIDATE DATA
${JSON.stringify(profile, null, 2)}`;
}

async function runRefinementLoop({ sourceText, targetRole, initialFeedback, initialPrompt, generateStructured }) {
  let feedback = initialFeedback || { weaknesses: [], missingKeywords: [] };
  let previousResume = "";
  let best = null;

  for (let attempt = 1; attempt <= MAX_REWRITE_ATTEMPTS; attempt += 1) {
    const prompt = attempt === 1 && initialPrompt
      ? initialPrompt
      : rewritePrompt({ resumeText: sourceText, targetRole, feedback, previousResume });
    const generated = await generateStructured({ prompt, schema: rewriteSchema, temperature: 0.35 });
    const resumeMarkdown = String(generated.resumeMarkdown || "").trim();
    if (!resumeMarkdown) throw new AppError(502, "The AI service did not generate a resume.", "AI_EMPTY_RESUME");

    const score = await generateStructured({
      prompt: analysisPrompt(resumeMarkdown, targetRole),
      schema: analysisSchema,
      temperature: 0.1
    });
    if (!score.isResume) throw new AppError(502, "The generated document failed resume validation.", "AI_INVALID_RESUME");

    const candidate = { resumeMarkdown, analysis: score, attempts: attempt };
    if (!best || score.score > best.analysis.score) best = candidate;
    if (score.score >= TARGET_SCORE) break;

    previousResume = resumeMarkdown;
    feedback = score;
  }

  return best;
}

export function markdownToPdf(markdown) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margins: { top: 48, right: 48, bottom: 48, left: 48 }, info: { Title: "ATS Resume" } });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    for (const rawLine of String(markdown || "").split(/\r?\n/)) {
      const line = rawLine.trimEnd();
      if (!line) {
        doc.moveDown(0.45);
      } else if (line.startsWith("# ")) {
        doc.font("Helvetica-Bold").fontSize(18).fillColor("#071529").text(line.slice(2), { align: "center" }).moveDown(0.35);
      } else if (line.startsWith("## ")) {
        doc.moveDown(0.25).font("Helvetica-Bold").fontSize(11).fillColor("#135cff").text(line.slice(3).toUpperCase()).moveDown(0.2);
      } else if (/^[-*] /.test(line)) {
        doc.font("Helvetica").fontSize(9.5).fillColor("#1f2937").text(`\u2022 ${line.slice(2)}`, { indent: 12, paragraphGap: 3 });
      } else {
        doc.font("Helvetica").fontSize(9.5).fillColor("#1f2937").text(line.replace(/\*\*/g, ""), { paragraphGap: 3 });
      }
    }
    doc.end();
  });
}

export function createResumeService(config, dependencies = {}) {
  const parsePdf = dependencies.parsePdf || defaultParsePdf;
  const generateStructured = dependencies.generateStructured || createGeminiGenerator(config);

  return {
    async analyzePdf(file, { targetRole = "" } = {}) {
      if (!file?.buffer) throw new AppError(400, "Choose a PDF resume to analyze.", "RESUME_REQUIRED");
      const resumeText = validateExtractedResumeText(await parsePdf(file.buffer));
      const analysis = await generateStructured({ prompt: analysisPrompt(resumeText, targetRole), schema: analysisSchema, temperature: 0.1 });
      if (!analysis.isResume) throw new AppError(400, analysis.reason || "This file does not appear to be a resume or CV.", "NOT_A_RESUME");
      return { resumeText, analysis };
    },

    async analyzeText(resumeText, { targetRole = "" } = {}) {
      const text = validateExtractedResumeText(resumeText);
      const analysis = await generateStructured({ prompt: analysisPrompt(text, targetRole), schema: analysisSchema, temperature: 0.1 });
      if (!analysis.isResume) throw new AppError(400, analysis.reason || "This text does not appear to be a resume or CV.", "NOT_A_RESUME");
      return { resumeText: text, analysis };
    },

    rebuild({ resumeText, targetRole = "", analysis }) {
      const sourceText = validateExtractedResumeText(resumeText);
      return runRefinementLoop({ sourceText, targetRole, initialFeedback: analysis, generateStructured });
    },

    generate(profile) {
      const sourceText = profileToSourceText(profile);
      return runRefinementLoop({
        sourceText,
        targetRole: profile.targetRole,
        initialPrompt: generationPrompt(profile),
        generateStructured
      });
    },

    exportPdf(markdown) {
      return markdownToPdf(markdown);
    }
  };
}
