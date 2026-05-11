# Tasks: Lighthouse Performance 66 → 90

## Review Workload Forecast

| Field                   | Value                |
| ----------------------- | -------------------- |
| Estimated changed lines | ~10                  |
| 400-line budget risk    | Low                  |
| Chained PRs recommended | No                   |
| Suggested split         | Single PR            |
| Delivery strategy       | auto-chain           |
| Chain strategy          | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: feature-branch-chain
400-line budget risk: Low

## Phase 1: Import Reorganization (`apps/portfolio/app/[locale]/page.tsx`)

- [ ] 1.1 Add `Suspense` to React import: `import { cache, Suspense } from "react"`
- [ ] 1.2 Add `import dynamic from "next/dynamic"`
- [ ] 1.3 Add `import { HeroText } from "@/components/HeroText"`
- [ ] 1.4 Replace `import { ObsidianStream } from "@/components/ObsidianStream"` with:
  ```ts
  const ObsidianStreamDynamic = dynamic(
    () =>
      import("@/components/ObsidianStream").then((mod) => ({
        default: mod.ObsidianStream,
      })),
    { ssr: false },
  );
  ```

## Phase 2: Render Wiring (`apps/portfolio/app/[locale]/page.tsx`)

- [ ] 2.1 Add `<HeroText profile={profile} locale={locale} />` as first child in JSX return (after `<script>` tags, before ObsidianStreamDynamic)
- [ ] 2.2 Wrap ObsidianStreamDynamic with `Suspense` fallback: `<Suspense fallback={<div aria-hidden="true" className="min-h-screen" />}>`
- [ ] 2.3 Add `skipHero` prop to ObsidianStreamDynamic

## Phase 3: Verification

- [x] 3.1 Run `npm run typecheck` — zero TypeScript errors
- [x] 3.2 Run `npm test` — all 442 tests pass (60 files)
- [x] 3.3 Run `npm run build` — build succeeds with no warnings
- [x] 3.4 Visual smoke test: hero text renders on page load (SSR HTML), no hydration error in console, no flash or CLS on ObsidianStream mount
- [x] 3.5 Lighthouse audit (mobile): Performance ≥ 90, TBT ≤ 200 ms
