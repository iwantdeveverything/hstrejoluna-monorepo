## Exploration: fix-flaky-e2e-tests

### Current State

The portfolio app has 4 Playwright E2E test suites (`hero.spec.ts`, `navigation.behavior.spec.ts`, `grid-expansion.behavior.spec.ts`, `accessibility-hardening.spec.ts`) that run in CI via `qa-professional.yml`. The CI config uses `fullyParallel: true` with `workers: 2` and runs 4–6 browser projects (Desktop Chrome, Desktop Firefox, Mobile Chrome, Desktop Safari, Mobile Safari, and Desktop Chrome Reduced Motion). Three of these tests fail intermittently, blocking PR merges.

The architecture involves several async layers relevant to flakiness:

- **Dynamic WebGL import**: `HeroLiquidWebGL` is loaded via `next/dynamic({ ssr: false })`, gated by `useLiquidHeroCapability()` which checks WebGL2 support, hardware concurrency, viewport width, and `matchMedia` queries.
- **Scroll-driven nav state**: `useActiveSection` uses an `IntersectionObserver` (threshold 0.4) to determine which section is centered in the viewport, updating `aria-current` on nav buttons.
- **Framer Motion `AnimatePresence`**: Expansion panels in Projects/Experience/Skills use `AnimatePresence` with `m.div layout` for enter/exit animations, which can detach DOM nodes during transitions.

### Affected Areas

- `apps/portfolio/e2e/hero.spec.ts` — Lines 42–54: Axe a11y test (`toEqual([])`) and Canvas visibility test (`toBeVisible` on Firefox)
- `apps/portfolio/e2e/navigation.behavior.spec.ts` — Lines 42–58: "activates certificates" test (`toHaveAttribute("aria-current", "location")`)
- `apps/portfolio/e2e/grid-expansion.behavior.spec.ts` — Lines 35–57: "singular expansion" test (stale element on Safari)
- `apps/portfolio/playwright.config.ts` — workers: 2, retries: 2, webServer env vars, WebKit only in CI
- `.github/workflows/qa-professional.yml` — 45min timeout, single node, no sharding
- `apps/portfolio/hooks/useActiveSection.ts` — IntersectionObserver logic driving `aria-current`
- `apps/portfolio/components/fragments/HeroLiquidField.tsx` — dynamic import + capability gate for WebGL canvas
- `apps/portfolio/components/fragments/ProjectsOverview.tsx` — `AnimatePresence` + `m.div layout` for singular expansion

### Root Cause Analysis Per Failing Test

#### 1. `hero` → Axe accessibility violations (`toEqual` deep equality) — Desktop Chrome, Run 2 only

**Root cause**: The test runs `new AxeBuilder({ page }).include(...)` against the hero section **without waiting for the WebGL canvas to fully render**. When `HeroLiquidWebGLLazy` (dynamic import) mounts, the R3F `<Canvas>` renders a `<canvas>` element and potentially other Three.js DOM artifacts that Axe scans. The canvas itself (`<canvas>` without accessible name) and R3F's internal elements may trigger Axe violations (e.g., `color-contrast` on Three.js-rendered text, `aria-allowed-attr` on custom attributes).

The flakiness pattern "Run 2 only" is explained by Playwright's `retries: 2`. On the first run, the dynamic import may not have completed before Axe runs → passes (empty violations). On the retry, the server is already warm (webServer reuse in some scenarios) OR the browser has cached the chunk → canvas renders faster → Axe catches violations → fails.

**Underlying issue**: The test needs to either (a) wait for the canvas to be present so Axe runs against the fully rendered page, or (b) exclude the canvas from the Axe scan since it's a WebGL surface outside the DOM accessibility tree. Axe-core has a `disableRules` option and `.exclude()` method for this.

#### 2. `hero` → Canvas `toBeVisible` on Desktop Firefox — Both runs

**Root cause**: Headless Firefox in CI uses software rendering (llvmpipe on Ubuntu runners) which has unreliable WebGL2 support. Even though `useLiquidHeroCapability()` calls `probeWebGL2()` which creates a temporary canvas and checks `getContext("webgl2")`, there's a gap:

1. `probeWebGL2()` creates a **2D canvas** and checks if WebGL2 context is available → may return `true` in headless Firefox
2. `HeroLiquidWebGL` uses R3F's `<Canvas>` which requires a **real WebGL rendering context** with specific extensions
3. The R3F Canvas may fail to initialize, render an empty canvas, or not render a canvas at all

