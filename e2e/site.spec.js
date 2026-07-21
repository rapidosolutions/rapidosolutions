import { expect, test } from "@playwright/test";

test("homepage presents both service lines in the correct sequence", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Web, SEO & Finance Solutions for Growth");
  await page.getByRole("button", { name: "Explore Our Services" }).first().click();
  const serviceDialog = page.getByRole("dialog", { name: "Choose a service" });
  await expect(serviceDialog.getByRole("link", { name: /Web Services/i })).toHaveAttribute("href", "/web-services");
  await expect(serviceDialog.getByRole("link", { name: /Financial Services/i })).toHaveAttribute("href", "/financial-services");
  await expect(serviceDialog.getByRole("link", { name: /Human Resource Services/i })).toHaveAttribute("href", "/human-resource-services");
  await page.keyboard.press("Escape");

  const webHeading = page.getByRole("heading", { name: /Web Services Designed to Move Your Business Forward/i });
  const financeHeading = page.getByRole("heading", { name: /Financial Support Built for Clearer Business Control/i });
  const hrHeading = page.getByRole("heading", { name: /HR Support Built for Better Team Structure/i });
  await expect(webHeading).toBeVisible();
  await expect(financeHeading).toBeVisible();
  await expect(hrHeading).toBeVisible();
  expect((await webHeading.boundingBox()).y).toBeLessThan((await financeHeading.boundingBox()).y);
  expect((await financeHeading.boundingBox()).y).toBeLessThan((await hrHeading.boundingBox()).y);

  await expect(page.locator("section").filter({ hasText: "Web Services Designed to Move Your Business Forward" }).locator("article")).toHaveCount(4);
  await expect(page.getByText("Selected Project Directions")).toHaveCount(0);
  await expect(page.getByText("Industries Served")).toHaveCount(0);
  await expect(page.getByText("View All Blogs")).toHaveCount(0);
  if (!isMobile) {
    await expect(page.getByText("100%")).toBeVisible();
  }
});

test("desktop projects menu exposes both project categories", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop navigation behavior");
  await page.goto("/");
  const projectsButton = page.getByRole("button", { name: "Projects" });
  await projectsButton.hover();
  await expect(page.locator('header nav a[href="/projects?type=web"]')).toBeVisible();
  await expect(page.locator('header nav a[href="/projects?type=financial"]')).toBeVisible();
  await expect(page.locator('header nav a[href="/projects?type=human"]')).toBeVisible();
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

test("mobile homepage avoids horizontal overflow", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile layout check");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  const consultation = await page.getByRole("link", { name: "Book a Free Consultation" }).first().boundingBox();
  const scrollCue = await page.getByRole("link", { name: "Scroll to more content" }).boundingBox();
  expect(scrollCue.y).toBeGreaterThanOrEqual(consultation.y + consultation.height + 8);
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});

test("team portrait media uses square mobile frames and horizontal desktop cards", async ({ page, isMobile }) => {
  await page.goto("/about");
  const firstCard = page.locator('[data-team-card="true"]').first();
  const media = firstCard.locator('[data-team-media="true"]');
  const content = firstCard.locator('[data-team-content="true"]');
  const image = firstCard.locator('[data-team-image="true"]');
  await expect(media).toBeVisible();

  const mediaBox = await media.boundingBox();
  const contentBox = await content.boundingBox();
  if (isMobile) {
    expect(Math.abs(mediaBox.width - mediaBox.height)).toBeLessThanOrEqual(1);
    expect(contentBox.y).toBeGreaterThanOrEqual(mediaBox.y + mediaBox.height - 1);
  } else {
    expect(contentBox.x).toBeGreaterThanOrEqual(mediaBox.x + mediaBox.width - 1);
    expect(Math.abs(mediaBox.height - contentBox.height)).toBeLessThanOrEqual(1);
  }
  await expect(image).toHaveCSS("object-fit", "cover");
});

test("about team groups preserve department order and secure LinkedIn actions", async ({ page }) => {
  await page.goto("/about#team");
  const groups = page.locator("[data-team-group]");
  await expect(groups).toHaveCount(6);

  await expect(page.locator('[data-team-group-heading="true"]')).toHaveText([
    "Finance",
    "Technology",
    "Human Resources",
    "Operations",
    "Design – UI/UX",
    "Business Development"
  ]);

  const expectedMembers = [
    ["Hashim Raza", "Muhammad Huzaifa"],
    ["Shehzad Amir", "Samar Khan"],
    ["Jawad Sadat Ali", "M. Imran Bashir"],
    ["Hamza Tufail", "Munim Sohail"],
    ["Zunair Ahmed Khan"],
    ["Saba Nadeem"]
  ];

  for (let index = 0; index < expectedMembers.length; index += 1) {
    await expect(groups.nth(index).locator("[data-team-name]")).toHaveText(expectedMembers[index]);
  }

  await expect(page.locator("[data-team-card]")).toHaveCount(10);
  await expect(page.locator("[data-team-role]")).toHaveCount(0);
  await expect(page.getByText("More Details", { exact: true })).toHaveCount(0);

  const hashimLinkedIn = page.getByRole("link", { name: "Open Hashim Raza's LinkedIn profile" });
  await expect(hashimLinkedIn).toHaveAttribute("href", "https://www.linkedin.com/in/hashim-raza-900115114/");
  await expect(hashimLinkedIn).toHaveAttribute("target", "_blank");
  await expect(hashimLinkedIn).toHaveAttribute("rel", "noopener noreferrer");
  await expect(hashimLinkedIn).toHaveAttribute("referrerpolicy", "no-referrer");

  await expect(page.locator('[data-linkedin="true"]')).toHaveCount(7);
  await expect(page.getByRole("link", { name: "Open Hamza Tufail's LinkedIn profile" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open Munim Sohail's LinkedIn profile" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open Zunair Ahmed Khan's LinkedIn profile" })).toHaveCount(0);
  await expect(groups.first().locator('img[alt="The Meraki Partnership LLP"]')).toBeVisible();
});

test("main pages avoid horizontal overflow on mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile layout check");
  const paths = ["/", "/web-services", "/financial-services", "/projects", "/about", "/contact", "/blogs"];

  for (const path of paths) {
    await page.goto(path);
    await page.getByRole("button", { name: "Open menu" }).waitFor({ state: "visible" });
    const dimensions = await page.evaluate(() => ({
      path: window.location.pathname,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(dimensions.scrollWidth, `${dimensions.path} should not overflow horizontally`).toBeLessThanOrEqual(
      dimensions.clientWidth + 1
    );
  }
});

test("mobile navigation reaches financial services", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation behavior");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.locator("aside");
  await expect(menu.getByRole("link", { name: "Financial Services", exact: true })).toHaveCount(0);
  await menu.getByRole("button", { name: "Services" }).click();
  await menu.getByRole("link", { name: "Financial Services", exact: true }).click();
  await expect(page).toHaveURL(/financial-services/);
});

test("mobile services and projects navigation use dropdowns", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation behavior");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.locator("aside");

  await expect(menu.getByRole("link", { name: "Web Services", exact: true })).toHaveCount(0);
  await menu.getByRole("button", { name: "Services" }).click();
  await expect(menu.getByRole("link", { name: "Web Services", exact: true })).toBeVisible();

  await expect(menu.getByRole("link", { name: "Human Resource Projects", exact: true })).toHaveCount(0);
  await menu.getByRole("button", { name: "Projects" }).click();
  await expect(menu.getByRole("link", { name: "Human Resource Projects", exact: true })).toBeVisible();
});
