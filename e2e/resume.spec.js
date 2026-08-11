import { expect, test } from "@playwright/test";

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

test("resume workspace analyzes, rebuilds, and stays responsive", async ({ page }) => {
  await page.route("**/api/resume/analyze/sample", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ resumeText, analysis })
    });
  });
  await page.route("**/api/resume/rebuild", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        resumeMarkdown: "# Alex Morgan\n\n## EXPERIENCE\n- Built accessible applications.",
        analysis: { ...analysis, score: 9, weaknesses: [], missingKeywords: [] },
        attempts: 2
      })
    });
  });

  await page.goto("/resume-analyzer");

  await expect(page).toHaveTitle(/AI Resume Analyzer/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Analyze, Improve, or Build an ATS Resume");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/resume-analyzer$/);

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole("button", { name: "Try Sample Resume" }).click();
  await expect(page.getByRole("heading", { name: "Your resume analysis" })).toBeVisible();
  await expect(page.getByLabel("ATS score 6 out of 10")).toBeVisible();

  await page.getByRole("button", { name: "Rebuild for ATS" }).click();
  await expect(page.getByRole("heading", { name: "Best version: 9/10" })).toBeVisible();
  await expect(page.getByText("Built accessible applications.")).toBeVisible();

  await page.getByRole("tab", { name: "Create From Scratch" }).click();
  await expect(page.getByRole("group", { name: "2. Personal Information" })).toBeVisible();
  await expect(page.getByLabel(/Job description \/ vacancy text/)).toBeVisible();
  await expect(page.getByRole("group", { name: "4. Work Experience" })).toBeVisible();
  await expect(page.getByText(/7. Projects/)).toBeVisible();

  const builderOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(builderOverflow).toBe(false);
});
