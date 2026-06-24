/// <reference types="vitest/globals" />
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * useHeroPhysics — the Phase 6 signal orchestrator (design §4.1/§4.3/§4.4;
 * spec: Cursor-Reactive Distortion, Scroll-driven distortion, Entrance burst).
 *
 * It owns the three physics signal SOURCES and exposes them as refs the WebGL
 * scene reads in `useFrame` (no React state in the loop) plus a `burst` state
 * value the css tier feeds into its `signals` prop:
 *  - `pointerRef` ← `useLiquidPointer({ enabled })` (gate-fed motion prefs);
 *  - `scrollRef`  ← scroll progress, frozen while the hero is off-viewport;
 *  - `burstRef` / `burst` ← `hero-burst-store` subscription.
 *
 * Dependencies are mocked so the hook's WIRING is verified deterministically:
 * the real pointer/scroll/burst behavior is covered by their own unit tests.
 */

const holder = vi.hoisted(() => ({
  pointerRef: { current: { mx: 0.5, my: 0.5, vx: 0, vy: 0 } },
  lastPointerOptions: undefined as { enabled?: boolean } | undefined,
  scrollProgress: 0,
  scrollListeners: [] as Array<(v: number) => void>,
  burstListeners: [] as Array<(v: number) => void>,
  unsubscribeBurst: vi.fn(),
}));

vi.mock("@hstrejoluna/ui", () => ({
  useLiquidPointer: (options: { enabled?: boolean } = {}) => {
    holder.lastPointerOptions = options;
    return { pointerRef: holder.pointerRef };
  },
}));

// Minimal framer-motion useScroll/useMotionValueEvent stand-ins.
vi.mock("framer-motion", () => ({
  useScroll: () => ({
    scrollYProgress: {
      get: () => holder.scrollProgress,
      on: (_event: string, cb: (v: number) => void) => {
        holder.scrollListeners.push(cb);
        return () => undefined;
      },
    },
  }),
  useMotionValueEvent: (
    value: { on: (e: string, cb: (v: number) => void) => void },
    event: string,
    cb: (v: number) => void,
  ) => {
    value.on(event, cb);
  },
}));

vi.mock("./hero-burst-store", () => ({
  subscribeBurst: (cb: (v: number) => void) => {
    holder.burstListeners.push(cb);
    return holder.unsubscribeBurst;
  },
  getBurstValue: () => 0,
}));

import { useHeroPhysics } from "./use-hero-physics";

const emitScroll = (v: number) => {
  holder.scrollProgress = v;
  for (const cb of holder.scrollListeners) cb(v);
};
const emitBurst = (v: number) => {
  for (const cb of holder.burstListeners) cb(v);
};

beforeEach(() => {
  holder.scrollProgress = 0;
  holder.scrollListeners.length = 0;
  holder.burstListeners.length = 0;
  holder.lastPointerOptions = undefined;
  holder.pointerRef.current = { mx: 0.5, my: 0.5, vx: 0, vy: 0 };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useHeroPhysics — pointer wiring", () => {
  it("forwards the gate-fed enabled flag into useLiquidPointer", () => {
    renderHook(() => useHeroPhysics({ enabled: false }));
    expect(holder.lastPointerOptions?.enabled).toBe(false);
  });

  it("exposes the useLiquidPointer ref as pointerRef", () => {
    const { result } = renderHook(() => useHeroPhysics({ enabled: true }));
    expect(result.current.pointerRef).toBe(holder.pointerRef);
  });
});

describe("useHeroPhysics — scroll wiring", () => {
  it("tracks scroll progress into scrollRef while in viewport", () => {
    const { result } = renderHook(() =>
      useHeroPhysics({ enabled: true, inView: true }),
    );
    act(() => emitScroll(0.4));
    expect(result.current.scrollRef.current).toBeCloseTo(0.4, 5);
  });

  it("freezes scrollRef while off-viewport (no update, spec)", () => {
    const { result } = renderHook(() =>
      useHeroPhysics({ enabled: true, inView: true }),
    );
    act(() => emitScroll(0.3));
    expect(result.current.scrollRef.current).toBeCloseTo(0.3, 5);

    // Off-viewport: further scroll progress must NOT update the ref.
    act(() => {
      result.current.setInView(false);
    });
    act(() => emitScroll(0.9));
    expect(result.current.scrollRef.current).toBeCloseTo(0.3, 5);
  });
});

describe("useHeroPhysics — burst wiring", () => {
  it("subscribes to the burst store and reflects it in burstRef + state", () => {
    const { result } = renderHook(() => useHeroPhysics({ enabled: true }));
    act(() => emitBurst(0.8));
    expect(result.current.burstRef.current).toBeCloseTo(0.8, 5);
    expect(result.current.burst).toBeCloseTo(0.8, 5);
  });

  it("unsubscribes from the burst store on unmount", () => {
    const { unmount } = renderHook(() => useHeroPhysics({ enabled: true }));
    unmount();
    expect(holder.unsubscribeBurst).toHaveBeenCalledTimes(1);
  });
});
