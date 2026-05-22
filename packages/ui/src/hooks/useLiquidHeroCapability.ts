"use client";

import { useMemo } from "react";

import { useLiquidGlassGates } from "../liquid-glass/use-liquid-glass-gates";

export type LiquidHeroCapability = "static" | "css-only" | "css+webgl";

const HARDWARE_FLOOR = 4;
const HD_QUERY = "(min-width: 1024px)";

interface NavigatorWithConnection extends Navigator {
  connection?: { saveData?: boolean };
}

import { isBrowser } from "../utils/is-browser";

const probeWebGL2 = (): boolean => {
  if (!isBrowser()) return false;
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl2") !== null;
  } catch {
    return false;
  }
};

const hdViewportMatches = (): boolean => {
  if (!isBrowser()) return false;
  try {
    return window.matchMedia(HD_QUERY).matches;
  } catch {
    return false;
  }
};

const hasIntersectionObserver = (): boolean =>
  isBrowser() &&
  typeof (window as unknown as { IntersectionObserver?: unknown })
    .IntersectionObserver === "function";

const saveDataOn = (): boolean => {
  if (!isBrowser()) return false;
  const conn = (navigator as NavigatorWithConnection).connection;
  return Boolean(conn?.saveData);
};

const hardwareEnough = (): boolean => {
  if (!isBrowser()) return false;
  const cores = navigator.hardwareConcurrency ?? 0;
  return cores >= HARDWARE_FLOOR;
};

/**
 * Compute the liquid hero capability synchronously to avoid a race
 * between `useEffect` and `useSyncExternalStore` finalising its gate
 * snapshot after React hydration (fixes RED task 7.5 / e2e reduced-
 * motion spec).
 */
const computeCapability = (
  gates: ReturnType<typeof useLiquidGlassGates>,
): LiquidHeroCapability => {
  // SSR — always static (matches design §6)
  if (!isBrowser()) return "static";

  // Highest priority: user preference
  if (gates.reduceMotion || gates.reduceTransparency) {
    return "static";
  }

  // Hard floors before WebGL probes
  if (!hasIntersectionObserver()) return "static";

  if (
    !hdViewportMatches() ||
    !hardwareEnough() ||
    saveDataOn() ||
    gates.reduceData ||
    !probeWebGL2()
  ) {
    return "css-only";
  }

  return "css+webgl";
};

export function useLiquidHeroCapability(): LiquidHeroCapability {
  const gates = useLiquidGlassGates();

  return useMemo(
    () => computeCapability(gates),
    [
      gates.reduceMotion,
      gates.reduceTransparency,
      gates.reduceData,
      gates.isMobile,
    ],
  );
}
