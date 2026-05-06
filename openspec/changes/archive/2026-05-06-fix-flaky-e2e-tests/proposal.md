# Proposal: Fix Flaky E2E Tests

## Intent

Fix 4 flaky Playwright E2E tests blocking PR merges in QA Gates. Root causes: missing async waits after DOM-mutating actions, WebGL canvas interference with Axe, Firefox WebGL2 headless failures, and stale element references during Framer Motion `AnimatePresence` layout animations. Also apply 5 CI infrastructure improvements to reduce queuing pressure and catch browser-specific failures earlier.

## Scope

### In Scope

- Fix Axe a11y test: exclude `<canvas>` from scan (Desktop Chrome)
- Fix WebGL capability gate test: skip on Firefox (Desktop Firefox)
- Fix `aria-current` assertion: add URL hash wait + `expect.poll()` (Desktop Chrome)
- Fix singular expansion test: re-query locators + animation settle wait (Desktop Safari)
- Increase CI workers from 2→4 (`workers: undefined` on CPU cores)
- Add `--shard` support to `qa-professional.yml`
- Add Firefox WebGL force-enable flags to Playwright config
- Enable Safari tests locally via `PLAYWRIGHT_INCLUDE_WEBKIT=1`
- Adopt `expect.poll()` as testing convention for async-dependent assertions

### Out of Scope

- Changes to application code (HeroLiquidWebGL, useActiveSection, ProjectsOverview)
- Enabling Firefox WebGL2 in headless (tracked as follow-up issue)
- Modifying the capability probe (`useLiquidHeroCapability()`)

## Capabilities

### New Capabilities

None — this is a test fix and CI configuration change, not a new feature.

### Modified Capabilities

None — existing specs (vertical-navigation-hud, in-place-expansion-grids, portfolio-testing-foundation) are not changing. The tests verify existing spec requirements.

## Approach

**Test fixes**: 4 targeted interventions with minimal surface area:

1. **Axe a11y**: Add `.exclude("canvas")` to `AxeBuilder` after `waitFor("canvas", { state: "attached" })`. Canvas is a WebGL surface, not DOM a11y material.
2. **Firefox WebGL**: `test.skip(browserName === "firefox", "...")` for canvas visibility. Headless Firefox WebGL2 is a known Playwright limitation — tracked for re-enabling later.
3. **Navigation aria-current**: Add `expect(page).toHaveURL(/#certificates$/)` after click, then `expect.poll()` with 10s timeout for `aria-current="location"`. Observer fires after scroll completion, not synchronously.
4. **Grid expansion**: Re-query `projectButtons.nth(N)` after each click + `waitForTimeout(500)` for `AnimatePresence` exit animation to settle.

**Infrastructure**: Pure config changes in `playwright.config.ts` and `qa-professional.yml` — no code dependencies.

## Affected Areas

| Area                                    | Impact   | Description                                         |
| --------------------------------------- | -------- | --------------------------------------------------- |
| `e2e/hero.spec.ts`                      | Modified | Exclude canvas from Axe; skip WebGL test on Firefox |
| `e2e/navigation.behavior.spec.ts`       | Modified | Add URL hash wait + poll for aria-current           |
| `e2e/grid-expansion.behavior.spec.ts`   | Modified | Re-query locators after DOM mutations               |
| `playwright.config.ts`                  | Modified | Workers, Firefox flags, Safari local toggle         |
| `.github/workflows/qa-professional.yml` | Modified | Shard support, timeout adjustments                  |

## Risks

| Risk                                          | Likelihood | Mitigation                                                   |
| --------------------------------------------- | ---------- | ------------------------------------------------------------ |
| Canvas exclusion masks real a11y issues       | Low        | Canvas is purely decorative; semantic DOM tested separately  |
| Skipping Firefox loses cross-browser coverage | Med        | Tracked follow-up issue; Chrome + Safari still covered       |
| `waitForTimeout(500)` too short on slow CI    | Low        | Combined with re-query; 500ms covers median animation        |
| 4 workers exceed CI runner memory (7GB)       | Low        | `webServer` is single-process; main cost is browser contexts |

## Rollback Plan

Revert the 2 commits (`playwright.config.ts` + test files) via `git revert`. CI runs same tests; no deployment dependencies. Rollback takes <5 minutes.

## Dependencies

- Issue #63 approved (`status:approved`)
- No external library upgrades or new packages

## Success Criteria

- [ ] All 4 test suites pass consistently (3 consecutive green CI runs, retries disabled)
- [ ] CI pipeline completes in ≤30 minutes (current timeout: 45min)
- [ ] Safari tests runnable locally via `PLAYWRIGHT_INCLUDE_WEBKIT=1` without CI-only guard
