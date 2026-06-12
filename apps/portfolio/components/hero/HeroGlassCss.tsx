"use client";

/**
 * HeroGlassCss — the `css-only` tier glass (design §1 z-stack, §2 contract,
 * ADR-4; spec: Video Refraction "CSS tier filters the video").
 *
 * Refracts the background video by applying an SVG `feDisplacementMap` filter
 * to the wrapper that HOLDS the video layer element — so the bright ember
 * filaments of the loop visibly bend (refraction reads because the VIDEO bends,
 * not because a fake blur is painted). Layer order (design §1):
 *   video (z-0, lowest) < this glass/refraction wrapper < h1/content (highest).
 * The component owns its own stacking context (`isolation: isolate`) so the
 * filter cannot leak onto the page or the h1.
 *
 * Phase 4 scope = displacement PLUMBING only:
 *  - the `filter: url(#hero-refraction)` wrapper + the `<filter>` defs;
 *  - `computeDisplacementScale` drives the `feDisplacementMap` scale from the
 *    `signals` prop.
 * The Phase 6 physics (useLiquidPointer / useScroll / hero-burst-store) feed
 * that `signals` prop — wired at the `HeroBackdrop` seam in Phase 6, NOT here.
 *
 * jsdom does not paint `filter: url(...)`; the contract is the applied inline
 * style + the DOM presence of the `<filter id="hero-refraction">` defs.
 */
import type { CSSProperties, ReactNode } from "react";
import {
  computeDisplacementScale,
  type DisplacementSignals,
} from "./hero-displacement-bridge";

const FILTER_ID = "hero-refraction";

const rootStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  // Own stacking context so the refraction filter is contained to this layer
  // and the h1/content above it is never displaced (design §1).
  isolation: "isolate",
  pointerEvents: "none",
};

const hiddenSvgStyle: CSSProperties = {
  position: "absolute",
  width: 0,
  height: 0,
  overflow: "hidden",
  pointerEvents: "none",
};

export interface HeroGlassCssProps {
  /** The video layer element(s) to refract (HeroVideoLayer in production). */
  children?: ReactNode;
  /**
   * Displacement signals (Phase 6: useLiquidPointer / useScroll / burst store).
   * Phase 4 leaves this at rest; the seam is wired in Phase 6.
   */
  signals?: DisplacementSignals;
}

/**
 * <HeroRefractionFilter /> — the SVG `<defs>` carrying `#hero-refraction`.
 *
 * `feDisplacementMap` warps the source graphic (the filtered video wrapper)
 * along the channels of a turbulence map; `scale` is the warp amplitude in px,
 * driven by `computeDisplacementScale`. A self-contained `feTurbulence`
 * supplies the displacement field so the filter needs no external image.
 */
const HeroRefractionFilter = ({ scale }: { scale: number }) => (
  <svg aria-hidden="true" data-hero-refraction-defs="" style={hiddenSvgStyle}>
    <defs>
      <filter
        id={FILTER_ID}
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.012"
          numOctaves={2}
          seed={7}
          stitchTiles="stitch"
          result="hero-noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="hero-noise"
          scale={scale}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

export const HeroGlassCss = ({ children, signals }: HeroGlassCssProps) => {
  const scale = computeDisplacementScale(signals);

  return (
    <div data-hero-glass-css="" style={rootStyle} aria-hidden="true">
      <HeroRefractionFilter scale={scale} />
      <div
        data-hero-refraction-target=""
        style={{
          position: "absolute",
          inset: 0,
          filter: `url(#${FILTER_ID})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
