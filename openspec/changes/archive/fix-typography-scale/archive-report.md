# Archive Report: Fix Typography Scale (SDD)

## 1. Summary
We identified and fixed a typography scaling issue where cinematic titles were being rendered at the browser's default font size (16px). The cause was the incorrect use of Tailwind CSS v4 arbitrary value syntax (`text-[var(--NAME)]`), which defaulted to styling the `color` property instead of mapping theme variables to `font-size`.

## 2. Key Changes
- Refactored 7 components to use idiomatic Tailwind v4 utility classes:
  - `HudChip.tsx`
  - `SkillsFragment.tsx`
  - `ProjectFragment.tsx`
  - `ExperienceFragment.tsx`
  - `HeroFragment.tsx`
  - `ObsidianStream.tsx`
  - `PortfolioGrid.tsx`
- Replaced all instances of `text-[var(--text-fluid-*)]` with `text-fluid-*`.
- Replaced all instances of `text-[var(--text-label-sm)]` with `text-label-sm`.

## 3. Post-Implementation Notes
The typography now correctly utilizes the `clamp()` functions defined in `globals.css`. Titles will appear massive on desktop and scale down gracefully on mobile, restoring the intended hierarchy where titles are significantly larger than body text.

Verification confirmed that no `text-[var(--text-fluid` patterns remain in the component directory.
