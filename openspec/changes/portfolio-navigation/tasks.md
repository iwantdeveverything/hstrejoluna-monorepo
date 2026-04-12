# Tasks: Portfolio Navigation Overhaul

## Phase 1: Foundation (CSS & Hooks)
- [ ] Implement `useActiveSection.ts` hook invoking the `IntersectionObserver` over a given set of string IDs.
- [ ] Refactor `apps/portfolio/app/globals.css`. Cut all `scroll-snap` horizontal bindings and replace with semantic `.stream-section` mapping for uniform min-height padding.

## Phase 2: Navigation UI Components
- [ ] Scaffold `apps/portfolio/components/ui/SectionDock.tsx` component applying absolute positioning over the right axis (`hidden lg:flex`). Hook into `useActiveSection`.
- [ ] Scaffold `apps/portfolio/components/ui/CommandNav.tsx` integrating active IDs and parsing array lengths.

## Phase 3: The Expanding Grids
- [ ] Implement `ProjectsOverview.tsx` leveraging `AnimatePresence`. Display list in grid. Assign inline toggle state hooking framer's `layout` transitions.
- [ ] Implement `ExperienceOverview.tsx` rendering chronologies vertically with active spine tracking markers.
- [ ] Implement `SkillsOverview.tsx` parsing technical maps dynamically. Setup detail states rendering HudChips.

## Phase 4: Integration
- [ ] Modify `apps/portfolio/components/ObsidianStream.tsx`. Transform into a `div flex col` stack directly mapping `<section id="...">` for each fragment output. Wire dynamic navigation fragments below payload mappings.

## Phase 5: Verification
- [ ] Run typescript type checks via `npx tsc --noEmit` locally.
