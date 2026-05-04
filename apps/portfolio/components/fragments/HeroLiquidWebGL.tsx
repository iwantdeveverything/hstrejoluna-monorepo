"use client";

import { useRef, useEffect, type ReactElement } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { useLiquidHeroCapability } from "@hstrejoluna/ui";
import type { Mesh } from "three";
import {
  getBurstStore,
  getScrollStore,
  computeBurstValue,
} from "./hero-uniform-store";

const BURST_DURATION_MS = 1200;

// Custom uniform names injected into the MeshTransmissionMaterial's
// existing uniforms object after mount. The material's internal
// extend() call inside the Drei component registers the class with
// R3F so it can be used declaratively.
type LiquidUniforms = {
  uTime: { value: number };
  uMx: { value: number };
  uMy: { value: number };
  uScroll: { value: number };
  uBurst: { value: number };
};

/** Material instance shape — MeshPhysicalMaterial extended with uniforms. */
interface LiquidMaterial {
  uniforms: Record<string, { value: number }> & LiquidUniforms;
  // Refs forwarded by Drei's MeshTransmissionMaterial:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buffer?: any;
}

/**
 * Inner component — rendered INSIDE the r3f Canvas.
 *
 * Renders a fullscreen plane with Drei's MeshTransmissionMaterial
 * (PascalCase component — triggers the internal extend() call so the
 * material is registered in R3F's namespace automatically).
 *
 * Custom uniforms (uTime, uMx/uMy, uScroll, uBurst) are merged into
 * the material's existing uniforms via Object.assign after mount.
 */
const LiquidGlassPlane = () => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<LiquidMaterial>(null);

  // ── Merge custom uniforms into Drei's built-in uniforms ─────────
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat || !mat.uniforms) return;
    Object.assign(mat.uniforms, {
      uTime: { value: 0 },
      uMx: { value: 0.5 },
      uMy: { value: 0.5 },
      uScroll: { value: 0 },
      uBurst: { value: 0 },
    });
  }, []);

  // ── Entrance burst tween (design §3.3) ──────────────────────────
  useEffect(() => {
    const burst = getBurstStore();
    if (burst.hasPlayed()) return; // Already played this page load

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / BURST_DURATION_MS);
      burst.set(computeBurstValue(t));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        burst.set(0);
        burst.markPlayed();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Frame loop — reads stores to update uniforms ────────────────
  useFrame((state) => {
    if (!materialRef.current) return;
    const mat = materialRef.current;

    const burst = getBurstStore();
    const scroll = getScrollStore();

    if (mat.uniforms.uTime) {
      mat.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (mat.uniforms.uScroll) {
      mat.uniforms.uScroll.value = scroll.value;
    }
    if (mat.uniforms.uBurst) {
      mat.uniforms.uBurst.value = burst.value;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <MeshTransmissionMaterial
        ref={materialRef}
        transmission={1}
        thickness={1.5}
        ior={1.4}
        chromaticAberration={0.05}
        distortion={0.5}
        distortionScale={0.3}
        temporalDistortion={0.1}
        samples={6}
        resolution={256}
        backside
        transparent
        opacity={0.85}
        roughness={0.1}
        metalness={0}
      />
    </mesh>
  );
};

/**
 * HeroLiquidWebGL — WebGL refraction layer.
 *
 * Only renders a Three.js Canvas when `useLiquidHeroCapability()` returns
 * "css+webgl". Otherwise the component renders nothing.
 *
 * Design contract: spec § "WebGL refraction layer", design §2.
 */
export const HeroLiquidWebGL = (): ReactElement | null => {
  const capability = useLiquidHeroCapability();

  if (capability !== "css+webgl") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none"
    >
      <Canvas
        data-testid="r3f-canvas"
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 1], fov: 45 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <LiquidGlassPlane />
      </Canvas>
    </div>
  );
};
