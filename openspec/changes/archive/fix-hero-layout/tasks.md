# Tasks: Hero Layout Fix

## Phase 1: Refactoring Hero Layout
- [ ] 1.1 Modify `HeroFragment.tsx`: Update the `h1` className to use standard block layout instead of flexbox for the name parts, or apply a responsive tight leading `leading-[0.8]` with `block` children.
- [ ] 1.2 Modify `HeroFragment.tsx`: Remove all hardcoded negative margins (`-mt-2 md:-mt-8`) from the `GlitchText` `className` logic.
- [ ] 1.3 Ensure `GlitchText` renders as `block` elements so they stack properly without flexbox wrapping issues.

## Phase 2: Validation
- [ ] 2.1 Visually confirm the name doesn't overlap or break out of bounds on mobile and desktop simulations. (Mental validation & type checking).