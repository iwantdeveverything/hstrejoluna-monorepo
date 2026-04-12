# Explore: Dark Kinetic Portfolio Redesign

## 1. Request
The user wants to adapt the current portfolio application to the "Dark Kinetic Portfolio" design system fetched from Google Stitch (MCP), emphasizing a deep comparison to implement missing components like the Navbar and correct stylistic deviations.

## 2. Current State (Codebase) vs Dark Kinetic Specs
The current `portfolio` app is built around the "Obsidian Stream" concept, which is close but has several deviations from the pure **Dark Kinetic Portfolio** spec.

### A. Missing or Incorrect Components
1. **Floating Glass Navigation (Navbar):**
   - *Current:* Uses fixed HUD text elements in corners and a vertical scroll indicator on the right.
   - *Dark Kinetic Spec:* Requires a slim, horizontal bar fixed to the top or bottom. Background: `surface_container` at 60% opacity with heavy `backdrop-filter: blur(20px)`. Active links need a 2px underline in `primary` with a glowing `box-shadow`.
2. **HUD Chips (Tags/Skills):**
   - *Current:* Skills and tags use standard pill shapes or simple text.
   - *Dark Kinetic Spec:* Must have `0px` radius, `surface_container_highest` background, and a left-side accent line (2px wide) using the `tertiary` color. Text must be `label-sm` (Monospace).
3. **Cards & Lists (Projects):**
   - *Current:* The `PortfolioGrid` uses Bento-style cards with rounded corners (`rounded-full`, `rounded-[2.5rem]`) and gradients.
   - *Dark Kinetic Spec:* **DON'T use rounded corners. Everything must be 0px.** Forbid dividers. Cards should shift background from `surface` to `surface_container_low` on hover. No standard drop shadows.

### B. Styling & Thematic Rules
1. **Colors & Tonal Layering:**
   - Map Material 3 tokens: `background` (#131313), `surface` (#131313), `surface_container_lowest` (#0e0e0e), `surface_container_low` (#1b1b1b), `surface_container` (#1f1f1f), `surface_container_high` (#2a2a2a), `primary` (#ffb4a5), `primary_container` (#ff5637).
   - *No 1px borders* for sectioning. Use "Ghost Borders" (`outline_variant` at 10%) or tonal shifts.
2. **Buttons (Ignition States):**
   - *Primary:* 0px radius, `primary` background, `on_primary` text. Hover adds a `primary_container` outer glow.
   - *Secondary:* "Ghost Border" (10% opacity), no background.
3. **Typography:**
   - Display: Space Grotesk (Massive, tightly spaced).
   - Body: Inter.
   - Labels/Metadata: Monospace (`label-sm`), always uppercase with `0.1em` letter spacing.

## 3. Technical Approach
1. **CSS Variables (`globals.css`):** Inject the precise M3 color tokens and remove old `--color-void`/`--color-ember`.
2. **Navbar Component:** Create a new `GlassNav.tsx` component adhering to the Floating Glass Navigation spec, and integrate it into the `layout.tsx` or `ObsidianStream.tsx`.
3. **Refactor Fragments:**
   - Update `HeroFragment.tsx` buttons and typography.
   - Update `ProjectFragment.tsx` / `PortfolioGrid.tsx` to remove rounded corners, apply `surface_container` backgrounds, and implement the hover tonal shifts.
   - Create a `HudChip.tsx` component for skills and tags, applying the 0px radius and left-accent line.
4. **General Polish:** Sweep all UI elements to ensure `rounded-none` is applied universally, replacing any `rounded-full` or `rounded-lg` utilities.

## 4. Conclusion
The redesign requires not just color swaps, but structural changes: creating a new Glass Navigation bar, a new HUD Chip component, and rigidly enforcing the "0px radius" and "no 1px border" rules across the existing cinematic stream.