import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const roles = ["Tenants & Buyers", "Owners & Agents", "Builders"];
const headings = [
  "A home search shaped around you.",
  "Tell the story of your space.",
  "Make your project part of the conversation.",
];

test.beforeEach(async ({ page }) => {
  // All API responses are local fixtures. Tests never contact Java or message the business.
  // The trailing wildcard keeps the stub matched when the contact URL carries a query string.
  await page.route("**/api/contact*", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ whatsappPhoneNumber: "8123995310", country: "IN", countryCode: "+91" }),
  }));
  await page.goto("/");
});

test("home has the new brand, one clear heading, and a labelled sample chat", async ({
  page,
}) => {
  await expect(page).toHaveTitle(/MiloBroker/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "No extra app.",
  );
  await expect(
    page.getByLabel("Illustrative WhatsApp conversation with MiloBroker"),
  ).toBeVisible();
  await expect(
    page.getByText("Illustrative chat · Sample property, not a live listing"),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/PropExcel/i);
  await expect(page.locator('img[src*="logo"]')).toHaveCount(0);
});

test("every role reveals its own steps, sample message, CTA and future video state", async ({
  page,
}) => {
  await expect(page.getByRole("tab")).toHaveCount(3);
  for (let index = 0; index < roles.length; index++) {
    const tab = page.getByRole("tab", { name: new RegExp(`^${roles[index]}`) });
    await expect(tab.locator("svg")).toHaveAttribute("aria-hidden", "true");
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const panel = page.getByRole("tabpanel");
    await expect(panel).toHaveCount(1);
    await expect(panel.getByRole("heading", { level: 3 })).toHaveText(
      headings[index],
    );
    await expect(panel.getByRole("listitem")).toHaveCount(3);
    await expect(
      panel.getByText(
        `Video guide for ${roles[index].toLowerCase()} coming soon.`,
        { exact: false },
      ),
    ).toBeVisible();
    const example = await panel.locator("blockquote").innerText();
    const href = await panel.getByRole("link").getAttribute("href");
    const destination = new URL(href!);
    expect(destination.origin).toBe("https://wa.me");
    expect(destination.pathname).toBe("/918123995310");
    expect(destination.searchParams.get("text")).toBe(example);
    await expect(panel.getByRole("link")).toHaveAttribute("target", "_blank");
    await expect(panel.locator("video")).toHaveCount(0);
  }
});

test("tabs support arrow keys, wrapping, Home and End without adding extra tab stops", async ({
  page,
}) => {
  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tabpanel")).toBeFocused();
});

test("mobile menu opens, navigates, closes and returns focus on Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Menu" });
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation).not.toBeVisible();
  await menu.click();
  await expect(
    page.getByRole("button", { name: "Close menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  await navigation.getByRole("link", { name: "How it works" }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(navigation).not.toBeVisible();
  await menu.click();
  await navigation.getByRole("link", { name: "Home", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("FAQs reveal and collapse answers with the keyboard", async ({ page }) => {
  const question = page
    .locator("summary")
    .filter({ hasText: "Do I need to download another app?" });
  const answer = page.getByText("No extra property app is needed to start.", {
    exact: false,
  });
  await expect(answer).not.toBeVisible();
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(answer).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(answer).not.toBeVisible();
});

test("WhatsApp opens the correct destination without sending a message", async ({
  page,
}) => {
  // Intercept the external request. This test never contacts WhatsApp or sends anything.
  await page.context().route("https://wa.me/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<p>WhatsApp destination intercepted for testing</p>",
    }),
  );
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: /^Chat on WhatsApp/ }).first().click(),
  ]);
  await popup.waitForLoadState();
  const url = new URL(popup.url());
  expect(url.pathname).toBe("/918123995310");
  expect(url.searchParams.get("text")).toContain("Hi MiloBroker");
  await popup.close();
});

test("WhatsApp links use the number served by the contact API", async ({
  page,
}) => {
  // Stub the Java contact API with a different national number, then reload:
  // every wa.me link must be rebuilt from the served number, not the fallback.
  await page.route("**/api/contact*", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        whatsappPhoneNumber: "1234567890",
        country: "IN",
        countryCode: "+91",
      }),
    }),
  );
  await page.reload();
  const chatLink = page
    .getByRole("link", { name: /Chat on WhatsApp/ })
    .first();
  await expect(chatLink).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/911234567890\?text=/,
  );
  // Every service, role link, QR link and fallback instruction must agree.
  for (const link of await page.locator('a[href^="https://wa.me/"]').all()) {
    await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/911234567890\?text=/);
  }
  for (const role of roles) {
    await page.getByRole("tab", { name: new RegExp(`^${role}`) }).click();
    await expect(page.getByRole("tabpanel").getByRole("link")).toHaveAttribute("href", /^https:\/\/wa\.me\/911234567890\?text=/);
  }
  const help = page.locator("details").filter({ hasText: "What if WhatsApp does not open?" });
  await help.locator("summary").click();
  await expect(help).toContainText("+911234567890");
  await expect(page.locator('img[alt*="QR code"]')).toHaveAttribute("src", /^data:image\/png;base64,/);
});

