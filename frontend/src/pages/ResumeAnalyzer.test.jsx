import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResumeAnalyzer from "./ResumeAnalyzer";
import { analyzeSampleResume, generateResume, rebuildResume } from "../utils/resumeApi";

vi.mock("../utils/resumeApi", () => ({
  analyzeResume: vi.fn(),
  analyzeSampleResume: vi.fn(),
  exportResumePdf: vi.fn(),
  generateResume: vi.fn(),
  rebuildResume: vi.fn()
}));

const resumeText = `${"Experience Education Skills Summary ".repeat(8)}Delivered accessible web applications.`;
const analysis = {
  isResume: true,
  reason: "This is a valid resume with a usable ATS foundation.",
  score: 6,
  strengths: ["Clear work history"],
  weaknesses: ["Accomplishments need more detail"],
  missingKeywords: ["accessibility"],
  actionSteps: ["Strengthen accomplishment bullets"]
};

describe("ResumeAnalyzer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyzeSampleResume.mockResolvedValue({ resumeText, analysis });
    rebuildResume.mockResolvedValue({
      resumeMarkdown: "# Alex Morgan\n\n## EXPERIENCE\n- Built accessible applications.",
      analysis: { ...analysis, score: 9, weaknesses: [], missingKeywords: [] },
      attempts: 2
    });
  });

  it("analyzes the sample and rebuilds the best scored resume", async () => {
    render(<MemoryRouter><ResumeAnalyzer /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Analyze, Improve, or Build an ATS Resume");
    fireEvent.click(screen.getByRole("button", { name: "Try Sample Resume" }));

    expect(await screen.findByRole("heading", { name: "Your resume analysis" })).toBeInTheDocument();
    expect(screen.getByLabelText("ATS score 6 out of 10")).toBeInTheDocument();
    expect(screen.getByText("Clear work history")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rebuild for ATS" }));
    expect(await screen.findByRole("heading", { name: "Best version: 9/10" })).toBeInTheDocument();
    expect(screen.getByText(/Built accessible applications/)).toBeInTheDocument();
    expect(rebuildResume).toHaveBeenCalledWith(expect.objectContaining({ resumeText, analysis }));
  });

  it("clears a generated result when switching workflows", async () => {
    render(<MemoryRouter><ResumeAnalyzer /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Try Sample Resume" }));
    await screen.findByRole("heading", { name: "Your resume analysis" });
    fireEvent.click(screen.getByRole("button", { name: "Rebuild for ATS" }));
    await screen.findByRole("heading", { name: "Best version: 9/10" });

    fireEvent.click(screen.getByRole("tab", { name: "Create From Scratch" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Best version: 9/10" })).not.toBeInTheDocument());
    expect(screen.getByRole("group", { name: "Personal information" })).toBeInTheDocument();
  });

  it("requires at least three skills before generating a resume", () => {
    render(<MemoryRouter><ResumeAnalyzer /></MemoryRouter>);
    fireEvent.click(screen.getByRole("tab", { name: "Create From Scratch" }));
    fireEvent.change(screen.getByPlaceholderText("React, JavaScript, Technical SEO"), { target: { value: "React" } });
    fireEvent.submit(screen.getByRole("button", { name: "Build ATS Resume" }).closest("form"));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter at least three skills separated by commas.");
    expect(generateResume).not.toHaveBeenCalled();
  });
});
