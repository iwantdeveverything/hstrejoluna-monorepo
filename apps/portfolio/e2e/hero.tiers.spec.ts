import { expect, test } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════
// Hero — Three-Tier Capability Gate (live DOM)
//
// useHeroTier() decision order (gate ON in the e2e build):
//   viewport < 1024px  → css-only  → [data-hero-glass-css] + filter#hero-refraction,
//                                     NO [data-hero-glass-webgl] canvas
//   viewport ≥ 1024px + WebGL2 → css+webgl → [data-hero-glass-webgl] canvas mounts
//                                             (after the video emits `canplay`)
//
// The ?forceWebGL backdoor was removed by design (spec: "MUST NOT exist") — it
// has NO effect on a sub-1024 viewport.
//
// DOM contract: the backdrop is a SIBLING of section#hero, so every locator is
// PAGE-scoped. Tier selection is viewport-driven, so we force the viewport
// explicitly rather than relying on project defaults.
// ═══════════════════════════════════════════════════════════════════════════

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

test.describe("Hero — capability tiers", () => {
  test("sub-1024 viewport → css-only: SVG refraction filter, no WebGL canvas", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    // Sentinel: a stale no-flag build renders the static poster only (no video).
    const video = page.locator("video");
    await expect(video).toHaveCount(1);

    // css-only tier markers.
    await expect(page.locator("[data-hero-glass-css]")).toHaveCount(1);
    await expect(page.locator("filter#hero-refraction")).toHaveCount(1);
    // The filter is applied to the wrapper that holds the video.
    await expect(page.locator("[data-hero-refraction-target]")).toHaveCount(1);

    // The WebGL tier MUST NOT mount below 1024px.
    await expect(page.locator("[data-hero-glass-webgl]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("desktop ≥1024 + WebGL2 → css+webgl: canvas mounts after video ready", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    const video = page.locator("video");
    await expect(video).toHaveCount(1);

    // The canvas mounts only after the <video> emits `canplay` (HeroBackdrop
    // gates setVideoEl on onVideoReady). The real asset is 1.9–3.3 MB, so the
    // load + canplay can take a moment — use a generous timeout.
    await expect(page.locator("[data-hero-glass-webgl] canvas")).toHaveCount(
      1,
      { timeout: 30_000 },
    );
  });

  test("?forceWebGL=true on a sub-1024 viewport has NO effect — still no canvas", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/?forceWebGL=true");

    await expect(page.locator("video")).toHaveCount(1);
    // The removed backdoor cannot promote the tier.
    await expect(page.locator("[data-hero-glass-webgl]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  // Kill-switch smoke: only runs against a separate STATIC build (gate OFF),
  // opted-in via HERO_KILLSWITCH_SMOKE=1. The default e2e build has the flag ON,
  // so this is skipped there. With the flag off, no video/canvas ships at all.
  test("kill switch off → static poster only (no glass)", async ({ page }) => {
    test.skip(
      process.env.HERO_KILLSWITCH_SMOKE !== "1",
      "Requires a static build with NEXT_PUBLIC_HERO_LIQUID off (HERO_KILLSWITCH_SMOKE=1)",
    );

    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-hero-glass-css]")).toHaveCount(0);

    // The SSR poster + semantic shell still render.
    await expect(
      page.locator('img[aria-hidden="true"]').first(),
    ).toBeVisible();
    await expect(page.locator("#hero-title")).toBeVisible();
  });
});
