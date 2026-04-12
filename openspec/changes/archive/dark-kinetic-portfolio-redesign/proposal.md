# Proposal: Dark Kinetic Portfolio Redesign

## 1. Intent
To fully adapt the existing "Obsidian Stream" portfolio application into the "Dark Kinetic Portfolio" design system, strictly enforcing its principles of absolute blacks, 0px border radii, aggressive typography scale shifts, and high-contrast "danger-zone" accents (Electric Bleed) to achieve a high-end, cinematic, and technically precise aesthetic.

## 2. Scope
- **Global Theme Configuration:** Update `app/globals.css` with the Material 3 color tokens mapped to the Dark Kinetic spec (`#131313` background, `#ffb4a5` primary).
- **Core Components Creation:**
  - `GlassNav.tsx`: A new floating glass navigation bar fixed to the layout.
  - `HudChip.tsx`: A new metadata tag component (0px radius, left-accent line, monospace typography).
- **Refactoring Existing Fragments:**
  - `HeroFragment.tsx`: Update buttons to use Electric Bleed (radial gradient `primary` to `primary_container`), remove current borders, enforce 0px radius.
  - `PortfolioGrid.tsx` / `ProjectFragment.tsx`: Remove all `rounded-[X]` classes, remove standard box-shadows, implement tonal layering (shifting from `surface` to `surface_container_low` on hover), and eliminate 1px divider lines.
  - `SkillsGrid.tsx`: Replace current tags with the new `HudChip.tsx`.
- **Global Polish:** Ensure typography uses `Space Grotesk` for headlines (tight letter-spacing) and Monospace (`label-sm` with `0.1em` tracking) for metadata.

## 3. Approach
1. **Theme Update:** Replace all CSS variables in `@theme` within `globals.css` with the target Dark Kinetic colors. Add generic CSS rules for the new global components (like Electric Bleed animation or ghost borders).
2. **Component Implementation:** Build the new `GlassNav` and `HudChip` components first to establish the baseline for the new UI elements.
3. **Fragment Migration:** Systematically migrate each Fragment (Hero, Project, Experience, Skills) to use the new tokens and structural rules. This involves manually removing Tailwind `rounded-*`, `border`, and `shadow-*` utility classes and replacing them with `bg-surface_container_*`, `border-outline_variant/10`, and tonal layer patterns.
4. **Validation:** Run visual regression checks to ensure the app respects the "No 1px border" and "0px radius" rules entirely.

## 4. Risks & Mitigations
- *Risk:* Overuse of deep blacks (`#131313` vs `#0e0e0e`) may cause elements to blend together, reducing accessibility.
  - *Mitigation:* Strictly adhere to the "Tonal Layering" principle by shifting background containers from `surface` to `surface_container_low` or `surface_container_high` rather than relying on borders or pure black backgrounds everywhere. Use the 10% opacity "Ghost Border" only when strictly necessary for accessibility.