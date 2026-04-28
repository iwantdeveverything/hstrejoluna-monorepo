# Design: Obsidian Command Portfolio

## Technical Approach
Transform the portfolio into a cinematic, horizontal-scrolling experience (Desktop) and vertical-snap stream (Mobile). We will utilize Next.js 16 (React 19) features for server-side data fetching and Framer Motion for high-performance visual orchestration.

## Architecture Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Scroll Engine** | CSS Snap + Framer Motion | Native performance for scrolling, JS only for parallax/glitch triggers. |
| **Glitch Effects** | CSS Pseudo-elements + Keyframes | Minimizes DOM churn and keeps the main thread free for animations. |
| **Data Fetching** | Server Components (RSC) | Direct Sanity integration with zero client-side fetch overhead. |
| **Styling** | Tailwind 4 | Leverages modern CSS features (layers, variables) for a brutalist aesthetic. |

## Data Flow
Sanity Data -> PortfolioPage (RSC) -> ObsidianStream (Client) -> Fragments (UI)
The stream maps Sanity schemas (Project, Experience) into "Digital Fragments" and "HUD Telemetry".

## File Changes
| File | Action | Description |
|------|--------|-------------|
| `components/ObsidianStream.tsx` | Create | Main horizontal/vertical scroll orchestrator. |
| `components/ui/GlitchText.tsx` | Create | Component for CSS-based glitch and chromatic aberration. |
| `components/ui/TelemetryHUD.tsx` | Create | Floating HUD data display for projects/experience. |
| `components/fragments/HeroFragment.tsx` | Create | High-impact entry fragment. |
| `app/page.tsx` | Modify | Replace PortfolioGrid with ObsidianStream. |
| `app/globals.css` | Modify | Add global noise textures and custom scrollbar styles. |

## Testing Strategy
- **Unit**: Verify `TelemetryHUD` correctly formats Sanity dates and tech stacks.
- **Integration**: Ensure `ObsidianStream` triggers entrance animations on scroll.
- **A11y**: Validate `prefers-reduced-motion` correctly disables heavy animations.

## Open Questions
- [ ] Should we use a Canvas-based noise overlay or a small SVG tile for performance?
- [ ] How many fragments are too many for the horizontal scroll before it feels cluttered?
