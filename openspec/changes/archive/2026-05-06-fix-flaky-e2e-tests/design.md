# Design: Fix Flaky E2E Tests

## Technical Approach

Four targeted test fixes resolve async-assertion race conditions, plus five config-only CI/infrastructure improvements. Zero application code changes — all fixes stay within `e2e/*.spec.ts`, `playwright.config.ts`, and `.github/workflows/qa-professional.yml`. The strategy follows existing codebase patterns: `expect.poll()` (already used in navigation spec line 24), `waitForTimeout` (already used in grid-expansion spec line 76), and environment-variable-gated config toggles (already used for Safari line 5-6).

## Architecture Decisions

### Decision: expect.poll() vs waitFor

| Pattern                          | When                                      | Why                                                |
| -------------------------------- | ----------------------------------------- | -------------------------------------------------- |
| `expect.poll()`                  | Observer-driven state (aria-current, LCP) | Polls with intervals; resilient to timing variance |
| `waitFor({ state: "attached" })` | Element presence before assertion         | Auto-retries within timeout                        |
| `waitForTimeout(500)` + re-query | AnimatePresence exit                      | No DOM signal for exit; must pair with re-query    |

**Rationale**: Following existing pattern — `expect.poll()` already used in navigation spec line 24. Extending to certificates is consistent.

### Decision: Locator Re-query Strategy

**Choice**: Re-query locators after every action that triggers `AnimatePresence` exit/enter (click, scroll-driven layout changes). Cache locators as named variables (e.g., `first`, `second`) but invoke `.nth(N)` fresh before each assertion.

**Rationale**: `AnimatePresence` with `motion.div layout` detaches/re-attaches DOM nodes. Cached locators become stale on Safari/WebKit. Re-querying costs ~1ms and eliminates the flake.

### Decision: CI Workers

**Choice**: Set `workers: undefined` in CI (auto-detect CPU cores). Keep `workers: 2` only for local development.

**Rationale**: Ubuntu runners have 4 cores; 2 workers creates queuing for 6 browser projects. `undefined` auto-detects 4 without exceeding 7GB memory (browser contexts are the main cost; `webServer` is single-process).

### Decision: CI Shard Implementation

**Choice**: Playwright native `--shard=N/TOTAL` CLI flag with GitHub Actions matrix strategy.

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2]
    shardTotal: [2]
```

Pass `--shard=${{ matrix.shard }}/${{ matrix.shardTotal }}` to `npx playwright test`. Replace `npm run qa:e2e --workspace=apps/portfolio` with the direct Playwright CLI call to allow shard argument injection.

**Rationale**: Deterministic distribution by test title hash. Two shards ~halve per-job time and isolate flakes (shard 2 failing but shard 1 passing narrows the source instantly). Native Playwright avoids external test-splitter tooling.

### Decision: Firefox WebGL force-enable

**Choice**: Add `firefoxUserPrefs` in the Firefox project definition within `playwright.config.ts`.

```typescript
{
  name: "Desktop Firefox",
  use: {
    ...devices["Desktop Firefox"],
    launchOptions: {
      firefoxUserPrefs: {
        "webgl.force-enabled": true,
        "webgl.disabled": false,
      },
    },
  },
}
```

**Rationale**: Firefox headless llvmpipe may not expose WebGL2. Force-enable via `about:config` prefs is Playwright's recommended approach. `test.skip(browserName === "firefox")` in hero spec adds defense-in-depth until follow-up issue #64 verifies the prefs alone suffice.

### Decision: Safari Local Toggle

**Choice**: The existing `PLAYWRIGHT_INCLUDE_WEBKIT` env-var gate (playwright.config.ts line 5-6) already works. No config change needed — only documentation.

**Rationale**: Gate already exists (playwright.config.ts line 5-6). Pattern is correct — no change needed. Document usage: `PLAYWRIGHT_INCLUDE_WEBKIT=1 npm run qa:e2e`.

## Data Flow: Navigation aria-current Race Condition

```
User Click → scrollToSection(id) ──────→ pushState(#certificates) ────→ URL hash updated (sync)
                  │
                  └──→ scrollIntoView({ behavior: "smooth" }) ──→ IntersectionObserver fires
                                                                           │
                                                                   activeId = "certificates"
                                                                           │
                                                                   React re-render ──→ aria-current="location"

Playwright Test:
  click() ──→ expect(page).toHaveURL(/#certificates$/)  ← deterministic signal (hash sync)
              expect.poll(() => locator.getAttribute("aria-current"), { timeout: 10_000 })
                                                         ← resilient to observer delay
```

The URL hash is set synchronously (`replaceState` in `scrollToSection`) — reliable first gate. The observer may take 300–1000ms; `expect.poll()` with 10s timeout absorbs this variance.

## File Changes

| File                                                 | Action | Description                                                                                                                                                                          |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/portfolio/e2e/hero.spec.ts`                    | Modify | Lines 8-20: add `test.skip(browserName === "firefox", ...)` for canvas visibility. Lines 42-54: add `waitFor("canvas", { state: "attached" })` + `.exclude("canvas")` to AxeBuilder. |
| `apps/portfolio/e2e/navigation.behavior.spec.ts`     | Modify | Lines 53-55: insert `expect(page).toHaveURL(/#certificates$/)` after click, replace `toHaveAttribute` with `expect.poll()` (10s timeout).                                            |
| `apps/portfolio/e2e/grid-expansion.behavior.spec.ts` | Modify | Lines 49-56: re-query `projectButtons.nth(0)` after second click, add `waitForTimeout(500)` before assertion. Lines 71-81: extend existing 500ms pattern to include re-query.        |
| `apps/portfolio/playwright.config.ts`                | Modify | Line 46: change CI workers from `2` to `undefined`. Lines 13-16: add `firefoxUserPrefs`. Add `shard` config from env.                                                                |
| `.github/workflows/qa-professional.yml`              | Modify | Replace single `qa` job with `strategy.matrix` (shard 1/2 + 2/2). Adjust timeout from 45→25 min per shard. Replace `npm run qa:e2e` with direct `npx playwright test --shard`.       |

## Testing Strategy

| Layer                  | What to Test                                                   | Approach                                       |
| ---------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| E2E (fix verification) | All 4 fixed tests pass 3 consecutive CI runs with `retries: 0` | Manual CI validation — no new tests needed     |
| Config validation      | `playwright.config.ts` loads without errors with env vars set  | `npx playwright test --list` smoke test        |
| CI workflow            | Matrix shard jobs execute and upload reports                   | GitHub Actions dry-run via `workflow_dispatch` |

## Open Questions

- [ ] Should `shardTotal` be configurable via `env` or hardcoded to 2? Hardcoded to 2 for now (4 test files, 2 shards = 2 files each).
- [ ] Does the `firefoxUserPrefs` fix alone resolve Firefox WebGL, or is `test.skip` still needed? Both applied as defense-in-depth; follow-up issue #64 tracks removing the skip.
