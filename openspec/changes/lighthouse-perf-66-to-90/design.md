# Design: Lighthouse Performance 66 → 90

## Technical Approach

Split the initial JS payload by delivering hero text via an RSC (`HeroText`) that renders in the critical path, while deferring the heavy interactive shell (`ObsidianStream`) to an async `next/dynamic` chunk with `ssr: false`. The RSC produces immediate-LCP HTML (h1, lead, CTAs + static CSS blobs) without shipping any client JS for those nodes. ObsidianStream loads post-interactive, eliminating hydration mismatch #418 and removing framer-motion + Three.js parse/execute from the critical path.

Pre-existing work: `HeroText.tsx` and the `skipHero` prop on `ObsidianStream` already exist. The remaining integration is wiring `page.tsx`.

## Architecture Decisions

| Decision                     | Choice                                                                                                                                                 | Alternatives                                                    | Rationale                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero delivery                | Dedicated `HeroText` RSC renders `section#hero` with full text content                                                                                 | Keep HeroSection as-is and split its SSR/client parts           | HeroSection is a cohesive component with client-dependent visual layer (HeroLiquidField). A parallel RSC avoids refactoring HeroSection's internals while preserving its standalone contract. |
| ObsidianStream loading       | `next/dynamic(() => import('...'), { ssr: false })` from page.tsx                                                                                      | `Suspense` with `React.lazy`; conditional `typeof window` guard | `next/dynamic` is the framework-native pattern. `ssr: false` prevents server-render → no HTML for ObsidianStream = no hydration mismatch.                                                     |
| skipHero contract            | Already implemented: `skipHero?: boolean`, default `false`                                                                                             | Render-prop, compound component                                 | Boolean prop is simplest. Default `false` preserves standalone use in previews/storybook. TypeScript enforces the prop.                                                                       |
| Cross-tree section detection | `useActiveSection` uses `document.getElementById(id)` — reads DOM, not React tree                                                                      | `useRef` forwarding, context bridge                             | IntersectionObserver on native DOM elements is framework-agnostic. HeroText's `section#hero` is in the SSR HTML; ObsidianStream's `useActiveSection` detects it correctly after mount.        |
| Inline CSS strategy          | Static blob divs in HeroText mirror HeroLiquidField's `static` profile (same radial-gradient sizes/positions). No JS-driven CSS vars (`--mx`, `--my`). | Extract critical CSS into `<style>` tag; CSS-in-JS              | Pre-built blob DOM is 0JS, gzip-friendly (~400B), and visually indistinguishable from the static capability path until WebGL overlays it.                                                     |

## Data Flow

```
                ┌───────────── Sanity (ISR, revalidate=60) ─────────────┐
                ▼                                                       ▼
        ┌──────────────┐                                    ┌──────────────────┐
        │   page.tsx   │                                    │  generateMetadata │
        │  (RSC, async)│                                    │      (RSC)        │
        └──────┬───────┘                                    └──────────────────┘
               │
    ┌──────────┼──────────┐
    ▼                     ▼
┌───────────┐    ┌─────────────────────────┐
│ HeroText  │    │ ObsidianStreamDynamic    │
│  (RSC)    │    │ next/dynamic, ssr:false  │
│           │    │ skipHero={true}          │
│ h1, lead  │    └───────────┬─────────────┘
│ CTAs,     │                │ (loads async)
│ CSS blobs │                ▼
└─────┬─────┘    ┌─────────────────────────┐
      │          │ framer-motion chunk      │
      ▼          │ @hstrejoluna/ui chunk    │
  SSR HTML       │ useActiveSection (IObs)  │
  (immediate     │ HeroSection (skipped)    │
   LCP)          │ StreamSection ×4         │
                 │ CommandNav, scroll bar   │
                 │ Background watermark     │
                 └─────────────────────────┘

IntersectionObserver (in useActiveSection) reads DOM:
  section#hero (HeroText) → activeId="hero" → CommandNav highlights "hero"
```

## File Changes

| File                                       | Action    | Description                                                                                                                                                                         |
| ------------------------------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/[locale]/page.tsx`                    | Modify    | Add `HeroText` import + render above dynamic ObsidianStream. Replace static ObsidianStream import with `next/dynamic(() => import('...'), { ssr: false })`. Pass `skipHero={true}`. |
| `components/HeroText.tsx`                  | No change | Already implemented: RSC with h1, lead, CTAs + 3 static blob divs matching HeroLiquidField static profile.                                                                          |
| `components/ObsidianStream.tsx`            | No change | `skipHero` prop already implemented (line 32, 74, 126). No import audit needed — current framer-motion imports (m, useScroll, useTransform) are all used.                           |
| `components/fragments/HeroSection.tsx`     | No change | Used when `skipHero=false` (standalone mode).                                                                                                                                       |
| `components/fragments/HeroLiquidField.tsx` | No change | WebGL already lazy-loaded via `next/dynamic({ ssr: false })`.                                                                                                                       |

## Interfaces / Contracts

```typescript
// page.tsx — the only file that changes
import dynamic from "next/dynamic";
import { HeroText } from "@/components/HeroText";

const ObsidianStreamDynamic = dynamic(
  () => import("@/components/ObsidianStream").then((mod) => ({ default: mod.ObsidianStream })),
  { ssr: false }
);

// Inside PortfolioPage:
<HeroText profile={profile} locale={locale} />
<Suspense fallback={<div aria-hidden="true" className="min-h-screen" />}>
  <ObsidianStreamDynamic
    profile={profile}
    projects={projects}
    skills={skills}
    experiences={experiences}
    certificates={certificates}
    projectsContent={<ProjectsGrid projects={projects} locale={locale} />}
    skipHero={true}
  />
</Suspense>
```

**Contract**: HeroText's `section#hero` ID and ObsidianStream's `useActiveSection(streamSectionIds)` share the DOM namespace. `streamSectionIds` includes `"hero"` — the IntersectionObserver will detect it. The `min-h-screen` fallback div and static blobs prevent CLS during async chunk load.

## Testing Strategy

| Layer       | What to Test                                       | Approach                                                                                                                                                    |
| ----------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | HeroText renders h1, CTAs with correct i18n        | New `HeroText.test.tsx` (RSC — mock `getTranslations`). Verify `section#hero`, aria-labelledby, h1 text, CTA hrefs.                                         |
| Unit        | ObsidianStream with skipHero=true                  | Extend `ObsidianStream.test.tsx`: render with `skipHero={true}`, assert `screen.queryByTestId("hero-section")` is null. Verify other sections still render. |
| Unit        | page.tsx renders HeroText + dynamic ObsidianStream | New `page.test.tsx` (async RSC test): mock Sanity, assert HeroText is in output, assert dynamic import config has `ssr: false`.                             |
| Integration | Cross-tree section detection                       | Test that `useActiveSection` detects HeroText's DOM `section#hero` after ObsidianStream mounts.                                                             |
| E2E         | Lighthouse score ≥ 90                              | Playwright + Lighthouse CI. Verify TBT ≤ 200ms, zero hydration errors, LCP ≤ 2.0s.                                                                          |
| E2E         | SEO crawler fallback                               | Disable JS in Playwright — verify h1, lead, CTAs, JSON-LD all present in static HTML.                                                                       |

## Migration / Rollout

No migration required. Rollback:

1. Revert `page.tsx`: remove `HeroText`, restore static `import { ObsidianStream }`
2. If desired, delete `HeroText.tsx` and remove `skipHero` from ObsidianStream props

All changes in 1 file. Zero DB, zero infra.

## Open Questions

None — all architectural decisions resolved. Implementation is wiring-only.
