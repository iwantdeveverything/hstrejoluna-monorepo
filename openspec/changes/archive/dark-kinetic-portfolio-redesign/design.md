# Technical Design: Dark Kinetic Portfolio Redesign

## 1. Architecture Overview
The portfolio is built with Next.js 16 (App Router), React 19, and Tailwind CSS v4. The redesign requires updating the core styling layer and replacing specific presentational components without altering the data fetching (Sanity) or the overall structure of the `ObsidianStream` horizontal scrolling container.

## 2. CSS Architecture (Tailwind v4)
Tailwind v4 introduces native CSS variables via the `@theme` block.
**Decision:** We will replace the custom `--color-void`, `--color-ember`, etc., with a standardized Material 3-like token structure mapping directly to the Dark Kinetic specs.

```css
@theme {
  --color-background: #131313;
  --color-surface: #131313;
  --color-surface-container-lowest: #0e0e0e;
  --color-surface-container-low: #1b1b1b;
  --color-surface-container: #1f1f1f;
  --color-surface-container-high: #2a2a2a;
  --color-surface-container-highest: #353535;
  --color-surface-bright: #393939;

  --color-primary: #ffb4a5;
  --color-on-primary: #650a00;
  --color-primary-container: #ff5637;
  --color-on-primary-container: #590800;

  --color-tertiary: #ffb693;

  --color-outline-variant: #5f3f38;
  
  --color-on-background: #e2e2e2;
  --color-on-surface: #e2e2e2;
  --color-on-surface-variant: #e9bcb3;
}
```
*Note:* We must update `layout.tsx` or `globals.css` base styles to use `background-color: var(--color-background); color: var(--color-on-background);`.

## 3. Component Architecture

### 3.1 GlassNav Component
`components/ui/GlassNav.tsx` will be a Client Component using `framer-motion` for subtle enter animations. It will be mounted in `layout.tsx` or `ObsidianStream.tsx` outside the scrolling fragments to remain fixed.
- **State:** Needs to track the active section based on scroll position. (Will reuse or adapt the existing `useScroll` setup from `ObsidianStream` or rely on simple internal state if complex integration isn't strictly necessary for a fixed nav). For simplicity, it can just be a fixed bar with anchor links.

### 3.2 HudChip Component
`components/ui/HudChip.tsx` will be a stateless, presentational React component receiving `text` or `children` props.
- **Structure:** A simple `div` or `span` with `inline-flex items-center`.
- **Classes:** `bg-surface_container_highest border-l-2 border-primary px-3 py-1 text-label-sm font-mono uppercase tracking-widest text-on_surface_variant rounded-none`.

### 3.3 Fragment Refactoring Strategy
1. **HeroFragment:**
   - Button replacement: Change standard button classes to use Tailwind gradients (`bg-gradient-to-r from-primary to-primary_container`). Add `shadow-[0_0_20px_var(--color-primary)]` for the "Electric Bleed" effect. Ensure `rounded-none`.
2. **ProjectFragment & PortfolioGrid:**
   - Scan for `rounded-[X]` or `rounded-full` utilities and remove them.
   - Scan for `shadow-[X]` and remove them.
   - Replace `bg-void` or `bg-brand-salmon` with `bg-surface_container_low` for cards.
   - Implement hover states: `hover:bg-surface_container_high transition-colors`.

## 4. Technical Trade-offs
- **Trade-off:** Removing all rounded corners might make the UI feel harsh on standard web.
  - *Justification:* This is the explicit goal of the "Dark Kinetic" / "Obsidian Command" spec—it rejects friendly web design for a high-stakes, cinematic feel.
- **Trade-off:** Hardcoding CSS variables in `@theme` instead of `tailwind.config.ts`.
  - *Justification:* The project is already using Tailwind v4's native `@theme` CSS integration, so we must stick to that paradigm for compatibility.

## 5. Security & Performance
- No new external dependencies are required.
- Replacing CSS classes doesn't impact bundle size significantly.
- Glassmorphism (`backdrop-blur`) is GPU-accelerated but can cause performance hits on low-end mobile devices; however, the project is already using it.