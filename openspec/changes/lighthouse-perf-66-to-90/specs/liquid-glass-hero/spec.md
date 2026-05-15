# Delta for liquid-glass-hero

## ADDED Requirements

### Requirement: HeroText RSC Shell

`HeroText` Server Component SHALL render hero text (eyebrow, h1, lead, CTAs) + 3 static radial-gradient CSS blobs via `getTranslations` from `next-intl/server`. Zero client JS. Emits `section#hero[aria-labelledby="hero-title"]`. Matches HeroSection's Tailwind layout. No framer-motion, LiquidGlass, Three.js.

#### Scenario: Server-rendered hero with i18n

- GIVEN request to `/en` or `/es`
- WHEN page SSR completes
- THEN HTML SHALL contain `section#hero` with eyebrow, h1, lead, two CTAs
- AND strings from `messages/{locale}.json` under `hero.*`

#### Scenario: Static CSS blobs, zero client JS

- GIVEN HeroText renders
- THEN 3 radial-gradient divs SHALL be static CSS (no animation)
- AND no `"use client"`, framer-motion, LiquidGlass, or Three.js SHALL execute

### Requirement: ObsidianStream skipHero Prop

`ObsidianStream` SHALL accept `skipHero?: boolean` (default `false`). When `true`, `HeroSection` does not render. All other sections render normally. TypeScript-enforced.

#### Scenario: skipHero hides hero, preserves other sections

- GIVEN `skipHero={true}`
- WHEN ObsidianStream renders
- THEN HeroSection absent; projects, experience, skills, certificates, CommandNav, scroll bar, watermark present

#### Scenario: Omitted skipHero preserves standalone rendering

- GIVEN `skipHero` omitted
- THEN HeroSection renders unchanged

### Requirement: Dynamic ObsidianStream Import

`page.tsx` SHALL import ObsidianStream via `next/dynamic(() => import('...'), { ssr: false })`. No SSR execution of its JS. `<HeroText>` renders as direct RSC above `<ObsidianStreamDynamic skipHero />`.

#### Scenario: JS deferred from SSR

- GIVEN page request
- WHEN server renders HTML
- THEN ObsidianStream JS bundle SHALL NOT appear in SSR response

#### Scenario: Component ordering in page tree

- GIVEN portfolio page renders
- THEN HeroText SHALL be direct RSC above dynamically-imported ObsidianStreamDynamic

### Requirement: Hydration Error Elimination

Zero React hydration error #418 in any environment. SSR HTML from HeroText SHALL match client output.

#### Scenario: Clean hydration

- GIVEN page loads in dev/production
- WHEN browser console inspected
- THEN zero hydration warnings/errors; no React DevTools mismatch flag

### Requirement: Visual Regression Integrity

Hero section visually identical before/after. Static CSS blobs match HeroLiquidField static path. Container uses `min-height` reserve to prevent CLS when ObsidianStream mounts.

#### Scenario: Layout and content match

- GIVEN old and new pipelines
- WHEN hero text, spacing, Tailwind classes compared
- THEN identical content, layout, spacing

#### Scenario: No layout shift on dynamic mount

- GIVEN HeroText SSR HTML painted
- WHEN ObsidianStream mounts asynchronously below
- THEN min-height reserve prevents CLS; no visible flash or jump

### Requirement: Existing Test Continuity

All 432 tests SHALL pass. TypeScript SHALL report zero errors. Build SHALL succeed.

#### Scenario: CI gate passes

- GIVEN change applied
- WHEN `npm test && npm run typecheck && npm run build` executes
- THEN zero failures, zero TS errors, successful build

## MODIFIED Requirements

### Requirement: Performance budgets

| Budget               | Target                 |
| -------------------- | ---------------------- |
| Initial JS (gz)      | ≤ 150 KB (from 233 KB) |
| TBT                  | ≤ 200 ms (from 580 ms) |
| FCP                  | ≤ 500 ms (no regress)  |
| LCP (slow-4G mobile) | ≤ 2500 ms              |
| Lighthouse Perf      | ≥ 90 (from 66)         |
| WebGL chunk (gz)     | ≤ 300 KB               |
| INP (hero)           | ≤ 200 ms               |
| CLS                  | ≤ 0.1                  |

(Previously: Initial JS budget was +5 KB gz relative delta; LCP ≤ 2.5s; INP ≤ 200ms; CLS ≤ 0.1. TBT, FCP, Lighthouse score, absolute JS cap not specified.)

#### Scenario: CI bundle gate blocks regression

- GIVEN CI runs `qa:gate`
- WHEN initial JS exceeds 150 KB gzipped
- THEN step SHALL fail and block merge

#### Scenario: Lighthouse meets thresholds

- GIVEN `qa:lighthouse` on production build, mobile profile
- THEN Performance ≥ 90, TBT ≤ 200ms, FCP ≤ 500ms, LCP ≤ 2500ms
- AND LCP element SHALL be h1 text node, not canvas
