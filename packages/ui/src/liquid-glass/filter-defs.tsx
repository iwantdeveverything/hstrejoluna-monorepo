/**
 * Filter id constants and JSX builders for the document-global
 * <LiquidGlassFilters /> defs.
 *
 * - `LG_VARIANTS`: the canonical ordered tuple of variants.
 * - `LG_FILTER_IDS`: stable id per variant.
 * - `renderGooeyFilter`: returns the JSX subtree for the gooey filter.
 */
import { type ReactElement } from "react";
import type { LiquidGlassVariant } from "./types";

export const LG_VARIANTS = [
  "panel",
  "pill",
  "dock",
  "circle",
  "dialog",
] as const satisfies readonly LiquidGlassVariant[];

export const LG_FILTER_IDS: Readonly<Record<"gooey", string>> =
  Object.freeze({
    gooey: "lg-gooey",
  });

/**
 * Filter for the "gooey" effect.
 * Combines a high blur with a color matrix that sharpens the alpha channel
 * to create the melting/fusing look between elements.
 */
export const renderGooeyFilter = (): ReactElement => (
  <filter id={LG_FILTER_IDS.gooey} x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
    <feColorMatrix
      in="blur"
      mode="matrix"
      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
      result="gooey"
    />
    <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
  </filter>
);


