# Tasks: Dark Kinetic Portfolio Redesign

## Phase 1: Foundation (Theme & CSS)
- [ ] 1.1 Update `app/globals.css`: Replace existing `@theme` block with the new Material 3 / Dark Kinetic color variables.
- [ ] 1.2 Update `app/globals.css`: Apply `--color-background` and `--color-on-background` to `:root` and `body`.

## Phase 2: Core Components
- [ ] 2.1 Create `components/ui/HudChip.tsx`: Implement the 0px radius, left-accent border tag component.
- [ ] 2.2 Create `components/ui/GlassNav.tsx`: Implement the floating glassmorphism navigation bar.
- [ ] 2.3 Integrate `GlassNav.tsx`: Add the new navigation bar to `components/ObsidianStream.tsx` or `app/layout.tsx`.

## Phase 3: Fragments Refactoring (The 0px Radius Rule)
- [ ] 3.1 Refactor `HeroFragment.tsx`: 
    - Update main CTA button to use "Electric Bleed" gradient (`bg-gradient-to-r from-primary to-primary_container`).
    - Remove `rounded-full` or any border radius.
- [ ] 3.2 Refactor `PortfolioGrid.tsx` & `ProjectFragment.tsx`:
    - Remove all `rounded-[X]` classes (replace with `rounded-none`).
    - Update backgrounds to use `bg-surface_container_low` and implement `hover:bg-surface_container_high`.
    - Remove heavy shadows (`shadow-2xl`) and 1px dividers.
- [ ] 3.3 Refactor `SkillsGrid.tsx`:
    - Swap out existing generic skill pills with the new `HudChip` component.
    - Enforce 0px radius across the grid.
- [ ] 3.4 Refactor `ExperienceFragment.tsx` (if applicable):
    - Ensure timelines and cards use 0px borders and tonal layering.

## Phase 4: Polish & Validation
- [ ] 4.1 Perform global search for `rounded-` in `apps/portfolio/components` and remove any stragglers.
- [ ] 4.2 Verify Typography: Ensure all headlines use `Space Grotesk` and metadata uses `label-sm` monospace.
- [ ] 4.3 Manual visual verification to ensure strict adherence to Dark Kinetic specs.