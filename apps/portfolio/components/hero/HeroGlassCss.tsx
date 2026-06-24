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
import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import {
  computeDisplacementScale,
  type DisplacementSignals,
} from "./hero-displacement-bridge";
import type { PointerSignal } from "./hero-uniform-sync";
import { useCssRefractionBridge } from "./use-css-refraction-bridge";

const FILTER_ID = "hero-refraction";

/** Pointer ref shape consumed by the rAF bridge (includes velocity). */
interface PointerVelocitySignal extends PointerSignal {
  vx: number;
  vy: number;
}

/**
 * Phase 6 live-refraction wiring: the rAF attribute bridge reads the physics
 * signal refs each frame and mutates the feDisplacementMap scale + `--mx/--my`.
 * Absent → the static `signals` snapshot drives the rest-state scale (Phase 4).
 */
export interface HeroCssRefraction {
  enabled: boolean;
  pointerRef: RefObject<PointerVelocitySignal | null>;
  scrollRef: RefObject<number>;
  burstRef: RefObject<number>;
}

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
   * Static displacement-signal snapshot — drives the initial/rest scale. The
   * live per-frame reactivity comes from `refraction` (the rAF bridge).
   */
  signals?: DisplacementSignals;
  /** Phase 6 live refraction wiring (rAF bridge reading the physics refs). */
  refraction?: HeroCssRefraction;
}

/**
 * <HeroRefractionFilter /> — the SVG `<defs>` carrying `#hero-refraction`.
 *
 * `feDisplacementMap` warps the source graphic (the filtered video wrapper)
 * along the channels of a turbulence map; `scale` is the warp amplitude in px,
 * driven by `computeDisplacementScale`. A self-contained `feTurbulence`
 * supplies the displacement field so the filter needs no external image.
 */
const HeroRefractionFilter = ({
  scale,
  mapRef,
}: {
  scale: number;
  mapRef: RefObject<SVGFEDisplacementMapElement | null>;
}) => (
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
          ref={mapRef}
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

export const HeroGlassCss = ({
  children,
  signals,
  refraction,
}: HeroGlassCssProps) => {
  // Rest-state scale (Phase 4 path). When `refraction` is supplied, the rAF
  // bridge overwrites this `scale` attribute imperatively each frame.
  const scale = computeDisplacementScale(signals);
  const mapRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useCssRefractionBridge({
    enabled: refraction?.enabled ?? false,
    mapRef,
    cssTargetRef: targetRef,
    // Idle refs when no live refraction is wired — the bridge is disabled then.
    pointerRef: refraction?.pointerRef ?? { current: null },
    scrollRef: refraction?.scrollRef ?? { current: 0 },
    burstRef: refraction?.burstRef ?? { current: 0 },
  });

  return (
    <div data-hero-glass-css="" style={rootStyle} aria-hidden="true">
      <HeroRefractionFilter scale={scale} mapRef={mapRef} />
      <div
        ref={targetRef}
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
