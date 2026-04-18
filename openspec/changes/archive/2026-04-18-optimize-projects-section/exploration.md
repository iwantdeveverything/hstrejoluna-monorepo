## Exploration: optimize-projects-section

### Current State
The portfolio's "Projects" section utilizes two primary components: `ProjectFragment.tsx` (for a single project with an asymmetric cinematic fragment and HUD data) and `ProjectsOverview.tsx` (a grid of projects that expand accordion-style). 

Both components heavily rely on `framer-motion` for animations, rendering multiple nested absolute layers to achieve digital noise, scanlines, and glitch effects. Images are loaded via `next/image` but some lack proper `sizes` hints (like in `ProjectsOverview.tsx`) or blur placeholders. 

Storybook presence is highly incomplete. `ProjectFragment.stories.tsx` is broken (passes `project: null`), and `ProjectsOverview.tsx` has no stories at all.

### Affected Areas
- `apps/portfolio/components/fragments/ProjectFragment.tsx` — Heavy DOM structure for styling effects; full `motion.div` usage.
- `apps/portfolio/components/fragments/ProjectsOverview.tsx` — Layout animations, accordion logic, heavy hover overlays, missing `sizes` on `Image`.
- `apps/portfolio/components/fragments/ProjectFragment.stories.tsx` — Incomplete/Broken Story.
- `apps/portfolio/components/fragments/ProjectsOverview.stories.tsx` — Does not exist.

### Approaches
1. **Optimize DOM, Lazy Load Animations & Enhance Interactivity (Recommended)**
   - **Pros**: Reduces DOM nodes by consolidating visual effects via CSS classes/variables. Defers `framer-motion` parsing using `LazyMotion` and `m` components (or refactors simple intersection observations to pure CSS). Improves loading times by optimizing `next/image` with `sizes`. Adds smooth, highly interactive states (like magnetic interactions or nuanced spring animations) that feel premium. Provides robust Storybook coverage using comprehensive mock data.
   - **Cons**: Requires refactoring the current layout elements and updating framer-motion imports.
   - **Effort**: Medium

2. **Pure React State & CSS Keyframes Only**
   - **Pros**: Completely removes `framer-motion` overhead, resulting in the lightest possible bundle.
   - **Cons**: Implementing fluid layout animations (like expanding the grid cards) is notoriously difficult in pure CSS/React without layout calculation libraries. Would lose the cinematic "feel".
   - **Effort**: High

### Recommendation
Proceed with **Approach 1 (Optimize DOM, Lazy Load Animations & Enhance Interactivity)**. This retains the premium cinematic feel while stripping out the rendering bloat. By consolidating the visual noise/glitch effects to pseudo-elements (`::before`/`::after`) or CSS variables, we decrease the total DOM node count. Adding proper mock data to Storybook will enable us to isolate the components and iterate on their "Look and Feel" without running the full Next.js stack.

### Risks
- Migrating `motion.div` to `m.div` with `LazyMotion` might cause brief flashes of unstyled content if the features bundle isn't loaded quickly enough, but this is usually negligible.
- Complex grid layout animations in `ProjectsOverview.tsx` need careful handling of layout IDs to prevent breaking the flex/grid behavior.

### Ready for Proposal
Yes — Proceed to the `sdd-propose` phase.