/**
 * hero-displacement-bridge — the pure signal→`feDisplacementMap.scale` mapping
 * for the `css-only` tier (design §4.1 / §4.3 / §4.4).
 *
 * Phase 4 ships only the PLUMBING: a deterministic function the future physics
 * signals drive. The actual signal SOURCES land in Phase 6:
 *  - `pointerVelocity` ← `useLiquidPointer` rAF-throttled velocity magnitude;
 *  - `scrollProgress`  ← framer-motion `useScroll` progress (0..1), frozen
 *    off-viewport;
 *  - `burst`           ← `hero-burst-store` once-per-page-load `0→1→idle` ramp.
 *
 * Keeping this a pure, side-effect-free function lets the Phase 4 tests pin the
 * displacement response WITHOUT pulling in the Phase 6 hooks, and lets Phase 6
 * wire real signals in without touching the math.
 */

/** Resting displacement (px) — subtle refraction even when idle. */
export const BASE_DISPLACEMENT_SCALE = 12;

/** Upper clamp (px) so combined signals never over-warp the video. */
export const MAX_DISPLACEMENT_SCALE = 48;

/** Per-signal contribution weights (px at signal === 1). */
const POINTER_WEIGHT = 14;
const SCROLL_WEIGHT = 10;
const BURST_WEIGHT = 20;

export interface DisplacementSignals {
  /** Pointer velocity magnitude, normalized 0..1 (Phase 6: useLiquidPointer). */
  pointerVelocity?: number;
  /** Scroll progress across the hero, 0..1 (Phase 6: useScroll). */
  scrollProgress?: number;
  /** Entrance/click burst ramp, 0..1 (Phase 6: hero-burst-store). */
  burst?: number;
}

const clamp01 = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

/**
 * Map displacement signals to an `feDisplacementMap` scale in px.
 * Rests at `BASE_DISPLACEMENT_SCALE`, rises with each signal, and is
 * clamped to `MAX_DISPLACEMENT_SCALE`.
 */
export const computeDisplacementScale = (
  signals: DisplacementSignals = {},
): number => {
  const pointer = clamp01(signals.pointerVelocity ?? 0) * POINTER_WEIGHT;
  const scroll = clamp01(signals.scrollProgress ?? 0) * SCROLL_WEIGHT;
  const burst = clamp01(signals.burst ?? 0) * BURST_WEIGHT;
  const raw = BASE_DISPLACEMENT_SCALE + pointer + scroll + burst;
  return Math.min(MAX_DISPLACEMENT_SCALE, raw);
};
