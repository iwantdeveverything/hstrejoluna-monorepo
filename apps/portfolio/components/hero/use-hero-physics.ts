"use client";

/**
 * useHeroPhysics — the Phase 6 signal orchestrator (design §4.1/§4.3/§4.4;
 * spec: Cursor-Reactive Distortion, Scroll-driven distortion, Entrance burst
 * splash). Lives in `HeroBackdrop` (the always-loaded island) so framer-motion
 * stays OUT of the lazy three/R3F chunk (design §7).
 *
 * It owns the three physics signal SOURCES and exposes:
 *  - `pointerRef` ← `useLiquidPointer({ enabled })` — read by the WebGL scene's
 *    `useFrame` (no React state in the loop) and by the css tier for `--mx/--my`;
 *  - `scrollRef`  ← scroll progress (0..1), FROZEN while off-viewport
 *    (spec: `uScroll` SHALL NOT update outside the hero viewport);
 *  - `burstRef` + `burst` ← `hero-burst-store` subscription (the ref feeds the
 *    WebGL `useFrame`; the `burst` state value feeds the css tier `signals`).
 *  - `heroRef` — attach to the hero section so `useScroll` can scope progress.
 *  - `setInView` — fed by an IntersectionObserver to gate scroll updates.
 *
 * `enabled` is the gate-fed motion-preference switch (centralized in the gate,
 * design §3): when false, `useLiquidPointer` attaches no listeners.
 */
import { useScroll, useMotionValueEvent } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useLiquidPointer, type LiquidPointerState } from "@hstrejoluna/ui";

import { getBurstValue, subscribeBurst } from "./hero-burst-store";

export interface UseHeroPhysicsOptions {
  /** Gate-fed motion-preference switch forwarded to useLiquidPointer. */
  enabled: boolean;
  /** Initial in-viewport state (defaults true; updated via setInView). */
  inView?: boolean;
}

export interface UseHeroPhysicsResult {
  /** Hero section ref — `useScroll` target + IntersectionObserver target. */
  heroRef: RefObject<HTMLDivElement | null>;
  /** Pointer signal ref (useLiquidPointer). */
  pointerRef: RefObject<LiquidPointerState | null>;
  /** Scroll progress ref (0..1), frozen off-viewport. */
  scrollRef: RefObject<number>;
  /** Burst ramp ref (0..1) for the WebGL frame loop. */
  burstRef: RefObject<number>;
  /** Burst ramp value for the css tier `signals` prop (re-renders on change). */
  burst: number;
  /** Update in-viewport gating (IntersectionObserver feeds this). */
  setInView: (inView: boolean) => void;
}

export function useHeroPhysics({
  enabled,
  inView = true,
}: UseHeroPhysicsOptions): UseHeroPhysicsResult {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { pointerRef } = useLiquidPointer({ enabled, targetRef: heroRef });

  const scrollRef = useRef<number>(0);
  const burstRef = useRef<number>(getBurstValue());
  const [burst, setBurst] = useState<number>(burstRef.current);

  // In-viewport gating: keep both a state (for re-render) and a ref (so the
  // motion-value callback reads the latest value without re-subscribing).
  const [, setInViewState] = useState<boolean>(inView);
  const inViewRef = useRef<boolean>(inView);
  const setInView = useCallback((next: boolean) => {
    inViewRef.current = next;
    setInViewState(next);
  }, []);

  // Scroll progress across the hero; frozen while off-viewport (spec).
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!inViewRef.current) return;
    scrollRef.current = value;
  });

  // Burst store subscription → ref (frame loop) + state (css tier re-render).
  useEffect(() => {
    const unsubscribe = subscribeBurst((value) => {
      burstRef.current = value;
      setBurst(value);
    });
    return unsubscribe;
  }, []);

  return {
    heroRef,
    pointerRef,
    scrollRef,
    burstRef,
    burst,
    setInView,
  };
}
