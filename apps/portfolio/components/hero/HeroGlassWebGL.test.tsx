/// <reference types="vitest/globals" />
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * HeroGlassWebGL — the lazy three/R3F chunk boundary (design §4 frameloop
 * policy, ADR-2; §7 chunk boundary; spec: Video Refraction, GPU Lifecycle).
 *
 * jsdom has no WebGL2 context and no IntersectionObserver, so R3F's <Canvas>
 * and IntersectionObserver are mocked. The contract pinned here:
 *  1. <Canvas> mounts with `frameloop="always"` while the hero is in viewport
 *     and switches to `"demand"` when the IntersectionObserver reports the
 *     hero off-screen (ADR-2 — no off-screen frame budget).
 *  2. The video element is forwarded into <HeroRefractionScene videoEl=...>.
 *  3. A WebGL context/compile failure calls `reportWebglFailure` (demotion to
 *     css-only) and renders nothing instead of crashing.
 *  4. The IntersectionObserver is disconnected on unmount (no leaked observer).
 */

const holder = vi.hoisted(() => ({
  canvasProps: [] as Array<Record<string, unknown>>,
  sceneProps: [] as Array<Record<string, unknown>>,
  shouldThrow: false,
  ioInstances: [] as Array<{
    callback: (entries: Array<{ isIntersecting: boolean }>) => void;
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }>,
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: (props: Record<string, unknown>) => {
    holder.canvasProps.push(props);
    if (holder.shouldThrow) {
      throw new Error("WebGL context creation failed");
    }
    return (
      <div data-testid="r3f-canvas" data-frameloop={String(props.frameloop)}>
        {props.children as React.ReactNode}
      </div>
    );
  },
}));

vi.mock("./HeroRefractionScene", () => ({
  HeroRefractionScene: (props: Record<string, unknown>) => {
    holder.sceneProps.push(props);
    return <div data-testid="refraction-scene" />;
  },
}));

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  callback: (entries: Array<{ isIntersecting: boolean }>) => void;
  constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
    this.callback = cb;
    holder.ioInstances.push(this);
  }
}

import { HeroGlassWebGL } from "./HeroGlassWebGL";

const makeVideo = () => document.createElement("video");

beforeEach(() => {
  holder.canvasProps.length = 0;
  holder.sceneProps.length = 0;
  holder.ioInstances.length = 0;
  holder.shouldThrow = false;
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const lastCanvas = () => holder.canvasProps[holder.canvasProps.length - 1];

describe("HeroGlassWebGL — frameloop policy (ADR-2)", () => {
  it("mounts the Canvas with frameloop='always' while in viewport", () => {
    render(
      <HeroGlassWebGL videoEl={makeVideo()} reportWebglFailure={vi.fn()} />,
    );
    expect(lastCanvas()?.frameloop).toBe("always");
  });

  it("switches frameloop to 'demand' when the hero scrolls off-screen", () => {
    const { getByTestId } = render(
      <HeroGlassWebGL videoEl={makeVideo()} reportWebglFailure={vi.fn()} />,
    );
    expect(getByTestId("r3f-canvas").dataset.frameloop).toBe("always");

    act(() => {
      holder.ioInstances[0]?.callback([{ isIntersecting: false }]);
    });

    expect(getByTestId("r3f-canvas").dataset.frameloop).toBe("demand");
  });

  it("observes a target element and disconnects the observer on unmount", () => {
    const { unmount } = render(
      <HeroGlassWebGL videoEl={makeVideo()} reportWebglFailure={vi.fn()} />,
    );
    const io = holder.ioInstances[0];
    expect(io?.observe).toHaveBeenCalledTimes(1);

    unmount();
    expect(io?.disconnect).toHaveBeenCalledTimes(1);
  });
});

describe("HeroGlassWebGL — video texture source", () => {
  it("forwards the video element into HeroRefractionScene", () => {
    const videoEl = makeVideo();
    render(<HeroGlassWebGL videoEl={videoEl} reportWebglFailure={vi.fn()} />);
    expect(holder.sceneProps[0]?.videoEl).toBe(videoEl);
  });
});

describe("HeroGlassWebGL — Phase 6 signal refs", () => {
  it("forwards pointer/scroll/burst refs into HeroRefractionScene", () => {
    const pointerRef = { current: { mx: 0.5, my: 0.5 } };
    const scrollRef = { current: 0 };
    const burstRef = { current: 0 };
    render(
      <HeroGlassWebGL
        videoEl={makeVideo()}
        reportWebglFailure={vi.fn()}
        pointerRef={pointerRef}
        scrollRef={scrollRef}
        burstRef={burstRef}
      />,
    );
    expect(holder.sceneProps[0]?.pointerRef).toBe(pointerRef);
    expect(holder.sceneProps[0]?.scrollRef).toBe(scrollRef);
    expect(holder.sceneProps[0]?.burstRef).toBe(burstRef);
  });
});

describe("HeroGlassWebGL — WebGL failure demotion (reportWebglFailure)", () => {
  it("calls reportWebglFailure and renders no canvas on context failure", () => {
    holder.shouldThrow = true;
    const reportWebglFailure = vi.fn();

    const { queryByTestId } = render(
      <HeroGlassWebGL
        videoEl={makeVideo()}
        reportWebglFailure={reportWebglFailure}
      />,
    );

    expect(reportWebglFailure).toHaveBeenCalledTimes(1);
    expect(queryByTestId("r3f-canvas")).toBeNull();
  });
});
