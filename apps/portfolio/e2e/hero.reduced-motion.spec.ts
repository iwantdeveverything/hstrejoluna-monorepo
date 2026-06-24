import { expect, test } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════
// Hero — Motion & Data Preference Fallback (reduced motion → static tier)
//
// Under prefers-reduced-motion: reduce, useHeroTier() resolves the `static`
// tier → <HeroBackdrop/> returns null → there is NO <video> element at all
// (not "video with no sources"), NO canvas, and ZERO video media requests can
// fire because nothing schedules them. The SSR poster <img> stays as the
// background. All locators are PAGE-scoped (the backdrop is a section sibling).
// ═══════════════════════════════════════════════════════════════════════════

const WEBM_OR_MP4 = /\/hero-loop-\d+\.(webm|mp4)(\?.*)?$/;

test.describe("Hero — Reduced Motion (e2e)", () => {
  test("reduced motion: static tier — no video, no canvas, zero media requests", async ({
    page,
  }, testInfo) => {
    // Runs under the "Desktop Chrome Reduced Motion" project (reducedMotion:
    // "reduce"). Skip in other projects that also glob this file.
    const isReducedMotionProject =
      testInfo.project.name.includes("Reduced Motion");
    test.skip(
      !isReducedMotionProject,
      "Only valid under reduced-motion emulation",
    );

    // ── Headless Chromium limitation ─────────────────────────────────────────
    // Playwright's reducedMotion: "reduce" drives CSS @media but NOT
    // window.matchMedia() in headless Chromium. useHeroTier → useLiquidGlassGates
    // reads matchMedia at the JS level to decide `static`, so we override
    // matchMedia BEFORE navigation to make the gate see reduce. Without this an
    // upgraded tier may mount a <video> and the "0 video" assertion fails.
    await page.addInitScript(() => {
      const originalMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query: string) => {
        if (query.includes("prefers-reduced-motion")) {
          return {
            matches: true,
            media: query,
            onchange: null,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => true,
          } as MediaQueryList;
        }
        return originalMatchMedia(query);
      };
    });

    const mediaRequests: string[] = [];
    page.on("request", (req) => {
      if (WEBM_OR_MP4.test(req.url())) mediaRequests.push(req.url());
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const heroSection = page.locator('section[aria-labelledby="hero-title"]');
    await expect(heroSection).toBeVisible();

    // Allow hydration + any deferred idle work to settle. If the gate were
    // wrong, this window is enough for a video to mount and request bytes.
    await page.waitForTimeout(2000);

    // Static tier: the backdrop island renders null.
    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(mediaRequests).toHaveLength(0);

    // The SSR poster <img> remains the background.
    const poster = page.locator('img[aria-hidden="true"]').first();
    await expect(poster).toBeVisible();
    expect(await poster.getAttribute("src")).toMatch(/hero-poster/);

    // Semantic shell is always present.
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(page.getByRole("link", { name: /projects/i })).toBeVisible();
  });
});
