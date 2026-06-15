/// <reference types="vitest/globals" />
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BURST_DURATION_MS,
  CLICK_BURST_AMPLITUDE,
  computeBurstSignal,
  getBurstValue,
  hasBurstPlayedOnce,
  resetBurstStoreForTest,
  subscribeBurst,
  triggerBurst,
  triggerClickBurst,
} from "./hero-burst-store";

/**
 * hero-burst-store — once-per-page-load entrance burst latch + capped click
 * re-burst (design §4.4; spec: Entrance burst splash).
 *
 * The burst is a module-scoped signal that ramps `0 → 1 → idle` over
 * ≤ 1200ms exactly ONCE per page load. Remounts must NOT replay it (the latch
 * lives at module scope, surviving component unmount). Pointer clicks inside
 * the hero trigger a SMALL capped re-burst, which is NOT latched.
 *
 * The animation is driven by `requestAnimationFrame` reading `performance.now()`;
 * the test installs a controllable rAF + clock harness so the ramp can be
 * advanced deterministically without real time.
 */

/* ── Controllable rAF + clock harness ───────────────────────────────── */
let nowMs = 0;
let rafCallbacks: Array<{ id: number; cb: FrameRequestCallback }> = [];
let nextRafId = 1;

const advance = (deltaMs: number) => {
  nowMs += deltaMs;
  // Drain the rAF queue once per advance (the store re-schedules each frame).
  const pending = rafCallbacks;
  rafCallbacks = [];
  for (const { cb } of pending) cb(nowMs);
};

beforeEach(() => {
  nowMs = 0;
  rafCallbacks = [];
  nextRafId = 1;
  vi.spyOn(performance, "now").mockImplementation(() => nowMs);
  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
    (cb: FrameRequestCallback) => {
      const id = nextRafId++;
      rafCallbacks.push({ id, cb });
      return id;
    },
  );
  vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(
    (id: number) => {
      rafCallbacks = rafCallbacks.filter((entry) => entry.id !== id);
    },
  );
  resetBurstStoreForTest();
});

afterEach(() => {
  vi.restoreAllMocks();
  resetBurstStoreForTest();
});

describe("computeBurstSignal — pure ramp shape", () => {
  it("is 0 at the start of the ramp", () => {
    expect(computeBurstSignal(0)).toBeCloseTo(0, 5);
  });

  it("reaches the peak amplitude near the middle and returns to 0 at the end", () => {
    const peak = computeBurstSignal(BURST_DURATION_MS / 2);
    expect(peak).toBeGreaterThan(0.9);
    expect(peak).toBeLessThanOrEqual(1);
    expect(computeBurstSignal(BURST_DURATION_MS)).toBeCloseTo(0, 2);
  });

  it("is 0 once the duration has fully elapsed", () => {
    expect(computeBurstSignal(BURST_DURATION_MS + 1)).toBe(0);
    expect(computeBurstSignal(99_999)).toBe(0);
  });

  it("scales by the amplitude argument (capped click burst)", () => {
    const full = computeBurstSignal(BURST_DURATION_MS / 2, 1);
    const capped = computeBurstSignal(BURST_DURATION_MS / 2, CLICK_BURST_AMPLITUDE);
    expect(capped).toBeLessThan(full);
    expect(capped).toBeCloseTo(full * CLICK_BURST_AMPLITUDE, 5);
  });

  it("never exceeds the amplitude for any elapsed value", () => {
    for (let t = 0; t <= BURST_DURATION_MS; t += 50) {
      expect(computeBurstSignal(t, 1)).toBeLessThanOrEqual(1 + 1e-9);
      expect(computeBurstSignal(t, 1)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("hero-burst-store — once-per-page-load entrance latch", () => {
  it("plays the entrance burst exactly once; repeat triggers are ignored", () => {
    expect(hasBurstPlayedOnce()).toBe(false);

    const started = triggerBurst();
    expect(started).toBe(true);
    expect(hasBurstPlayedOnce()).toBe(true);

    // Repeat call (e.g. a remount firing canplay again) must not re-arm.
    const startedAgain = triggerBurst();
    expect(startedAgain).toBe(false);
  });

  it("notifies subscribers of a 0 → up → idle ramp within BURST_DURATION_MS", () => {
    const values: number[] = [];
    const unsubscribe = subscribeBurst((v) => values.push(v));

    triggerBurst();
    // Advance across the full ramp in small steps.
    for (let i = 0; i < 13; i += 1) advance(100);

    expect(values.length).toBeGreaterThan(0);
    expect(Math.max(...values)).toBeGreaterThan(0.5);
    // Ends at idle (≈ 0) once the ramp completes.
    expect(getBurstValue()).toBeCloseTo(0, 2);
    unsubscribe();
  });

  it("survives a 'remount' (module scope) — re-trigger after play does not replay", () => {
    triggerBurst();
    for (let i = 0; i < 13; i += 1) advance(100);
    expect(getBurstValue()).toBeCloseTo(0, 2);

    // Simulate a component remount firing canplay again: still latched.
    const replayed = triggerBurst();
    expect(replayed).toBe(false);
  });

  it("stops scheduling frames once the ramp completes", () => {
    triggerBurst();
    for (let i = 0; i < 20; i += 1) advance(100);
    const idleQueue = rafCallbacks.length;
    advance(100);
    // No perpetual rAF loop after the burst settles.
    expect(rafCallbacks.length).toBeLessThanOrEqual(idleQueue);
    expect(getBurstValue()).toBe(0);
  });
});

describe("hero-burst-store — capped click re-burst", () => {
  it("allows repeated click bursts (not latched) capped below the entrance peak", () => {
    triggerBurst();
    for (let i = 0; i < 13; i += 1) advance(100);
    expect(getBurstValue()).toBeCloseTo(0, 2);

    const peaks: number[] = [];
    const unsubscribe = subscribeBurst((v) => peaks.push(v));

    triggerClickBurst();
    for (let i = 0; i < 13; i += 1) advance(100);
    const firstClickPeak = Math.max(...peaks, 0);

    peaks.length = 0;
    triggerClickBurst();
    for (let i = 0; i < 13; i += 1) advance(100);
    const secondClickPeak = Math.max(...peaks, 0);

    // Click bursts replay (both produce a signal)…
    expect(firstClickPeak).toBeGreaterThan(0);
    expect(secondClickPeak).toBeGreaterThan(0);
    // …and stay capped at the click amplitude, never the full entrance peak.
    expect(firstClickPeak).toBeLessThanOrEqual(CLICK_BURST_AMPLITUDE + 1e-6);
    unsubscribe();
  });
});

describe("hero-burst-store — subscriber lifecycle", () => {
  it("stops notifying after unsubscribe", () => {
    const values: number[] = [];
    const unsubscribe = subscribeBurst((v) => values.push(v));
    unsubscribe();

    triggerBurst();
    for (let i = 0; i < 5; i += 1) advance(100);
    expect(values).toHaveLength(0);
  });
});