The capability gate says "go ahead" but R3F fails silently. This isn't truly flaky — it's a **consistent Firefox-specific bug** (fails both runs), but it's classified as flaky because it depends on the CI runner's graphics stack.

**Underlying issue**: The capability probe needs to be more robust for headless environments, OR Firefox should be excluded from this specific test, OR the test should use `waitFor` with a longer timeout and handle the "canvas never appears" case gracefully (skip instead of fail).

#### 3. `navigation.behavior` → "activates certificates" `toHaveAttribute` — Desktop Chrome, Both runs

**Root cause**: The test clicks the certificates nav button and immediately checks `aria-current="location"`. The `aria-current` attribute is not set synchronously by the click handler — it's set by `useActiveSection`'s `IntersectionObserver`, which fires only AFTER:

1. `scrollIntoView({ behavior: "smooth" })` completes the scroll animation (~300–500ms in headless Chrome)
2. The certificates `<section>` intersects the centered viewport band (0.4 threshold with rootMargin)
3. React re-renders with the new `activeId`

Playwright's `toHaveAttribute` assertion has auto-retry with a default 5s timeout on `expect`. However, `useActiveSection` uses **`threshold: 0` on the IntersectionObserver** (line 22 of the hook) combined with a rootMargin calculated from the 0.4 threshold. The actual visibility check happens in the callback via manual `isIntersecting` check. The `scrollIntoView` with `behavior: "smooth"` sometimes doesn't fire the observer callback in headless Chrome because the scroll is instant (smooth scroll is emulated to instant), but the observer may fire before the scroll target is actually in position.

Additionally, the `streamSectionIds` array starts with `"hero"`, which is always visible at the top. If the certificates section is tall enough that it overlaps with the hero section in the centered viewport band, the observer might pick "hero" instead.

**Underlying issue**: Missing explicit wait between click and assertion. Need `page.waitForTimeout(500)` or `expect.poll()` with a longer retry, or check URL hash (`#certificates`) as a more deterministic signal.

#### 4. `grid-expansion.behavior` → Singular expansion "Element not attached to DOM" — Desktop Safari, Run 1 only

**Root cause**: `ProjectsOverview.tsx` wraps expansion panels in `AnimatePresence` with `m.div layout` from Framer Motion. When clicking the second project button:

1. `toggleProject(second)` fires → `setExpandedId(second)`
2. React schedules re-render
3. `AnimatePresence` detects the first panel exiting → starts exit animation on first panel
4. `AnimatePresence` detects the second panel entering → starts enter animation
5. Framer Motion's `layout` animation repositions DOM nodes

On Safari/WebKit, the exit animation can **detach the first panel's DOM node** (remove from parent) before the layout animation for the second panel completes. Playwright's locator `first` (captured via `projectButtons.nth(0)`) is a reference that becomes **stale** — the underlying DOM element was removed and possibly re-created.

The "Run 1 only" pattern suggests timing variance: on the first run, the browser is cold and animations take longer, increasing the window where DOM detachment occurs. On retry, the JIT is warm and animations finish faster, reducing the window.

**Underlying issue**: The test captures element references before triggering DOM-mutating animations. It needs to re-query the locator after the click, or use `page.waitForTimeout()` to let the animation settle, or use `expect(locator).toBeAttached()` before asserting attributes.

### Patterns Identified

1. **Missing async waits after actions**: All 4 tests perform an action (navigate, click) and immediately assert on state that takes time to settle (scroll completion, dynamic import, animation, observer callback). Tests 3 and 4 lack any explicit `waitForTimeout` or `expect.poll()`.

2. **Dynamic import timing variance**: The WebGL canvas test (test 2) and Axe test (test 1) are affected by the timing of `next/dynamic` chunk loading + R3F Canvas initialization. This is inherently non-deterministic.

3. **DOM detachment during layout animations**: Framer Motion's `layout` + `AnimatePresence` causes DOM nodes to be removed/re-added during transitions. Safari handles this differently than Chromium, causing stale element references.

4. **CI resource constraints**: `workers: 2` for 4+ browser projects means tests queue up. A test in one project might be waiting for a worker while another has a WebGL context timeout, creating cascading failures that look flaky but are contention issues.

5. **Headless browser quirks**:
   - Firefox: WebGL2 probe passes but R3F fails to create a rendering context
   - Chrome: `performance.getEntriesByType("largest-contentful-paint")` sometimes omits the `element` field (already handled in the LCP test with a fallback)
   - Safari (WebKit): Only runs in CI, not locally, so failures are discovered late

