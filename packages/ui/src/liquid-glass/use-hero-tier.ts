"use client";

/**
 * useHeroTier — the single consolidated tier decider for the liquid-glass
 * hero (design §3). Built ON `useLiquidGlassGates`; no component may
 * hardcode `canRender`.
 *
 * Decision order (first match wins):
 *  1. Kill switch: `NEXT_PUBLIC_HERO_LIQUID !== "true"` → `static`.
 *  2. Preference gates: reduceMotion / reduceData / saveData /
 *     reduceTransparency → `static` (reactive via the gates hook).
 *  3. SSR / pre-hydration snapshot → `static` (safest tier; the poster is
 *     already painted, so a post-hydration upgrade is additive).
 *  4. Mobile viewport (< 1024px) → cap at `css-only`.
 *  5. WebGL2 probe failure OR `reportWebglFailure` latched → `css-only`.
 *  6. Otherwise → `css+webgl`.
 */
import { useCallback, useMemo, useSyncExternalStore } from "react";

import { isBrowser } from "../utils/is-browser";
import {
  useLiquidGlassGates,
  type LiquidGlassGates,
} from "./use-liquid-glass-gates";

export type HeroTier = "static" | "css-only" | "css+webgl";

export interface HeroTierResult {
  tier: HeroTier;
  /** Gate facts exposed for tests/storybook, not for re-deciding. */
  gates: LiquidGlassGates;
  /** Called by the WebGL layer on context/compile failure → demote to css-only. */
  reportWebglFailure: () => void;
}

/** Hero HD viewport — distinct from the 480px floor inside the gates hook. */
const HD_QUERY = "(min-width: 1024px)";

/* ------------------------------------------------------------------ */
/* WebGL2 probe — run once per page load, memoized at module scope.    */
/* ------------------------------------------------------------------ */

let webgl2Probe: boolean | null = null;

const probeWebgl2 = (): boolean => {
  if (!isBrowser()) return false;
  if (webgl2Probe !== null) return webgl2Probe;
  try {
    const canvas = document.createElement("canvas");
    webgl2Probe = canvas.getContext("webgl2") !== null;
  } catch {
    webgl2Probe = false;
  }
  return webgl2Probe;
};

/* ------------------------------------------------------------------ */
/* WebGL failure latch — survives remounts within the same page load.  */
/* ------------------------------------------------------------------ */

let webglFailureLatched = false;
const failureListeners = new Set<() => void>();

const subscribeFailure = (notify: () => void): (() => void) => {
  failureListeners.add(notify);
  return () => {
    failureListeners.delete(notify);
  };
};

const getFailureSnapshot = (): boolean => webglFailureLatched;
const getFailureServerSnapshot = (): boolean => false;

const latchWebglFailure = (): void => {
  if (webglFailureLatched) return;
  webglFailureLatched = true;
  for (const listener of failureListeners) listener();
};

/* ------------------------------------------------------------------ */
/* HD viewport — reactive matchMedia subscription.                     */
/* ------------------------------------------------------------------ */

const subscribeHdViewport = (notify: () => void): (() => void) => {
  if (!isBrowser() || typeof window.matchMedia !== "function") {
    return () => undefined;
  }
  const list = window.matchMedia(HD_QUERY);
  const handler = () => notify();
  if (typeof list.addEventListener === "function") {
    list.addEventListener("change", handler);
    return () => list.removeEventListener("change", handler);
  }
  const legacy = list as unknown as {
    addListener?: (cb: () => void) => void;
    removeListener?: (cb: () => void) => void;
  };
  legacy.addListener?.(handler);
  return () => legacy.removeListener?.(handler);
};

const getHdViewportSnapshot = (): boolean => {
  if (!isBrowser() || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia(HD_QUERY).matches;
  } catch {
    return false;
  }
};

const getHdViewportServerSnapshot = (): boolean => false;

/* ------------------------------------------------------------------ */
/* Hydration sentinel — server snapshot pins the tier to `static`.     */
/* ------------------------------------------------------------------ */

const subscribeNoop = (): (() => void) => () => undefined;
const getHydratedSnapshot = (): boolean => true;
const getHydratedServerSnapshot = (): boolean => false;

const killSwitchOff = (): boolean =>
  process.env.NEXT_PUBLIC_HERO_LIQUID !== "true";

export function useHeroTier(): HeroTierResult {
  const gates = useLiquidGlassGates();
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );
  const hdViewport = useSyncExternalStore(
    subscribeHdViewport,
    getHdViewportSnapshot,
    getHdViewportServerSnapshot,
  );
  const webglFailed = useSyncExternalStore(
    subscribeFailure,
    getFailureSnapshot,
    getFailureServerSnapshot,
  );

  const reportWebglFailure = useCallback(() => {
    latchWebglFailure();
  }, []);

  const tier = useMemo<HeroTier>(() => {
    // 1. Kill switch (also enforced server-side in HeroText — ADR-3).
    if (killSwitchOff()) return "static";
    // 2. Preference gates (reactive via useLiquidGlassGates).
    if (
      gates.reduceMotion ||
      gates.reduceData ||
      gates.saveData ||
      gates.reduceTransparency
    ) {
      return "static";
    }
    // 3. SSR / pre-hydration snapshot.
    if (!hydrated) return "static";
    // 4. Mobile viewport cap.
    if (!hdViewport) return "css-only";
    // 5. WebGL2 probe failure or latched runtime failure.
    if (webglFailed || !probeWebgl2()) return "css-only";
    // 6. Full experience.
    return "css+webgl";
  }, [gates, hydrated, hdViewport, webglFailed]);

  return useMemo(
    () => ({ tier, gates, reportWebglFailure }),
    [tier, gates, reportWebglFailure],
  );
}
