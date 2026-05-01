"use client";

/**
 * <LiquidGlass /> — single shared primitive for translucent glass surfaces in
 * `apps/portfolio` (REQ-1).
 *
 * Design contract (see `sdd/liquid-glass-immersion/design`):
 *  - Polymorphic via `as` (default 'div'). Native attrs of the resolved
 *    element pass through with strict types — no `any` (ADR-7).
 *  - Styling driven by `data-lg-variant` + `data-lg-intensity` attributes
 *    rather than class permutations.
 *  - Runtime visual gates are CSS-first (@supports + @media). The JS hook
 *    `useLiquidGlassGates` mirrors gate state for two narrow uses only:
 *      1. Choosing whether to apply the SVG refraction filter URL inline
 *         (so consumers do not need to know the variant→id mapping).
 *      2. Animation gating in the bridge (`useReducedMotion` short-circuit).
 *  - className is composed via the local `cn` helper (utils/cn.ts) so the
 *    caller string is appended without duplicating internal tokens (S1.4).
 */
import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
} from "react";

import { cn } from "../utils/cn";
import { LG_FILTER_IDS } from "./filter-defs";
import type {
  LiquidGlassIntensity,
  LiquidGlassProps,
  LiquidGlassVariant,
} from "./types";
import { useLiquidGlassGates } from "./use-liquid-glass-gates";

/**
 * Base internal class — variant/intensity styling is selected via
 * `data-lg-*` attributes in `liquid-glass.css`.
 */
const LG_BASE_CLASS = "lg-glass";

const buildBackdropFilter = (
  variant: LiquidGlassVariant,
  supports: boolean,
): string | undefined => {
  if (!supports) return undefined;
  return `url(#${LG_FILTER_IDS[variant]}) blur(var(--lg-blur)) saturate(var(--lg-saturation))`;
};

interface LiquidGlassImplProps extends LiquidGlassProps<ElementType> {
  forwardedRef?: ForwardedRef<Element>;
}

const LiquidGlassImpl = ({
  variant,
  intensity = "med" as LiquidGlassIntensity,
  className,
  children,
  as,
  forwardedRef,
  style: callerStyle,
  ...rest
}: LiquidGlassImplProps): ReactElement => {
  const Component = (as ?? "div") as ElementType;
  const gates = useLiquidGlassGates();

  const refractionState: "url" | "none" = gates.supportsRefraction
    ? "url"
    : "none";
  const fallbackState: "solid" | "translucent" = gates.reduceTransparency
    ? "solid"
    : "translucent";

  const backdrop = buildBackdropFilter(variant, gates.supportsRefraction);

  // CSS variables live on the element so the variant→filter-id mapping is
  // surgical: stylesheet rules read `--lg-backdrop-filter` to apply the
  // correct `backdrop-filter` value without per-variant CSS branching.
  const lgStyle: CSSProperties = backdrop
    ? ({
        ...(callerStyle as CSSProperties | undefined),
        ["--lg-backdrop-filter" as never]: backdrop,
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop,
      } as CSSProperties)
    : ({
        ...(callerStyle as CSSProperties | undefined),
      } as CSSProperties);

  return (
    <Component
      {...rest}
      ref={forwardedRef as never}
      data-lg-variant={variant}
      data-lg-intensity={intensity}
      data-lg-refraction={refractionState}
      data-lg-fallback={fallbackState}
      className={cn(LG_BASE_CLASS, className)}
      style={lgStyle}
    >
      {children}
    </Component>
  );
};

const LiquidGlassFR = forwardRef(function LiquidGlass(
  props: LiquidGlassProps<ElementType>,
  ref: ForwardedRef<Element>,
) {
  return <LiquidGlassImpl {...props} forwardedRef={ref} />;
});

LiquidGlassFR.displayName = "LiquidGlass";

/**
 * <LiquidGlass /> — single shared primitive for translucent glass surfaces.
 * 
 * This component implements the Apple "Liquid Glass" paradigm using a combination
 * of CSS backdrop-filters and SVG refraction maps.
 *
 * @example
 * ```tsx
 * <LiquidGlass variant="panel" intensity="high">
 *   <h1>Glassy Content</h1>
 * </LiquidGlass>
 * ```
 * 
 * @param props.variant - The surface profile ('panel', 'pill', 'dock', 'circle', 'dialog').
 * @param props.intensity - Depth of the refraction/blur ('low', 'med', 'high'). Default is 'med'.
 * @param props.as - The underlying HTML element to render (polymorphic). Default is 'div'.
 */
export const LiquidGlass = LiquidGlassFR as unknown as <
  T extends ElementType = "div",
>(
  props: LiquidGlassProps<T>,
) => ReactElement;
