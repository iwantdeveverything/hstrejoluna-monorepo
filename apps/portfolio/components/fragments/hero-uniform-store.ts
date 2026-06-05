import type { IUniform } from 'three';

/**
 * Canonical uniform names injected into the refraction shader.
 * Snapshot-tested to catch drei minor-version drift.
 */
export const HERO_UNIFORM_NAMES = ['uMouse', 'uScroll', 'uBurst'] as const;

export type HeroUniformName = (typeof HERO_UNIFORM_NAMES)[number];

export interface HeroUniforms {
  uMouse: IUniform<[number, number]>;
  uScroll: IUniform<number>;
  uBurst: IUniform<number>;
}

/**
 * Creates a fresh set of hero shader uniforms with initial values.
 * Used by HeroRefractionScene to inject into the drei material shader.
 */
export function createHeroUniforms(): HeroUniforms {
  return {
    uMouse: { value: [0, 0] },
    uScroll: { value: 0 },
    uBurst: { value: 0 },
  };
}
