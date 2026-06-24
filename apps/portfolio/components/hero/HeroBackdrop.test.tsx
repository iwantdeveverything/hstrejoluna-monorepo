/// <reference types="vitest/globals" />
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HeroTier, HeroTierResult } from "@hstrejoluna/ui";

/**
 * HeroBackdrop is a pure function of the mocked gate (design §2 / §3):
 *  - tier `static`     → renders null (poster already SSR'd upstream)
 *  - tier `css-only`   → renders the video layer (+ css glass seam)
 *  - tier `css+webgl`  → renders the video layer (+ webgl glass seam)
 *  - NO hardcoded `canRender`; output follows whatever the gate reports.
 *
 * For slice 3 the css/webgl glass layers do not exist yet (slices 4–5); the
 * tier→layer mapping and the `null` static branch are what this slice locks.
 */

const reportWebglFailure = vi.fn();
let mockTier: HeroTier = "static";
let mockReduceMotion = false;

vi.mock("@hstrejoluna/ui", () => ({
  useHeroTier: (): HeroTierResult =>
    ({
      tier: mockTier,
      gates: {
        reduceTransparency: false,
        reduceMotion: mockReduceMotion,
        reduceData: false,
        saveData: false,
        isMobile: false,
      },
      reportWebglFailure,
    }) as HeroTierResult,
}));

// useHeroPhysics is the Phase 6 orchestrator; stub it so HeroBackdrop wiring is
// verified without the real pointer/scroll/burst machinery. Records the
// `enabled` flag it was called with so the gate→physics seam can be asserted.
const physicsRefs = {
  heroRef: { current: null as HTMLDivElement | null },
  pointerRef: { current: { mx: 0.5, my: 0.5, vx: 0, vy: 0 } },
  scrollRef: { current: 0 },
  burstRef: { current: 0 },
};
let lastPhysicsOptions: { enabled?: boolean } | undefined;
let mockBurst = 0;
const setInView = vi.fn();
vi.mock("./use-hero-physics", () => ({
  useHeroPhysics: (options: { enabled?: boolean }) => {
    lastPhysicsOptions = options;
    return { ...physicsRefs, burst: mockBurst, setInView };
  },
}));

// Identify the video layer without depending on its internals. Expose a
// trigger so tests can simulate `onVideoReady` (canplay) firing.
let fireVideoReady: ((el: HTMLVideoElement) => void) | undefined;
vi.mock("./HeroVideoLayer", () => ({
  HeroVideoLayer: ({
    onVideoReady,
  }: {
    onVideoReady?: (el: HTMLVideoElement) => void;
  }) => {
    fireVideoReady = onVideoReady;
    return <video data-testid="hero-video-layer" />;
  },
}));

// HeroGlassWebGL is loaded via next/dynamic; stub the dynamic loader so the
// chunk resolves synchronously in jsdom and records the videoEl + signal refs
// it receives. `webglShouldThrow` simulates a chunk-load / render failure
// surfacing inside the lazily-loaded component (the failure mode the parent
// boundary must absorb).
let webglVideoEl: HTMLVideoElement | null = null;
let webglProps: Record<string, unknown> | null = null;
let webglShouldThrow = false;
vi.mock("next/dynamic", () => ({
  default: () => (props: { videoEl?: HTMLVideoElement }) => {
    if (webglShouldThrow) {
      throw new Error("Loading chunk hero-glass-webgl failed");
    }
    webglVideoEl = props.videoEl ?? null;
    webglProps = props as Record<string, unknown>;
    return <div data-testid="hero-glass-webgl" />;
  },
}));

// The entrance burst fires from HeroVideoLayer's canplay via the store.
const triggerBurst = vi.fn();
const triggerClickBurst = vi.fn();
vi.mock("./hero-burst-store", () => ({
  triggerBurst: () => triggerBurst(),
  triggerClickBurst: () => triggerClickBurst(),
}));

// Record the signals + live refraction wiring the css tier receives.
let cssSignals: Record<string, unknown> | undefined;
let cssRefraction: Record<string, unknown> | undefined;
vi.mock("./HeroGlassCss", () => ({
  HeroGlassCss: ({
    children,
    signals,
    refraction,
  }: {
    children?: React.ReactNode;
    signals?: Record<string, unknown>;
    refraction?: Record<string, unknown>;
  }) => {
    cssSignals = signals;
    cssRefraction = refraction;
    return <div data-testid="hero-glass-css">{children}</div>;
  },
}));

import { HeroBackdrop } from "./HeroBackdrop";

const renderAtTier = (tier: HeroTier) => {
  mockTier = tier;
  return render(<HeroBackdrop />);
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  fireVideoReady = undefined;
  webglVideoEl = null;
  webglProps = null;
  webglShouldThrow = false;
  cssSignals = undefined;
  cssRefraction = undefined;
  lastPhysicsOptions = undefined;
  mockReduceMotion = false;
  mockBurst = 0;
  physicsRefs.scrollRef.current = 0;
  physicsRefs.burstRef.current = 0;
});

