# Specification: Hero Layout Fix

## 1. Requirements
### 1.1 `HeroFragment.tsx`
- The main `h1` element wrapping the name parts must be a flex container (column) or block container.
- **Removed:** Any negative margins (`-mt-X`) from `nameParts.map` children.
- **Added:** A flexible `gap` (e.g. `gap-0` or `gap-2`) if using `flex-col`, or relying entirely on `leading-[0.8]` or `leading-none` on the parent to naturally stack the glitch text components without clipping.
- **Typography:** Retain the `var(--text-fluid-hero)` utility, which handles scaling automatically (`clamp`).

## 2. Scenarios
- **Desktop:** The massive font scale (13rem max) should stack cleanly. The second name part (`TREJO`) should sit right under the first (`SEBASTIÁN`), transparent (`text-white/10`), aligned to the start without colliding.
- **Mobile:** The smaller font scale (3.5rem min) scales the layout proportionally. The lack of fixed negative `rem` margins prevents the second text from shifting *up* into the first text.

## 3. CSS
- We will rely entirely on Tailwind's existing spacing utilities and the custom clamp function. No new variables are needed.