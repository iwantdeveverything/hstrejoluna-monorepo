import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════
// Hero — Self-Hosted Video Layer Contract (open gate)
//
// The e2e build runs with NEXT_PUBLIC_HERO_LIQUID="true" (playwright.config.ts
// webServer.env), so the liquid-glass <HeroBackdrop/> mounts live. These specs
// pin the LIVE DOM contract of the video layer:
//   - <video> attrs (autoplay muted loop playsinline preload=none poster aria-hidden)
//   - poster-first: ZERO video media requests before idle, proven by capturing
//     (not running) requestIdleCallback, asserting the negative end-state, then
//     releasing idle and asserting the rendition request fires.
//
// DOM contract (verified): <HeroBackdrop/> (video + canvas + SVG filter) is a
// SIBLING of section#hero, NOT a descendant. All media locators are
// PAGE-scoped (page.locator("video"), never heroSection.locator(...)).
//
// Architecture note: useHeroTier() pins the SSR tier to `static` via a
// hydration sentinel, so the <video> is NOT in the initial HTML — it mounts
// only after client hydration. The zero-media proof therefore uses a captured
// requestIdleCallback against the LIVE DOM, not a server-HTML assertion.
// ═══════════════════════════════════════════════════════════════════════════

const WEBM_OR_MP4 = /\/hero-loop-\d+\.(webm|mp4)(\?.*)?$/;
const DESKTOP = { width: 1440, height: 900 };

/**
 * Install a requestIdleCallback stub BEFORE any app script runs. It CAPTURES
 * the scheduled callbacks into `window.__heroIdleCbs` instead of running them,
 * so the test controls exactly when the video sources are injected. This makes
 * "no media before idle" a deterministic negative end-state rather than a race
 * against the browser's idle scheduler.
 */
async function captureIdle(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __heroIdleCbs: Array<(deadline: IdleDeadline) => void>;
      requestIdleCallback: (cb: (d: IdleDeadline) => void) => number;
      cancelIdleCallback: (h: number) => void;
    };
    w.__heroIdleCbs = [];
    w.requestIdleCallback = (cb) => {
      w.__heroIdleCbs.push(cb);
      return w.__heroIdleCbs.length;
    };
    w.cancelIdleCallback = () => undefined;
  });
}

async function releaseIdle(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const w = window as unknown as {
      __heroIdleCbs: Array<(deadline: IdleDeadline) => void>;
    };
    const deadline = {
      didTimeout: false,
      timeRemaining: () => 50,
    } as IdleDeadline;
    for (const cb of w.__heroIdleCbs) cb(deadline);
    w.__heroIdleCbs = [];
  });
}

