import { defineConfig, devices } from "@playwright/test";

const port = 4173;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const includeWebkit = process.env.CI === "true" || process.env.PLAYWRIGHT_INCLUDE_WEBKIT === "1";

// When PLAYWRIGHT_BASE_URL points at an external deployment (staging / production)
// skip the local webServer entirely — no build step needed.
const isExternalTarget = (() => {
  if (!process.env.PLAYWRIGHT_BASE_URL) return false;
  try {
    const { hostname } = new URL(process.env.PLAYWRIGHT_BASE_URL);
    return hostname !== "127.0.0.1" && hostname !== "localhost";
  } catch {
    return false;
  }
})();

const projects = [
  {
    name: "Desktop Chrome",
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "Desktop Firefox",
    use: { ...devices["Desktop Firefox"] },
  },
  {
    name: "Mobile Chrome",
    use: { ...devices["Pixel 5"] },
  },
];

if (includeWebkit) {
  projects.push(
    {
      name: "Desktop Safari",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    }
  );
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: isExternalTarget
    ? undefined
    : {
        command: `npm run build && npm run start -- --port ${port}`,
        url: baseURL,
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
        env: {
          NEXT_PUBLIC_SKIP_BOOT_SEQUENCE: "1",
        },
      },
  projects,
});
