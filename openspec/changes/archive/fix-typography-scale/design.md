# Technical Design: Fix Typography Scale (SDD)

## 1. Architecture
The fix is entirely within the presentation layer. By using standard Tailwind v4 utility naming conventions, we allow the JIT compiler to correctly map theme variables to `font-size` CSS properties.

## 2. Implementation Details
The current implementation fails because Tailwind's `text-[]` utility assumes a color if the variable provided doesn't look like a length. 

### Before:
```css
/* Component */
<h1 className="text-[var(--text-fluid-hero)]">

/* Compiled CSS (roughly) */
.text-\[var\(--text-fluid-hero\)] {
  color: var(--text-fluid-hero);
}
```

### After:
```css
/* Component */
<h1 className="text-fluid-hero">

/* Compiled CSS (roughly) */
.text-fluid-hero {
  font-size: clamp(3.5rem, 15vw, 13rem);
}
```

## 3. Migration Map
Each file will be scanned for the pattern `text-[var(--text-` and replaced with the literal utility name.

### Files to Modify:
1. `apps/portfolio/components/ui/HudChip.tsx`
2. `apps/portfolio/components/fragments/SkillsFragment.tsx`
3. `apps/portfolio/components/fragments/ProjectFragment.tsx`
4. `apps/portfolio/components/fragments/ExperienceFragment.tsx`
5. `apps/portfolio/components/fragments/HeroFragment.tsx`
6. `apps/portfolio/components/ObsidianStream.tsx`
7. `apps/portfolio/components/PortfolioGrid.tsx`

## 4. Verification Plan
- **Automatic:** Run `npx tsc --noEmit` to ensure no syntax errors were introduced.
- **Manual:** Check the UI to verify that titles are now much larger than body text.
