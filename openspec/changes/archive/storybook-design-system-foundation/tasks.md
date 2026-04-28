# Tasks: Storybook Design System Foundation

## Phase 1: Foundation / Tooling

- [x] 1.1 Add Storybook dependencies and scripts in `apps/portfolio/package.json` (`storybook`, `storybook:build`).
- [x] 1.2 Add root delegation scripts in `package.json` for workspace Storybook run/build commands.
- [x] 1.3 Create `apps/portfolio/.storybook/main.ts` with Next.js framework setup, stories globs, and alias-aware config.
- [x] 1.4 Create `apps/portfolio/.storybook/preview.ts` importing `apps/portfolio/app/globals.css` and global parameters/decorators.
- [x] 1.5 Create `apps/portfolio/.storybook/mocks/next.ts` for stable mocks of Next runtime-dependent behavior.

## Phase 2: Storybook Coverage (UI + Fragments)

- [x] 2.1 Create stories for `apps/portfolio/components/ui/CommandNav.tsx` covering default, menu-open, and no-social states.
- [x] 2.2 Create stories for `apps/portfolio/components/ui/SectionDock.tsx` covering active, hidden, and reduced-motion-friendly states.
- [x] 2.3 Create stories for selected fragments in `apps/portfolio/components/fragments/*.tsx` using deterministic mock props.
- [x] 2.4 Ensure stories use local mocks/wrappers so they do not require live Sanity, routing, or network calls.

## Phase 3: Shared UI Foundation (Portability)

- [x] 3.1 Create `packages/ui/package.json` with typed entrypoints and workspace-compatible metadata.
- [x] 3.2 Create `packages/ui/src/index.ts` with public exports for first shared primitives.
- [x] 3.3 Create `packages/ui/src/styles/tokens.css` as shared token source for app and Storybook parity.
- [x] 3.4 Update `apps/portfolio/app/globals.css` to consume/align with shared tokens without visual regressions.
- [x] 3.5 Migrate first batch (`components/ui` + selected `components/fragments`) to shared presentational exports with app adapters preserved.

## Phase 4: CI / Integration Wiring

- [x] 4.1 Update `turbo.json` with Storybook tasks (`storybook`, `storybook:build`) and suitable cache outputs.
- [x] 4.2 Update `.github/workflows/ci.yml` to run Storybook static build when relevant UI/story/token paths change.
- [x] 4.3 Keep existing quality gates (`lint`, `typecheck`, `build`, `test`) intact while adding Storybook validation.

## Phase 5: Verification

- [x] 5.1 Add/update Vitest tests for Storybook-safe adapters/utilities in `apps/portfolio` (deterministic behavior).
- [x] 5.2 Validate `storybook:build` fails on broken-story conditions and passes on healthy stories (spec error-state scenarios).
- [x] 5.3 Validate `apps/portfolio` Playwright flows still pass after shared-import migration.
- [x] 5.4 Run final verification commands (`npm run lint`, `npm run typecheck`, `npm run test`, Storybook build command) and record evidence for `sdd-verify`.
