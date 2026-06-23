import { expect, test } from "@playwright/test";

test("homepage presents both service lines in the correct sequence", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Web Services & Financial Support");
  await expect(page.getByRole("link", { name: "Explore Web Services" })).toHaveAttribute("href", "/web-services");
  await expect(page.getByRole("link", { name: "Explore Financial Services" }).first()).toHaveAttribute("href", "/financial-services");

  const webHeading = page.getByRole("heading", { name: /Web Services Designed to Move Your Business Forward/i });
  const financeHeading = page.getByRole("heading", { name: /Financial Support Built for Clearer Business Control/i });
  await expect(webHeading).toBeVisible();
  await expect(financeHeading).toBeVisible();
  expect((await webHeading.boundingBox()).y).toBeLessThan((await financeHeading.boundingBox()).y);
});

test("desktop projects menu exposes both project categories", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop navigation behavior");
  await page.goto("/");
  await page.getByRole("button", { name: "Projects" }).hover();
  const navigation = page.getByRole("navigation").first();
  await expect(navigation.getByRole("link", { name: "Web Projects" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Financial Projects" })).toBeVisible();
});

test("web services are scoped and overview cards share a row height", async ({ page }) => {
  await page.goto("/web-services");
  await expect(page.getByText("Custom Software & Automation")).toHaveCount(0);
  const cards = page.locator("section").filter({ hasText: "Service Overview" }).locator("article");
  await expect(cards).toHaveCount(6);
  const boxes = await cards.evaluateAll((nodes) => nodes.slice(0, 4).map((node) => Math.round(node.getBoundingClientRect().height)));
  expect(new Set(boxes).size).toBe(1);
});

test("contact form submits through the API and reports success", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ message: "Thank you. Your request has been saved and sent to our team.", reference: "e2e-1", emailSent: true })
    });
  });
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Test Visitor");
  await page.getByLabel("Email").fill("visitor@example.com");
  await page.getByLabel("Message").fill("I need a secure website and bookkeeping support.");
  await page.getByRole("button", { name: "Submit Project Request" }).click();
  await expect(page.getByText(/saved and sent to our team/i)).toBeVisible();
});

test("mobile navigation reaches financial services", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation behavior");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.locator("aside");
  await expect(menu.getByRole("link", { name: "Financial Services", exact: true })).toBeVisible();
  await menu.getByRole("link", { name: "Financial Services", exact: true }).click();
  await expect(page).toHaveURL(/financial-services/);
});
