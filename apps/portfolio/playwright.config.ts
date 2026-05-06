import { defineConfig, devices } from "@playwright/test";
import type { Project } from "@playwright/test";

const port = 4173;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const includeWebkit =
  process.env.CI === "true" || process.env.PLAYWRIGHT_INCLUDE_WEBKIT === "1";

const shard = process.env.PLAYWRIGHT_SHARD
  ? (() => {
      const [current, total] =
        process.env.PLAYWRIGHT_SHARD.split("/").map(Number);
      return { current, total };
    })()
  : undefined;

const projects: Project[] = [
  {
    name: "Desktop Chrome",
    testIgnore: /hero\.memory-leak\.spec\.ts$/,
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "Desktop Firefox",
    testIgnore: /hero\.memory-leak\.spec\.ts$/,
    use: {
      ...devices["Desktop Firefox"],
      launchOptions: {
        firefoxUserPrefs: {
          "webgl.force-enabled": true,
          "webgl.disabled": false,
        },
      },
    },
  },
  {
    name: "Mobile Chrome",
    testIgnore: /hero\.memory-leak\.spec\.ts$/,
    use: { ...devices["Pixel 5"] },
  },
  {
    name: "Desktop Chrome Reduced Motion",
    testMatch: /.*\.reduced-motion\.spec\.ts$/,
    use: { ...devices["Desktop Chrome"], reducedMotion: "reduce" },
  },
  {
    name: "Desktop Chrome Memory Leak",
    testMatch: /hero\.memory-leak\.spec\.ts$/,
    use: { ...devices["Desktop Chrome"] },
  },
];

if (includeWebkit) {
  projects.push(
    {
      name: "Desktop Safari",
      testIgnore: /hero\.memory-leak\.spec\.ts$/,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Safari",
      testIgnore: /hero\.memory-leak\.spec\.ts$/,
      use: { ...devices["iPhone 13"] },
    },
  );
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries:
    process.env.PLAYWRIGHT_RETRIES !== undefined
      ? parseInt(process.env.PLAYWRIGHT_RETRIES, 10)
      : process.env.CI
        ? 2
        : 0,
  workers: undefined,
  shard,
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
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SKIP_BOOT_SEQUENCE: "1",
      NEXT_PUBLIC_HERO_LIQUID: "true",
    },
  },
  projects,
});
