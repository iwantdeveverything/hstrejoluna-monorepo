/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';

// Mock three.js and r3f since jsdom has no WebGL
vi.mock('three', () => {
  const Vector2 = vi.fn().mockImplementation((x, y) => ({ x, y }));
  return {
    Vector2,
    MeshPhysicalMaterial: vi.fn(),
  };
});

vi.mock('@react-three/fiber', () => ({
  Canvas: vi.fn(({ children }: { children: React.ReactNode }) => children),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    gl: {
      dispose: vi.fn(),
      getContext: vi.fn(() => ({
        getExtension: vi.fn(() => ({
          loseContext: vi.fn(),
        })),
      })),
    },
    scene: {
      traverse: vi.fn(),
    },
  })),
}));

vi.mock('@react-three/drei', () => ({
  MeshTransmissionMaterial: vi.fn(() => null),
}));

describe('HeroRefractionScene', () => {
  it('RED: exports a default function component', async () => {
    const mod = await import('./HeroRefractionScene');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  it('RED: exports disposeScene utility for cleanup', async () => {
    const mod = await import('./HeroRefractionScene');
    expect(mod.disposeScene).toBeDefined();
    expect(typeof mod.disposeScene).toBe('function');
  });
});

describe('disposeScene', () => {
  it('RED: disposes geometry, material, textures on scene.traverse', async () => {
    const { disposeScene } = await import('./HeroRefractionScene');

    const texture = { dispose: vi.fn() };
    const material = {
      dispose: vi.fn(),
      map: texture,
      normalMap: null,
      roughnessMap: null,
      metalnessMap: null,
      envMap: null,
    };
    const geometry = { dispose: vi.fn() };
    const mesh = {
      isMesh: true,
      geometry,
      material,
    };

    const scene = {
      traverse: vi.fn((cb: (child: unknown) => void) => {
        cb(mesh);
      }),
    };

    const gl = {
      dispose: vi.fn(),
      getContext: vi.fn(() => ({
        getExtension: vi.fn(() => ({
          loseContext: vi.fn(),
        })),
      })),
    };

    disposeScene(scene as never, gl as never);

    expect(geometry.dispose).toHaveBeenCalled();
    expect(material.dispose).toHaveBeenCalled();
    expect(texture.dispose).toHaveBeenCalled();
    expect(gl.dispose).toHaveBeenCalled();
  });

  it('TRIANGULATE: calls forceContextLoss via WEBGL_lose_context', async () => {
    const { disposeScene } = await import('./HeroRefractionScene');

    const loseContextFn = vi.fn();
    const scene = { traverse: vi.fn() };
    const gl = {
      dispose: vi.fn(),
      getContext: vi.fn(() => ({
        getExtension: vi.fn(() => ({
          loseContext: loseContextFn,
        })),
      })),
    };

    disposeScene(scene as never, gl as never);

    expect(loseContextFn).toHaveBeenCalled();
  });

  it('TRIANGULATE: skips non-mesh objects during traverse', async () => {
    const { disposeScene } = await import('./HeroRefractionScene');

    const nonMesh = { isMesh: false };
    const scene = {
      traverse: vi.fn((cb: (child: unknown) => void) => {
        cb(nonMesh);
      }),
    };
    const gl = {
      dispose: vi.fn(),
      getContext: vi.fn(() => ({
        getExtension: vi.fn(() => null),
      })),
    };

    // Should not throw
    expect(() => disposeScene(scene as never, gl as never)).not.toThrow();
    expect(gl.dispose).toHaveBeenCalled();
  });

  it('TRIANGULATE: handles missing WEBGL_lose_context extension', async () => {
    const { disposeScene } = await import('./HeroRefractionScene');

    const scene = { traverse: vi.fn() };
    const gl = {
      dispose: vi.fn(),
      getContext: vi.fn(() => ({
        getExtension: vi.fn(() => null),
      })),
    };

    // Should not throw when extension is null
    expect(() => disposeScene(scene as never, gl as never)).not.toThrow();
  });
});
