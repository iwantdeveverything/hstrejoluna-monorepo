# Proposal: Storybook Design System Foundation

## Intent

Create a component workbench that improves documentation and portability across apps. It enables isolated Storybook development and a path to shared UI.

## Scope

### In Scope
- Phase 1: Set up Storybook in `apps/portfolio` with Next.js support, alias resolution, and Tailwind v4 styles.
- Phase 1: Add initial stories for key components in `components/ui` and selected `components/fragments`.
- Phase 1: Add monorepo scripts/tasks for local Storybook and static build.
- Phase 2: Extract reusable presentational components and tokens into `packages/ui`.
- Phase 2: Consume `packages/ui` from `apps/portfolio` while keeping Storybook as the UI catalog.

### Out of Scope
- Full component rewrite in one iteration.
- Changes to Sanity content models or App Router architecture.
- Mandatory paid visual regression tooling.

## Capabilities

### New Capabilities
- `storybook-component-workbench`: Catalog and interactively validate UI states/variants.
- `shared-ui-foundation`: Shared UI/token package for cross-app reuse.

### Modified Capabilities
- `portfolio-testing-foundation`: Add deterministic Storybook static build validation to QA command contracts.

## Approach

Implement a two-step rollout: bootstrap Storybook first in `apps/portfolio`, then migrate stable, app-agnostic components to `packages/ui`. Use light refactors (composition boundaries + mocks) to make components render safely outside page/runtime context.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/portfolio/.storybook/*` | New | Storybook config, preview decorators, framework setup. |
| `apps/portfolio/components/**/*` | Modified | Story files and small storyability refactors. |
| `apps/portfolio/app/globals.css` | Modified | Style/token parity between app and Storybook. |
| `packages/ui/*` | New | Shared reusable components and token exports. |
| `package.json` | Modified | Root Storybook scripts. |
| `turbo.json` | Modified | Storybook tasks in Turborepo pipeline. |
| `.github/workflows/ci.yml` | Modified | Storybook build check integration. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| App-coupled components fail in isolation | Med | Add wrappers/mocks and split container vs presentational layers. |
| Design token drift | Med | Single source of truth for tokens consumed by app and Storybook. |
| Longer CI time | Low/Med | Start with build-only validation; optimize before adding extra checks. |

## Rollback Plan

Remove Storybook config/scripts and revert `packages/ui` imports to local app components. Keep existing app rendering paths and QA commands as fallback baseline.

## Dependencies

- Storybook packages for React/Next.js.
- Existing Tailwind v4 + PostCSS setup.
- Existing CI workflow in `.github/workflows/ci.yml`.

## Success Criteria

- [ ] Storybook runs locally in `apps/portfolio` with expected styles and aliases.
- [ ] CI executes a reproducible Storybook static build command.
- [ ] `packages/ui` exports at least one reusable component set consumed by `apps/portfolio`.
- [ ] Stories cover key default, interaction, and empty/loading states.
