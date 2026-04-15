# Proposal: Portfolio Navigation Overhaul

## Intent

The current horizontal stream forces viewers into a massive cognitive load by restricting visibility to a single item at a time. The intention here is to refactor the architecture into an elite vertical section-based grid layout ("bird's eye view") with zero context switching, fulfilling the user expectation for a modern, highly interactive portfolio. This will significantly improve browsability, allowing users to select single projects, experiences, or skills to see details conditionally expanded *in-place*.

## Scope

### In Scope
- Refactor `ObsidianStream.tsx` from horizontal scroll to vertical anchor layout.
- Implementation of `ProjectsOverview`, `ExperienceOverview`, and `SkillsOverview` grid fragments.
- Implementation of dynamic *In-place expansions* via Framer Motion's `AnimatePresence`.
- Implementation of `CommandNav` (a bottom-fixed glass panel with item live counts).
- Implementation of `SectionDock` (a right-fixed dot navigation timeline, powered by an intersection observer).
- Refactoring `globals.css` structure to drop horizontal locking utilities without breaking the Dark Kinetic baseline.

### Out of Scope
- Full-page Next.js Application router transitions (maintaining single-page feel).
- Backend CMS (Sanity) modifications (the payload structure remains identical, only presentation changes).

## Capabilities

### New Capabilities
- `vertical-navigation-hud`: A scroll-bound IntersectionObserver HUD navigation system managing state for the SectionDock and CommandNav.
- `in-place-expansion-grids`: The implementation pattern managing responsive grids (`1x1` to `3x3`) injecting expansive flex-panels in line with content.

### Modified Capabilities
- None

## Approach

We will restructure `globals.css` and the `utils.ts` wrapper logic first to ensure the core orchestrator `ObsidianStream` can render components vertically. Next, a custom edge hook (`useActiveSection`) will be created utilizing an `IntersectionObserver` to detect viewport thresholds. Using this hook, we'll mount the `CommandNav` and `SectionDock`. Finally, the existing `*Fragment.tsx` legacy pieces will be retooled inside new `*Overview.tsx` grids which iterate over the Sanity datasets and mount the fragments through Framer Motion conditional animations upon click.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/portfolio/components/ObsidianStream.tsx` | Modified | Total refactoring to vertical flow. |
| `apps/portfolio/app/globals.css` | Modified | Horizontal snap rules deleted, new section-layout classes added. |
| `apps/portfolio/components/ui/GlassNav.tsx` | Removed | Outdated static nav. |
| `apps/portfolio/components/ui/CommandNav.tsx` | New | Smart glass HUD tracking active state. |
| `apps/portfolio/components/ui/SectionDock.tsx` | New | Desktop vertical navigation dots. |
| `apps/portfolio/hooks/useActiveSection.ts` | New | HUD scroll tracker hook. |
| `apps/portfolio/components/fragments/*Overview.tsx`| New | The actual grids rendering the views. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Framer motion height layout snapping glitch when grids reflow. | Med | Use absolute container heights via `layout` prop on siblings during presence changes. |
| Mobile layout overlap with bottom CommandNav. | High | Set explicit padding-bottom tokens matching CommandNav height. |

## Rollback Plan

Revert git history and wipe the `openspec/changes/portfolio-navigation` directory. No database migrations exist for this feature, making the rollback purely presentational.

## Dependencies

- Framer Motion (already in project dependencies)
- React 19 (Hooks capability for Intersection APIs)

## Success Criteria

- [ ] Users can scroll vertically from top to bottom through Hero -> Projects -> Experience -> Skills.
- [ ] Clicking a project card expands it vertically without displacing the horizontal axis or opening a modal global route.
- [ ] The bottom CommandNav accurately logs current section ID and item arrays length (e.g. `[04]`).
