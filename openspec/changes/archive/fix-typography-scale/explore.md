# Explore: Fix Typography Scale (SDD)

## 1. Request
The user reported that cinematic titles (Hero, Projects, Skills) appear smaller than body text. They requested an SDD-driven fix.

## 2. Root Cause Analysis
The project uses Tailwind CSS v4. In `globals.css`, fluid typography variables are defined in the `@theme` block:
```css
--text-fluid-hero: clamp(3.5rem, 15vw, 13rem);
--text-fluid-h2: clamp(2.5rem, 8vw, 7rem);
--text-label-sm: 0.75rem;
```
Tailwind v4 automatically maps these to utility classes like `text-fluid-hero` or `text-label-sm`.

**The Bug:**
The components are using arbitrary value syntax:
```tsx
className="text-[var(--text-fluid-hero)]"
```
In Tailwind, passing a naked CSS variable to the `text-[]` utility defaults to the `color` property. This resulted in the titles having a color matching the clamp value (which likely computed to something invalid or ignored) while their `font-size` remained at the browser default (16px). Meanwhile, paragraphs using standard utilities like `text-lg` or `text-2xl` appeared larger.

## 3. Affected Files
The following 7 files use the incorrect `text-[var(...)]` syntax:
1. `apps/portfolio/components/ui/HudChip.tsx`
2. `apps/portfolio/components/fragments/SkillsFragment.tsx`
3. `apps/portfolio/components/fragments/ProjectFragment.tsx`
4. `apps/portfolio/components/fragments/ExperienceFragment.tsx`
5. `apps/portfolio/components/fragments/HeroFragment.tsx`
6. `apps/portfolio/components/ObsidianStream.tsx`
7. `apps/portfolio/components/PortfolioGrid.tsx`

## 4. Proposed Fix
Replace all arbitrary `text-[var(--NAME)]` classes with the idiomatic Tailwind v4 utility classes `text-NAME`.

## 5. Conclusion
The fix is straightforward but requires surgical updates across multiple components to restore the intended cinematic scale. Moving to Propose phase.