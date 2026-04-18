# Design: Migrate Core Components

## Technical Approach
Extract the remaining core UI primitives and the `useReducedMotion` hook from the portfolio application to the shared `@hstrejoluna/ui` package. This involves moving files, updating internal package exports, decoupling application-specific types from UI components (specifically `TelemetryHUD`), and updating all call sites in the portfolio app to use the new package imports.

## Architecture Decisions

### Decision: Decoupling TelemetryHUD
**Choice**: Refactor `TelemetryHUD` to accept a generic props interface (`identifier`, `techStack`, `status`, `dateRange`) instead of Sanity's `Project | Experience` types.
**Alternatives considered**: Keep `TelemetryHUD` in `apps/portfolio` since it's highly specific to the portfolio's data models.
**Rationale**: `TelemetryHUD` is a core visual element of the design language. By enforcing a container/presentational split, we make it highly reusable while keeping the UI package agnostic of the CMS layer.

### Decision: Hook Relocation
**Choice**: Move `useReducedMotion` to `@hstrejoluna/ui/hooks`.
**Alternatives considered**: Pass a `reducedMotion` boolean prop to all components from the app level.
**Rationale**: Many UI primitives (like `GlitchText`) internally manage their own animations. Packaging the hook with the components ensures they remain self-contained and easy to drop into any React application without wiring up external accessibility context.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/ui/src/hooks/useReducedMotion.ts` | Create | Migrated from portfolio. |
| `packages/ui/src/components/{Primitive}.tsx` | Create | Migrated `GlitchText`, `CipherText`, `GlowBorder`, `HudChip`, `GlassNav`, `MicroInteraction`, `BootSequence`, `TelemetryHUD`. |
| `packages/ui/src/index.ts` | Modify | Export the newly added components and hooks. |
| `apps/portfolio/hooks/useReducedMotion.ts` | Delete | Replaced by shared package. |
| `apps/portfolio/components/ui/{Primitive}.tsx` | Delete | Replaced by shared package. |
| `apps/portfolio/components/fragments/*.tsx` | Modify | Update import paths to use `@hstrejoluna/ui`. |

## Interfaces / Contracts

```typescript
// packages/ui/src/components/TelemetryHUD.tsx
export interface TelemetryHUDProps {
  identifier: string; // e.g., slug.current or company name
  status: "LIVE" | "ACTIVE_OPS" | string;
  techStack?: string[]; // Array of technology names
  dateRange?: string; // Formatted date string
  className?: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit/Build | Package boundary exports | Run `npm run typecheck` and `npm run build` to ensure exports and imports are valid. |
| UI/Visual | Component isolation | Add Storybook stories for all migrated components (`npm run storybook:build`). |
| E2E | Layout and Accessibility | Run `npm run qa:e2e` in portfolio to ensure the migration didn't break existing layouts or keyboard navigation. |

## Migration / Rollout
No complex migration required. The changes are strictly structural refactorings and import updates.

## Open Questions
- None.