/** The country selector travels as a query string appended at request time, not baked into the endpoint. */
test("contact request appends the countryIso2 query dynamically", async ({ page }) => {
  let requestedIso = "";
  await page.route("**/api/contact*", (route) => {
    requestedIso = new URL(route.request().url()).searchParams.get("countryIso2") ?? "";
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ whatsappPhoneNumber: "8123995310", country: "IN", countryCode: "+91" }),
    });
  });
  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(requestedIso).toBe("DF");
});

for (const [name, body] of [
  ["missing fields", {}],
  ["invalid number", { whatsappPhoneNumber: "8123<script>", countryCode: "+91" }],
  ["missing country code", { whatsappPhoneNumber: "8123995310", country: "IN" }],
  ["invalid country code", { whatsappPhoneNumber: "8123995310", countryCode: "javascript:" }],
  ["too many digits", { whatsappPhoneNumber: "12345678901234", countryCode: "+123" }],
  ["null response", null],
] as const) {
  test(`contact uses fallback for ${name}`, async ({ page }) => {
    await page.route("**/api/contact*", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(body) }));
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#home a[href^='https://wa.me/']")).toHaveAttribute("href", /^https:\/\/wa\.me\/918123995310\?text=/);
  });
}

test("contact keeps the fallback after an offline API, HTTP error or invalid JSON", async ({ page }) => {
  for (const mode of ["offline", "error", "json"]) {
    await page.route("**/api/contact*", (route) => mode === "offline"
      ? route.abort()
      : route.fulfill({ status: mode === "error" ? 503 : 200, contentType: "application/json", body: "not JSON" }));
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#home a[href^='https://wa.me/']")).toHaveAttribute("href", /^https:\/\/wa\.me\/918123995310\?text=/);
  }
});

test("slow API is aborted while the fallback links remain usable", async ({ page }) => {
  await page.route("**/api/contact*", () => { /* Hold the response until the client cancels it. */ });
  const started = Date.now();
  const aborted = page.waitForEvent("requestfailed", { predicate: (request) => request.url().includes("/api/contact") && Date.now() - started >= 4500, timeout: 10_000 });
  await page.reload();
  await expect(page.locator("#home a[href^='https://wa.me/']")).toHaveAttribute("href", /^https:\/\/wa\.me\/918123995310\?text=/);
  await aborted;
});

test("carousel selection works with keyboard and reduced motion without extra tab roles", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const carousel = page.getByRole("region", { name: "MiloBroker audience conversations" });
  for (const role of ["Owners & Agents", "Tenants & Buyers", "Builders"]) {
    const button = carousel.getByRole("button", { name: `Show ${role} conversation` });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-current", "true");
    await expect(carousel.getByRole("group", { name: role, exact: true }).getByRole("img")).toBeVisible();
  }
  await expect(page.getByRole("tab")).toHaveCount(3);
  await expect(carousel.getByRole("button", { name: /slideshow/ })).toHaveCount(0);
});

test("carousel pause stops rotation and swiping changes the sample", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await page.clock.install();
  const carousel = page.getByRole("region", { name: "MiloBroker audience conversations" });
  // Enter pauses the slideshow; explicit Play resumes it without a mouse click.
  const pause = carousel.getByRole("button", { name: "Pause slideshow" });
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect(carousel.getByRole("button", { name: "Play slideshow" })).toBeVisible();
  const owner = carousel.getByRole("button", { name: "Show Owners & Agents conversation" });
  await page.clock.fastForward(4500);
  await expect(owner).toHaveAttribute("aria-current", "true");
  await page.keyboard.press("Enter");
  await page.clock.fastForward(4500);
  await expect(carousel.getByRole("button", { name: "Show Tenants & Buyers conversation" })).toHaveAttribute("aria-current", "true");
  await owner.click();
  const preview = carousel.getByLabel("Illustrative WhatsApp conversation with MiloBroker");
  await preview.scrollIntoViewIfNeeded();
  const box = await preview.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + box!.width * 0.8;
  const y = box!.y + box!.height * 0.5;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 90, y, { steps: 6 });
  await page.mouse.up();
  await expect(carousel.getByRole("button", { name: "Show Tenants & Buyers conversation" })).toHaveAttribute("aria-current", "true");
});

