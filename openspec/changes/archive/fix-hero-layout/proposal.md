# Proposal: Hero Layout Fix

## 1. Intent
To refactor the semantic layout and positioning of the primary Hero section (`HeroFragment.tsx`) to ensure the user's name displays perfectly on both mobile and desktop screens, adhering to the "Dark Kinetic" aesthetic without fragile negative margins.

## 2. Scope
- Update `HeroFragment.tsx`'s `h1` container.
- Remove hardcoded negative margin classes (`-mt-2`, `-mt-8`).
- Utilize proper Tailwind line-height (`leading`) and flexbox layout constraints to allow the text to flow naturally without overlapping.
- Fix responsiveness: ensure mobile doesn't overflow, and desktop keeps the massive "display-lg" scale cleanly.

## 3. Approach
Instead of mapping `nameParts` directly into `GlitchText` wrappers with manual margins:
- Apply `leading-none` or a specific tight leading like `leading-[0.85]` to the parent `h1`.
- Let the block-level rendering naturally stack the items if needed, or use a flexible `gap` inside the flex column instead of negative margins.
- Ensure the second part of the name maintains its semi-transparent "watermark/subtitle" vibe (`text-white/10`) but actually aligns perfectly.

## 4. Mitigation
Risk of `GlitchText` overlapping: Since `GlitchText` creates an `inline-block` context, using `flex flex-col` on the parent `h1` is correct, but we must use `gap-x` or `gap-y` for spacing instead of negative margins, or simply let the strict `leading-none` handle it.