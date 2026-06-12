"use client";

/**
 * HeroRefractionScene — the `css+webgl` tier glass plane (design §4.2, §4.5;
 * ADR-1; spec: Video Refraction, GPU Lifecycle). Renders INSIDE an R3F
 * `<Canvas>` (mounted by HeroGlassWebGL).
 *
 * A full-viewport plane (NOT a sphere) carries a custom ShaderMaterial that
 * samples the hero VideoTexture (`uVideo`, SRGBColorSpace) at a displaced UV —
 * the LIVE VIDEO bends, which is the proven-visible refraction. NOT
 * MeshTransmissionMaterial (its envmap/FBO pipeline was the invisible-glass /
 * alpha-corruption failure, PR #140).
 *
 * GPU lifecycle (design §4.5):
 *  - geometry, ShaderMaterial and VideoTexture are created once (useMemo) and
 *    disposed in the effect cleanup; the renderer is disposed via gl.dispose().
 *    R3F auto-disposes scene-graph nodes, but the VideoTexture and renderer are
 *    MANUAL — so we own them explicitly.
 *  - useFrame mutates uniform values in place; it never constructs `new THREE.*`
 *    (no per-frame GC churn).
 *
 * Phase 5 scope: uMouse/uScroll/uBurst sit at rest defaults (0.5,0.5 / 0 / 0)
 * and only `time` advances. The GLSL already reads every uniform, so there is
 * no dead machinery. Phase 6 (physics) feeds the live signal sources at the
 * clearly-marked seam below — this file imports NO pointer/scroll/burst hooks.
 */
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

import {
  HERO_REFRACTION_FRAGMENT,
  HERO_REFRACTION_VERTEX,
} from "./hero-refraction-shaders";

export interface HeroRefractionSceneProps {
  /** The hero `<video>` element — source for the THREE.VideoTexture (ADR-1). */
  videoEl: HTMLVideoElement;
}

export const HeroRefractionScene = ({ videoEl }: HeroRefractionSceneProps) => {
  const gl = useThree((state) => state.gl);

  // Created once. Kept in refs so useFrame mutates without re-running useMemo.
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

  const videoTexture = useMemo(() => {
    const tex = new THREE.VideoTexture(videoEl);
    // ADR-1: video content is authored in sRGB; tag it so the sampler decodes
    // correctly instead of washing the ember filaments out.
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [videoEl]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: HERO_REFRACTION_VERTEX,
        fragmentShader: HERO_REFRACTION_FRAGMENT,
        uniforms: {
          uVideo: { value: videoTexture },
          // Rest defaults (Phase 5). Phase 6 drives these from the physics
          // signal sources (useLiquidPointer / useScroll / hero-burst-store).
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uScroll: { value: 0 },
          uBurst: { value: 0 },
          time: { value: 0 },
        },
      }),
    [videoTexture],
  );

  // Drive only `time` in Phase 5 — pure in-place mutation, no allocations.
  // `material` is stable across renders (useMemo), so the closure stays fresh
  // without a render-phase ref assignment.
  // ── Phase 6 signal seam ──────────────────────────────────────────────
  // Phase 6 copies pointerRef -> uMouse, scrollRef -> uScroll, burstRef ->
  // uBurst here (refs only, no React state). Do NOT construct new THREE
  // objects inside this callback.
  useFrame((_state, delta) => {
    material.uniforms.time.value += delta;
  });

  // GPU dispose contract (spec: GPU Lifecycle). VideoTexture + renderer are
  // manual; geometry/material disposed explicitly even though the mesh node is
  // auto-managed, so the contract is self-contained and unit-testable.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      videoTexture.dispose();
      gl.dispose();
    };
  }, [geometry, material, videoTexture, gl]);

  return <mesh geometry={geometry} material={material} />;
};