### Recommended Fixes

#### Fix 1: Stabilize Axe a11y test (Test 1)

**Approach A**: Wait for canvas before running Axe, then exclude it from scan.

```typescript
// Wait for canvas to appear (if capability gates allow it)
const canvas = heroSection.locator("canvas");
await canvas.waitFor({ state: "attached", timeout: 5000 }).catch(() => {});
// Exclude canvas from a11y scan (it's a WebGL surface, not DOM a11y)
const analysis = await new AxeBuilder({ page })
  .include('section[aria-labelledby="hero-title"]')
  .exclude("canvas")
  .analyze();
```

- **Pros**: Deterministic — canvas is always excluded regardless of load timing
- **Cons**: Misses a11y issues that could appear if canvas has DOM fallback content
- **Effort**: Low

**Approach B**: Use `expect.poll()` with retry instead of one-shot `toEqual`.

```typescript
await expect
  .poll(
    async () => {
      const analysis = await new AxeBuilder({ page })
        .include('section[aria-labelledby="hero-title"]')
        .analyze();
      return analysis.violations.length;
    },
    { timeout: 10_000, intervals: [1000, 2000, 3000] },
  )
  .toBe(0);
```

- **Pros**: Handles timing variance naturally
- **Cons**: Multiple Axe scans are expensive; doesn't fix the root cause if the canvas itself has violations
- **Effort**: Low

**Recommendation**: **Approach A** — exclude the canvas element from the hero a11y scan. The canvas is a WebGL rendering surface, not part of the DOM accessibility tree. The semantic content (h1, links, buttons) is what matters. This is the correct pattern for testing pages with WebGL overlays.

#### Fix 2: Handle Firefox WebGL failures (Test 2)

**Approach A**: Skip the canvas visibility test on Firefox with a descriptive message.

```typescript
test.skip(
  browserName === "firefox",
  "Headless Firefox WebGL2 rendering is unreliable in CI",
);
```

- **Pros**: Simple, zero false positives
- **Cons**: Loses coverage on Firefox (but we already cover Chrome + Safari)
- **Effort**: Low

**Approach B**: Add a `data-testid="r3f-canvas"` check (already present in `HeroLiquidWebGL.tsx` line 151!) and use a longer timeout with graceful skip.

```typescript
const canvas = heroSection.locator('[data-testid="r3f-canvas"] canvas');
const isVisible = await canvas.isVisible({ timeout: 10000 }).catch(() => false);
if (browserName === "firefox" && !isVisible) {
  test.skip(true, "Firefox WebGL context creation failed");
}
expect(isVisible).toBe(true);
```

- **Pros**: Keeps coverage when it works, skips only when it doesn't
- **Cons**: More complex; `data-testid="r3f-canvas"` exists on line 151 but is on the Canvas wrapper, not on `<canvas>` itself
- **Effort**: Medium

**Recommendation**: **Approach A** for immediate fix — skip Firefox for the WebGL canvas test. Firefox headless WebGL is a known Playwright limitation. Then open a follow-up issue to investigate enabling Firefox with `--use-gl=swiftshader` or equivalent flags. The `data-testid="r3f-canvas"` exists on the R3F Canvas wrapper div (line 151 of `HeroLiquidWebGL.tsx`), so the test could alternatively check for that wrapper instead of `canvas` directly.

#### Fix 3: Fix navigation `aria-current` race condition (Test 3)

**Approach A**: Wait for URL hash change as a deterministic signal, then use `expect.poll()`.

```typescript
await certificatesNavLink.click();
// Wait for scroll to complete via URL hash
await expect(page).toHaveURL(/#certificates$/);
// Now check aria-current via poll (observer may still be settling)
await expect
  .poll(() => certificatesNavLink.getAttribute("aria-current"), {
    timeout: 10_000,
  })
  .toBe("location");
```

- **Pros**: URL hash is deterministic (set synchronously by `scrollToSection` via `replaceState`)
- **Cons**: The hash updates immediately, but the observer still needs time; coupling to URL hash for nav state
- **Effort**: Low

**Approach B**: Replace the `scrollToSection` with a direct `page.evaluate` that scrolls AND waits for the observer to fire via a custom event.

```typescript
await page.evaluate((id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
}, "certificates");
await page.waitForTimeout(1000); // Let observer fire
```

- **Pros**: More control over scroll behavior
- **Cons**: brittle timeout; observers may not fire in exactly 1s
- **Effort**: Medium

