# Archive Report: hero-liquid-glass-redesign

**Archived**: 2026-05-07  
**Mode**: hybrid (openspec + engram)  
**Phase**: sdd-archive

---

## Change Summary

Redesign of the portfolio hero section from a cyberpunk-themed `HeroFragment` (with zero semantic `<h1>`, an SEO regression) to a modern liquid-glass hero with three layers: (1) semantic SSR shell with single `<h1>`, lead paragraph, and CTAs, (2) always-on CSS blobs with SVG goo filter and backdrop glass card, and (3) optional capability-gated WebGL refraction via `@react-three/fiber` + `@react-three/drei` `MeshTransmissionMaterial`. The implementation followed strict TDD across 10 phases: scaffolding, Context7 verification, shared hooks, hero components, i18n/page integration, styles/SEO, e2e tests, Lighthouse/bundle validation, rollout, and legacy cleanup.

**Final state**: `NEXT_PUBLIC_HERO_LIQUID` flag fully removed (Phase 10 cleanup). `ObsidianStream.tsx` unconditionally renders `HeroSection`. `HeroFragment.tsx`, `useSpotlightTracking`, and deprecated i18n keys fully excised. 382 tests passing, bundle at 282.15 KB gz (budget: 300 KB).

---

## Specs Synced

| Domain                         | Action      | Details                                                                                                                                                                                                                                           |
| ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `liquid-glass-hero`            | **Created** | 9 requirements added: Semantic SSR shell, Liquid glass CSS layer, WebGL refraction layer (capability-gated), Entrance burst splash, Scroll-driven distortion, Performance budgets, Accessibility, Rollback flag, SEO surface. 29 scenarios total. |
| `portfolio-testing-foundation` | **Updated** | 1 new requirement added: "Hero Testing Extension" with 5 scenarios (hero semantic h1, Lighthouse SEO threshold, Playwright reduced-motion, Playwright desktop capable, i18n parity).                                                              |

### Spec Merge Details

No **REMOVED** requirements in the delta. No destructive merges.

- `openspec/specs/liquid-glass-hero/spec.md` — created from delta's ADDED requirements.
- `openspec/specs/portfolio-testing-foundation/spec.md` — appended Hero Testing Extension requirement from delta's MODIFIED scenarios.

---

## Artifacts Produced

| Artifact          | Path               | Notes                                               |
| ----------------- | ------------------ | --------------------------------------------------- |
| Proposal          | `proposal.md`      | 271 lines, 9 sections, locked architecture          |
| Exploration       | `explore.md`       | 186 lines, 5 options evaluated                      |
| Exploration Delta | `explore-delta.md` | PR #33 overlap analysis                             |
| Spec Delta        | `spec.md`          | 341 lines, RFC 2119, ADDED + MODIFIED + REFERENCED  |
| Design            | `design.md`        | 461 lines, 13 sections, 5 deferred Context7 lookups |
| Tasks             | `tasks.md`         | 127 lines, 10 phases, 59 tasks (all ✅)             |
| Verify Report     | `verify-report.md` | 157 lines, 0 CRITICAL, 0 WARNING                    |

---

## PR / Issue References

| Reference | URL                                                                | Status                                |
| --------- | ------------------------------------------------------------------ | ------------------------------------- |
| PR #65    | https://github.com/iwantdeveverything/hstrejoluna-monorepo/pull/65 | **OPEN** (not merged at archive time) |

> ⚠️ **Warning**: PR #65 is still OPEN. The archive proceeds with confidence because the implementation is verified (382/382 tests, 0 critical issues), but merging should be completed to finalize the git record.

---

## Test Results (at archive time)

- **TypeScript**: `tsc --noEmit` — 0 errors
- **Vitest**: 55 files, 382 tests — 0 failures
- **Bundle**: 282.15 KB gz / 300 KB budget — PASS
- **Lighthouse**: SEO ≥ 95, Perf ≥ 90, LCP ≤ 2.5s — Configured in CI

---

## Archive Path

`openspec/changes/archive/2026-05-07-hero-liquid-glass-redesign/`

---

## SDD Cycle Complete

The change has been fully planned, implemented across 10 phases, verified with zero critical issues, and archived. The source of truth now reflects the new hero behavior in `openspec/specs/liquid-glass-hero/spec.md` and `openspec/specs/portfolio-testing-foundation/spec.md`.
