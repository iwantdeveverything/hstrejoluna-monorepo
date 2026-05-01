# Liquid Glass (Apple iOS 26 / macOS Tahoe Style)

A cinematic, physics-driven translucent surface primitive for React 19.

## Overview

The `LiquidGlass` primitive provides refractive, specular surfaces using CSS + SVG filters. It is designed to be the single entry point for glassy UI in the hstrejoluna-monorepo.

## Installation

The component is part of the `@hstrejoluna/ui` package.

```bash
import { LiquidGlass, LiquidGlassFilters } from "@hstrejoluna/ui";
import "@hstrejoluna/ui/styles/liquid-glass.css";
```

## Setup

You MUST mount the `LiquidGlassFilters` exactly once at the root of your application (usually in the root layout) to provide the necessary SVG definitions.

```tsx
// app/[locale]/layout.tsx
import { LiquidGlassFilters } from "@hstrejoluna/ui";

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <LiquidGlassFilters />
        {children}
      </body>
    </html>
  );
}
```

## Usage

### Basic Usage

```tsx
import { LiquidGlass } from "@hstrejoluna/ui";

export const MyComponent = () => (
  <LiquidGlass variant="panel" intensity="med">
    <p>Cinematic Glass Content</p>
  </LiquidGlass>
);
```

### Polymorphism

Use the `as` prop to change the underlying HTML element while maintaining type safety for its attributes.

```tsx
<LiquidGlass as="section" variant="dialog" aria-labelledby="title">
  <h2 id="title">Dialog Title</h2>
</LiquidGlass>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `panel \| pill \| dock \| circle \| dialog` | **Required** | The surface geometry profile. |
| `intensity` | `low \| med \| high` | `med` | The depth of the refraction and specular highlight. |
| `as` | `ElementType` | `div` | The HTML element or React component to render as. |
| `className` | `string` | - | Additional CSS classes to merge. |
| `children` | `ReactNode` | - | Content to be rendered inside the glass surface. |

## Feature Support & Fallbacks

- **Chromium (Blink)**: Full refractive SVG displacement + specular highlights.
- **Safari (WebKit) / Firefox (Gecko)**: Graceful fallback to saturated blur + rim accents.
- **Accessibility**:
  - `prefers-reduced-transparency`: Surfaces become opaque solid containers.
  - `prefers-reduced-motion`: Displacement animations are frozen.
  - `prefers-reduced-data`: Displacement maps are disabled to save bandwidth.
- **Mobile**: Displacement is disabled on viewports < 480px for performance.

## Architecture

For a deep dive into the architecture and design decisions, refer to:
- `sdd/liquid-glass-immersion/spec`
- `sdd/liquid-glass-immersion/design`
