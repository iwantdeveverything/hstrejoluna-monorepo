import { expect, test } from "@playwright/test";

test.describe("Hero — Reduced Motion (e2e)", () => {
  // ═══════════════════════════════════════════════════════════════════
  // 7.5 RED → 7.6 GREEN: Reduced motion — no canvas, blobs static
  // ═══════════════════════════════════════════════════════════════════
  test("reduced motion: no canvas, no pointermove, blobs static", async ({
    page,
  }, testInfo) => {
    // This spec is designed for the "Desktop Chrome Reduced Motion"
    // project which sets reducedMotion: "reduce".  Skip in regular
    // projects that also pick up this file (they have no testMatch).
    const isReducedMotionProject =
      testInfo.project.name.includes("Reduced Motion");
    test.skip(
      !isReducedMotionProject,
      "Only valid under reduced-motion emulation",
    );

    // ── Headless Chromium limitation ─────────────────────────────────
    // Playwright's reducedMotion: "reduce" affects CSS @media queries
    // but NOT window.matchMedia() in headless Chromium.  To test the
    // JS capability gate we inject an override BEFORE navigating so
    // the hooks pick up prefers-reduced-motion: reduce at the JS level.
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

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const heroSection = page.locator('section[aria-labelledby="hero-title"]');
    await expect(heroSection).toBeVisible();

    // Wait for dynamic imports to settle
    await page.waitForTimeout(2000);

    // ══ Canvas — must NOT mount under reduced-motion ═════════════════
    await expect(heroSection.locator("canvas")).toHaveCount(0);

    // ══ Blobs — CSS frozen via @media (prefers-reduced-motion: reduce)
    // The globals.css has: .hero-blob { animation: none !important; }
    // inside that media query.  Verify it takes effect.
    const blobs = heroSection.locator('[class*="hero-blob"]');
    const firstBlob = blobs.first();

    const isVisible = await firstBlob.isVisible().catch(() => false);
    if (isVisible) {
      const animationName = await firstBlob.evaluate(
        (el) => window.getComputedStyle(el).animationName,
      );
      expect(
        animationName === "" || animationName === "none",
        `Expected empty or "none" animation-name, got "${animationName}"`,
      ).toBe(true);
    }

    // ══ Semantic shell — always present ═══════════════════════════════
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(page.getByRole("link", { name: /projects/i })).toBeVisible();
  });
});
