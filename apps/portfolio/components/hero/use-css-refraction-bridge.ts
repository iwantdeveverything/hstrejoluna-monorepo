"use client";

/**
 * useCssRefractionBridge — the css-only tier's rAF "attribute bridge"
 * (design §4.1/§4.3/§4.4; spec: Cursor-Reactive Distortion, Scroll-driven
 * distortion, Entrance burst splash).
 *
 * The physics signals live in REFS (pointer/scroll/burst) so the WebGL frame
 * loop can read them without re-rendering. But the css-only tier has no R3F
 * loop, and refs don't trigger React re-renders — so a `signals` prop snapshot
 * would be stale. This hook closes that gap: a single rAF loop reads the refs
 * each frame and imperatively mutates the live `feDisplacementMap.scale`
 * attribute plus writes `--mx/--my` CSS custom properties on the css target.
 * That is what makes pointer movement VISIBLY distort the css-only glass.
 *
 * Gating: when `enabled` is false (reduce-motion, fed from the gate) no loop is
 * scheduled. The loop is cancelled on unmount.
 */
import { useEffect, type RefObject } from "react";

import {
  computeDisplacementScale,
  type DisplacementSignals,
} from "./hero-displacement-bridge";
import type { PointerSignal } from "./hero-uniform-sync";

/** Pointer ref shape (superset of PointerSignal — includes velocity). */
interface PointerVelocitySignal extends PointerSignal {
  vx: number;
  vy: number;
}

export interface UseCssRefractionBridgeOptions {
  /** Master switch (reduce-motion off). No loop scheduled when false. */
  enabled: boolean;
  /** The live `feDisplacementMap` whose `scale` attribute is driven. */
  mapRef: RefObject<SVGElement | null>;
  /** Element to receive `--mx/--my` CSS vars. */
  cssTargetRef?: RefObject<HTMLElement | null>;
  /** Pointer signal ref (useLiquidPointer). */
  pointerRef: RefObject<PointerVelocitySignal | null>;
  /** Scroll progress ref (0..1), frozen off-viewport. */
  scrollRef: RefObject<number>;
  /** Burst ramp ref (0..1). */
  burstRef: RefObject<number>;
}

/** Pointer velocity magnitude (already clamped per-axis to [-1,1] upstream). */
const pointerVelocityMagnitude = (p: PointerVelocitySignal | null): number => {
  if (!p) return 0;
  const mag = Math.hypot(p.vx, p.vy);
  return mag > 1 ? 1 : mag;
};

export function useCssRefractionBridge({
  enabled,
  mapRef,
  cssTargetRef,
  pointerRef,
  scrollRef,
  burstRef,
}: UseCssRefractionBridgeOptions): void {
  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    const frame = () => {
      const pointer = pointerRef.current;
      const signals: DisplacementSignals = {
        pointerVelocity: pointerVelocityMagnitude(pointer),
        scrollProgress: scrollRef.current ?? 0,
        burst: burstRef.current ?? 0,
      };

      const map = mapRef.current;
      if (map) {
        map.setAttribute("scale", computeDisplacementScale(signals).toFixed(2));
      }

      const cssTarget = cssTargetRef?.current;
      if (cssTarget && pointer) {
        cssTarget.style.setProperty("--mx", pointer.mx.toFixed(3));
        cssTarget.style.setProperty("--my", pointer.my.toFixed(3));
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
    };
  }, [enabled, mapRef, cssTargetRef, pointerRef, scrollRef, burstRef]);
}
