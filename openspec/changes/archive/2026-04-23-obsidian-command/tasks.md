# Tasks: Obsidian Command Portfolio

## Phase 1: Foundation & UI Atomic Components
- [x] 1.1 Update `apps/portfolio/app/globals.css` with noise textures and custom scroll snap styles.
- [x] 1.2 Create `apps/portfolio/components/ui/GlitchText.tsx` with CSS-based chromatic aberration.
- [x] 1.3 Create `apps/portfolio/components/ui/TelemetryHUD.tsx` to format Sanity metadata (slug, dates, tags).
- [x] 1.4 Test: Verify `GlitchText` renders correctly and `TelemetryHUD` handles missing Sanity fields gracefully.

## Phase 2: Fragment Development
- [x] 2.1 Create `apps/portfolio/components/fragments/HeroFragment.tsx` using `GlitchText` and massive typography.
- [x] 2.2 Create `apps/portfolio/components/fragments/ProjectFragment.tsx` with asymmetric clip-paths and hover reveals.
- [x] 2.3 Create `apps/portfolio/components/fragments/ExperienceFragment.tsx` for the Chrono Log entries.

## Phase 3: Stream Orchestration
- [x] 3.1 Create `apps/portfolio/components/ObsidianStream.tsx` with horizontal/vertical scroll-snap logic.
- [x] 3.2 Implement Framer Motion `useScroll` for parallax effects on background text layers.
- [x] 3.3 Wire `ObsidianStream` in `apps/portfolio/app/page.tsx`, replacing `PortfolioGrid`.

## Phase 4: A11y & SEO Optimization
- [x] 4.1 Implement `prefers-reduced-motion` hook to disable heavy animations/glitches.
- [x] 4.2 Add ARIA labels and roles to all HUD elements for screen reader compatibility.
- [x] 4.3 Configure dynamic JSON-LD structured data in `app/page.tsx` for SEO.

## Phase 5: Polish & Performance
- [x] 5.1 Optimize image loading using Sanity's `urlFor` and Next.js `Image` priority loading for Hero.
- [x] 5.2 Audit Core Web Vitals (LCP/CLS) and refine Framer Motion transition physics.
