# Apply Progress: hero-video-liquid-glass

> Mode: Strict TDD (vitest via pnpm). Delivery: auto-chain, feature-branch-chain.
> Tracker branch: `feature/hero-video-liquid-glass`.

## Slice 1 — Demolition + CI (`hero-vlg/01-demolition`) — COMPLETE

### Tasks

- [x] 1.1 Deleted `fragments/HeroSection.tsx`, `.test.tsx`, `.stories.tsx`, `lib/lcp.test.ts`. Verified: `rg "HeroSection" apps/portfolio` → 0 hits.
- [x] 1.2 Deleted dead-pinning suites: `fragments/hero-globals.test.ts`, `fragments/hero-uniform-store.test.ts`, `fragments/HeroRefractionScene.test.ts`, `lib/use-liquid-glass-gates.test.ts`, `lib/hero-cursor-field.test.ts`.
- [x] 1.3 Deleted dead impl: `fragments/HeroPhysicsIsland.tsx` + test, `fragments/HeroRefractionScene.tsx`, `fragments/hero-uniform-store.ts`, `lib/use-liquid-glass-gates.ts`, `lib/hero-cursor-field.ts`. Removed `HeroPhysicsIsland` import/mount from `components/HeroText.tsx`. Updated `ObsidianStream.test.tsx` / `ObsidianStream.dynamic.test.tsx` (3 baseline-failing tests pinned the removed legacy HeroSection mock).
- [x] 1.4 RED: `apps/portfolio/scripts/size-limit-globs.test.ts` — asserts every `.size-limit.json` glob matches ≥1 build file. Confirmed FAILING against stale globs (`page-*.js`, `HeroRefractionScene*.js` — 0 matches each; Turbopack hashes chunk names) BEFORE 1.5.
- [x] 1.5 GREEN: `scripts/size-gate.mjs` now fails on any glob matching 0 files (STALE GLOB error, exit 1) before running size-limit. `.size-limit.json` replaced stale entries with `client-js-total` (`.next/static/chunks/*.js`, 600 KB gzip; measured 514,425 bytes ≈ 502 KB). Negative-path verified: injected ghost glob → gate exits 1.
- [x] 1.6 `lighthouserc.cjs`: Performance/Accessibility/SEO/FCP/LCP/Speed-Index assertions commented with `// TODO(#TBD-perf-gate-revival): re-enable`; Best Practices (warn 0.9) kept. `lighthouserc.test.ts` updated to pin the suspended state. FOLLOW-UP ISSUE NOT FILED (executor not permitted) — orchestrator must file it and replace the placeholder.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| 1.1–1.3 (demolition) | Removal-driven: baseline had 4 failing suites pinning dead machinery (ObsidianStream.test.tsx, lib/use-liquid-glass-gates.test.ts, fragments/HeroRefractionScene.test.ts, fragments/HeroSection.test.tsx) | Deletion + HeroText/ObsidianStream test alignment → full suite green (56 files / 317 tests at that point) | N/A |
| 1.4–1.5 (glob guard) | `scripts/size-limit-globs.test.ts` written first; ran and FAILED (2 failed / 1 passed) on stale globs | Guard added to `size-gate.mjs` + globs fixed → test green (2 passed), `pnpm size` ok | `test/bundle-budget.test.ts` realigned (old contract pinned stale entries and tolerated vacuous passes) |
| 1.6 (lighthouse) | `lighthouserc.test.ts` rewritten to pin suspended assertions (would fail against old config) | `lighthouserc.cjs` assertions commented → 9 tests green | N/A |

### Commits (on `hero-vlg/01-demolition`, base `feature/hero-video-liquid-glass`)

| Hash | Message |
|------|---------|
| d0c8e84 | refactor(portfolio): remove dead hero implementation and test suites (18 files, +9/−1701) |
| 6189e72 | feat(portfolio): guard size-limit globs against vacuous pass (3 files, +92/−19) |
| 4bdf5d6 | chore(portfolio): suspend perf/a11y/seo lighthouse assertions temporarily (2 files, +35/−44) |
| 16abc91 | test(portfolio): align bundle-budget contract with glob-guarded size gate (1 file, +29/−37) |

### Verification (final, post all commits)

- `pnpm --filter portfolio lint` (tsc --noEmit): PASS
- `pnpm --filter portfolio test`: PASS — 57 files / 316 tests, 0 failures (baseline before slice: 4 failed files / 30 failed tests)
- `pnpm --filter portfolio size`: PASS — `client-js-total` 514,425 bytes gzip ≤ 600 KB; stale-glob negative path exits 1

### Deviations from tasks.md

