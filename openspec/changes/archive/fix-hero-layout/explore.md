# Explore: Hero Layout Fix

## 1. Request
The user noted that the first section (HeroFragment) where their name appears is a "mess" ("un relajo") and wants it to look presentable with correct semantic rules and proper positioning for both mobile and desktop under SDD.

## 2. Current State Analysis
File: `apps/portfolio/components/fragments/HeroFragment.tsx`

The `h1` element containing the name uses the following structure:
```tsx
<h1 className="text-[var(--text-fluid-hero)] font-black tracking-tighter leading-[0.85] uppercase flex flex-col items-start italic">
  {nameParts.map((part, i) => (
    <GlitchText 
      key={i} 
      text={part} 
      active={i === 0} 
      className={i === 1 ? "text-white/10 -mt-2 md:-mt-8" : "text-white"}
    />
  ))}
</h1>
```
### Issues:
1. **Negative Margins (`-mt-2 md:-mt-8`)**: This causes the second part of the name to overlap or clip into the first part, particularly depending on the font rendering. In a responsive fluid typography setup (`clamp(3.5rem, 15vw, 13rem)`), fixed `rem` or `px` margins (like `-mt-8` which is `-2rem`) break the scaling proportion, creating a mess on different breakpoints.
2. **Spacing & Wrapping**: The `flex flex-col` creates a strict stack, but without proportional spacing, the text looks misaligned.
3. **Accessibility & Semantics**: The `<GlitchText>` components might be breaking the `h1` semantic if they insert non-semantic wrappers without `aria-hidden` attributes correctly synced, though the immediate issue is visual positioning.

## 3. Target State
- Replace the fragile negative margin hack (`-mt-2 md:-mt-8`) with proportional scaling, or just use natural `leading` (line-height) to control the gap.
- The `h1` should scale smoothly across all viewports (Mobile to Desktop) without parts overlapping incorrectly.
- Follow the "Dark Kinetic" design: massive typography (`display-lg`), tight letter spacing, and intentional layout.

## 4. Next Steps
Move to Propose phase to define the new structural layout for the `h1` tag and surrounding containers.