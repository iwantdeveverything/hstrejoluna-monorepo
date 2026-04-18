# Tasks: Optimize Projects Section

## Phase 1: Mock Data & Storybook Foundation

- [x] 1.1 Create `apps/portfolio/components/fragments/ProjectsOverview.stories.tsx` and scaffold the basic Storybook Meta setup.
- [x] 1.2 Define robust `Project` mock data arrays in the stories matching the Sanity schema (`_id`, `title`, `description`, `image`, `techStack`, `externalLink`, `micrositePath`).
- [x] 1.3 Fix `apps/portfolio/components/fragments/ProjectFragment.stories.tsx` by importing and applying the new mock data instead of `null`.
- [x] 1.4 Add Interactive stories (e.g., expanded states) to `ProjectsOverview.stories.tsx`.

## Phase 2: Component Refactor - ProjectFragment

- [x] 2.1 Refactor `apps/portfolio/components/fragments/ProjectFragment.tsx`: Replace `motion.div` with `m.div`.
- [x] 2.2 Refactor `ProjectFragment.tsx`: Optimize the `next/image` component (ensure proper `sizes` and remove heavy glitch/scanline extra DOM elements, replacing them with Tailwind pseudo-elements or simplified CSS if possible).
- [x] 2.3 Verify `ProjectFragment` in Storybook to ensure the visual aesthetic (glitch, noise) is preserved but with a lighter DOM.

## Phase 3: Component Refactor - ProjectsOverview

- [x] 3.1 Refactor `apps/portfolio/components/fragments/ProjectsOverview.tsx`: Replace `motion.div` and `AnimatePresence` children with `m.div` and `AnimatePresence` from `framer-motion`.
- [x] 3.2 Refactor `ProjectsOverview.tsx`: Optimize the `next/image` component by adding the `sizes` property.
- [x] 3.3 Verify `ProjectsOverview` in Storybook to ensure the grid expansion animation remains fluid and accurate.

## Phase 4: Application Integration

- [x] 4.1 Update `apps/portfolio/app/page.tsx` (or wherever `ProjectsOverview` is used) to wrap the component tree in a `<LazyMotion features={domAnimation}>` provider so `m.div` features function correctly.
- [x] 4.2 Test the full production build or dev server locally to confirm performance improvements and that animations fire correctly.