"use client";

/**
 * useLiquidGlassGates
 *
 * Mirrors the CSS-first gating contract (design §5 / ADR-3) into JS state for
 * two narrow purposes:
 *  1. Animation gating — the Framer Motion bridge skips attribute mutation
 *     when `reduceMotion` is true (REQ-6 / S6.4).
 *  2. Storybook fallback-matrix story — drive the same component through
 *     every gate combination via a debug-only override.
 *
 * The hook is NOT the runtime visual gate. CSS owns that surface.
 *
 * SSR safety: when `window` is unavailable the hook returns the most
 * permissive defaults (`LIQUID_GLASS_SSR_DEFAULTS`) so server output matches
 * the most-common client state and avoids hydration jank. After hydration,
 * `useSyncExternalStore` patches state from real `matchMedia` + `CSS.supports`.
 */
import { useSyncExternalStore } from "react";

export interface LiquidGlassGates {
  /** `@supports (backdrop-filter: url("#x"))` — refraction path available. */
  supportsRefraction: boolean;
  /** `@media (prefers-reduced-transparency: reduce)`. */
  reduceTransparency: boolean;
  /** `@media (prefers-reduced-motion: reduce)`. */
  reduceMotion: boolean;
  /** `@media (prefers-reduced-data: reduce)`. */
  reduceData: boolean;
  /** Viewport floor — TRUE when narrower than 480px. */
  isMobile: boolean;
}

export const LIQUID_GLASS_SSR_DEFAULTS: LiquidGlassGates = Object.freeze({
  supportsRefraction: true,
  reduceTransparency: false,
  reduceMotion: false,
  reduceData: false,
  isMobile: false,
});

const QUERIES = {
  reduceTransparency: "(prefers-reduced-transparency: reduce)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
  reduceData: "(prefers-reduced-data: reduce)",
  /** When this matches, the viewport is at least 480px (i.e. NOT mobile). */
  desktopFloor: "(min-width: 480px)",
} as const;

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

const probeSupports = (): boolean => {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return LIQUID_GLASS_SSR_DEFAULTS.supportsRefraction;
  }
  try {
    return CSS.supports("backdrop-filter", 'url("#x")');
  } catch {
    return false;
  }
};

const readSnapshot = (): LiquidGlassGates => {
  if (!isBrowser()) return LIQUID_GLASS_SSR_DEFAULTS;
  const reduceTransparency = window.matchMedia(QUERIES.reduceTransparency)
    .matches;
  const reduceMotion = window.matchMedia(QUERIES.reduceMotion).matches;
  const reduceData = window.matchMedia(QUERIES.reduceData).matches;
  const desktop = window.matchMedia(QUERIES.desktopFloor).matches;
  return {
    supportsRefraction: probeSupports(),
    reduceTransparency,
    reduceMotion,
    reduceData,
    isMobile: !desktop,
  };
};

const subscribe = (notify: () => void): (() => void) => {
  if (!isBrowser()) return () => undefined;
  const lists = Object.values(QUERIES).map((query) =>
    window.matchMedia(query),
  );
  const handler = () => notify();
  for (const list of lists) {
    if (typeof list.addEventListener === "function") {
      list.addEventListener("change", handler);
    } else if (typeof list.addListener === "function") {
      // Older browsers — keep type-safe via cast.
      (list as unknown as MediaQueryList).addListener(handler);
    }
  }
  return () => {
    for (const list of lists) {
      if (typeof list.removeEventListener === "function") {
        list.removeEventListener("change", handler);
      } else if (typeof list.removeListener === "function") {
        (list as unknown as MediaQueryList).removeListener(handler);
      }
    }
  };
};

/**
 * `useSyncExternalStore` requires a stable snapshot reference between calls
 * unless the underlying state actually changed; otherwise React enters an
 * infinite render loop. We memoize via a module-scoped cache keyed by a
 * stringified fingerprint.
 */
let cachedSnapshot: LiquidGlassGates | null = null;
let cachedFingerprint = "";

const getCachedSnapshot = (): LiquidGlassGates => {
  const next = readSnapshot();
  const fingerprint = `${next.supportsRefraction}|${next.reduceTransparency}|${next.reduceMotion}|${next.reduceData}|${next.isMobile}`;
  if (cachedSnapshot && fingerprint === cachedFingerprint) {
    return cachedSnapshot;
  }
  cachedSnapshot = next;
  cachedFingerprint = fingerprint;
  return next;
};

const getServerSnapshot = (): LiquidGlassGates => LIQUID_GLASS_SSR_DEFAULTS;

export const useLiquidGlassGates = (): LiquidGlassGates =>
  useSyncExternalStore(subscribe, getCachedSnapshot, getServerSnapshot);
