import { expect, test } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════
// Hero — route-away unmount (GPU dispose smoke)
//
// GPU resource disposal itself is verified at UNIT level with spies (design §6:
// Playwright cannot call gc(), so it cannot assert memory is freed). This e2e
// only smoke-checks that tearing down the live WebGL hero (canvas mounted) on a
// route change logs NO console errors during unmount — a crash in dispose,
// a stale rAF, or a detached-context access would surface here.
// ═══════════════════════════════════════════════════════════════════════════

const DESKTOP = { width: 1440, height: 900 };

test("routing away from the live WebGL hero logs no console errors", async ({
  page,
}) => {
  // Third-party analytics (GTM / Meta Pixel) trip a Report-Only CSP directive
  // that Firefox surfaces as a console error on every page. It is environmental
  // noise unrelated to hero teardown, so it is filtered out — we assert only on
  // errors originating from the app's own unmount/dispose path.
  const isAppError = (text: string) =>
    !/Content[- ]Security[- ]Policy|googletagmanager\.com|connect\.facebook\.net|fbevents/.test(
      text,
    );

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && isAppError(msg.text()))
      consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => {
    if (isAppError(err.message)) consoleErrors.push(err.message);
  });

  await page.setViewportSize(DESKTOP);
  await page.goto("/");

  // Mount the full WebGL tier (canvas live) before tearing it down.
  await expect(page.locator("[data-hero-glass-webgl] canvas")).toHaveCount(1, {
    timeout: 30_000,
  });

  // Route away → HeroBackdrop (and the R3F tree) unmounts and disposes.
  await page.goto("/en/privacy");
  await expect(page.locator("video")).toHaveCount(0);
  // Give pending rAF / dispose callbacks a tick to flush.
  await page.waitForTimeout(500);

  expect(
    consoleErrors,
    `console errors during hero unmount:\n${consoleErrors.join("\n")}`,
  ).toEqual([]);
});
