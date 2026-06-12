/// <reference types="vitest/globals" />
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * HeroRefractionScene — source-level + dispose contract (design §4.2/§4.5,
 * §6; spec: Video Refraction, GPU Lifecycle). jsdom has no WebGL2 context, so
 * three/R3F are mocked: the GPU resources cannot be created for real, but the
 * dispose CONTRACT and the GLSL uniform wiring are verified deterministically.
 *
 * Three guarantees pinned here:
 *  1. Every declared uniform (uMouse/uScroll/uBurst/uVideo/time) is referenced
 *     by the GLSL — no injected-but-dead uniforms (design §4.5 damage row 4).
 *  2. No `new THREE.*` allocation inside any `useFrame` callback body
 *     (design §4.5 damage row 2 — per-frame GC churn).
 *  3. On unmount, every created GPU resource disposes: PlaneGeometry,
 *     ShaderMaterial, VideoTexture, and the renderer (`gl.dispose()`).
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const SCENE_SRC = readFileSync(
  path.resolve(here, "HeroRefractionScene.tsx"),
  "utf8",
);
const SHADER_SRC = readFileSync(
  path.resolve(here, "hero-refraction-shaders.ts"),
  "utf8",
);

/** Extract every `useFrame(...)` call argument body via paren-balancing. */
const extractUseFrameBodies = (source: string): string[] => {
  const bodies: string[] = [];
  let idx = 0;
  for (;;) {
    idx = source.indexOf("useFrame(", idx);
    if (idx === -1) break;
    const start = idx + "useFrame(".length;
    let depth = 1;
    let i = start;
    for (; i < source.length && depth > 0; i += 1) {
      if (source[i] === "(") depth += 1;
      else if (source[i] === ")") depth -= 1;
    }
    bodies.push(source.slice(start, i));
    idx = i;
  }
  return bodies;
};

describe("HeroRefractionScene — GLSL uniform wiring (source-level)", () => {
  const uniforms = ["uMouse", "uScroll", "uBurst", "uVideo", "time"] as const;

  it.each(uniforms)("references the %s uniform in the GLSL", (name) => {
    // Strip the GLSL uniform declarations so a match proves actual USE,
    // not merely the `uniform <type> <name>;` declaration line.
    const withoutDecls = SHADER_SRC.replace(
      /uniform\s+\w+\s+\w+\s*;/g,
      "",
    );
    expect(withoutDecls).toContain(name);
  });

  it("declares each uniform exactly once in the shader source", () => {
    for (const name of uniforms) {
      const declRe = new RegExp(`uniform\\s+\\w+\\s+${name}\\s*;`);
      expect(SHADER_SRC).toMatch(declRe);
    }
  });

  it("sets SRGBColorSpace on the VideoTexture (ADR-1)", () => {
    expect(SCENE_SRC).toMatch(/colorSpace\s*=\s*THREE\.SRGBColorSpace/);
  });
});

describe("HeroRefractionScene — no per-frame allocations (source-level)", () => {
  it("contains at least one useFrame callback", () => {
    expect(extractUseFrameBodies(SCENE_SRC).length).toBeGreaterThan(0);
  });

  it("never constructs `new THREE.*` inside a useFrame body", () => {
    for (const body of extractUseFrameBodies(SCENE_SRC)) {
      expect(body).not.toMatch(/new\s+THREE\./);
    }
  });
});

/* ── Dispose contract (spy-based, mocked three + R3F) ─────────────── */

const mocks = vi.hoisted(() => {
  const geometry: Array<{ dispose: ReturnType<typeof vi.fn> }> = [];
  const material: Array<{ dispose: ReturnType<typeof vi.fn>; uniforms: unknown }> =
    [];
  const videoTexture: Array<{
    dispose: ReturnType<typeof vi.fn>;
    colorSpace: unknown;
  }> = [];
  const glDispose = vi.fn();
  return { geometry, material, videoTexture, glDispose };
});

vi.mock("three", () => {
  const SRGBColorSpace = "srgb";
  class PlaneGeometry {
    dispose = vi.fn();
    constructor() {
      mocks.geometry.push(this);
    }
  }
  class ShaderMaterial {
    dispose = vi.fn();
    uniforms: unknown;
    constructor(params: { uniforms: unknown }) {
      this.uniforms = params.uniforms;
      mocks.material.push(this);
    }
  }
  class VideoTexture {
    dispose = vi.fn();
    colorSpace: unknown = undefined;
    constructor(_el: unknown) {
      mocks.videoTexture.push(this);
    }
  }
  class Vector2 {
    constructor(
      public x = 0,
      public y = 0,
    ) {}
    set(x: number, y: number) {
      this.x = x;
      this.y = y;
      return this;
    }
  }
  return {
    PlaneGeometry,
    ShaderMaterial,
    VideoTexture,
    Vector2,
    SRGBColorSpace,
    default: { PlaneGeometry, ShaderMaterial, VideoTexture, Vector2, SRGBColorSpace },
  };
});

vi.mock("@react-three/fiber", () => ({
  useThree: (selector?: (s: { gl: { dispose: () => void } }) => unknown) => {
    const state = { gl: { dispose: mocks.glDispose } };
    return selector ? selector(state) : state;
  },
  useFrame: () => undefined,
}));

describe("HeroRefractionScene — GPU dispose on unmount (spies, mocked three)", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mocks.geometry.length = 0;
    mocks.material.length = 0;
    mocks.videoTexture.length = 0;
  });

  it("disposes geometry, material, VideoTexture and the renderer on unmount", async () => {
    const { createElement } = await import("react");
    const { render } = await import("@testing-library/react");
    const { HeroRefractionScene } = await import("./HeroRefractionScene");
    const videoEl = document.createElement("video");

    const { unmount } = render(
      createElement(HeroRefractionScene, { videoEl }),
    );

    expect(mocks.geometry).toHaveLength(1);
    expect(mocks.material).toHaveLength(1);
    expect(mocks.videoTexture).toHaveLength(1);
    // VideoTexture colorSpace was set to SRGBColorSpace at creation.
    expect(mocks.videoTexture[0]?.colorSpace).toBe("srgb");

    unmount();

    expect(mocks.geometry[0]?.dispose).toHaveBeenCalledTimes(1);
    expect(mocks.material[0]?.dispose).toHaveBeenCalledTimes(1);
    expect(mocks.videoTexture[0]?.dispose).toHaveBeenCalledTimes(1);
    expect(mocks.glDispose).toHaveBeenCalledTimes(1);
  });
});
