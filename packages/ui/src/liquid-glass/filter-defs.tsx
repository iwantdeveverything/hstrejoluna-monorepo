/**
 * Filter id constants and JSX builders for the document-global
 * <LiquidGlassFilters /> defs.
 *
 * - `LG_VARIANTS`: the canonical ordered tuple of variants.
 * - `LG_FILTER_IDS`: stable id per variant — referenced by CSS via
 *   `backdrop-filter: url(#lg-refraction-{variant})` (REQ-2 S2.2).
 * - `LG_RESTING_SCALE`: pixel amplitude of the refraction at rest, per
 *   variant. The default `<feDisplacementMap scale>` attribute is
 *   initialized from this lookup (design §3 and §7).
 * - `renderFilter`: returns the JSX subtree for one filter — kept here so
 *   <LiquidGlassFilters /> can map over LG_VARIANTS without inlining
 *   filter graphs.
 */
import { Fragment, type ReactElement } from "react";
import { LG_DISPLACEMENT_MAPS } from "./displacement-maps";
import type { LiquidGlassVariant } from "./types";

export const LG_VARIANTS = [
  "panel",
  "pill",
  "dock",
  "circle",
  "dialog",
] as const satisfies readonly LiquidGlassVariant[];

export const LG_FILTER_IDS: Readonly<Record<LiquidGlassVariant, string>> =
  Object.freeze({
    panel: "lg-refraction-panel",
    pill: "lg-refraction-pill",
    dock: "lg-refraction-dock",
    circle: "lg-refraction-circle",
    dialog: "lg-refraction-dialog",
  });

/** Pixel amplitude of the refraction at rest, per variant (design §3). */
export const LG_RESTING_SCALE: Readonly<Record<LiquidGlassVariant, number>> =
  Object.freeze({
    panel: 9,
    pill: 6,
    dock: 12,
    circle: 8,
    dialog: 9,
  });

/**
 * Build the <filter> JSX for a single variant. Animations imperatively
 * mutate ONLY the `scale` attribute on the <feDisplacementMap> via a stable
 * ref (REQ-6). The map's <feImage> child is never rebuilt.
 */
export const renderFilter = (
  variant: LiquidGlassVariant,
  restingScale: number = LG_RESTING_SCALE[variant],
): ReactElement => (
  <filter
    key={LG_FILTER_IDS[variant]}
    id={LG_FILTER_IDS[variant]}
    x="-10%"
    y="-10%"
    width="120%"
    height="120%"
    filterUnits="objectBoundingBox"
    primitiveUnits="userSpaceOnUse"
  >
    <Fragment>
      <feImage
        href={LG_DISPLACEMENT_MAPS[variant]}
        x="0"
        y="0"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        result="dispMap"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="dispMap"
        scale={restingScale}
        xChannelSelector="R"
        yChannelSelector="G"
        result="refracted"
      />
      <feGaussianBlur in="refracted" stdDeviation="0.6" result="softened" />
      <feMerge>
        <feMergeNode in="softened" />
      </feMerge>
    </Fragment>
  </filter>
);
