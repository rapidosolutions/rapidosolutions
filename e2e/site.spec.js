import { expect, test } from "@playwright/test";

test("homepage presents all service lines in the correct sequence", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Bookkeeping, Web & HR Services for Growing Businesses"
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await page.getByRole("button", { name: "Explore Our Services" }).first().click();
  const serviceDialog = page.getByRole("dialog", { name: "Choose a service" });
  await expect(serviceDialog.getByRole("link", { name: /Web Services/i })).toHaveAttribute("href", "/web-services");
  await expect(serviceDialog.getByRole("link", { name: /Financial Services/i })).toHaveAttribute("href", "/financial-services");
  await expect(serviceDialog.getByRole("link", { name: /Human Resource Services/i })).toHaveAttribute("href", "/human-resource-services");
  await page.keyboard.press("Escape");

  const webHeading = page.getByRole("heading", { name: /Web Development and SEO Services for Business Growth/i });
  const financeHeading = page.getByRole("heading", { name: /Bookkeeping Support for Clearer Financial Control/i });
  const hrHeading = page.getByRole("heading", { name: /HR Support for Stronger People Operations/i });
  await expect(webHeading).toBeVisible();
  await expect(financeHeading).toBeVisible();
  await expect(hrHeading).toBeVisible();
  expect((await webHeading.boundingBox()).y).toBeLessThan((await financeHeading.boundingBox()).y);
  expect((await financeHeading.boundingBox()).y).toBeLessThan((await hrHeading.boundingBox()).y);

  await expect(page.locator("section").filter({ hasText: "Web Development and SEO Services for Business Growth" }).locator("article")).toHaveCount(4);
  await expect(page.getByText("Selected Project Directions")).toHaveCount(0);
  await expect(page.getByText("Industries Served")).toHaveCount(0);
  await expect(page.getByText("View All Blogs")).toHaveCount(0);
  await expect(page.getByText("Daniel Brooks", { exact: true })).toHaveCount(0);
  if (!isMobile) {
    await expect(page.getByText("100%")).toBeVisible();
  }
});

test("homepage exposes unique SEO metadata and verified structured data", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Web, Bookkeeping & HR Services | Rapido Solutions");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Rapido Solutions Co. provides web development, Shopify, WordPress, SEO, bookkeeping, property accounting, and HR support for growing businesses."
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Web, Bookkeeping & HR Services | Rapido Solutions"
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    "Web, Bookkeeping & HR Services | Rapido Solutions"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});

test("public routes expose unique crawlable metadata", async ({ page }) => {
  const routes = [
    "/",
    "/about",
    "/web-services",
    "/financial-services",
    "/human-resource-services",
    "/projects",
    "/blogs",
    "/contact"
  ];

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description.trim().length, `${route} should have a useful meta description`).toBeGreaterThanOrEqual(80);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  }

  await page.goto("/reviews");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  await page.goto("/blog-admin");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await page.goto("/project-admin");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});

test("crawler files include public routes and exclude private routes", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Disallow: /blog-admin");
  expect(await robots.text()).toContain("Disallow: /project-admin");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const xml = await sitemap.text();
  expect(xml).toContain("/web-services");
  expect(xml).toContain("/human-resource-services");
  expect(xml).not.toContain("/blog-admin");
  expect(xml).not.toContain("/project-admin");
  expect(xml).not.toContain("/reviews");
});

test("public projects use published API records and exclude non-public records", async ({ page }) => {
  await page.route("**/api/projects", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ projects: [{
      id: "published-1", title: "Managed Published Project", slug: "managed-published-project", type: "web",
      category: "Business Websites", description: "A published project loaded from the protected database workflow.",
      services: ["Web Development"], metric: "Published result", coverImage: null, coverAlt: "",
      accent: "from-blue-100 to-blue-300", featured: false, displayOrder: 1
    }] })
  }));
  await page.goto("/projects");
  await expect(page.getByText("Managed Published Project")).toBeVisible();
  await expect(page.getByText("Shopify Skincare Store")).toHaveCount(0);
  await expect(page.getByText("Draft Project")).toHaveCount(0);
  await expect(page.getByText("Archived Project")).toHaveCount(0);
});

test("project admin is hidden from public navigation and requires login", async ({ page }) => {
  await page.route("**/api/auth/session", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "Administrator login required." }) }));
  await page.goto("/project-admin");
  await expect(page.getByRole("heading", { name: "Project Administrator Login" })).toBeVisible();
  await expect(page.getByLabel("Administrator Email")).toHaveValue("");
  await expect(page.getByLabel("Administrator Email")).toHaveAttribute("autocomplete", "username");
  await expect(page.getByLabel("Password")).toHaveValue("");
  await expect(page.getByLabel("Password")).toHaveAttribute("autocomplete", "current-password");
  await page.getByRole("button", { name: "Show" }).click();
  await expect(page.getByLabel("Password")).toHaveAttribute("type", "text");
  await expect(page.getByText(/create account|sign up/i)).toHaveCount(0);

  await page.goto("/");
  await expect(page.locator('header a[href="/project-admin"], footer a[href="/project-admin"]')).toHaveCount(0);
});

