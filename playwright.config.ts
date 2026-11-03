import { defineConfig, devices } from "@playwright/test";

/** Cross-browser interaction/accessibility suite; failures retain traces and an HTML report. */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: process.env.PLAYWRIGHT_CHANNEL } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"], channel: process.env.PLAYWRIGHT_CHANNEL } },
    { name: "mobile-safari", use: { ...devices["iPhone 13"] } },
  ],
  // Own the test server so an existing dev session cannot silently disable the API checks.
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    env: {
      VITE_BASE_API_URL: "http://127.0.0.1:8080",
      VITE_CONTACT_API_URL: "/api/contact",
      VITE_COUNTRY_ISO2: "DF",
    },
  },
});
