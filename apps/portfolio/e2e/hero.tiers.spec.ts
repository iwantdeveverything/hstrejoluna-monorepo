import { expect, test } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════
// Hero — Three-Tier Capability Gate (live DOM)
//
// The DEFAULT e2e build runs with NEXT_PUBLIC_HERO_LIQUID="true" (video mounts)
// and NEXT_PUBLIC_HERO_REFRACTION UNSET (refraction OFF — the product default,
// design #765). So every non-static tier renders the RAW <video> with NO
// refraction glass:
//   viewport < 1024px  → css-only capability → raw video, NO [data-hero-glass-css],
//                         NO filter#hero-refraction, NO [data-hero-refraction-target]
//   viewport ≥ 1024px + WebGL2 → css+webgl capability → raw video, NO canvas
//
// useHeroTier() still detects the SAME capability tiers; only the PRESENTATION
// (refract vs raw) is flag-gated inside HeroBackdrop. The refraction-on markers
// are asserted by the env-gated HERO_REFRACTION_SMOKE lane (a separate build
// with NEXT_PUBLIC_HERO_REFRACTION=true).
//
// The ?forceWebGL backdoor was removed by design (spec: "MUST NOT exist").
//
// DOM contract: the backdrop is a SIBLING of section#hero, so every locator is
// PAGE-scoped. Tier selection is viewport-driven, so we force the viewport
// explicitly rather than relying on project defaults.
// ═══════════════════════════════════════════════════════════════════════════

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

const REFRACTION_ON = process.env.HERO_REFRACTION_SMOKE === "1";

test.describe("Hero — capability tiers (refraction OFF default)", () => {
  test.skip(
    REFRACTION_ON,
    "Default lane asserts refraction OFF; skipped when HERO_REFRACTION_SMOKE=1",
  );

  test("sub-1024 viewport → css-only capability: raw video, NO refraction glass", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    // Sentinel: a stale no-flag build renders the static poster only (no video).
    const video = page.locator("video");
    await expect(video).toHaveCount(1);

    // Refraction OFF: none of the SVG-refraction markers are present.
    await expect(page.locator("[data-hero-glass-css]")).toHaveCount(0);
    await expect(page.locator("filter#hero-refraction")).toHaveCount(0);
    await expect(page.locator("[data-hero-refraction-target]")).toHaveCount(0);

    // The WebGL tier MUST NOT mount below 1024px (and refraction is off anyway).
    await expect(page.locator("[data-hero-glass-webgl]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("desktop ≥1024 + WebGL2 → css+webgl capability: raw video, NO canvas", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    const video = page.locator("video");
    await expect(video).toHaveCount(1);

    // Refraction OFF: the WebGL canvas never mounts even at the css+webgl tier.
    await expect(page.locator("[data-hero-glass-webgl]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-hero-glass-css]")).toHaveCount(0);
    await expect(page.locator("filter#hero-refraction")).toHaveCount(0);
  });

  test("?forceWebGL=true on a sub-1024 viewport has NO effect — still no canvas", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/?forceWebGL=true");

    await expect(page.locator("video")).toHaveCount(1);
    // The removed backdoor cannot promote the tier; refraction is off regardless.
    await expect(page.locator("[data-hero-glass-webgl]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  // Kill-switch smoke: only runs against a separate build (gate OFF),
  // opted-in via HERO_KILLSWITCH_SMOKE=1. The default e2e build has the liquid
  // flag ON, so this is skipped there. With the liquid flag off, the video
  // plays raw (no glass/refraction/canvas).
  test("kill switch off → raw video plays, but no glass/canvas", async ({
    page,
  }) => {
    test.skip(
      process.env.HERO_KILLSWITCH_SMOKE !== "1",
      "Requires a build with NEXT_PUBLIC_HERO_LIQUID off (HERO_KILLSWITCH_SMOKE=1)",
    );

    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    await expect(page.locator("video")).toHaveCount(1);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-hero-glass-css]")).toHaveCount(0);

    // The SSR poster + semantic shell still render.
    await expect(page.locator('img[aria-hidden="true"]').first()).toBeVisible();
    await expect(page.locator("#hero-title")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Refraction-ON smoke lane (env-gated). Runs ONLY against a build made with
// NEXT_PUBLIC_HERO_REFRACTION=true, opted-in via HERO_REFRACTION_SMOKE=1. Proves
// the refraction path is still reachable (design rollback): css-only wraps
// HeroGlassCss (SVG filter) and css+webgl mounts the WebGL canvas after the
// video is ready. Skipped in the default (refraction-off) lane.
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Hero — capability tiers (refraction ON smoke)", () => {
  test.skip(
    !REFRACTION_ON,
    "Requires a refraction-on build (HERO_REFRACTION_SMOKE=1 + NEXT_PUBLIC_HERO_REFRACTION=true)",
  );

  test("sub-1024 → css-only: SVG refraction filter mounts, no WebGL canvas", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    await expect(page.locator("video")).toHaveCount(1);
    await expect(page.locator("[data-hero-glass-css]")).toHaveCount(1);
    await expect(page.locator("filter#hero-refraction")).toHaveCount(1);
    await expect(page.locator("[data-hero-refraction-target]")).toHaveCount(1);
    await expect(page.locator("[data-hero-glass-webgl]")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("desktop ≥1024 + WebGL2 → css+webgl: canvas mounts after video ready", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    await expect(page.locator("video")).toHaveCount(1);
    await expect(page.locator("[data-hero-glass-webgl] canvas")).toHaveCount(
      1,
      { timeout: 30_000 },
    );
  });
});
