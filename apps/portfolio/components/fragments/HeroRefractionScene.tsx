'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import type { Mesh, WebGLRenderer, Object3D } from 'three';
import { createHeroUniforms, type HeroUniforms } from './hero-uniform-store';

// ─── Texture map keys to check during dispose ───────────────────────
const TEXTURE_KEYS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'envMap',
] as const;

/**
 * Disposes all GPU resources from a Three.js scene and renderer.
 * Exported for testability. Called on unmount to prevent memory leaks.
 *
 * Order: geometry → material textures → material → renderer → forceContextLoss
 */
export function disposeScene(
  scene: { traverse: (cb: (child: Object3D) => void) => void },
  gl: WebGLRenderer
): void {
  scene.traverse((child) => {
    const mesh = child as unknown as Mesh;
    if (!mesh.isMesh) return;

    // Dispose geometry
    mesh.geometry?.dispose();

    // Dispose material(s)
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const mat of materials) {
      if (!mat) continue;
      // Dispose texture maps
      for (const key of TEXTURE_KEYS) {
        const texture = (mat as unknown as Record<string, unknown>)[key];
        if (texture && typeof (texture as { dispose?: () => void }).dispose === 'function') {
          (texture as { dispose: () => void }).dispose();
        }
      }
      mat.dispose();
    }
  });

  // Dispose renderer
  gl.dispose();

  // Force context loss to release GPU memory
  const context = gl.getContext();
  const ext = context.getExtension('WEBGL_lose_context');
  if (ext) {
    ext.loseContext();
  }
}

// ─── Inner scene content (must be inside Canvas) ────────────────────

function RefractionMesh() {
  const meshRef = useRef<Mesh>(null);
  const uniformsRef = useRef<HeroUniforms>(createHeroUniforms());

  // Mutate uniforms in useFrame — refs only, React Compiler safe
  useFrame(() => {
    // Uniforms are mutated externally via the ref;
    // useFrame just ensures demand-mode invalidation if needed
  });

  const handleBeforeCompile = useCallback(
    (shader: { uniforms: Record<string, { value: unknown }> }) => {
      shader.uniforms.uMouse = uniformsRef.current.uMouse;
      shader.uniforms.uScroll = uniformsRef.current.uScroll;
      shader.uniforms.uBurst = uniformsRef.current.uBurst;
    },
    []
  );

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshTransmissionMaterial
        transmission={1}
        roughness={0.1}
        thickness={0.5}
        chromaticAberration={0.05}
        anisotropy={0.1}
        distortion={0.2}
        distortionScale={0.3}
        temporalDistortion={0.1}
        onBeforeCompile={handleBeforeCompile}
      />
    </mesh>
  );
}

// ─── Cleanup hook ───────────────────────────────────────────────────

function SceneCleanup() {
  const { gl, scene } = useThree();

  useEffect(() => {
    return () => {
      disposeScene(scene, gl);
    };
  }, [gl, scene]);

  return null;
}

// ─── Main scene component (loaded via dynamic import, ssr:false) ────

export default function HeroRefractionScene() {
  const dpr: [number, number] = [
    1,
    typeof window !== 'undefined'
      ? Math.min(2, window.devicePixelRatio)
      : 1,
  ];

  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <RefractionMesh />
      <SceneCleanup />
    </Canvas>
  );
}
