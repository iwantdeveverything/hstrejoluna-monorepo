# Proposal: Lighthouse Performance 66 → 90

## Intent

Lighthouse performance stalled at 66 because TBT is 580ms — 3× the 200ms target. Root cause: `ObsidianStream` (a "use client" component importing framer-motion, Three.js, and all sections) renders synchronously in the critical path. This causes React hydration error #418 (SSR/client mismatch → double render) wasting main-thread time, and ships 117KB of unused JS (50% of main chunk). Only the hero `<h1>` text is needed for LCP, yet the entire component tree blocks the main thread.

## Scope

### In Scope

- Create `HeroText` RSC — server-renders h1, lead, CTAs with inline CSS as immediate LCP candidate
- Dynamic-import `ObsidianStream` with `ssr: false` from `page.tsx`, deferring heavy JS to async chunk
- Add `skipHero` prop to ObsidianStream to prevent duplicate hero rendering
- Fix hydration error #418 (eliminated by `ssr: false` — no server render = no mismatch)
- Eliminate dead code (50% unused JS = 117KB gzipped in main chunk)
- Inline critical above-fold CSS for zero-layout-shift text paint

### Out of Scope

- New visual design or feature changes
- Splitting Three.js from its existing lazy-load inside HeroLiquidField (already `next/dynamic`)
- Sanity data fetching changes
- Non-hero page sections

## Capabilities

### New Capabilities

None — delivery architecture refinement within existing contracts.

### Modified Capabilities

- `liquid-glass-hero`: Hero text delivered via dedicated `HeroText` RSC; ObsidianStream dynamically imported with `ssr: false` + new `skipHero` prop for visual layers only. Performance budgets updated for reduced initial JS. The semantic SSR shell contract (h1, lead, CTAs) is preserved — only the delivery pipeline changes.

## Approach

**Split rendering**: `page.tsx` (RSC, `revalidate = 60`) renders `<HeroText>` server-side for h1/lead/CTAs/CSS blobs → immediate LCP. `ObsidianStream` loads via `next/dynamic(() => import('...'), { ssr: false })` with `loading` fallback → async chunk outside critical path. This eliminates hydration mismatch #418 (no server HTML for client component) and defers framer-motion + Three.js to post-interactive.

**skipHero contract**: `ObsidianStream` receives `skipHero?: boolean`. When `true`, it skips `<HeroSection>` rendering entirely (text already served by HeroText RSC). TypeScript enforces the prop; default `false` preserves standalone use.

**Code pruning**: Audit barrel exports and import wildcards in ObsidianStream. Replace broad framer-motion imports (`m, useScroll, useTransform, ...`) with targeted imports. Tree-shake dead paths.

**Inline CSS**: Extract above-fold hero CSS (< 2KB) into a `<style>` tag within HeroText RSC to prevent layout shift during dynamic import hydration.

## Affected Areas

| Area                                                  | Impact   | Description                                      |
| ----------------------------------------------------- | -------- | ------------------------------------------------ |
| `apps/portfolio/app/[locale]/page.tsx`                | Modified | `<HeroText>` RSC + dynamic ObsidianStream import |
| `apps/portfolio/components/HeroText.tsx`              | New      | RSC: h1, lead, CTAs + inline critical CSS        |
| `apps/portfolio/components/ObsidianStream.tsx`        | Modified | `skipHero` prop, framer-motion import audit      |
| `apps/portfolio/components/fragments/HeroSection.tsx` | Modified | Text-only variant support for HeroText use       |

## Risks

| Risk                                                       | Likelihood | Mitigation                                      |
| ---------------------------------------------------------- | ---------- | ----------------------------------------------- |
| Dynamic import causes layout shift for below-fold sections | Low        | `Suspense` boundary; sections render below fold |
| `skipHero` contract missed by future contributors          | Low        | JSDoc + TypeScript guard; default `false`       |
| Inline CSS inflates HTML payload                           | Low        | Only above-fold hero CSS (~2KB); gzip-neutral   |

## Rollback Plan

1. Revert `page.tsx`: remove `<HeroText>`, restore direct `<ObsidianStream>` without dynamic import
2. Delete `HeroText.tsx`
3. Remove `skipHero` prop and guard from ObsidianStream
   All changes in 2 files + 1 new file. Zero DB, zero infra.

## Dependencies

- `feat/lighthouse-audit-fixes` merged (baseline: score 66, security headers, ISR, BFCache)

## Success Criteria

- [ ] Lighthouse Performance ≥ 90 (from 66)
- [ ] TBT ≤ 200ms (from 580ms)
- [ ] LCP ≤ 2.0s (from 1846ms, maintained)
- [ ] Zero hydration errors in console (#418 resolved)
- [ ] Unused JS ≤ 20% (from 50%)
- [ ] All existing specs passing (axe a11y, Playwright e2e, Vitest, typecheck)
