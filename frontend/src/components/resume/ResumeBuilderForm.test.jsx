import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ResumeBuilderForm from "./ResumeBuilderForm";

function set(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("ResumeBuilderForm", () => {
  it("labels required, recommended, and optional inputs and supports repeatable sections", () => {
    render(<ResumeBuilderForm onGenerate={vi.fn()} pending={false} />);

    expect(screen.getByLabelText(/Target role/)).toHaveAccessibleName(/Required/);
    expect(screen.getByLabelText(/Job description/)).toHaveAccessibleName(/Recommended/);
    expect(screen.getByLabelText(/Target company/)).toHaveAccessibleName(/Optional/);
    expect(screen.getByRole("group", { name: "4. Work Experience" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Experience" }));
    expect(screen.getAllByLabelText(/Job title/)).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Remove experience" })[0]);
    expect(screen.getAllByLabelText(/Job title/)).toHaveLength(1);

    fireEvent.click(screen.getByText(/7. Projects/));
    fireEvent.click(screen.getByRole("button", { name: "Add Project" }));
    expect(screen.getByLabelText(/Project name/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove project" }));
    expect(screen.queryByLabelText(/Project name/)).not.toBeInTheDocument();
  });

  it("submits structured facts without inventing absent optional data", () => {
    const onGenerate = vi.fn();
    render(<ResumeBuilderForm onGenerate={onGenerate} pending={false} />);

    set(/Target role/, "Senior Frontend Engineer");
    set(/Job description/, "Build accessible React products and improve Core Web Vitals.");
    set(/Full name/, "Alex Morgan");
    set(/^Email/, "alex@example.com");
    set(/Job title/, "Frontend Engineer");
    set(/^Company/, "Example Co");
    fireEvent.change(screen.getAllByLabelText(/^Start date/)[0], { target: { value: "Jan 2022" } });
    set(/Responsibilities/, "Built accessible interfaces\nReviewed pull requests");
    set(/Achievement \/ action/, "Reduced application bundle size");
    set(/Result \/ outcome/, "Improved page-load performance");
    set(/Metric \/ number/, "32%");
    set(/^Degree/, "BSc Computer Science");
    set(/^Institution/, "Example University");
    set(/Graduation date/, "2021");
    set(/Technical skills/, "React, JavaScript");
    set(/Software \/ tools/, "Vite");

    fireEvent.click(screen.getByText(/7. Projects/));
    fireEvent.click(screen.getByRole("button", { name: "Add Project" }));
    set(/Project name/, "Accessibility Dashboard");
    set(/Key contributions/, "Built the component library\nAdded keyboard navigation");
    set(/Metrics \/ impact/, "20% fewer support requests");

    fireEvent.click(screen.getByText(/8. Certifications/));
    fireEvent.click(screen.getByRole("button", { name: "Add Certification" }));
    set(/Certification \/ license name/, "Web Accessibility Specialist");
    set(/Issuing organization/, "IAAP");

    fireEvent.click(screen.getByText(/9. Achievements/));
    fireEvent.click(screen.getByRole("button", { name: "Add Award" }));
    set(/Achievement \/ award name/, "Engineering Excellence");

    fireEvent.click(screen.getByText(/10. Additional Information/));
    fireEvent.click(screen.getByRole("button", { name: "Add Language" }));
    set(/^Language/, "English");
    set(/^Proficiency/, "Fluent");
    fireEvent.click(screen.getByRole("button", { name: "Add Publication" }));
    set(/Publication title/, "Accessible React Patterns");

    fireEvent.submit(screen.getByRole("button", { name: "Build ATS Resume" }).closest("form"));

    expect(onGenerate).toHaveBeenCalledOnce();
    expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({
      targetPosition: expect.objectContaining({
        targetRole: "Senior Frontend Engineer",
        jobDescription: expect.stringContaining("accessible React")
      }),
      skills: { technical: ["React", "JavaScript"], tools: ["Vite"], industry: [], professional: [] },
      workExperience: [expect.objectContaining({
        responsibilities: ["Built accessible interfaces", "Reviewed pull requests"],
        achievements: [{ action: "Reduced application bundle size", result: "Improved page-load performance", metric: "32%", businessImpact: "" }]
      })],
      projects: [expect.objectContaining({ name: "Accessibility Dashboard", contributions: ["Built the component library", "Added keyboard navigation"], metric: "20% fewer support requests" })],
      certifications: [expect.objectContaining({ name: "Web Accessibility Specialist", issuer: "IAAP" })],
      achievements: [expect.objectContaining({ title: "Engineering Excellence" })],
      languages: [{ language: "English", proficiency: "Fluent" }],
      publications: [expect.objectContaining({ title: "Accessible React Patterns" })]
    }));
  });

  it("keeps the submit action disabled while generation is pending", () => {
    render(<ResumeBuilderForm onGenerate={vi.fn()} pending />);
    expect(screen.getByRole("button", { name: "Building Resume..." })).toBeDisabled();
  });
});
