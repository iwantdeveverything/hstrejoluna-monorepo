import { describe, expect, it } from "vitest";
import { setupStorybookNextMocks } from "../.storybook/mocks/next";

describe("setupStorybookNextMocks", () => {
  it("registers matchMedia and ResizeObserver fallbacks in jsdom", () => {
    const originalMatchMedia = window.matchMedia;
    const originalResizeObserver = window.ResizeObserver;

    // Simulate Storybook browser bootstrap gaps.
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    setupStorybookNextMocks();

    expect(typeof window.matchMedia).toBe("function");
    expect("ResizeObserver" in window).toBe(true);

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: originalResizeObserver,
    });
  });
});
