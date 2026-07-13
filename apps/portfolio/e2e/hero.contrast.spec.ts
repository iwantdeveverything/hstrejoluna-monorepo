import { expect, test } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════
// Hero — Text contrast over the RAW video (default: refraction OFF, design #765)
//
// Method: pixel sampling of a real screenshot — the only valid measurement.
// A computed-style proxy sees NONE of the composited video + grain overlay.
//
// Refraction is OFF by default (NEXT_PUBLIC_HERO_REFRACTION unset), so the hero
// renders the RAW <video> with NO feDisplacementMap and NO WebGL canvas. The
// contrast guarantee comes from the PURE-CSS .hero-text-scrim (frame- and
// refraction-independent): feDisplacementMap only warped pixels SPATIALLY,
// never changing luminance, so removing it does not raise brightest-frame
// luminance behind the glyphs. We sample the sub-1024 css-only viewport where
// the raw <video> paints directly (no R3F canvas that would upload only NEW
// frames of a seeked-then-paused video → stale/black sample).
//
// Determinism: pause the video FIRST, set currentTime, await `seeked`, then 2
// rAF before the screenshot — seeking a still-playing loop keeps advancing.
//
// Grain (body::before, opacity 0.05 soft-light) is always active and cannot be
// disabled, so it is included in the measurement as required.
//
// Timestamps are pinned against the CURRENT real loop asset (hero-loop-1080,
// 8s placeholder: dark void with drifting ember/copper glows lower-right):
// t=0.4s (brightest early frame) + t=6.0s (darkest late frame). Re-pin both if
// the asset is replaced.
// ═══════════════════════════════════════════════════════════════════════════

const CSS_ONLY_VIEWPORT = { width: 900, height: 1200 }; // < 1024 → css-only tier
const TIMESTAMPS = [0.4, 6.0]; // early frame + late frame (seconds)
const MIN_CONTRAST = 2.5;
// The h1 is white; near-white pixels in the screenshot are text/anti-alias halo.
// Exclude them so we measure the BACKGROUND luminance behind the glyphs.
const TEXT_LUMINANCE_FLOOR = 0.55;
// WCAG contrast is text-vs-its-IMMEDIATE-background. The h1 is a large italic
// multi-line box with empty corners; averaging the whole bbox pulls in the
// asset's bright ember/copper glow that drifts into those text-free corners,
// which no glyph ever sits on. Sample ONLY the background pixels within this
// radius (device px) of a glyph edge — the actual surface the text reads against.
const GLYPH_PROXIMITY_RADIUS = 6;

test.describe("Hero — text contrast over raw video (refraction OFF default)", () => {
  for (const t of TIMESTAMPS) {
    test(`h1 contrast ≥ ${MIN_CONTRAST}:1 at video frame t=${t}s`, async ({
      page,
    }) => {
      await page.setViewportSize(CSS_ONLY_VIEWPORT);
      await page.goto("/");

      // Sentinel: the raw video mounts. Refraction is off by default, so the
      // SVG-refraction target and WebGL canvas must NOT be present.
      const video = page.locator("video");
      await expect(video).toHaveCount(1);
      await expect(page.locator("[data-hero-refraction-target]")).toHaveCount(
        0,
      );
      await expect(page.locator("[data-hero-glass-webgl]")).toHaveCount(0);

      const h1 = page.locator("#hero-title");
      await expect(h1).toBeVisible();

      // Wait for the video to buffer enough to seek (sources inject on idle).
      await page.waitForFunction(
        () => {
          const v = document.querySelector("video");
          return !!v && v.readyState >= 2 && v.duration > 0;
        },
        undefined,
        { timeout: 30_000 },
      );

      // Deterministic seek: pause → set time → await seeked → 2 rAF.
      await video.evaluate(async (el: HTMLVideoElement, time: number) => {
        el.pause();
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            el.removeEventListener("seeked", onSeeked);
            resolve();
          };
          el.addEventListener("seeked", onSeeked);
          el.currentTime = Math.min(time, Math.max(0, el.duration - 0.05));
        });
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }, t);

      // Screenshot the composited h1 region (raw video + grain + scrim + text).
      const shot = await h1.screenshot();
      const dataUrl = `data:image/png;base64,${shot.toString("base64")}`;

      // Decode + measure entirely in-browser (no PNG dependency needed).
      const result = await page.evaluate(
        async ({ url, textFloor, radius }) => {
          function srgbToLinear(c: number): number {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          }
          function luminance(r: number, g: number, b: number): number {
            return (
              0.2126 * srgbToLinear(r) +
              0.7152 * srgbToLinear(g) +
              0.0722 * srgbToLinear(b)
            );
          }

          const img = new Image();
          img.src = url;
          await img.decode();

          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return { ok: false as const, reason: "no-2d-context" };
          ctx.drawImage(img, 0, 0);
          const w = canvas.width;
          const h = canvas.height;
          const { data } = ctx.getImageData(0, 0, w, h);

          // Pass 1: classify each pixel as text (near-white glyph) or background.
          const isText = new Uint8Array(w * h);
          for (let p = 0; p < w * h; p += 1) {
            const i = p * 4;
            if (luminance(data[i], data[i + 1], data[i + 2]) >= textFloor) {
              isText[p] = 1;
            }
          }

          // Pass 2: average ONLY background pixels lying within `radius` of a
          // text pixel — the surface the glyphs actually read against. This is
          // the WCAG-faithful local background, not the whole-bbox average that
          // would fold in the asset's bright glow sitting in empty box corners.
          let sum = 0;
          let count = 0;
          for (let y = 0; y < h; y += 1) {
            for (let x = 0; x < w; x += 1) {
              const p = y * w + x;
              if (isText[p]) continue;
              let nearText = false;
              for (let dy = -radius; dy <= radius && !nearText; dy += 1) {
                const ny = y + dy;
                if (ny < 0 || ny >= h) continue;
                for (let dx = -radius; dx <= radius; dx += 1) {
                  const nx = x + dx;
                  if (nx < 0 || nx >= w) continue;
                  if (isText[ny * w + nx]) {
                    nearText = true;
                    break;
                  }
                }
              }
              if (!nearText) continue;
              const i = p * 4;
              sum += luminance(data[i], data[i + 1], data[i + 2]);
              count += 1;
            }
          }
          if (count === 0)
            return { ok: false as const, reason: "no-glyph-adjacent-background" };

          const bgLuminance = sum / count;
          // h1 text is white (#fff) → luminance 1.0.
          const textLuminance = 1.0;
          const lighter = Math.max(textLuminance, bgLuminance);
          const darker = Math.min(textLuminance, bgLuminance);
          const ratio = (lighter + 0.05) / (darker + 0.05);
          return {
            ok: true as const,
            ratio,
            bgLuminance,
            sampleCount: count,
          };
        },
        {
          url: dataUrl,
          textFloor: TEXT_LUMINANCE_FLOOR,
          radius: GLYPH_PROXIMITY_RADIUS,
        },
      );

      expect(result.ok, `pixel sampling failed: ${JSON.stringify(result)}`).toBe(
        true,
      );
      if (result.ok) {
        expect(
          result.ratio,
          `contrast ${result.ratio.toFixed(2)}:1 (bg L=${result.bgLuminance.toFixed(
            4,
          )}, ${result.sampleCount} bg px) at t=${t}s`,
        ).toBeGreaterThanOrEqual(MIN_CONTRAST);
      }
    });
  }
});