test("layouts reflow without page overflow across phone, tablet and desktop widths", async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const width of [320, 360, 390, 650, 768, 850, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const role of roles) {
      await page.getByRole("tab", { name: new RegExp(`^${role}`) }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${width}px, ${role}: no page overflow`,
      ).toBeTruthy();
    }
  }
});

test("page is usable with reduced motion and a skip link", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});

test("no serious accessibility violations across every role and expanded FAQ", async ({
  page,
}) => {
  for (const role of roles) {
    await page.getByRole("tab", { name: new RegExp(`^${role}`) }).click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations, `${role} accessibility`).toEqual([]);
  }
  await page.locator("summary").first().click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("page loads with no JavaScript errors or external image dependencies", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await page.getByRole("tab", { name: /^Builders/ }).click();
  expect(errors).toEqual([]);
  await expect(page.locator('img[src^="http"]')).toHaveCount(0);
});

/** Guards readable text at mobile/desktop sizes and confirms styling/icons stay on the local origin. */
test("readable typography and locally bundled styling", async ({ page }) => {
  const externalAssets: string[] = [];
  page.on("request", (request) => {
    if (
      ["stylesheet", "script", "font", "image"].includes(
        request.resourceType(),
      ) &&
      new URL(request.url()).origin !== new URL(page.url()).origin
    ) {
      externalAssets.push(request.url());
    }
  });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    // The three combined roles must fit together; do not hide a category beyond a mobile scroller.
    await page.getByRole("tablist").scrollIntoViewIfNeeded();
    for (const tab of await page.getByRole("tab").all()) {
      await expect(tab).toBeInViewport({ ratio: 1 });
    }
    const sizes = await page.evaluate(() => {
      const size = (selector: string) =>
        parseFloat(
          getComputedStyle(document.querySelector(selector)!).fontSize,
        );
      return {
        heading: size("h1"),
        section: Math.min(
          ...Array.from(document.querySelectorAll("h2"), (element) =>
            parseFloat(getComputedStyle(element).fontSize),
          ),
        ),
        subheading: size("h3"),
        body: size("[role=tabpanel]:not([hidden]) li p"),
        footer: size("footer > div:last-child p"),
        tab: size("[role=tab]"),
      };
    });
    expect(sizes.heading).toBeGreaterThanOrEqual(40);
    expect(sizes.section).toBeGreaterThanOrEqual(32);
    expect(sizes.subheading).toBeGreaterThanOrEqual(24);
    expect(sizes.body).toBeGreaterThanOrEqual(16);
    expect(sizes.footer).toBeGreaterThanOrEqual(14);
    expect(sizes.tab).toBeGreaterThanOrEqual(16);
  }
  expect(externalAssets).toEqual([]);
});

/** The welcome explains the product without pricing badges; PG support and fee information remain discoverable. */
test("gentle welcome highlights WhatsApp and PGs without pricing badges", async ({
  page,
}) => {
  const hero = page.locator("#home");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
    "No extra app.Just WhatsApp.",
  );
  await expect(
    hero.getByText("Post · Search · Promote", { exact: true }).first(),
  ).toBeVisible();
  for (const id of ["home", "about", "how-it-works"]) {
    await expect(page.locator(`#${id}`)).not.toContainText(
      /paid|premium|free posting|subscription|search fee/i,
    );
  }
  await expect(page.locator("body")).not.toContainText(
    "ONE PLATFORM. THREE POSSIBILITIES.",
  );
  await expect(page.locator("body")).not.toContainText(
    "A place for every property goal.",
  );
  const services = page.locator("#about");
  await expect(services.getByRole("article")).toHaveCount(3);
  await expect(
    services.getByText(/Have a home, room or PG accommodation/),
  ).toBeVisible();
  const postLink = services.getByRole("link", { name: /^Post your space/ });
  expect(
    new URL((await postLink.getAttribute("href"))!).searchParams.get("text"),
  ).toContain("property or PG room");
  await page.getByRole("tab", { name: /^Owners & Agents/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText("PG operators");
  await expect(page.getByRole("tabpanel")).toContainText("sharing options");
  await page.getByRole("tab", { name: /^Tenants & Buyers/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText("PG room");
  const pgFaq = page
    .locator("details")
    .filter({ hasText: "Can I post a property or PG room?" });
  await pgFaq.locator("summary").click();
  await expect(pgFaq).toContainText("PG (paying guest) accommodation");
  const charges = page
    .locator("details")
    .filter({ hasText: "Are there any service charges?" });
  await expect(charges.locator("p")).not.toBeVisible();
  await charges.locator("summary").click();
  await expect(charges).toContainText(
    "Property search is a paid service for tenants and buyers.",
  );
});

test("disclaimer explains MiloBroker's platform role before the legal footer", async ({
  page,
}) => {
  const disclaimer = page.getByRole("complementary", { name: "Disclaimer" });
  await expect(disclaimer).toContainText(
    "not a party to transactions discussed between users",
  );
  await expect(disclaimer).toContainText(
    "verify all information",
  );
  await expect(page.locator("footer")).toContainText(
    "Maven RealtyxAI (OPC) Pvt Ltd.",
  );
});
