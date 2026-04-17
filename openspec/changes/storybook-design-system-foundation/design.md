# Design: Storybook Design System Foundation

## Technical Approach

Implement a phased architecture aligned with the specs: bootstrap Storybook in `apps/portfolio` first, then extract reusable presentational UI into `packages/ui`.  
Phase 1 targets fast feedback using existing app conventions (`@` alias from `tsconfig.json`, Tailwind v4 from `app/globals.css`, Vitest/RTL style of deterministic mocks).  
Phase 2 formalizes portability by moving shareable components and tokens to package exports while preserving app adapters for runtime-specific concerns (Sanity fetches, routing, analytics).

## Architecture Decisions

### Decision: Storybook scope starts in one app
**Choice**: Start with `apps/portfolio/.storybook` and workspace scripts before creating monorepo-global Storybook.
**Alternatives considered**: Root-level Storybook from day one; Storybook per every app simultaneously.
**Rationale**: `apps/portfolio` already has the densest component surface and test baseline (`vitest.config.ts`, RTL tests), so pilot risk and CI cost are lower.

### Decision: Container/presentational split for portability
**Choice**: Keep app-coupled logic in app containers and extract only presentational primitives to `packages/ui`.
**Alternatives considered**: Move all components directly to shared package; keep everything app-local.
**Rationale**: Current components include `next/image`, `next/link`, CMS-bound types, and motion state. Incremental extraction avoids regressions while enabling reuse.

### Decision: Static Storybook build as QA contract
**Choice**: Add deterministic Storybook build command to quality gates, triggered conditionally when UI/story/shared-token paths change.
**Alternatives considered**: No CI validation; run on every PR; snapshot-only assertions.
**Rationale**: Spec requires reproducible build validation, while conditional triggering controls CI cost and runtime.

## Data Flow

### Story authoring and rendering

    Component source (`apps/portfolio/components/*`)
      -> Story file (`*.stories.tsx`)
      -> Storybook preview decorators (styles + mocks)
      -> Browser canvas with controls/args
      -> Developer validates states

### CI validation path

    Pull Request
      -> `npm ci`
      -> `npm run storybook:build --workspace=apps/portfolio`
      -> pass/fail check in `.github/workflows/ci.yml`

### Shared UI adoption path (Phase 2)

    `apps/portfolio/components/*`
      -> extract presentational primitive
      -> `packages/ui/src/*` + typed exports
      -> app imports from `packages/ui`
      -> same component documented in Storybook

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/portfolio/.storybook/main.ts` | Create | Storybook framework config for Next.js + stories discovery. |
| `apps/portfolio/.storybook/preview.ts` | Create | Global decorators/imports (`globals.css`, shared wrappers, controls parameters). |
| `apps/portfolio/.storybook/mocks/next.ts` | Create | Stable Storybook mocks for `next/image`, routing, and runtime-safe defaults. |
| `apps/portfolio/components/ui/*.stories.tsx` | Create | Baseline stories for interactive nav and UI primitives. |
| `apps/portfolio/components/fragments/*.stories.tsx` | Create | Stories for selected fragment states with deterministic mock data. |
| `apps/portfolio/package.json` | Modify | Add `storybook` and `storybook:build` scripts. |
| `package.json` | Modify | Add root scripts delegating Storybook workspace commands. |
| `turbo.json` | Modify | Add Storybook tasks for orchestration and caching strategy. |
| `.github/workflows/ci.yml` | Modify | Add Storybook build validation step in quality job. |
| `packages/ui/package.json` | Create | Shared UI package manifest and entrypoints. |
| `packages/ui/src/index.ts` | Create | Public exports for shared components/tokens. |
| `packages/ui/src/styles/tokens.css` | Create | Shared token source consumed by app and Storybook. |
| `apps/portfolio/app/globals.css` | Modify | Align token usage with shared token source during Phase 2. |

## Interfaces / Contracts

```typescript
export interface StorybookHarnessOptions {
  mockRouter?: boolean;
  mockNextImage?: boolean;
  reducedMotion?: boolean;
}

export interface SharedUiExports {
  // Public, stable API only
  CommandSurface: React.ComponentType<CommandSurfaceProps>;
}

export interface CommandSurfaceProps {
  activeId: string;
  hideOnScroll?: boolean;
}
```

Contract notes:
- `packages/ui` MUST expose only documented public exports.
- Storybook stories MUST use deterministic args and local mocks (no live network/CMS dependency).

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Story-safe adapters and token utilities | Vitest tests for mapper/helpers used by stories. |
| Integration | Storybook rendering contracts | Storybook static build in CI + RTL coverage for behavior-critical components. |
| E2E | Portfolio runtime parity after extraction | Existing Playwright flows in `apps/portfolio` to ensure no UX regressions after shared imports. |

## Migration / Rollout

Phase 1 (pilot):
1. Add Storybook config and scripts in `apps/portfolio`.
2. Publish baseline stories for critical UI.
3. Enforce static build in CI.

Phase 2 (portability):
1. Create `packages/ui` with token + component exports.
2. Migrate selected presentational components incrementally.
3. Keep app adapters for runtime-specific behavior.

No data migration required.

## Open Questions

- None. Resolved:
  - First extraction batch includes `components/ui` and selected `components/fragments`.
  - Storybook static build runs in CI only when relevant UI/story/token paths change.
