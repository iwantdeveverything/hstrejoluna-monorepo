/// <reference types="vitest/globals" />
import { cleanup, render } from "@testing-library/react";
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

vi.mock("@hstrejoluna/ui", () => ({
  useHeroTier: (): HeroTierResult =>
    ({
      tier: mockTier,
      gates: {
        reduceTransparency: false,
        reduceMotion: false,
        reduceData: false,
        saveData: false,
        isMobile: false,
      },
      reportWebglFailure,
    }) as HeroTierResult,
}));

// Identify the video layer without depending on its internals.
vi.mock("./HeroVideoLayer", () => ({
  HeroVideoLayer: () => <video data-testid="hero-video-layer" />,
}));

import { HeroBackdrop } from "./HeroBackdrop";

const renderAtTier = (tier: HeroTier) => {
  mockTier = tier;
  return render(<HeroBackdrop />);
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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
  it("renders at most one video layer regardless of tier", () => {
    for (const tier of ["static", "css-only", "css+webgl"] as HeroTier[]) {
      const { container, unmount } = renderAtTier(tier);
      const layers = container.querySelectorAll(
        "[data-testid='hero-video-layer']",
      );
      expect(layers.length).toBeLessThanOrEqual(1);
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
