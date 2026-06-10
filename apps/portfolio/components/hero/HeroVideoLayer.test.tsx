/// <reference types="vitest/globals" />
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroVideoLayer } from "./HeroVideoLayer";

/**
 * HeroVideoLayer contract (design §2 / §5, spec: Self-Hosted Video Layer
 * Contract + Poster-First Delivery):
 *  - <video autoplay muted loop playsinline preload="none" poster aria-hidden>
 *  - NO <source> children before idle (preload-none / poster-first)
 *  - after idle: AV1/WebM first, H.264 mp4 second; same-origin /-rooted URLs
 *  - mobile rendition (720) picked from the gate-fed `isMobile` fact
 *  - onVideoReady(videoEl) fires on `canplay`
 */

let idleCallback: (() => void) | null = null;

const flushIdle = () => {
  act(() => {
    idleCallback?.();
  });
};

beforeEach(() => {
  idleCallback = null;
  Object.defineProperty(window, "requestIdleCallback", {
    configurable: true,
    writable: true,
    value: vi.fn((cb: IdleRequestCallback) => {
      idleCallback = () =>
        cb({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline);
      return 1;
    }),
  });
  Object.defineProperty(window, "cancelIdleCallback", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const getVideo = (container: HTMLElement): HTMLVideoElement => {
  const video = container.querySelector("video");
  if (!video) throw new Error("video element not found");
  return video;
};

describe("HeroVideoLayer — element contract", () => {
  it("renders a video with the poster-first attribute contract", () => {
    const { container } = render(<HeroVideoLayer />);
    const video = getVideo(container);

    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "none");
    expect(video).toHaveAttribute("aria-hidden", "true");
    expect(video.muted).toBe(true);
    expect(video.getAttribute("poster")).toBe("/hero-poster.jpg");
  });
});

describe("HeroVideoLayer — poster-first / no sources before idle", () => {
  it("renders NO <source> children before idle", () => {
    const { container } = render(<HeroVideoLayer />);
    expect(getVideo(container).querySelectorAll("source")).toHaveLength(0);
  });

  it("injects sources only after the idle callback fires", () => {
    const { container } = render(<HeroVideoLayer />);
    expect(getVideo(container).querySelectorAll("source")).toHaveLength(0);

    flushIdle();

    expect(
      getVideo(container).querySelectorAll("source").length,
    ).toBeGreaterThan(0);
  });
});

describe("HeroVideoLayer — source injection order and origin", () => {
  it("orders AV1/WebM first, H.264 mp4 second (desktop rendition)", () => {
    const { container } = render(<HeroVideoLayer isMobile={false} />);
    flushIdle();
    const sources = Array.from(
      getVideo(container).querySelectorAll("source"),
    );

    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute("type", "video/webm");
    expect(sources[0]).toHaveAttribute("src", "/hero-loop-1080.webm");
    expect(sources[1]).toHaveAttribute("type", "video/mp4");
    expect(sources[1]).toHaveAttribute("src", "/hero-loop-1080.mp4");
  });

  it("all source URLs are same-origin /-rooted paths", () => {
    const { container } = render(<HeroVideoLayer />);
    flushIdle();
    for (const source of getVideo(container).querySelectorAll("source")) {
      expect(source.getAttribute("src")).toMatch(/^\/hero-loop-/);
    }
  });

  it("calls video.load() after injecting sources", () => {
    const loadSpy = vi
      .spyOn(HTMLMediaElement.prototype, "load")
      .mockImplementation(() => undefined);
    render(<HeroVideoLayer />);
    expect(loadSpy).not.toHaveBeenCalled();
    flushIdle();
    expect(loadSpy).toHaveBeenCalled();
  });
});

describe("HeroVideoLayer — mobile rendition pick (ADR-5)", () => {
  it("picks the 720 rendition from the gate-fed isMobile fact", () => {
    const { container } = render(<HeroVideoLayer isMobile />);
    flushIdle();
    const sources = Array.from(
      getVideo(container).querySelectorAll("source"),
    );

    expect(sources[0]).toHaveAttribute("src", "/hero-loop-720.webm");
    expect(sources[1]).toHaveAttribute("src", "/hero-loop-720.mp4");
  });
});

describe("HeroVideoLayer — readiness callback", () => {
  it("fires onVideoReady with the video element on canplay", () => {
    const onVideoReady = vi.fn();
    const { container } = render(
      <HeroVideoLayer onVideoReady={onVideoReady} />,
    );
    const video = getVideo(container);

    expect(onVideoReady).not.toHaveBeenCalled();
    fireEvent.canPlay(video);

    expect(onVideoReady).toHaveBeenCalledTimes(1);
    expect(onVideoReady).toHaveBeenCalledWith(video);
  });
});

describe("HeroVideoLayer — idle fallback when requestIdleCallback absent", () => {
  it("falls back to setTimeout(2000) when requestIdleCallback is unavailable", () => {
    vi.useFakeTimers();
    // Remove rIC so the component must use the setTimeout fallback.
    Reflect.deleteProperty(window, "requestIdleCallback");

    const { container } = render(<HeroVideoLayer />);
    expect(getVideo(container).querySelectorAll("source")).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      getVideo(container).querySelectorAll("source").length,
    ).toBeGreaterThan(0);
    vi.useRealTimers();
  });
});