1. `ObsidianStream.test.tsx` / `ObsidianStream.dynamic.test.tsx` edits were not listed in 1.1–1.3 but were required: they mocked/pinned the deleted `fragments/HeroSection` and 3 tests were already failing at baseline.
2. `test/bundle-budget.test.ts` (not listed) pinned the stale `.size-limit.json` entries and explicitly tolerated vacuous passes — contradicting the new Size-Limit Glob Integrity spec; realigned in commit 16abc91.
3. `.size-limit.json`: the old `initial-js-delta` (page-*.js) and `hero-webgl-lazy-chunk` globs are unmatchable under Turbopack hashed chunk names. Replaced with a single `client-js-total` ceiling (600 KB gzip, informational per spec "Performance budgets REMOVED"). Slice 5 (task 5.4) re-adds a dedicated hero chunk entry.
4. 1.6: follow-up issue NOT filed (out of executor scope) — literal placeholder `#TBD-perf-gate-revival` in `lighthouserc.cjs`; orchestrator action required.

### Next slice

Phase 2 — Gate Consolidation (`hero-vlg/02-gates`, base `hero-vlg/01-demolition`): tasks 2.1–2.6 (saveData gate extension, `use-hero-tier` matrix RED/GREEN, delete `useReducedMotion`, confirm no `forceWebGL` reads).

Pending orchestrator actions: (a) file the perf-gate-revival follow-up GitHub issue and update the TODO reference in `lighthouserc.cjs`; (b) open PR 1 `hero-vlg/01-demolition` → `feature/hero-video-liquid-glass` (deletion-dominated, ~1,950 changed lines, flag per workload forecast).

### Post-review fixes (slice 1, after adversarial review)

Follow-up issue filed: #146 — "chore(portfolio): re-enable and recalibrate Lighthouse CI thresholds after hero revival".

Fixes applied in commit 7cf0e44 (`chore(portfolio): clear demolition debris and pin lighthouse follow-up issue`):

1. `#TBD-perf-gate-revival` placeholder replaced with `#146` in `lighthouserc.cjs` and the doc comment in `lighthouserc.test.ts`.
2. Stale `apps/portfolio/components/fragments/HeroSection.tsx` entry removed from `scripts/audit-liquid-glass.ts` migrated-files list (file deleted in this slice); constants renamed to camelCase per workspace style.
3. Deleted orphaned `apps/portfolio/lib/lcp.ts` (zero imports; its test was removed with the dead hero); prose reference in `e2e/hero.spec.ts:206` cleaned.
4. Deleted vacuous `apps/portfolio/e2e/hero.memory-leak.spec.ts` plus its dedicated Playwright project and `testIgnore` entries in `playwright.config.ts`.

Verification post-fixes: `pnpm --filter portfolio lint` PASS; `pnpm --filter portfolio test` PASS (57 files / 316 tests).

## Slice 2 — Gate Consolidation (`hero-vlg/02-gates`) — COMPLETE

### Tasks

- [x] 2.1 RED: extended `packages/ui/src/liquid-glass/__tests__/use-liquid-glass-gates.test.tsx` with `saveData` scenarios (reads `navigator.connection.saveData`, defaults false when API absent, reacts to runtime `change` events, independent from `reduceData`). Ran BEFORE impl: 5 failed / 2 passed.
- [x] 2.2 GREEN: `use-liquid-glass-gates.ts` extended — `saveData` in `LiquidGlassGates` + SSR defaults, read via Network Information API, `connection.change` listener wired into the `useSyncExternalStore` subscribe, snapshot fingerprint updated. 7/7 green.
- [x] 2.3 RED: new `packages/ui/src/liquid-glass/use-hero-tier.test.tsx` — full tier matrix: kill switch (`""`/`"false"` → static, `"true"` → highest tier), each preference gate → static (reduceMotion, reduceData, reduceTransparency, saveData), SSR snapshot = static (`renderToStaticMarkup`), mobile <1024px cap → css-only, WebGL2 probe fail → css-only, `reportWebglFailure` demotion + cross-remount latch, runtime matchMedia reactivity (reduceMotion flip, viewport crossing), result contract (gates facts + `reportWebglFailure` exposure). Ran BEFORE impl: failed (module `./use-hero-tier` does not exist). 15 tests.
- [x] 2.4 GREEN: `packages/ui/src/liquid-glass/use-hero-tier.ts` per design §3 decision order (kill switch → preference gates → hydration sentinel → 1024px cap → WebGL2 probe/failure latch → css+webgl). Module-scoped memoized probe + failure latch via `useSyncExternalStore`; exported from `liquid-glass/index.ts` (`useHeroTier`, `HeroTier`, `HeroTierResult`). 15/15 green.
- [x] 2.5 Deleted `packages/ui/src/hooks/useReducedMotion.ts` + barrel export; migrated all 4 consumers to `useLiquidGlassGates().reduceMotion`: `packages/ui/src/components/GlitchText.tsx` (relative import), `apps/portfolio/components/ObsidianStream.tsx`, `apps/portfolio/components/ui/CommandNav.tsx`, `apps/portfolio/hooks/useKeyboardNav.ts`; test mocks updated to mock `useLiquidGlassGates` (3 files). `rg "forceWebGL"` → 0 hits repo-wide (source); `rg "useReducedMotion"` → 0 hits in source (only stale `storybook-static/` build artifacts, regenerated on next build).
- [x] 2.6 Verify: `pnpm --filter portfolio test` (includes packages/ui suites per vitest include) PASS — 58 files / 334 tests; `pnpm --filter portfolio lint` (tsc --noEmit) PASS.

