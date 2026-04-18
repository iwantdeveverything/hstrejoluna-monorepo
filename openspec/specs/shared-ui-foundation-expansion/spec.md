# Shared UI Foundation Expansion Specification

## Purpose
Expand the shared `@hstrejoluna/ui` package with advanced visual primitives (glitch, cipher, HUD elements) and accessibility hooks, decoupling them from application-specific dependencies like Sanity CMS types.

## Requirements

### Requirement: Decoupled TelemetryHUD

The `TelemetryHUD` component MUST accept generic properties representing an identifier, technical stack, status, and date range, and MUST NOT import or depend on application-specific CMS types (e.g., `Project | Experience`).

#### Scenario: Rendering generic identifier and status
- GIVEN generic HUD props (identifier: "SYS_01", status: "LIVE")
- WHEN the component is rendered
- THEN it displays the identifier and a pulsing status indicator
- AND no type errors occur without Sanity types

### Requirement: Accessibility Hook Portability

The `useReducedMotion` hook MUST be exported from the shared UI package to allow presentational components to conditionally disable animations.

#### Scenario: Conditionally disabling glitch animation
- GIVEN the user system has `prefers-reduced-motion` enabled
- WHEN `useReducedMotion` is invoked by a component like `GlitchText`
- THEN the hook returns `true`
- AND the component prevents infinite looping animations

### Requirement: Presentational Primitive Exports

The shared package MUST export `GlitchText`, `CipherText`, `GlowBorder`, `HudChip`, `GlassNav`, `MicroInteraction`, and `BootSequence` as generic components.

#### Scenario: Importing primitive in consuming app
- GIVEN an external Next.js application
- WHEN the app imports `GlitchText` from `@hstrejoluna/ui`
- THEN the component renders correctly with its expected styles and animations