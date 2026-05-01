"use client";

/**
 * Animation bridge for `<feDisplacementMap scale>` (REQ-6 / design §7).
 *
 * Architecture:
 *  - The `<feDisplacementMap>` node is rendered ONCE in the document-global
 *    `<LiquidGlassFilters />` defs. Animations imperatively mutate the
 *    `scale` attribute on that stable node — the node ref persists across
 *    tweens (S6.2) and only the `scale` attribute changes (S6.1).
 *  - `useReducedMotion` short-circuits the binding so the resting attribute
 *    set by `filter-defs.tsx` is never overwritten when the user prefers
 *    reduced motion (S6.4).
 *  - The Framer Motion entry-point loads `domAnimation` only via
 *    `LazyMotion` to keep the bundle bounded (S6.3).
 *
 * The pure functions exported below (`applyDisplacementScale`,
 * `bindDisplacementScale`) keep the contract testable without driving
 * Framer Motion through jsdom — Framer Motion's runtime depends on rAF and
 * is brittle in jsdom. The React hook (`useDisplacementScaleAnimation`)
 * wires those pure functions to a real `MotionValue<number>` at runtime.
 */
import { useEffect, type RefObject } from "react";
import {
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/**
 * Subset of MotionValue-like objects the bridge needs. Keeping this narrow
 * lets the unit tests pass a plain object without pulling Framer Motion's
 * runtime into jsdom.
 */
export interface ScaleSource {
  get: () => number;
  on: (event: "change", listener: (value: number) => void) => () => void;
}

/**
 * Imperatively set the `scale` attribute on a `<feDisplacementMap>` node.
 *
 * Returns silently when the node is null (consumer ref still pending) or
 * when `reduce` is true (S6.4: never mutate when reduced motion is on).
 *
 * @param node — the displacement-map element (may be null pre-mount)
 * @param value — pixel amplitude to set as the new scale
 * @param reduce — when true, the helper is a no-op (S6.4)
 */
export const applyDisplacementScale = (
  node: SVGFEDisplacementMapElement | null,
  value: number,
  reduce: boolean,
): void => {
  if (!node) return;
  if (reduce) return;
  node.setAttribute("scale", String(value));
};

/**
 * Subscribe `applyDisplacementScale` to a MotionValue-like source. The
 * returned cleanup unsubscribes the listener (Framer Motion's `on` returns
 * an unsubscribe function; we pass it through).
 *
 * `getReduce` is a getter, not a snapshot, so flipping reduce-motion mid
 * flight stops further mutation immediately on the next change event.
 */
export const bindDisplacementScale = (
  node: SVGFEDisplacementMapElement | null,
  source: ScaleSource,
  getReduce: () => boolean,
): (() => void) => {
  const unsubscribe = source.on("change", (value) => {
    applyDisplacementScale(node, value, getReduce());
  });
  return unsubscribe;
};

/**
 * Hook variant — pass a `MotionValue<number>` and a `RefObject` to the
 * displacement-map node. The hook gates on `useReducedMotion` and wires
 * the binding inside `useEffect` so SSR is safe.
 *
 * Apps wrap their tree in `<LazyMotion features={domAnimation} />` exactly
 * once (per design §7 / ADR-4) so `framer-motion` only ships its
 * lightweight feature pack.
 */
export const useDisplacementScaleAnimation = (
  ref: RefObject<SVGFEDisplacementMapElement | null>,
  scale: MotionValue<number>,
): void => {
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (reduce) return undefined;
    return bindDisplacementScale(node, scale, () => reduce ?? false);
  }, [ref, scale, reduce]);
};

/**
 * Convenience: a stable `MotionValue<number>` whose initial value matches a
 * resting scale. Apps that drive the dock hover ramp can `useTransform`
 * other motion values into this one.
 */
export const useRestingScale = (resting: number): MotionValue<number> =>
  useMotionValue(resting);
