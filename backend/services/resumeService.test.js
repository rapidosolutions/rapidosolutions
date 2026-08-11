// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createResumeService, generationPrompt, markdownToPdf, profileToSourceText, sampleResumeText, validateExtractedResumeText } from "./resumeService.js";

const config = { geminiApiKey: "test-key", geminiModel: "gemini-flash-latest" };

function analysis(score, overrides = {}) {
  return {
    isResume: true,
    reason: "This is a resume.",
    score,
    strengths: ["Clear experience"],
    weaknesses: score >= 9 ? [] : ["Needs more specific impact"],
    missingKeywords: score >= 9 ? [] : ["stakeholder management"],
    actionSteps: score >= 9 ? ["Tailor before applying"] : ["Strengthen accomplishment bullets"],
    ...overrides
  };
}

describe("resumeService", () => {
  const structuredProfile = {
    personalInfo: { name: "Alex Morgan", email: "alex@example.com", phone: "", location: "" },
    targetPosition: { targetRole: "Frontend Engineer", targetIndustry: "Software", targetCompany: "Example Co", jobDescription: "Build accessible React products and improve Core Web Vitals." },
    professionalProfile: { professionalSummary: "", yearsExperience: "", primarySpecialization: "", coreExpertise: [], keyStrengths: [], majorAchievement: "", valueProposition: "" },
    workExperience: [{ jobTitle: "Developer", company: "Agency", startDate: "2022", endDate: "", responsibilities: ["Built accessible interfaces"], achievements: [{ action: "Reduced bundle size", result: "Faster page loads", metric: "32%", businessImpact: "" }], tools: ["Vite"], skills: ["React"] }],
    education: [{ degree: "BSc", institution: "Example University", graduationDate: "2021", coursework: [], achievements: [] }],
    skills: { technical: ["React", "JavaScript"], tools: ["Vite"], industry: [], professional: [] },
    projects: [], certifications: [], achievements: [], languages: [], volunteerExperience: [], leadershipExperience: [], publications: [], professionalAssociations: []
  };

  it("prioritizes the job description and supplied metrics while prohibiting fabricated facts", () => {
    const prompt = generationPrompt(structuredProfile);
    const source = profileToSourceText(structuredProfile);

    expect(prompt).toContain("Build accessible React products");
    expect(prompt).toContain("32%");
    expect(prompt).toMatch(/Never invent or infer numbers/i);
    expect(prompt).toMatch(/Separate routine responsibilities from achievements/i);
    expect(source).toContain("TARGET ROLE: Frontend Engineer");
    expect(source).toContain("Built accessible interfaces");
  });

  it("generates from the expanded profile and tolerates empty optional sections", async () => {
    const generateStructured = vi.fn()
      .mockResolvedValueOnce({ resumeMarkdown: "# Alex Morgan\n\n## EXPERIENCE\n- Reduced bundle size by 32%, improving page-load performance.\n\n## SKILLS\nReact, JavaScript, Vite" })
      .mockResolvedValueOnce(analysis(9));
    const service = createResumeService(config, { generateStructured });

    const result = await service.generate(structuredProfile);

    expect(result.analysis.score).toBe(9);
    expect(result.resumeMarkdown).toContain("32%");
    expect(generateStructured.mock.calls[0][0].prompt).toContain("Core Web Vitals");
  });

  it("fails safely instead of fabricating a resume when AI is not configured", async () => {
    const service = createResumeService({ geminiApiKey: "", geminiModel: "gemini-flash-latest" });
    await expect(service.generate(structuredProfile)).rejects.toMatchObject({ status: 503, code: "AI_NOT_CONFIGURED" });
  });

  it("rejects blank, unrelated, and obvious invoice content before an AI call", async () => {
    expect(() => validateExtractedResumeText("short")).toThrow(/could not read enough/i);
    expect(() => validateExtractedResumeText(
      "This quarterly market report discusses revenue trends, customer sentiment, regional demand, forecasts, and strategic observations. ".repeat(4)
    )).toThrow(/does not appear to be a resume/i);

    const generateStructured = vi.fn();
    const service = createResumeService(config, { generateStructured });
    await expect(service.analyzeText(`${"INVOICE Amount Due Subtotal Bill To Payment Terms ".repeat(5)}Thank you for your payment.`))
      .rejects.toMatchObject({ code: "NOT_A_RESUME" });
    expect(generateStructured).not.toHaveBeenCalled();
  });

  it("extracts, validates, and scores a PDF using one structured AI call", async () => {
    const parsePdf = vi.fn(async () => sampleResumeText);
    const generateStructured = vi.fn(async () => analysis(6));
    const service = createResumeService(config, { parsePdf, generateStructured });
    const result = await service.analyzePdf({ buffer: Buffer.from("pdf") }, { targetRole: "Frontend Developer" });

    expect(result.analysis.score).toBe(6);
    expect(result.resumeText).toContain("EXPERIENCE");
    expect(parsePdf).toHaveBeenCalledOnce();
    expect(generateStructured).toHaveBeenCalledOnce();
    expect(generateStructured.mock.calls[0][0].schema.properties.isResume.type).toBe("boolean");
  });

  it("refines up to the target and returns the highest actual score", async () => {
    const generateStructured = vi.fn()
      .mockResolvedValueOnce({ resumeMarkdown: "# Alex Morgan\n\n## EXPERIENCE\n- Supported product launches." })
      .mockResolvedValueOnce(analysis(7))
      .mockResolvedValueOnce({ resumeMarkdown: "# Alex Morgan\n\n## EXPERIENCE\n- Coordinated three product launches across design and engineering." })
      .mockResolvedValueOnce(analysis(9));
    const service = createResumeService(config, { generateStructured });
    const result = await service.rebuild({ resumeText: sampleResumeText, targetRole: "Product Manager", analysis: analysis(6) });

    expect(result.analysis.score).toBe(9);
    expect(result.attempts).toBe(2);
    expect(result.resumeMarkdown).toContain("three product launches");
    expect(generateStructured).toHaveBeenCalledTimes(4);
  });

  it("creates a readable PDF buffer from Markdown", async () => {
    const pdf = await markdownToPdf(`# Alex Morgan\n\n## EXPERIENCE\n- Built accessible web applications.\n\n## SKILLS\nReact, JavaScript`);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(500);
  });
});
