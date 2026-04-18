# Design: Optimize Projects Section

## Technical Approach
Refactor the React components (`ProjectFragment` and `ProjectsOverview`) in `apps/portfolio/` to reduce their reliance on deep `framer-motion` trees. We will implement `LazyMotion` combined with `m.div` to defer the parsing of the heavy animation library, optimize `next/image` attributes to prevent layout shifts and improve loading times, and migrate complex static CSS effects (like noise overlays) into lightweight CSS pseudo-elements/variables. We will also construct extensive Storybook stories and mocks to allow isolated component development.

## Architecture Decisions

### Decision: Animation Library Refactor
**Choice**: Wrap components in `<LazyMotion features={domAnimation}>` and replace `<motion.div>` with `<m.div>`.
**Alternatives considered**: Pure CSS transitions (rejected because grid layout expansions/collapses are too complex to manage without React layout measurement logic).
**Rationale**: Keeps the fluid, premium feel while drastically cutting the initial JS payload and main-thread execution time during hydration.

### Decision: Visual Effects (Glitch, Noise)
**Choice**: Use `before:` and `after:` pseudo-elements via Tailwind in place of rendering absolute `div` elements, or rely on existing optimized utility classes in `@hstrejoluna/ui`.
**Alternatives considered**: Keeping the current absolute `div` approach (rejected due to excessive DOM depth).
**Rationale**: Fewer DOM nodes mean less memory consumption and faster styling recalculations on scroll.

### Decision: Storybook Coverage
**Choice**: Provide robust mock objects matching the Sanity `Project` type in `ProjectFragment.stories.tsx` and a new `ProjectsOverview.stories.tsx`. 
**Alternatives considered**: Relying on live Sanity data (rejected for isolation and reproducibility reasons).
**Rationale**: Enables fast visual regression testing and iteration on the new optimized components without needing the full Next.js/Sanity backend running.

## Data Flow
```
Sanity (Project Data) ──→ Next.js Page (App Router)
                            │
                            └─→ ProjectsOverview 
                                  │
                                  ├─→ LazyMotion Context
                                  └─→ m.div (Grid Items)
                                        │
                                        └─→ next/image (optimized with sizes)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/portfolio/components/fragments/ProjectFragment.tsx` | Modify | Update to `m.div`, remove unnecessary wrapper divs, optimize `<Image />` props. |
| `apps/portfolio/components/fragments/ProjectsOverview.tsx` | Modify | Update to `m.div`, optimize `<Image />` props, refine grid layout structure. |
| `apps/portfolio/components/fragments/ProjectFragment.stories.tsx` | Modify | Add valid mock `Project` data and interactive states. |
| `apps/portfolio/components/fragments/ProjectsOverview.stories.tsx` | Create | Write stories reflecting the full grid view and expansion states. |

## Interfaces / Contracts
No changes to existing Sanity types. Mock data will strictly adhere to the existing `Project` type from `@/types/sanity`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Component Isolation | Storybook visual testing (Playwright/Vitest integration if existing). |
| Integration | Grid Expansion | E2E or manual verification that clicking an item expands it while collapsing others smoothly. |

## Migration / Rollout
No migration required. This is a pure frontend optimization.

## Open Questions
- None.