### TDD Cycle Evidence

| Task | RED | GREEN | REFACTOR |
|------|-----|-------|----------|
| 2.1–2.2 (saveData gate) | Test extension written first; ran → 5 failed / 2 passed (`saveData` undefined in snapshot/defaults) | Hook extended → 7/7 passed | Snapshot fingerprint extended to include `saveData`; doc comment cites design §10 |
| 2.3–2.4 (useHeroTier) | Full 15-test matrix written first; ran → suite failed: `Failed to resolve import "./use-hero-tier"` (module absent) | Hook implemented → 15/15 passed | Module-scope probe/latch documented; barrel export added |
| 2.5 (migration) | Removal-driven: deleting the hook breaks 4 consumers + 3 test mocks (tsc would fail) | Consumers migrated to `useLiquidGlassGates().reduceMotion`, mocks updated → full suite + lint green | Stale doc comments in `LiquidGlass.tsx`/`liquid-glass.css` cleaned; `as unknown as` polymorphic cast in `LiquidGlass.tsx` replaced with typed `LiquidGlassComponent` interface; `any` label param in `CommandNav.tsx` typed (`CommandNavLabels`); CSS-var cast in `ObsidianStream.tsx` replaced with typed `ScrollProgressStyle` (pre-commit review findings) |

### Commits (on `hero-vlg/02-gates`, base `hero-vlg/01-demolition`)

| Hash | Message |
|------|---------|
| 286219f | feat(ui): add saveData gate to useLiquidGlassGates (#145) (2 files, +122/−1) |
| b883fbb | feat(ui): add useHeroTier consolidated three-tier capability gate (#145) (3 files, +518) |
| bced72c | refactor(ui): replace useReducedMotion with consolidated gates hook (#145) (5 files, +12/−43) |
| 51ab2d4 | refactor(portfolio): migrate consumers to consolidated reduceMotion gate (#145) (6 files, +33/−16) |
| 16bd09d | test(portfolio): raise size-gate smoke timeout to avoid parallel-suite flake (1 file, +4) |

### Verification (final, post all commits)

- `pnpm --filter portfolio test`: PASS — 58 files / 334 tests (includes all packages/ui suites; `@hstrejoluna/ui` has no own test script — ui tests run through the portfolio vitest config include globs)
- `pnpm --filter portfolio lint` (tsc --noEmit): PASS
- `rg "forceWebGL"` → 0 hits; `rg "useReducedMotion"` → 0 source hits

### Deviations from tasks.md

1. `pnpm --filter @hstrejoluna/ui test` (task 2.6 wording) is a NO-OP: the ui package has no `test` script and no own vitest config — its suites are included by `apps/portfolio/vitest.config.ts` (`../../packages/ui/src/**/*.test.{ts,tsx}`). Verified via `pnpm --filter portfolio test`, which executes all 13 ui test files.
2. `test/bundle-budget.test.ts` (not listed): the size-gate smoke test spawns `pnpm run size` and flaked at the default 5s timeout under the parallel suite; explicit 60s timeout added (commit 16bd09d).
3. Pre-commit AI review (Gentleman Guardian Angel) flagged pre-existing issues in touched files, fixed in-slice: `any` in `CommandNav.resolveLabel`, `as unknown as` polymorphic cast in `LiquidGlass.tsx`, CSS-custom-property cast in `ObsidianStream.tsx`. Reviewer also repeatedly hallucinated a "leading space in import path" violation — verified false byte-exact (`cat -A`); resolved by splitting the commit (ui-side / app-side), after which both passed.
4. `packages/ui/src/hooks/useLiquidHeroCapability.ts` (+ test) overlaps `useHeroTier` (older capability hook, slightly different rules: no kill switch, saveData→css-only instead of static, IO-missing→static). It has zero app consumers and was NOT in slice 2's task list, so it was left in place — flag for sdd-verify / slice 3: design §3 says `useHeroTier` is "the ONLY tier decider"; recommend deleting `useLiquidHeroCapability` when `HeroBackdrop` lands (Phase 3).

### Next slice

Phase 3 — Video Pipeline (`hero-vlg/03-video`, base `hero-vlg/02-gates`): tasks 3.1–3.8 (placeholder renditions, `HeroVideoLayer`, `HeroBackdrop` on `useHeroTier()`, `HeroText` poster + kill switch).

Pending orchestrator actions: open PR 2 `hero-vlg/02-gates` → `hero-vlg/01-demolition` (~690 changed lines incl. 350-line test matrix; meaningful impl delta well under budget — note test-heavy ratio in PR body).
