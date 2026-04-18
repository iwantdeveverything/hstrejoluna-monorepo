# Tasks: Migrate Core Components

## Phase 1: Foundation & Hooks

- [x] 1.1 Extract `useReducedMotion` hook: Create `packages/ui/src/hooks/useReducedMotion.ts` with code from `apps/portfolio/hooks/useReducedMotion.ts`.
- [x] 1.2 Export hook: Add `export * from "./hooks/useReducedMotion";` to `packages/ui/src/index.ts`.
- [x] 1.3 Update portfolio hook imports: Find and replace `useReducedMotion` imports in `apps/portfolio/components/*` to import from `@hstrejoluna/ui`.
- [x] 1.4 Delete old hook: Remove `apps/portfolio/hooks/useReducedMotion.ts`.

## Phase 2: Simple UI Primitives Migration

- [x] 2.1 Move `GlitchText`: Move `apps/portfolio/components/ui/GlitchText.tsx` to `packages/ui/src/components/GlitchText.tsx`.
- [x] 2.2 Move `CipherText`: Move `apps/portfolio/components/ui/CipherText.tsx` to `packages/ui/src/components/CipherText.tsx`.
- [x] 2.3 Move `GlowBorder`: Move `apps/portfolio/components/ui/GlowBorder.tsx` to `packages/ui/src/components/GlowBorder.tsx`.
- [x] 2.4 Move `HudChip`: Move `apps/portfolio/components/ui/HudChip.tsx` to `packages/ui/src/components/HudChip.tsx`.
- [x] 2.5 Export primitives: Add exports for `GlitchText`, `CipherText`, `GlowBorder`, and `HudChip` to `packages/ui/src/index.ts`.

## Phase 3: Complex UI Primitives Migration

- [x] 3.1 Move `GlassNav`: Move `apps/portfolio/components/ui/GlassNav.tsx` to `packages/ui/src/components/GlassNav.tsx`.
- [x] 3.2 Move `MicroInteraction`: Move `apps/portfolio/components/ui/MicroInteraction.tsx` to `packages/ui/src/components/MicroInteraction.tsx`.
- [x] 3.3 Move `BootSequence`: Move `apps/portfolio/components/ui/BootSequence.tsx` to `packages/ui/src/components/BootSequence.tsx`.
- [x] 3.4 Decouple `TelemetryHUD`: Create `packages/ui/src/components/TelemetryHUD.tsx` with generic props (`identifier`, `techStack`, `status`, `dateRange`).
- [x] 3.5 Export complex primitives: Add exports for `GlassNav`, `MicroInteraction`, `BootSequence`, and `TelemetryHUD` to `packages/ui/src/index.ts`.

## Phase 4: Consumer Updates & Cleanup

- [x] 4.1 Update `TelemetryHUD` consumers: Update calls to `TelemetryHUD` in `apps/portfolio/components/fragments/*` to map Sanity data to the new generic props.
- [x] 4.2 Update primitive imports: Find and replace imports for the migrated components in `apps/portfolio` to point to `@hstrejoluna/ui`.
- [x] 4.3 Delete old primitives: Remove the old files from `apps/portfolio/components/ui/`.
- [x] 4.4 Build check: Run `npm run build` to verify there are no import or type errors.

## Phase 5: Storybook & Testing Validation

- [x] 5.1 Create Stories: Add stories for the newly migrated components in `apps/portfolio/.storybook/` or alongside components.
- [x] 5.2 Validate Storybook: Run `npm run storybook:build --workspace=apps/portfolio` to ensure the new stories render successfully.
- [x] 5.3 Validate E2E: Run `npm run qa:e2e --workspace=apps/portfolio` to verify accessibility and layout remain intact.