## Exploration: Portfolio Navigation Overhaul

### Current State
The portfolio is operating as a horizontal cinematic stream (`ObsidianStream.tsx`). It forces viewers to look at one element at a time (e.g., one individual project fragment, one individual experience log). The CSS mandates `scroll-snap-type: x mandatory`. The navigation (`GlassNav.tsx`) relies on basic CSS anchors. There is no grid perspective or overview of categories.

### Affected Areas
- `apps/portfolio/components/ObsidianStream.tsx` — This is the primary orchestrator that currently maps data to fragments horizontally. It will need to transform into a vertical stack of overviews.
- `apps/portfolio/app/globals.css` — Holds the strict `.stream-container` and `.stream-fragment` sizing that enforces horizontal snap. Needs layout refactoring.
- `apps/portfolio/components/fragments/*` — The existing fragments (`ProjectFragment`, `ExperienceFragment`) assume they are full screen. They need to either be refactored or embedded inside modal/expansion states.
- `apps/portfolio/components/ui/GlassNav.tsx` — Too simple for a grid paradigm; requires dynamic active state tracking.

### Approaches

1. **Section-Based App Routing (Standard Multi-Page)**
   - Pros: Built into Next.js naturally, great for SEO, easy to isolate layouts.
   - Cons: Destroys the cinematic "single-system" feel. Requires massive refactor to create individual routes (`/projects`, `/skills`).
   - Effort: High

2. **Vertical Scroll Overviews with In-Place Expansion**
   - Pros: Retains the single-page application feel. Vertical grid overviews provide the requested "bird's eye view," and expanding elements in-place avoids context-breaking page overlays. Better mobile synergy.
   - Cons: Requires removing the current horizontal `snap-x` CSS and replacing the layout logic.
   - Effort: Medium

3. **Horizontal Stream but with Embedded Grid Panels**
   - Pros: Keeps exact current orchestration CSS.
   - Cons: A grid that scrolls vertically inside a horizontal parent panel is usually considered very poor UX / scroll trapping on desktop.
   - Effort: Low

### Recommendation
**Option 2 (Vertical Scroll Overviews with In-Place Expansion)** is by far the highest elite-tier UX choice here. The horizontal tracking must be converted to vertical, unlocking the ability to render responsive grids (Projects, Experience, Skills) that users can scan instantly. The navigation elements (`GlassNav` and new visual indicators) must become aware of scroll states via an `IntersectionObserver`.

### Risks
- Migrating horizontal CSS to vertical might introduce height layout jumps with `framer-motion` parallax backgrounds if not managed properly.
- Expansion elements inside CSS grid could trigger layout shifts without `AnimatePresence`.

### Ready for Proposal
Yes. The domain boundaries are clear and I am ready to formalize the scopes in the proposal phase.
