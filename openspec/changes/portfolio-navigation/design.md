# Design: Portfolio Navigation Overhaul

## Technical Approach

Refactor `ObsidianStream.tsx` from mapping horizontal panels to rendering sequential `<section>` nodes directly on the vertical Y-axis. The active segment tracking will be abstracted into a new `useActiveSection` React hook that attaches a native `IntersectionObserver` directly to DOM element IDs matching the anchor hashes. The data will map into independent grid components (`ProjectsOverview`, `ExperienceOverview`, `SkillsOverview`), where each uses Framer Motion's `<AnimatePresence>` wrapped around a dynamic-height detail pane (`layout="position"` or explicit height injection) to achieve *In-place expansions*.

## Architecture Decisions

### Decision: Hook-based Intersection Observer over Scroll event listener

**Choice**: Custom `useActiveSection` hook with `IntersectionObserver`.
**Alternatives considered**: Traditional `window.addEventListener('scroll')` with bounding rectangle calculations via `getBoundingClientRect()`.
**Rationale**: Native scroll listeners are performance killers in React, frequently causing stutter as state triggers massive re-renders. `IntersectionObserver` executes off the main thread and fires solely upon thresholds breaching, providing jank-free performance.

### Decision: Framer Motion AnimatePresence over CSS native transitions

**Choice**: Use `framer-motion` for expansion grids.
**Alternatives considered**: CSS `max-height` transitions with toggleable classes.
**Rationale**: CSS transition `height: auto` cannot easily be animated reliably without JS workarounds. Framer Motion simplifies dynamic heights via `layout` properties guaranteeing siblings flow organically and layout jumping is mitigated perfectly inside the DOM tree.

## Data Flow

    [ Sanity payload ] 
          │ 
     ObsidianStream
      │           │\
      │           │ ─▶  [ CommandNav / SectionDock (Listens to useActiveSection hook) ]
      ▼           ▼
    Projects    Skills
    Overview    Overview
      │
      └─▶ OnClick: Local State expands details inline within the Grid.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/portfolio/hooks/useActiveSection.ts` | Create | Engine powering scroll recognition. |
| `apps/portfolio/components/ui/SectionDock.tsx` | Create | Desktop dot-timeline HUD. |
| `apps/portfolio/components/ui/CommandNav.tsx` | Create | Bottom HUD glass panel. |
| `apps/portfolio/components/fragments/ProjectsOverview.tsx` | Create | Grid pattern mapping Projects. |
| `apps/portfolio/components/fragments/ExperienceOverview.tsx`| Create | Grid pattern mapping Experience. |
| `apps/portfolio/components/fragments/SkillsOverview.tsx` | Create | Grid pattern mapping Skills. |
| `apps/portfolio/components/ObsidianStream.tsx` | Modify | Orchestration pipeline refactor to vertical. |
| `apps/portfolio/app/globals.css` | Modify | Wipe `scroll-snap-type: x` classes. |

## Interfaces / Contracts

```typescript
// useActiveSection Signature
export function useActiveSection(sectionIds: string[], threshold: number = 0.5): string {
    // Returns the ID of the currently active section based on the observer
}

// Global UI prop mapping expectations
export interface OverviewGridProps<T> {
  dataset: T[];
  activeId: string | null;
  onExpand: (id: string) => void;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | TS Compilations | Use `npx tsc --noEmit` to ensure strong typing logic |
| Integration | IntersectionObserver | Manual browser check traversing the 4 anchor heights |
| E2E | Mobile + Desktop Layouts | Native dev-tools device toggle to verify `SectionDock` strictly disappears `< lg` |

## Migration / Rollout
No database migration required. Pure logical refactoring of the UI mapping nodes. Existing Sanity data matches TS interfaces 1:1.

## Open Questions
- None. The architecture fully supports the required specs.
