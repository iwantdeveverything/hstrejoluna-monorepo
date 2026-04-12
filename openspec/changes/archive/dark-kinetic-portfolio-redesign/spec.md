# Specification: Dark Kinetic Portfolio Redesign

## 1. Overview
The goal is to adapt the Obsidian Stream portfolio to the strict Dark Kinetic Portfolio design system from Google Stitch. This redesign enforces a dark mode aesthetic (`#131313`), "No-Line" sectioning (tonal shifts instead of 1px borders), 0px radius across the board, and specific "Electric Bleed" textures for call-to-action buttons.

## 2. Requirements

### 2.1 CSS & Theme (`app/globals.css`)
- **Theme Variables Update:**
  - Replace the current custom `--color-*` variables with Material 3 tokens.
  - `--color-background`: `#131313`
  - `--color-surface`: `#131313`
  - `--color-surface-container-lowest`: `#0e0e0e`
  - `--color-surface-container-low`: `#1b1b1b`
  - `--color-surface-container`: `#1f1f1f`
  - `--color-surface-container-high`: `#2a2a2a`
  - `--color-surface-container-highest`: `#353535`
  - `--color-primary`: `#ffb4a5`
  - `--color-primary-container`: `#ff5637`
  - `--color-on-primary`: `#650a00`
  - `--color-outline-variant`: `#5f3f38`
  - `--color-error`: `#ffb4ab`
  - `--color-on-background` / `--color-on-surface`: `#e2e2e2`
- **Global Styles:**
  - Apply `background-color: var(--color-background)` and `color: var(--color-on-background)` to `:root` and `body`.

### 2.2 New Component: `GlassNav`
- **Location:** `components/ui/GlassNav.tsx`
- **Appearance:** A floating horizontal bar (e.g., fixed at bottom `bottom-8`, horizontally centered).
- **Styling:**
  - Background: `bg-surface_container` with `bg-opacity-60`.
  - Effect: `backdrop-blur-xl` (around `20px` blur).
  - Border: None, or `border border-outline_variant/10`.
  - Links: Include navigation links for "Projects", "Experience", "Skills". Active link gets a `border-b-2 border-primary shadow-[0_2px_10px_var(--color-primary)]` effect.

### 2.3 New Component: `HudChip`
- **Location:** `components/ui/HudChip.tsx`
- **Appearance:** Rectangular tag used for metadata and skills.
- **Styling:**
  - Border Radius: `0px` (`rounded-none`).
  - Background: `bg-surface_container_highest`.
  - Accent: A 2px left border in a tertiary/primary color `border-l-2 border-primary`.
  - Typography: `font-mono text-[var(--text-label-sm)] uppercase tracking-widest text-on_surface_variant`.

### 2.4 Refactoring Existing Components
- **`HeroFragment.tsx`:**
  - Typography: Ensure names and headlines match the `Space Grotesk` massive scale.
  - CTA Button: Change `border-ember` to the "Electric Bleed" gradient (`bg-gradient-to-br from-primary to-primary_container text-on_primary shadow-[0_0_20px_var(--color-primary)] hover:shadow-[0_0_40px_var(--color-primary)]`). `rounded-none`.
- **`ProjectFragment.tsx` / `PortfolioGrid.tsx`:**
  - Replace `rounded-[2.5rem]` or `rounded-3xl` with `rounded-none`.
  - Remove heavy shadows (`shadow-2xl`).
  - Hover states: On hover, the background should shift from `bg-surface` to `bg-surface_container_low` instead of lifting or scaling.
- **`SkillsGrid.tsx`:**
  - Swap out current generic tags/pills for the new `<HudChip />` component.
  - Remove all rounded corners from the grid containers.

## 3. Scenarios
- **Scenario 1:** User loads the page. The background is `#131313`. The floating glass nav bar sits at the bottom, blurring the background as they scroll down.
- **Scenario 2:** User hovers over the main CTA in the Hero section. The button, featuring a gradient from `#ffb4a5` to `#ff5637`, glows intensely with a primary drop-shadow, and its sharp 0px corners remain intact.
- **Scenario 3:** User scrolls to the Skills section. Each skill is presented as a sharp rectangle (`HudChip`) with a distinct left border accent line, looking technical and precise.

## 4. Dependencies
- Tailwind CSS v4 variables in `globals.css` must be correct.
- Frame Motion is already installed for animations.