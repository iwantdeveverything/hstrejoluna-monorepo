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
