/// <reference types="vitest/globals" />
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BASE_DISPLACEMENT_SCALE,
  MAX_DISPLACEMENT_SCALE,
} from "./hero-displacement-bridge";
import { useCssRefractionBridge } from "./use-css-refraction-bridge";

/**
 * useCssRefractionBridge — the css-only tier's rAF "attribute bridge"
 * (design §4.1/§4.3/§4.4; spec: Cursor-Reactive Distortion, Scroll-driven
 * distortion). Refs (pointer/scroll/burst) don't trigger React re-renders, so
 * the css-only tier reads them each frame in a rAF loop and mutates the live
 * `feDisplacementMap.scale` attribute + writes `--mx/--my` CSS vars. This is
 * the mechanism that makes pointer movement VISIBLY distort the css-only glass.
 *
 * The loop is gated by `enabled` (reduce-motion off) and stops on unmount.
 */

/* ── Controllable rAF harness ───────────────────────────────────────── */
let rafQueue: FrameRequestCallback[] = [];
let nextId = 1;
const flushFrame = () => {
  const pending = rafQueue;
  rafQueue = [];
  for (const cb of pending) cb(performance.now());
};

beforeEach(() => {
  rafQueue = [];
  nextId = 1;
  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
    (cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return nextId++;
    },
  );
  vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {
    rafQueue = [];
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const makeMap = () => {
  const el = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "feDisplacementMap",
  );
  el.setAttribute("scale", String(BASE_DISPLACEMENT_SCALE));
  return el;
};

describe("useCssRefractionBridge — displacement scale attribute", () => {
  it("rests at the base scale with idle signals", () => {
    const mapRef = { current: makeMap() };
    renderHook(() =>
      useCssRefractionBridge({
        enabled: true,
        mapRef,
        pointerRef: { current: { mx: 0.5, my: 0.5, vx: 0, vy: 0 } },
        scrollRef: { current: 0 },
        burstRef: { current: 0 },
      }),
    );
    act(() => flushFrame());
    expect(Number(mapRef.current.getAttribute("scale"))).toBeCloseTo(
      BASE_DISPLACEMENT_SCALE,
      1,
    );
  });

  it("raises the scale when the pointer velocity is high", () => {
    const mapRef = { current: makeMap() };
    renderHook(() =>
      useCssRefractionBridge({
        enabled: true,
        mapRef,
        pointerRef: { current: { mx: 0.5, my: 0.5, vx: 1, vy: 1 } },
        scrollRef: { current: 0 },
        burstRef: { current: 0 },
      }),
    );
    act(() => flushFrame());
    expect(Number(mapRef.current.getAttribute("scale"))).toBeGreaterThan(
      BASE_DISPLACEMENT_SCALE,
    );
  });

  it("raises the scale with scroll progress and burst, clamped to the max", () => {
    const mapRef = { current: makeMap() };
    renderHook(() =>
      useCssRefractionBridge({
        enabled: true,
        mapRef,
        pointerRef: { current: { mx: 0.5, my: 0.5, vx: 1, vy: 1 } },
        scrollRef: { current: 1 },
        burstRef: { current: 1 },
      }),
    );
    act(() => flushFrame());
    const scale = Number(mapRef.current.getAttribute("scale"));
    expect(scale).toBeGreaterThan(BASE_DISPLACEMENT_SCALE);
    expect(scale).toBeLessThanOrEqual(MAX_DISPLACEMENT_SCALE);
  });
});

describe("useCssRefractionBridge — CSS custom properties", () => {
  it("writes --mx/--my from the pointer onto the css target", () => {
    const cssTarget = document.createElement("div");
    const mapRef = { current: makeMap() };
    renderHook(() =>
      useCssRefractionBridge({
        enabled: true,
        mapRef,
        cssTargetRef: { current: cssTarget },
        pointerRef: { current: { mx: 0.25, my: 0.75, vx: 0, vy: 0 } },
        scrollRef: { current: 0 },
        burstRef: { current: 0 },
      }),
    );
    act(() => flushFrame());
    expect(cssTarget.style.getPropertyValue("--mx")).toBe("0.250");
    expect(cssTarget.style.getPropertyValue("--my")).toBe("0.750");
  });
});

describe("useCssRefractionBridge — gating + lifecycle", () => {
  it("does not schedule a frame loop when disabled", () => {
    const mapRef = { current: makeMap() };
    renderHook(() =>
      useCssRefractionBridge({
        enabled: false,
        mapRef,
        pointerRef: { current: { mx: 0.5, my: 0.5, vx: 1, vy: 1 } },
        scrollRef: { current: 1 },
        burstRef: { current: 1 },
      }),
    );
    expect(rafQueue.length).toBe(0);
  });

  it("cancels the frame loop on unmount", () => {
    const cancelSpy = vi.spyOn(globalThis, "cancelAnimationFrame");
    const mapRef = { current: makeMap() };
    const { unmount } = renderHook(() =>
      useCssRefractionBridge({
        enabled: true,
        mapRef,
        pointerRef: { current: { mx: 0.5, my: 0.5, vx: 0, vy: 0 } },
        scrollRef: { current: 0 },
        burstRef: { current: 0 },
      }),
    );
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
