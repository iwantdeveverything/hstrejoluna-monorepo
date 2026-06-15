/// <reference types="vitest/globals" />
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BASE_DISPLACEMENT_SCALE,
  MAX_DISPLACEMENT_SCALE,
  computeDisplacementScale,
} from "./hero-displacement-bridge";
import { HeroGlassCss } from "./HeroGlassCss";

/**
 * HeroGlassCss — the `css-only` tier glass (design §1 z-stack / §2 contract,
 * ADR-4; spec: Video Refraction "CSS tier filters the video").
 *
 * Phase 4 delivers the DISPLACEMENT PLUMBING only:
 *  - `filter: url(#hero-refraction)` applied to the wrapper holding the video
 *    layer element (the filter targets the video, not nothing, not content);
 *  - the `<filter id="hero-refraction">` SVG defs with an `feDisplacementMap`;
 *  - a pure displacement bridge (`computeDisplacementScale`) that the FUTURE
 *    pointer/scroll/burst physics (Phase 6) drive — here we pin that the scale
 *    responds to each signal and that the rendered `feDisplacementMap` scale
 *    reflects it. The Phase 6 `useLiquidPointer`/`useScroll`/burst wiring is a
 *    documented seam, NOT implemented in this slice.
 *
 * jsdom does not paint `filter: url(...)`; assertions target the applied
 * inline style + the DOM presence of the filter defs, not rendered pixels.
 */

afterEach(() => {
  cleanup();
});

const FILTER_RE = /url\(["']?#hero-refraction["']?\)/;

describe("computeDisplacementScale — displacement bridge (Phase 6 signal sink)", () => {
  it("rests at the base scale with no signals", () => {
    expect(computeDisplacementScale()).toBe(BASE_DISPLACEMENT_SCALE);
    expect(computeDisplacementScale({})).toBe(BASE_DISPLACEMENT_SCALE);
  });

  it("responds to the pointer-velocity signal", () => {
    expect(computeDisplacementScale({ pointerVelocity: 1 })).toBeGreaterThan(
      BASE_DISPLACEMENT_SCALE,
    );
  });

  it("responds to the scroll-progress signal", () => {
    expect(computeDisplacementScale({ scrollProgress: 1 })).toBeGreaterThan(
      BASE_DISPLACEMENT_SCALE,
    );
  });

  it("responds to the burst signal", () => {
    expect(computeDisplacementScale({ burst: 1 })).toBeGreaterThan(
      BASE_DISPLACEMENT_SCALE,
    );
  });

  it("clamps the combined signals to the max scale", () => {
    const scale = computeDisplacementScale({
      pointerVelocity: 5,
      scrollProgress: 5,
      burst: 5,
    });
    expect(scale).toBeLessThanOrEqual(MAX_DISPLACEMENT_SCALE);
  });
});

describe("HeroGlassCss — refraction filter over the video layer", () => {
  it("applies filter: url(#hero-refraction) to the wrapper holding the video", () => {
    const { container } = render(
      <HeroGlassCss>
        <video data-testid="hero-video-layer" />
      </HeroGlassCss>,
    );

    const target = container.querySelector<HTMLElement>(
      "[data-hero-refraction-target]",
    );
    expect(target).not.toBeNull();
    expect(target?.style.filter).toMatch(FILTER_RE);
    // The video layer element MUST live inside the filtered wrapper.
    expect(
      target?.querySelector("[data-testid='hero-video-layer']"),
    ).not.toBeNull();
  });

  it("mounts the <filter id='hero-refraction'> defs with an feDisplacementMap", () => {
    const { container } = render(
      <HeroGlassCss>
        <video data-testid="hero-video-layer" />
      </HeroGlassCss>,
    );

    const filter = container.querySelector("filter#hero-refraction");
    expect(filter).not.toBeNull();
    expect(filter?.tagName.toLowerCase()).toBe("filter");
    expect(filter?.querySelector("feDisplacementMap")).not.toBeNull();
  });

  it("establishes its own stacking context (isolation: isolate, design §1)", () => {
    const { container } = render(
      <HeroGlassCss>
        <video data-testid="hero-video-layer" />
      </HeroGlassCss>,
    );
    const root = container.querySelector<HTMLElement>("[data-hero-glass-css]");
    expect(root).not.toBeNull();
    expect(root?.style.isolation).toBe("isolate");
  });

  it("drives the feDisplacementMap scale from live pointer refs via the rAF bridge", () => {
    // css-only reactivity (spec: Cursor-Reactive Distortion): refs don't
    // re-render, so a rAF bridge reads them each frame and mutates the live
    // feDisplacementMap scale. A high pointer velocity must raise it above rest.
    const rafCbs: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        rafCbs.push(cb);
        return rafCbs.length;
      });

    const { container } = render(
      <HeroGlassCss
        refraction={{
          enabled: true,
          pointerRef: { current: { mx: 0.5, my: 0.5, vx: 1, vy: 1 } },
          scrollRef: { current: 0 },
          burstRef: { current: 0 },
        }}
      >
        <video />
      </HeroGlassCss>,
    );

    act(() => {
      rafCbs.forEach((cb) => cb(0));
    });

    const scale = Number(
      container.querySelector("feDisplacementMap")?.getAttribute("scale"),
    );
    expect(scale).toBeGreaterThan(BASE_DISPLACEMENT_SCALE);
    rafSpy.mockRestore();
  });

  it("reflects the displacement signals onto the feDisplacementMap scale", () => {
    const rest = render(
      <HeroGlassCss>
        <video />
      </HeroGlassCss>,
    );
    const restScale = Number(
      rest.container
        .querySelector("feDisplacementMap")
        ?.getAttribute("scale"),
    );
    expect(restScale).toBe(BASE_DISPLACEMENT_SCALE);
    rest.unmount();

    const active = render(
      <HeroGlassCss signals={{ burst: 1, pointerVelocity: 1 }}>
        <video />
      </HeroGlassCss>,
    );
    const activeScale = Number(
      active.container
        .querySelector("feDisplacementMap")
        ?.getAttribute("scale"),
    );
    expect(activeScale).toBeGreaterThan(restScale);
  });
});
