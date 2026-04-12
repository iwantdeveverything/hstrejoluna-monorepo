# Apply Progress: Hero Layout Fix

## Implementation Log
- ✅ **Phase 1: Refactoring Hero Layout**
  - Updated `apps/portfolio/components/fragments/HeroFragment.tsx`
  - Replaced the flexbox structure (`flex flex-col items-start`) on the `h1` with a natural block context (`break-words w-full`).
  - Tightened the leading from `leading-[0.85]` to `leading-[0.8]` to ensure visually stacked massive typography.
  - Removed fragile negative margins (`-mt-2 md:-mt-8`) from the conditional classes inside the `GlitchText` map.
  - Appended `block w-full` to the `GlitchText` children to ensure they respect the parent's block formatting context and leading.

The change allows the fluid typography (`var(--text-fluid-hero)`) to scale the text size and line-height proportionally across both mobile and desktop without overlap collisions caused by fixed rem margins.