test("project deletion requires Edit and exact confirmation before removing only the selected project", async ({ page }) => {
  let deleteRequested = false;
  const adminProjects = [
    {
      id: "delete-project", title: "Shopify Skincare Store", slug: "shopify-skincare-store", type: "web",
      category: "Shopify Stores", description: "A project selected for the deletion test.", services: ["Shopify"],
      metric: "Cleaner purchase journey", coverImage: null, coverAlt: "", accent: "from-blue-100 to-blue-300",
      projectUrl: "", featured: false, displayOrder: 1, status: "published", seoTitle: "", seoDescription: "",
      createdAt: "2026-08-01T00:00:00.000Z", updatedAt: "2026-08-09T00:00:00.000Z"
    },
    {
      id: "keep-project", title: "Unrelated Project", slug: "unrelated-project", type: "web",
      category: "Business Websites", description: "This project remains after deletion.", services: ["Web Development"],
      metric: "More leads", coverImage: null, coverAlt: "", accent: "from-slate-100 to-blue-300",
      projectUrl: "", featured: false, displayOrder: 2, status: "published", seoTitle: "", seoDescription: "",
      createdAt: "2026-08-02T00:00:00.000Z", updatedAt: "2026-08-08T00:00:00.000Z"
    }
  ];

  await page.route("**/api/auth/session", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ admin: { email: "admin@example.com", canManageProjects: true }, csrfToken: "test-csrf" })
  }));
  await page.route("**/api/admin/projects**", async (route) => {
    if (route.request().method() === "DELETE" && route.request().url().endsWith("/delete-project/permanent")) {
      expect(route.request().postDataJSON()).toEqual({ confirmationTitle: "Shopify Skincare Store" });
      deleteRequested = true;
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ projects: adminProjects }) });
  });

  await page.goto("/project-admin");
  await expect(page.getByRole("heading", { name: "Projects (2)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Project" })).toHaveCount(0);
  await page.getByRole("button", { name: "Edit" }).first().click();
  await page.getByRole("button", { name: "Delete Project" }).click();

  const dialog = page.getByRole("dialog", { name: /Delete “Shopify Skincare Store”/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Delete Permanently" })).toBeDisabled();
  await dialog.getByLabel("Type the project title to confirm").fill("shopify skincare store");
  await expect(dialog.getByRole("button", { name: "Delete Permanently" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(deleteRequested).toBe(false);

  await page.getByRole("button", { name: "Delete Project" }).click();
  const confirmation = page.getByRole("dialog", { name: /Delete “Shopify Skincare Store”/ });
  await confirmation.getByLabel("Type the project title to confirm").fill("Shopify Skincare Store");
  await confirmation.getByRole("button", { name: "Delete Permanently" }).click();
  await expect(page.getByText("Project deleted successfully.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Projects (1)" })).toBeVisible();
  await expect(page.getByText("Shopify Skincare Store")).toHaveCount(0);
  await expect(page.getByText("Unrelated Project")).toBeVisible();
  expect(deleteRequested).toBe(true);

  await page.route("**/api/projects", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ projects: [adminProjects[1]] })
  }));
  await page.goto("/projects");
  await expect(page.getByText("Shopify Skincare Store")).toHaveCount(0);
  await expect(page.getByText("Unrelated Project")).toBeVisible();
});

test("project admin manages review moderation, featuring, and confirmed deletion", async ({ page }) => {
  let review = {
    id: "review-admin-1", name: "Review Admin Client", email: "review-admin@example.com",
    company: "Example Company", role: "Owner", service: "Web Services", rating: 5,
    review: "Rapido delivered the agreed website work clearly and professionally.",
    createdAt: "2026-08-10T10:00:00.000Z", status: "pending", featured: false
  };
  let deleted = false;

  await page.route("**/api/auth/session", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ admin: { email: "admin@example.com", canManageProjects: true }, csrfToken: "test-csrf" })
  }));
  await page.route("**/api/admin/projects**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ projects: [] }) }));
  await page.route("**/api/admin/reviews**", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ reviews: deleted ? [] : [review], total: deleted ? 0 : 1, page: 1, pages: 1 }) });
      return;
    }
    if (request.method() === "PATCH" && request.url().endsWith("/featured")) {
      review = { ...review, featured: request.postDataJSON().featured };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ review }) });
      return;
    }
    if (request.method() === "PATCH") {
      const status = request.postDataJSON().status;
      review = { ...review, status, featured: status === "approved" ? review.featured : false };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ review }) });
      return;
    }
    expect(request.postDataJSON()).toEqual({ confirmationName: "Review Admin Client" });
    deleted = true;
    await route.fulfill({ status: 204 });
  });

  await page.goto("/project-admin");
  await page.getByRole("button", { name: "Reviews" }).click();
  await expect(page.getByRole("heading", { name: "Customer Reviews (1)" })).toBeVisible();
  await expect(page.getByText("review-admin@example.com")).toBeVisible();
  const card = page.getByRole("article").filter({ hasText: "Review Admin Client" });
  await card.getByRole("button", { name: "Approve" }).click();
  await card.getByRole("button", { name: "Feature" }).click();
  await expect(card.getByText("Featured", { exact: true })).toBeVisible();
  await card.getByRole("button", { name: "Hide" }).click();
  await card.getByRole("button", { name: "Restore" }).click();
  await card.getByRole("button", { name: "Reject" }).click();
  await card.getByRole("button", { name: "Delete Permanently" }).click();
  const dialog = page.getByRole("dialog", { name: /Delete Review Admin Client's review/ });
  await expect(dialog.getByRole("button", { name: "Delete Permanently" })).toBeDisabled();
  await dialog.getByLabel("Type the reviewer name to confirm").fill("Review Admin Client");
  await dialog.getByRole("button", { name: "Delete Permanently" }).click();
  await expect(page.getByText("Review deleted permanently.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Customer Reviews (0)" })).toBeVisible();
  await expect(page.getByText("Review Admin Client")).toHaveCount(0);
});

