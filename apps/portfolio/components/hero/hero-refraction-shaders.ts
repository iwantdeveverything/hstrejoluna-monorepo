/**
 * hero-refraction-shaders — GLSL for the `css+webgl` tier glass plane
 * (design §4.2 Video Refraction, ADR-1).
 *
 * The plane fills the viewport and samples the hero VideoTexture (`uVideo`)
 * at a UV displaced by the physics signals, so the LIVE VIDEO bends — the
 * proven-visible refraction, NOT an envmap over black (the invisible-glass
 * failure of PRs #135-144). A custom ShaderMaterial (not
 * MeshTransmissionMaterial) keeps every uniform's consumption explicit and
 * unit-testable (design §4.5: every declared uniform MUST appear in the GLSL).
 *
 * Uniforms — ALL consumed below:
 *  - uVideo  : sampler2D  — the THREE.VideoTexture (SRGBColorSpace, ADR-1).
 *  - uMouse  : vec2 (0..1) — pointer position; warps UVs around the cursor.
 *  - uScroll : float (0..1)— scroll progress; shifts refraction vertically.
 *  - uBurst  : float (0..1)— entrance/click burst; pulses warp amplitude.
 *  - time    : float       — seconds; animates the viscous ripple.
 *
 * Phase 5 drives uMouse/uScroll/uBurst from rest defaults (0.5,0.5 / 0 / 0)
 * and only `time` increments; Phase 6 feeds the live signal sources. The GLSL
 * already READS all of them so the wiring is dead-code-free today.
 */

/** Edge-tint color (molten copper `--color-accent` #e2725b) in linear-ish RGB. */
export const ACCENT_RGB = "vec3(0.886, 0.447, 0.357)";

export const HERO_REFRACTION_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const HERO_REFRACTION_FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D uVideo;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uBurst;
uniform float time;

varying vec2 vUv;

void main() {
  // Distance from the pointer drives a radial lens — closer = more bend.
  vec2 toMouse = vUv - uMouse;
  float mouseFall = exp(-dot(toMouse, toMouse) * 6.0);

  // Viscous ripple: slow animated sine field (time) modulated by the burst.
  float ripple = sin((vUv.y + time * 0.05) * 18.0)
               + cos((vUv.x - time * 0.04) * 14.0);
  float amplitude = 0.012 + uBurst * 0.03 + mouseFall * 0.02;

  // Scroll shifts the sampled column vertically so distortion tracks scroll.
  vec2 displaced = vUv;
  displaced += toMouse * mouseFall * 0.05;
  displaced.x += ripple * amplitude;
  displaced.y += sin(time * 0.03 + vUv.x * 8.0) * amplitude + uScroll * 0.04;

  vec4 video = texture2D(uVideo, displaced);

  // Fresnel-ish edge tint using the accent copper, brighter on burst.
  float edge = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 3.0);
  vec3 tint = ${ACCENT_RGB} * (edge * 0.12 + uBurst * 0.08);

  gl_FragColor = vec4(video.rgb + tint, 1.0);
}
`;
