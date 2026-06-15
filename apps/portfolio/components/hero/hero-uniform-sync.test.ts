/// <reference types="vitest/globals" />
import { describe, expect, it, vi } from "vitest";

import { syncHeroUniforms, type HeroUniformSources } from "./hero-uniform-sync";

/**
 * hero-uniform-sync — the pure, allocation-free copy from the Phase 6 physics
 * signal sources into the refraction ShaderMaterial uniforms (design §4.2/§4.5
 * seam; spec: Cursor-Reactive Distortion, Scroll-driven distortion, Entrance
 * burst). `HeroRefractionScene`'s `useFrame` delegates to this so the per-frame
 * mutation is testable WITHOUT a live R3F render and provably never constructs
 * `new THREE.*` (the GC-churn guard in the scene's source-level test).
 *
 * uMouse is a THREE.Vector2 — mutated via `.set(x, y)` (no new Vector2).
 * uScroll / uBurst are plain numbers.
 */

// Minimal uniform stand-ins matching the THREE.ShaderMaterial.uniforms shape.
const makeUniforms = () => {
  const setSpy = vi.fn();
  return {
    uMouse: {
      value: {
        x: 0.5,
        y: 0.5,
        set(x: number, y: number) {
          this.x = x;
          this.y = y;
          setSpy(x, y);
          return this;
        },
      },
    },
    uScroll: { value: 0 },
    uBurst: { value: 0 },
    time: { value: 0 },
    __setSpy: setSpy,
  };
};

describe("syncHeroUniforms — pointer → uMouse", () => {
  it("copies pointer mx/my into uMouse via .set (no allocation)", () => {
    const u = makeUniforms();
    syncHeroUniforms(u, { pointer: { mx: 0.2, my: 0.8 } });
    expect(u.uMouse.value.x).toBeCloseTo(0.2, 5);
    expect(u.uMouse.value.y).toBeCloseTo(0.8, 5);
    expect(u.__setSpy).toHaveBeenCalledWith(0.2, 0.8);
  });

  it("leaves uMouse untouched when no pointer source is provided", () => {
    const u = makeUniforms();
    syncHeroUniforms(u, {});
    expect(u.__setSpy).not.toHaveBeenCalled();
    expect(u.uMouse.value.x).toBe(0.5);
  });

  it("leaves uMouse untouched when pointer is null", () => {
    const u = makeUniforms();
    syncHeroUniforms(u, { pointer: null });
    expect(u.__setSpy).not.toHaveBeenCalled();
  });
});

describe("syncHeroUniforms — scroll → uScroll", () => {
  it("copies scroll progress into uScroll", () => {
    const u = makeUniforms();
    syncHeroUniforms(u, { scroll: 0.42 });
    expect(u.uScroll.value).toBeCloseTo(0.42, 5);
  });

  it("clamps scroll to 0..1", () => {
    const u = makeUniforms();
    syncHeroUniforms(u, { scroll: 2 });
    expect(u.uScroll.value).toBe(1);
    syncHeroUniforms(u, { scroll: -1 });
    expect(u.uScroll.value).toBe(0);
  });

  it("leaves uScroll untouched when scroll is undefined", () => {
    const u = makeUniforms();
    u.uScroll.value = 0.3;
    syncHeroUniforms(u, {});
    expect(u.uScroll.value).toBe(0.3);
  });
});

describe("syncHeroUniforms — burst → uBurst", () => {
  it("copies the burst signal into uBurst", () => {
    const u = makeUniforms();
    syncHeroUniforms(u, { burst: 0.7 });
    expect(u.uBurst.value).toBeCloseTo(0.7, 5);
  });

  it("clamps burst to 0..1", () => {
    const u = makeUniforms();
    syncHeroUniforms(u, { burst: 5 });
    expect(u.uBurst.value).toBe(1);
  });

  it("leaves uBurst untouched when burst is undefined", () => {
    const u = makeUniforms();
    u.uBurst.value = 0.25;
    syncHeroUniforms(u, {});
    expect(u.uBurst.value).toBe(0.25);
  });
});

describe("syncHeroUniforms — never touches time", () => {
  it("does not mutate the time uniform (driven separately by delta)", () => {
    const u = makeUniforms();
    u.time.value = 12.5;
    syncHeroUniforms(u, { pointer: { mx: 0.1, my: 0.1 }, scroll: 0.5, burst: 0.5 });
    expect(u.time.value).toBe(12.5);
  });
});

// Type-level guard: the exported source type accepts all three optional sources.
const _typeCheck: HeroUniformSources = {
  pointer: { mx: 0, my: 0 },
  scroll: 0,
  burst: 0,
};
void _typeCheck;
