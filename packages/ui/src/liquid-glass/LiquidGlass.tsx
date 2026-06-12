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
 *      2. Animation gating in the bridge (`reduceMotion` gate short-circuit).
 *  - className is composed via the local `cn` helper (utils/cn.ts) so the
 *    caller string is appended without duplicating internal tokens (S1.4).
 */
import {
  createElement,
  forwardRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
} from "react";

import { cn } from "../utils/cn";
import type { LiquidGlassProps } from "./types";
import { useLiquidGlassGates } from "./use-liquid-glass-gates";

/**
 * Base internal class — variant/intensity styling is selected via
 * `data-lg-*` attributes in `liquid-glass.css`.
 */
const LG_BASE_CLASS = "lg-glass";

interface LiquidGlassImplProps extends LiquidGlassProps<ElementType> {
  forwardedRef?: ForwardedRef<Element>;
}

const LiquidGlassImpl = ({
  variant,
  intensity = "med",
  className,
  children,
  as,
  forwardedRef,
  style: callerStyle,
  ...rest
}: LiquidGlassImplProps): ReactElement => {
  const Component = as ?? "div";
  const gates = useLiquidGlassGates();

  const fallbackState: "solid" | "translucent" = gates.reduceTransparency
    ? "solid"
    : "translucent";

  return createElement(
    Component,
    {
      ...rest,
      ref: forwardedRef,
      "data-lg-variant": variant,
      "data-lg-intensity": intensity,
      "data-lg-fallback": fallbackState,
      className: cn(LG_BASE_CLASS, className),
      style: callerStyle,
    },
    children,
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
interface LiquidGlassComponent {
  <T extends ElementType = "div">(props: LiquidGlassProps<T>): ReactElement;
  displayName?: string;
}

export const LiquidGlass = LiquidGlassFR as LiquidGlassComponent;