test.describe("Hero — Liquid Glass video layer (e2e, open gate)", () => {
  test("video element carries the poster-first attribute contract", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    // Sentinel: a stale server without the gate flag renders the static poster
    // ONLY (no <video>). Failing here means the build is misconfigured — fail
    // loud, not vacuously.
    const video = page.locator("video");
    await expect(video).toHaveCount(1);

    const attrs = await video.evaluate((el: HTMLVideoElement) => ({
      autoplay: el.autoplay,
      muted: el.muted,
      loop: el.loop,
      // Firefox does not reflect the `playsinline` IDL property (returns
      // undefined), so assert on the ATTRIBUTE presence — what the markup
      // contract actually guarantees — for cross-browser parity.
      playsInline: el.hasAttribute("playsinline"),
      preload: el.preload,
      poster: el.poster,
      ariaHidden: el.getAttribute("aria-hidden"),
    }));

    expect(attrs.autoplay).toBe(true);
    expect(attrs.muted).toBe(true);
    expect(attrs.loop).toBe(true);
    expect(attrs.playsInline).toBe(true);
    expect(attrs.preload).toBe("none");
    expect(attrs.poster).toMatch(/\/hero-poster\.jpg$/);
    expect(attrs.ariaHidden).toBe("true");
  });

  test("poster paints with ZERO video media requests before idle, then sources inject", async ({
    page,
    baseURL,
  }) => {
    const mediaRequests: string[] = [];
    page.on("request", (req) => {
      if (WEBM_OR_MP4.test(req.url())) mediaRequests.push(req.url());
    });

    await captureIdle(page);
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    // Hydration sentinel: the <video> mounts post-hydration.
    const video = page.locator("video");
    await expect(video).toHaveCount(1);

    // SSR poster <img> (background LCP candidate) is painted.
    const poster = page.locator('img[aria-hidden="true"]').first();
    await expect(poster).toBeVisible();
    const posterSrc = await poster.getAttribute("src");
    expect(posterSrc).toMatch(/hero-poster/);

    // Negative end-state: idle is captured (not run), so NO <source> children
    // exist and NO video bytes have been requested.
    await expect(video.locator("source")).toHaveCount(0);
    expect(mediaRequests).toHaveLength(0);

    // Wait until the idle callback has actually been scheduled, then release it.
    await page.waitForFunction(() => {
      const w = window as unknown as { __heroIdleCbs?: unknown[] };
      return Array.isArray(w.__heroIdleCbs) && w.__heroIdleCbs.length > 0;
    });
    await releaseIdle(page);

    // After idle: AV1/WebM first then H.264 MP4 are injected as <source> children.
    await expect(video.locator("source")).toHaveCount(2);
    const sources = await video.locator("source").evaluateAll((els) =>
      (els as HTMLSourceElement[]).map((el) => ({
        src: el.getAttribute("src"),
        type: el.getAttribute("type"),
      })),
    );
    // Desktop picks the 1080 rendition; webm precedes mp4.
    expect(sources[0]).toEqual({
      src: "/hero-loop-1080.webm",
      type: "video/webm",
    });
    expect(sources[1]).toEqual({
      src: "/hero-loop-1080.mp4",
      type: "video/mp4",
    });

    // The rendition request fires, same-origin, only after idle release.
    // Assert on the request listener captured at setup (line 102), NOT a fresh
    // page.waitForRequest(): releaseIdle() injects the sources and the autoplay
    // muted <video> begins loading SYNCHRONOUSLY, so the request can fire before
    // a freshly-attached waiter sees it (a guaranteed race → timeout).
    await expect.poll(() => mediaRequests.length).toBeGreaterThan(0);
    const firstMediaReq = mediaRequests[0];
    expect(firstMediaReq.startsWith(baseURL ?? "")).toBe(true);
    expect(firstMediaReq).toContain("/hero-loop-1080.");
  });

  test("h1 and primary CTA are visible over the live backdrop", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    await expect(page.locator("video")).toHaveCount(1);
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(page.getByRole("link", { name: /projects/i })).toBeVisible();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Accessibility (7.5): the hero produces zero axe violations with the glass
  // gate ON. The decorative canvas is excluded (it carries no semantics; its
  // host div is aria-hidden).
  // ═════════════════════════════════════════════════════════════════════════
  test("hero section has zero accessibility violations (gate ON)", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    const heroSection = page.locator('section[aria-labelledby="hero-title"]');
    await expect(heroSection).toBeVisible();

    const analysis = await new AxeBuilder({ page })
      .include('section[aria-labelledby="hero-title"]')
      .exclude("canvas")
      .analyze();

    expect(analysis.violations).toEqual([]);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // LCP: the h1 text wins LCP — the lazy canvas must not displace the text
  // candidate.
  // ═════════════════════════════════════════════════════════════════════════
  test("h1 is the LCP element", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    const h1 = page.locator("#hero-title");
    await expect(h1).toBeVisible();

    const lcpInfo = await page.evaluate(() => {
      const entries = performance.getEntriesByType(
        "largest-contentful-paint",
      ) as PerformanceEntry[];

      if (entries.length === 0)
        return { id: null, tag: null, reason: "no-lcp-entries" };

      const last = entries[entries.length - 1] as PerformanceEntry & {
        element?: { id: string; tagName: string } | null;
      };

      if (!last.element)
        return { id: null, tag: null, reason: "no-element-field" };

      return {
        id: last.element.id || null,
        tag: last.element.tagName.toLowerCase(),
        renderTime:
          (last as { renderTime?: number }).renderTime ?? last.startTime,
      };
    });

    if (
      lcpInfo.reason === "no-element-field" ||
      lcpInfo.reason === "no-lcp-entries"
    ) {
      // Fallback: verify the h1 meets all LCP-candidate conditions.
      const candidate = await h1.evaluate((el) => {
        const failures: string[] = [];
        if (el.tagName.toLowerCase() !== "h1") failures.push("not-h1");
        let ancestor: Element | null = el;
        while (ancestor) {
          if (
            ancestor instanceof HTMLElement &&
            ancestor.getAttribute("aria-hidden") === "true"
          ) {
            failures.push("aria-hidden-ancestor");
            break;
          }
          ancestor = ancestor.parentElement;
        }
        const s = window.getComputedStyle(el);
        if (s.display === "none") failures.push("display-none");
        if (s.visibility === "hidden") failures.push("visibility-hidden");
        if (parseFloat(s.opacity) <= 0) failures.push("opacity-zero");
        if ((el.textContent ?? "").trim().length === 0)
          failures.push("empty-text");
        return { pass: failures.length === 0, failures };
      });
      expect(
        candidate.pass,
        `LCP candidate check failed: ${candidate.failures.join(", ")}`,
      ).toBe(true);
    } else {
      expect(lcpInfo.id).toBe("hero-title");
    }
  });
});
