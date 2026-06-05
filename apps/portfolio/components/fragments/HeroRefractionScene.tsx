'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment } from '@react-three/drei';
import type { Mesh, WebGLRenderer, Object3D } from 'three';
import * as THREE from 'three';
import { createHeroUniforms, type HeroUniforms } from './hero-uniform-store';

// ─── Texture map keys to check during dispose ───────────────────────
const TEXTURE_KEYS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'envMap',
] as const;

// Scene is managed and cleaned up automatically by React Three Fiber

// ─── Inner scene content (must be inside Canvas) ────────────────────

function RefractionMesh() {
  const meshRef = useRef<Mesh>(null);
  const uniformsRef = useRef<HeroUniforms>(createHeroUniforms());
  const targetPos = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetPos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mutate uniforms in useFrame — refs only, React Compiler safe
  useFrame((state) => {
    // Make the mesh smoothly follow the pointer
    if (meshRef.current) {
      const x = (targetPos.current.x * state.viewport.width) / 2;
      const y = (targetPos.current.y * state.viewport.height) / 2;
      meshRef.current.position.lerp(new THREE.Vector3(x, y, 0), 0.05);
    }
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
      <sphereGeometry args={[1.5, 64, 64]} />
      <MeshTransmissionMaterial
        transmission={1}
        transparent={true}
        roughness={0.05}
        thickness={1.5}
        ior={1.2}
        chromaticAberration={0.05}
        anisotropy={0.1}
        distortion={0.3}
        distortionScale={0.5}
        temporalDistortion={0.1}
        envMapIntensity={0.2}
        color="#111111"
        background={new THREE.Color(0x000000)}
        onBeforeCompile={handleBeforeCompile}
      />
    </mesh>
  );
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
      <Environment preset="night" />
      <RefractionMesh />
    </Canvas>
  );
}
