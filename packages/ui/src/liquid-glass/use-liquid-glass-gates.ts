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
import { isBrowser } from "../utils/is-browser";

export interface LiquidGlassGates {
  /** `@media (prefers-reduced-transparency: reduce)`. */
  reduceTransparency: boolean;
  /** `@media (prefers-reduced-motion: reduce)`. */
  reduceMotion: boolean;
  /** `@media (prefers-reduced-data: reduce)`. */
  reduceData: boolean;
  /**
   * `navigator.connection.saveData` (Network Information API). Practical
   * data-saver gate — `prefers-reduced-data` UA support is poor, so both
   * are exposed and checked independently (design §10).
   */
  saveData: boolean;
  /** Viewport floor — TRUE when narrower than 480px. */
  isMobile: boolean;
}

export const LIQUID_GLASS_SSR_DEFAULTS: LiquidGlassGates = Object.freeze({
  reduceTransparency: false,
  reduceMotion: false,
  reduceData: false,
  saveData: false,
  isMobile: false,
});

const QUERIES = {
  reduceTransparency: "(prefers-reduced-transparency: reduce)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
  reduceData: "(prefers-reduced-data: reduce)",
  /** When this matches, the viewport is at least 480px (i.e. NOT mobile). */
  desktopFloor: "(min-width: 480px)",
} as const;



interface NetworkConnection {
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

const getConnection = (): NetworkConnection | undefined =>
  (navigator as Navigator & { connection?: NetworkConnection }).connection;

const readSaveData = (): boolean => {
  if (!isBrowser()) return false;
  return Boolean(getConnection()?.saveData);
};

const readSnapshot = (): LiquidGlassGates => {
  if (!isBrowser() || typeof window.matchMedia !== "function") return LIQUID_GLASS_SSR_DEFAULTS;
  const reduceTransparency = window.matchMedia(QUERIES.reduceTransparency)
    .matches;
  const reduceMotion = window.matchMedia(QUERIES.reduceMotion).matches;
  const reduceData = window.matchMedia(QUERIES.reduceData).matches;
  const desktop = window.matchMedia(QUERIES.desktopFloor).matches;
  return {
    reduceTransparency,
    reduceMotion,
    reduceData,
    saveData: readSaveData(),
    isMobile: !desktop,
  };
};

const addMediaListener = (list: MediaQueryList, handler: () => void) => {
  if (typeof list.addEventListener === "function") {
    list.addEventListener("change", handler);
  } else {
    const legacy = list as unknown as { addListener: (cb: () => void) => void };
    if (typeof legacy.addListener === "function") {
      legacy.addListener(handler);
    }
  }
};

const removeMediaListener = (list: MediaQueryList, handler: () => void) => {
  if (typeof list.removeEventListener === "function") {
    list.removeEventListener("change", handler);
  } else {
    const legacy = list as unknown as { removeListener: (cb: () => void) => void };
    if (typeof legacy.removeListener === "function") {
      legacy.removeListener(handler);
    }
  }
};

const subscribe = (notify: () => void): (() => void) => {
  if (!isBrowser() || typeof window.matchMedia !== "function") return () => undefined;
  const lists = Object.values(QUERIES).map((query) =>
    window.matchMedia(query),
  );
  const handler = () => notify();
  for (const list of lists) {
    addMediaListener(list, handler);
  }
  const connection = getConnection();
  connection?.addEventListener?.("change", handler);
  return () => {
    for (const list of lists) {
      removeMediaListener(list, handler);
    }
    connection?.removeEventListener?.("change", handler);
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
  const fingerprint = `${next.reduceTransparency}|${next.reduceMotion}|${next.reduceData}|${next.saveData}|${next.isMobile}`;
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
