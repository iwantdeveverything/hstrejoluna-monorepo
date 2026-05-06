# Tasks: Fix Flaky E2E Tests

## Review Workload Forecast

| Field                   | Value                |
| ----------------------- | -------------------- |
| Estimated changed lines | 70–100               |
| 400-line budget risk    | Low                  |
| Chained PRs recommended | No                   |
| Suggested split         | Single PR            |
| Delivery strategy       | ask-on-risk          |
| Chain strategy          | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: feature-branch-chain
400-line budget risk: Low

## Phase 1: Test Fixes

- [x] 1.1 **hero.spec.ts** — Add `waitFor("canvas", { state: "attached" })` before Axe assertions; add `AxeBuilder.exclude("canvas")`; add `test.skip(browserName === "firefox", "WebGL2 not available in headless Firefox")` for canvas visibility test. Spec: scenarios "Canvas visibility after dynamic WebGL import", "Skip WebGL2 on headless Firefox", "Exclude canvas from Axe scan".

- [x] 1.2 **navigation.behavior.spec.ts** — Insert `expect(page).toHaveURL(/#certificates$/)` after certificates nav click (synchronous hash gate); replace `toHaveAttribute("aria-current", "location")` with `expect.poll(() => locator.getAttribute("aria-current"), { timeout: 10_000 }).toBe("location")`. Spec: scenario "aria-current after scroll-driven navigation".

- [x] 1.3 **grid-expansion.behavior.spec.ts** — Re-query `projectButtons.nth(0)` after clicking item B (prevents stale locator on AnimatePresence re-attach); add `await page.waitForTimeout(500)` before aria-expanded assertion. Extend existing 500ms pattern at lines 71–81 to include re-query. Spec: scenarios "Assertion after Framer Motion AnimatePresence exit", "Re-query aria-expanded after grid selection change".

## Phase 2: CI Infrastructure

- [x] 2.1 **playwright.config.ts** — Change CI `workers: 2` → `workers: undefined` (auto-detect CPU cores). Add `firefoxUserPrefs: { "webgl.force-enabled": true, "webgl.disabled": false }` to Firefox project. Add `shard` env-var passthrough for CI. Spec: scenarios "Auto-detect CPU cores for workers", "Firefox WebGL force-enable in CI".

- [x] 2.2 **qa-professional.yml** — Replace single `qa` job with `matrix: { shard: [1, 2], shardTotal: [2] }` using `fail-fast: false`. Replace `npm run qa:e2e` with `npx playwright test --shard=${{ matrix.shard }}/${{ matrix.shardTotal }}`. Reduce per-shard timeout from 45→25 min. Spec: scenario "Sharded E2E execution".

## Phase 3: Validation

- [x] 3.1 **Smoke test** — Run `npx playwright test --list` in workspace to verify config loads correctly. Test with `PLAYWRIGHT_INCLUDE_WEBKIT=1` to confirm Safari project appears. Spec: scenario "Safari local opt-in via env variable".

- [ ] 3.2 **CI consistency gate** — Trigger 3 consecutive CI runs via `workflow_dispatch` with `retries: 0`. All test suites MUST pass on every run. Spec: scenario "Three consecutive green runs".
