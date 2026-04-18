# Proposal: Optimize Projects Section

## Intent
Enhance the performance, interactivity, look and feel, and Storybook presence of the portfolio's "Projects" section (`ProjectFragment` and `ProjectsOverview`). The components currently feel heavy and slow down the browser due to unoptimized animations and DOM structure.

## Scope

### In Scope
- Refactor `ProjectFragment` and `ProjectsOverview` to use `m.div` with `LazyMotion` (framer-motion) or CSS transitions to reduce DOM re-renders and bundle size.
- Optimize images using `next/image` with proper `sizes` and placeholders.
- Consolidate glitch and noise effects into CSS variables or pseudo-elements to reduce DOM depth.
- Add comprehensive mock data and stories for both components in Storybook.
- Improve interactive states (hover effects, expansion animation).

### Out of Scope
- Modifying other portfolio sections (e.g., Certificates, Skills).
- Changing the underlying Sanity CMS data structure for projects.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `in-place-expansion-grids`: Optimize DOM structure and animation performance (technical requirement change) while preserving the expansion logic.

## Approach
Implement "Approach 1" from the exploration phase: Optimize DOM, Lazy Load Animations & Enhance Interactivity. Replace `motion.div` with `m.div` and wrap with `LazyMotion` where necessary, or use pure CSS for hover effects. Improve `Image` props. Create rich Storybook files with Sanity mock data.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `apps/portfolio/components/fragments/ProjectFragment.tsx` | Modified | Refactor animations, reduce DOM nodes, optimize images. |
| `apps/portfolio/components/fragments/ProjectsOverview.tsx` | Modified | Refactor animations, optimize images, improve interaction. |
| `apps/portfolio/components/fragments/ProjectFragment.stories.tsx` | Modified | Add proper mock data and coverage. |
| `apps/portfolio/components/fragments/ProjectsOverview.stories.tsx` | New | Create Storybook coverage with mock data. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Framer Motion lazy loading flashes | Low | Provide sensible static CSS defaults before hydration. |
| Grid expansion layout breaks | Medium | Carefully preserve layout IDs and Flex/Grid classes during refactor. |

## Rollback Plan
Revert changes to the `components/fragments/` directory and their respective stories via git checkout to the last known good commit before this branch/change.

## Dependencies
- `@storybook/nextjs-vite`
- `framer-motion`
- `next/image`

## Success Criteria
- [ ] Both components render with significantly fewer absolute DOM layers.
- [ ] Storybook renders `ProjectFragment` and `ProjectsOverview` successfully with mock data.
- [ ] Browser scrolling and grid expansion feel perceptibly lighter and smoother.