describe("HeroBackdrop — tier mapping", () => {
  it("renders null at the static tier", () => {
    const { container } = renderAtTier("static");
    expect(container).toBeEmptyDOMElement();
    expect(container.querySelector("[data-testid='hero-video-layer']")).toBeNull();
  });

  it("renders the video layer at the css-only tier", () => {
    const { queryByTestId } = renderAtTier("css-only");
    expect(queryByTestId("hero-video-layer")).not.toBeNull();
  });

  it("renders the video layer at the css+webgl tier", () => {
    const { queryByTestId } = renderAtTier("css+webgl");
    expect(queryByTestId("hero-video-layer")).not.toBeNull();
  });
});

describe("HeroBackdrop — exactly one tier path", () => {
  it("renders exactly the tier-mandated number of video layers", () => {
    // static → 0 (poster SSR'd upstream); css-only / css+webgl → exactly 1.
    const expectedLayers: Record<HeroTier, number> = {
      static: 0,
      "css-only": 1,
      "css+webgl": 1,
    };
    for (const tier of ["static", "css-only", "css+webgl"] as HeroTier[]) {
      const { container, unmount } = renderAtTier(tier);
      const layers = container.querySelectorAll(
        "[data-testid='hero-video-layer']",
      );
      expect(layers.length).toBe(expectedLayers[tier]);
      unmount();
    }
  });

  it("is a pure function of the gate — flipping the mocked tier flips output", () => {
    const first = renderAtTier("static");
    expect(first.container).toBeEmptyDOMElement();
    first.unmount();

    const second = renderAtTier("css-only");
    expect(
      second.queryByTestId("hero-video-layer"),
    ).not.toBeNull();
  });
});

describe("HeroBackdrop — css+webgl tier WebGL wiring", () => {
  it("does not mount HeroGlassWebGL before the video is ready", () => {
    const { queryByTestId } = renderAtTier("css+webgl");
    // Video layer is present, but the WebGL glass waits for onVideoReady.
    expect(queryByTestId("hero-video-layer")).not.toBeNull();
    expect(queryByTestId("hero-glass-webgl")).toBeNull();
  });

  it("mounts HeroGlassWebGL with the live video element after canplay", () => {
    const { queryByTestId } = renderAtTier("css+webgl");
    const videoEl = document.createElement("video");

    act(() => {
      fireVideoReady?.(videoEl);
    });

    expect(queryByTestId("hero-glass-webgl")).not.toBeNull();
    expect(webglVideoEl).toBe(videoEl);
  });

  it("does not mount HeroGlassWebGL in the css-only tier", () => {
    const { queryByTestId } = renderAtTier("css-only");
    const videoEl = document.createElement("video");
    act(() => {
      fireVideoReady?.(videoEl);
    });
    expect(queryByTestId("hero-glass-webgl")).toBeNull();
  });
});

describe("HeroBackdrop — Phase 6 physics wiring", () => {
  it("forwards the physics signal refs into HeroGlassWebGL after canplay", () => {
    renderAtTier("css+webgl");
    act(() => {
      fireVideoReady?.(document.createElement("video"));
    });
    expect(webglProps?.pointerRef).toBe(physicsRefs.pointerRef);
    expect(webglProps?.scrollRef).toBe(physicsRefs.scrollRef);
    expect(webglProps?.burstRef).toBe(physicsRefs.burstRef);
  });

  it("feeds the css tier live refraction refs + burst seed from the physics hook", () => {
    mockBurst = 0.6;
    renderAtTier("css-only");
    // Rest-state seed.
    expect(cssSignals?.burst).toBeCloseTo(0.6, 5);
    // Live per-frame reactivity travels via the refraction refs (not a stale
    // snapshot): the rAF bridge inside HeroGlassCss reads them each frame.
    expect(cssRefraction?.pointerRef).toBe(physicsRefs.pointerRef);
    expect(cssRefraction?.scrollRef).toBe(physicsRefs.scrollRef);
    expect(cssRefraction?.burstRef).toBe(physicsRefs.burstRef);
    expect(cssRefraction?.enabled).toBe(true);
  });

  it("enables the pointer hook when motion is allowed", () => {
    mockReduceMotion = false;
    renderAtTier("css+webgl");
    expect(lastPhysicsOptions?.enabled).toBe(true);
  });

  it("disables the pointer hook under reduce-motion", () => {
    mockReduceMotion = true;
    renderAtTier("css-only");
    expect(lastPhysicsOptions?.enabled).toBe(false);
  });

  it("fires the entrance burst once on video-ready", () => {
    renderAtTier("css+webgl");
    act(() => {
      fireVideoReady?.(document.createElement("video"));
    });
    expect(triggerBurst).toHaveBeenCalledTimes(1);
  });
});

describe("HeroBackdrop — WebGL chunk-load resilience", () => {
  it("absorbs a chunk-load failure, keeps the video layer, and demotes the tier", () => {
    // A next/dynamic chunk-load failure throws BEFORE HeroGlassWebGL's own
    // WebGLErrorBoundary can mount, so the parent island must own the boundary.
    // Failure must NOT crash the hero tree: the css video layer stays painted
    // and reportWebglFailure latches the demotion to css-only.
    webglShouldThrow = true;
    const { queryByTestId } = renderAtTier("css+webgl");

    expect(() => {
      act(() => {
        fireVideoReady?.(document.createElement("video"));
      });
    }).not.toThrow();

    expect(queryByTestId("hero-video-layer")).not.toBeNull();
    expect(queryByTestId("hero-glass-webgl")).toBeNull();
    expect(reportWebglFailure).toHaveBeenCalledTimes(1);
  });
});
