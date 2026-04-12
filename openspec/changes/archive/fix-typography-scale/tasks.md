# Tasks: Fix Typography Scale (SDD)

## Phase 1: Core Utilities
- [ ] 1.1 Update `apps/portfolio/components/ui/HudChip.tsx`: Replace `text-[var(--text-label-sm)]` with `text-label-sm`.

## Phase 2: Main Stream Fragments
- [ ] 2.1 Update `apps/portfolio/components/fragments/SkillsFragment.tsx`: Replace `text-[var(--text-fluid-hero)]` with `text-fluid-hero`.
- [ ] 2.2 Update `apps/portfolio/components/fragments/ProjectFragment.tsx`: Replace `text-[var(--text-fluid-h2)]` with `text-fluid-h2`.
- [ ] 2.3 Update `apps/portfolio/components/fragments/ExperienceFragment.tsx`: Replace `text-[var(--text-fluid-h2)]` with `text-fluid-h2`.
- [ ] 2.4 Update `apps/portfolio/components/fragments/HeroFragment.tsx`: Replace `text-[var(--text-fluid-hero)]` with `text-fluid-hero`.

## Phase 3: Global Containers
- [ ] 3.1 Update `apps/portfolio/components/ObsidianStream.tsx`: Replace `text-[var(--text-fluid-hero)]` with `text-fluid-hero`.
- [ ] 3.2 Update `apps/portfolio/components/PortfolioGrid.tsx`: Replace all `text-[var(--text-label-sm)]` with `text-label-sm`.

## Phase 4: Validation
- [ ] 4.1 Run `npx tsc --noEmit` in `apps/portfolio`.
- [ ] 4.2 Perform final grep to ensure no `text-[var(--text-` patterns remain.
