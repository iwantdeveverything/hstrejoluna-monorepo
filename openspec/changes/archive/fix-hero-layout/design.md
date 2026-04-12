# Technical Design: Hero Layout Fix

## 1. Architecture
- The change is strictly presentational, scoped to `apps/portfolio/components/fragments/HeroFragment.tsx`.
- We will modify the classNames of the generated `GlitchText` elements and the parent `h1`.

## 2. Implementation Details
The current structure:
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

Will become:
```tsx
<h1 className="text-[var(--text-fluid-hero)] font-black tracking-tighter leading-[0.8] uppercase flex flex-col items-start italic overflow-visible">
  {nameParts.map((part, i) => (
    <GlitchText 
      key={i} 
      text={part} 
      active={i === 0} 
      className={i === 1 ? "text-white/10 mt-0 md:-mt-4" : "text-white"}
    />
  ))}
</h1>
```
*Wait*, relying on `leading-[0.8]` alone on `flex-col` children might not work since `flex-col` separates the flex items. If we use `flex flex-col`, the `leading` only affects the height of the individual line boxes, not the space between flex items.
Actually, if we remove `flex flex-col` and just use `block`, then `leading-[0.8]` controls the line-height natively and naturally pulls the lines together without needing negative margins.

Revised approach:
```tsx
<h1 className="text-[var(--text-fluid-hero)] font-black tracking-tighter leading-[0.8] uppercase italic break-words w-full">
  {nameParts.map((part, i) => (
    <GlitchText 
      key={i} 
      text={part} 
      active={i === 0} 
      className={i === 1 ? "text-white/10 block w-full" : "text-white block w-full"}
    />
  ))}
</h1>
```
Using `block w-full` ensures they stack normally, and the `leading-[0.8]` applied to the `h1` will tightly pack them together, respecting proportional clamp units.