**Recommendation**: **Approach A** — wait for URL hash first, then use `expect.poll()` with a 10s timeout. This gives the observer enough time to fire while being resilient to timing variance. The `scrollIntoView` could also be switched to `behavior: "auto"` (instant) in the test environment by detecting `NEXT_PUBLIC_SKIP_BOOT_SEQUENCE` or similar.

#### Fix 4: Fix Safari stale element in singular expansion (Test 4)

**Approach A**: Re-query locators after every DOM-mutating action.

```typescript
await first.click();
await expect(projectButtons.nth(0)).toHaveAttribute("aria-expanded", "true");
// ...
await second.click();
// Re-query first — don't reuse the stale reference
await expect(projectButtons.nth(0)).toHaveAttribute("aria-expanded", "false");
await expect(projectButtons.nth(1)).toHaveAttribute("aria-expanded", "true");
```

- **Pros**: Eliminates stale element references entirely
- **Cons**: Slightly more verbose; doesn't address the underlying animation timing
- **Effort**: Low

**Approach B**: Add `waitForTimeout` after the click to let Framer Motion exit animation complete.

```typescript
await second.click();
await page.waitForTimeout(500); // Let AnimatePresence exit animation finish
await expect(first).toHaveAttribute("aria-expanded", "false");
```

- **Pros**: Simple, matches existing patterns in other tests
- **Cons**: Timeout is arbitrary and might still be too short on slow CI runners
- **Effort**: Low

**Recommendation**: **Approach A** (re-query) combined with **Approach B** (wait for animation). Re-querying ensures no stale element references, and a 500ms timeout lets the `AnimatePresence` exit animation finish before assertions. This is the safest pattern against both Safari and Chromium DOM mutation differences.

### Infrastructure Recommendations

1. **Increase CI workers** from 2 to 4 (or `undefined` to use all available CPU cores). With `fullyParallel: true` and 4+ browser projects, 2 workers creates unnecessary queuing. Tradeoff: more memory usage, but tests finish faster.

2. **Add `--shard` support** for CI. Split tests across multiple CI jobs (e.g., 2 shards × 2 workers each = 4 concurrent tests). Reduces per-job timeout pressure and isolates flaky tests.

3. **Add Firefox WebGL flags** to the CI Playwright config:

   ```typescript
   use: {
     ...devices["Desktop Firefox"],
     launchOptions: { firefoxUserPrefs: { "webgl.force-enabled": true } }
   }
   ```

   Or install Mesa/EGL libraries on the CI runner for software WebGL.

4. **Run Safari tests locally** by enabling `PLAYWRIGHT_INCLUDE_WEBKIT=1` in a pre-push hook so Safari-specific failures are caught before CI.

5. **Consider `expect.poll()` as default** for any assertion that depends on async state (observer callbacks, WebGL init, animations). The current pattern of one-shot `expect().toHaveAttribute()` with Playwright's implicit auto-retry works for simple DOM changes but breaks down for multi-step async processes.

### Risks of Proposed Fixes

- **Risk 1**: Excluding `<canvas>` from Axe scan (Fix 1) could mask real a11y issues if the canvas renders fallback DOM content. Mitigation: ensure the canvas is purely decorative (`aria-hidden="true"` on the R3F wrapper) and test fallback content separately.
- **Risk 2**: Skipping Firefox WebGL test (Fix 2) reduces cross-browser coverage. Mitigation: track in a follow-up issue to re-enable with proper CI GPU configuration.
- **Risk 3**: Adding `waitForTimeout(500)` (Fix 3, Fix 4) increases total test time. With 4 fixes × 500ms = +2s per run, 2 retries × multiple browsers ≈ negligible in a 45min CI budget.
- **Risk 4**: Changing locator strategy to re-query (Fix 4) could break if the button count changes between queries. Mitigation: the buttons are rendered from a stable list; counts won't change during a single test.
- **Risk 5**: Increasing workers to 4 in CI may exceed GitHub Actions runner memory (7GB for ubuntu-latest). Mitigation: monitor memory usage; the webServer is a single process, so the main memory cost is Playwright browser contexts.

### Ready for Proposal

**Yes**. All four tests have clear root causes with actionable fixes. The fixes are low-complexity (test-only changes) and can be implemented independently. The infrastructure recommendations are optional optimizations that can be separate tasks.

The orchestrator should proceed to `sdd-propose` with this exploration as input, then `sdd-spec` → `sdd-design` → `sdd-tasks` → `sdd-apply`.
