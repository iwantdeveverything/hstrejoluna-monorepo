# Proposal: Migrate Core Components

## Intent
Extract the remaining core UI components (`GlitchText`, `CipherText`, `GlowBorder`, `HudChip`, `GlassNav`, `MicroInteraction`, `BootSequence`) and the `useReducedMotion` hook from `apps/portfolio` to the shared `@hstrejoluna/ui` package. This standardizes the design system, decouples presentational primitives from application logic, and improves reusability across the workspace.

## Scope

### In Scope
- Move `useReducedMotion` hook to `@hstrejoluna/ui/hooks`.
- Move independent UI components (`GlitchText`, `CipherText`, `GlowBorder`, `HudChip`, `GlassNav`, `MicroInteraction`, `BootSequence`) to `@hstrejoluna/ui/components`.
- Refactor `TelemetryHUD` to accept generic props (decoupled from Sanity types) and move it to `@hstrejoluna/ui`.
- Update import paths in `apps/portfolio`.
- Add Storybook stories for the newly migrated components.

### Out of Scope
- Migrating complex structural fragments (`HeroFragment`, `ProjectFragment`, etc.) that depend heavily on Sanity CMS data fetching and Next.js routing.
- Changing visual design or animations.

## Capabilities

### New Capabilities
- `shared-ui-foundation-expansion`: Expand the shared UI package with advanced visual primitives (glitch, cipher, HUD elements) and accessibility hooks.

### Modified Capabilities
- None

## Approach
**Direct Extraction with Type Decoupling**. We will move the independent components and the `useReducedMotion` hook directly to the shared package. For `TelemetryHUD`, we will define a generic interface (`identifier`, `status`, `metadata`) so it no longer depends on `Project | Experience` from the CMS, ensuring strict container/presentational separation.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/portfolio/components/ui/` | Removed | Primitives are extracted. |
| `apps/portfolio/hooks/` | Removed | `useReducedMotion` is extracted. |
| `packages/ui/src/` | New/Modified | Receives the new components and hooks. |
| `apps/portfolio/` | Modified | Import paths are updated to `@hstrejoluna/ui`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Broken imports in portfolio app | Low | TypeScript compiler will catch missing or incorrect imports. |
| Animation regressions (Framer Motion) | Low | Verify interactions in Storybook locally. |
| Type errors in `TelemetryHUD` refactor | Med | Strictly map Sanity data to the generic HUD interface in the portfolio app adapters. |

## Rollback Plan
Revert the commit that moves the files and updates the imports. The code is isolated and easily revertible.

## Dependencies
- Framer Motion (already peer dependency in `packages/ui`).

## Success Criteria
- [ ] All specified UI primitives are exported from `@hstrejoluna/ui`.
- [ ] `TelemetryHUD` no longer imports `@/types/sanity`.
- [ ] Portfolio app builds successfully (`npm run build`).
- [ ] Storybook runs and displays the new components correctly.