/**
 * hero-uniform-sync — the pure, allocation-free copy from the Phase 6 physics
 * signal sources into the refraction ShaderMaterial uniforms (design §4.2/§4.5
 * seam; spec: Cursor-Reactive Distortion, Scroll-driven distortion, Entrance
 * burst splash).
 *
 * `HeroRefractionScene`'s `useFrame` calls this once per frame. Extracting it
 * keeps the per-frame path:
 *  - allocation-free — `uMouse` is mutated via `Vector2.set(x, y)`, never
 *    `new THREE.Vector2` (satisfies the scene's no-`new THREE.*`-in-useFrame
 *    source guard, design §4.5 damage row 2);
 *  - unit-testable without a live R3F render.
 *
 * Each source is OPTIONAL: an absent/undefined source leaves its uniform at the
 * previous value, so the css-only tier (which drives the CSS-var/`signals`
 * bridge instead) and rest-state Phase 5 behavior are both preserved.
 */

/** Pointer state subset consumed here (mirrors ui `LiquidPointerState`). */
export interface PointerSignal {
  /** Normalized X 0..1. */
  mx: number;
  /** Normalized Y 0..1. */
  my: number;
}

export interface HeroUniformSources {
  /** Pointer position; `null`/absent leaves `uMouse` unchanged. */
  pointer?: PointerSignal | null;
  /** Scroll progress 0..1; absent leaves `uScroll` unchanged. */
  scroll?: number;
  /** Burst ramp 0..1; absent leaves `uBurst` unchanged. */
  burst?: number;
}

/** Minimal structural shape of the refraction material uniforms. */
interface Vec2Uniform {
  value: { x: number; y: number; set(x: number, y: number): unknown };
}
interface NumberUniform {
  value: number;
}
export interface HeroUniforms {
  uMouse: Vec2Uniform;
  uScroll: NumberUniform;
  uBurst: NumberUniform;
  time: NumberUniform;
}

const clamp01 = (value: number): number =>
  value < 0 ? 0 : value > 1 ? 1 : value;

/**
 * Copy the provided signal sources into the uniforms in place. Never allocates,
 * never touches `time` (driven separately by frame delta in the scene).
 */
export const syncHeroUniforms = (
  uniforms: HeroUniforms,
  sources: HeroUniformSources,
): void => {
  const { pointer, scroll, burst } = sources;

  if (pointer) {
    uniforms.uMouse.value.set(pointer.mx, pointer.my);
  }
  if (scroll !== undefined) {
    uniforms.uScroll.value = clamp01(scroll);
  }
  if (burst !== undefined) {
    uniforms.uBurst.value = clamp01(burst);
  }
};
