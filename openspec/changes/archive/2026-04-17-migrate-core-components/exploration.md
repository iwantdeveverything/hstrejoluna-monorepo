## Exploration: migrate-core-components

### Current State
The portfolio application contains several core UI primitives (`GlitchText`, `CipherText`, `GlowBorder`, `HudChip`, `GlassNav`, `MicroInteraction`, `BootSequence`, `TelemetryHUD`) and hooks (`useReducedMotion`) located in `apps/portfolio/components/ui/` and `apps/portfolio/hooks/`. These components are currently coupled to the application's local directory structure, and some (like `TelemetryHUD`) are tightly coupled to application-specific Sanity types.

### Affected Areas
- `apps/portfolio/components/ui/*.tsx` — Core UI primitives to be extracted.
- `apps/portfolio/hooks/useReducedMotion.ts` — Accessibility hook to be extracted alongside the components that depend on it.
- `packages/ui/src/components/*.tsx` — Target destination for the components.
- `packages/ui/src/hooks/*.ts` — Target destination for the hooks.
- `packages/ui/src/index.ts` — Needs to export the newly migrated components and hooks.

### Approaches
1. **Direct Extraction with Type Decoupling** — Move all independent UI components (`GlitchText`, `CipherText`, `HudChip`, etc.) directly to `@hstrejoluna/ui`. Move `useReducedMotion` hook to `@hstrejoluna/ui/hooks`. Decouple `TelemetryHUD` from Sanity types by mapping its props to generic primitives (`identifier`, `techStack`, `status`, `dateRange`).
   - Pros: Creates a truly agnostic UI package; components are highly reusable.
   - Cons: Requires refactoring `TelemetryHUD` call sites in the portfolio app to map Sanity types to the generic interface.
   - Effort: Medium

2. **Partial Extraction (Leave Coupled Components)** — Move only the pure UI components and leave `TelemetryHUD` in the portfolio app since it relies on Sanity types.
   - Pros: Faster, less refactoring required in the portfolio app.
   - Cons: Fragments the UI system; `TelemetryHUD` is a core visual component that should ideally be in the design system.
   - Effort: Low

### Recommendation
**Approach 1 (Direct Extraction with Type Decoupling)**. Decoupling `TelemetryHUD` from Sanity data types enforces a better container/presentational split and ensures the UI package remains agnostic to the CMS layer. Moving `useReducedMotion` to the UI package ensures components like `GlitchText` remain self-contained.

### Risks
- Moving the `useReducedMotion` hook requires updating imports across the portfolio app.
- Decoupling `TelemetryHUD` might introduce type errors if the mapping in the portfolio app is incomplete.
- Need to ensure Framer Motion animations in `BootSequence` and `MicroInteraction` still work perfectly when imported from the external package.

### Ready for Proposal
Yes — The orchestrator can proceed to `sdd-propose`.