test("homepage remains readable across required responsive widths", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the viewport matrix once");

  const viewports = [
    { width: 320, height: 760 },
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 900 },
    { width: 1440, height: 1000 }
  ];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto("/");

    const layout = await page.evaluate(() => {
      const labels = [
        "WEB • FINANCE • HUMAN RESOURCES",
        "Explore Our Services",
        "Book a Free Consultation"
      ];
      const elements = labels.map((label) =>
        [...document.querySelectorAll("a, button, span")].find((element) => element.textContent.trim() === label)
      );

      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        clippedLabels: elements.filter(Boolean).filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < -1 || rect.right > window.innerWidth + 1 || element.scrollWidth > element.clientWidth + 1;
        }).length
      };
    });

    expect(layout.scrollWidth, `${viewport.width}px should not overflow horizontally`).toBeLessThanOrEqual(
      layout.clientWidth + 1
    );
    expect(layout.clippedLabels, `${viewport.width}px should not clip key labels`).toBe(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    await page.locator("#home-services").evaluate((element) => element.scrollIntoView({ block: "start" }));
    await page.waitForTimeout(150);
    const clearance = await page.evaluate(() => {
      const header = document.querySelector("header").getBoundingClientRect();
      const section = document.querySelector("#home-services").getBoundingClientRect();
      return { headerBottom: header.bottom, sectionTop: section.top };
    });
    expect(clearance.sectionTop, `${viewport.width}px anchor should clear the sticky header`).toBeGreaterThanOrEqual(
      clearance.headerBottom - 1
    );

    if (viewport.width === 390 || viewport.width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `test-results/homepage-${viewport.width}.png`, fullPage: false });
    }

    await context.close();
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

test("Home requests featured reviews while the full Reviews page includes every approved rating", async ({ page }) => {
  await page.route("**/api/reviews**", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ message: "Thank you. Your review was submitted successfully.", reference: "review-e2e" })
      });
      return;
    }
    const url = new URL(route.request().url());
    const isHomeRequest = url.searchParams.get("featured") === "true";
    if (isHomeRequest) expect(url.searchParams.get("limit")).toBe("4");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        reviews: isHomeRequest ? [{
          id: "approved-featured-review", name: "Verified Client", company: "Example Co.", role: "Owner",
          service: "Web Services", rating: 5, review: "Rapido delivered the agreed work clearly and professionally."
        }] : [{
          id: "approved-low-rating-review", name: "Approved Three Star Client", company: "Example Co.", role: "Owner",
          service: "General Experience", rating: 3, review: "This approved feedback belongs on the complete Reviews page."
        }]
      })
    });
  });

  await page.goto("/");
  await expect(page.getByText("Verified Client", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Your Review" })).toHaveAttribute("href", "/reviews#submit-review");

  await page.goto("/reviews#submit-review");
  await expect(page.getByText("Approved Three Star Client", { exact: true })).toBeVisible();
  await page.getByLabel(/^Name/).fill("Review Test Client");
  await page.getByLabel(/^Email/).fill("reviewer@example.com");
  await page.getByLabel(/^Service/).selectOption("Web Services");
  await page.getByRole("button", { name: "5 stars" }).click();
  await page.getByLabel(/^Your Review/).fill("The service was clear, professional, and delivered as agreed.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit Review" }).click();
  await expect(page.getByText(/review was submitted successfully/i)).toBeVisible();
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

test("about team groups preserve department order and secure LinkedIn actions", async ({ page, isMobile }) => {
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

  if (!isMobile) {
    const operationsCardBox = await groups.nth(3).locator("[data-team-card]").first().boundingBox();
    const designCardBox = await groups.nth(4).locator("[data-team-card]").boundingBox();
    const businessCardBox = await groups.nth(5).locator("[data-team-card]").boundingBox();
    expect(Math.abs(designCardBox.width - operationsCardBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(designCardBox.width - businessCardBox.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(designCardBox.x - operationsCardBox.x)).toBeLessThanOrEqual(1);
  }
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
