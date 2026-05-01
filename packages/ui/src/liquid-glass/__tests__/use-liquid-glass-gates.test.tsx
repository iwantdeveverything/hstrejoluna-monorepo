/** @vitest-environment jsdom */
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";

type GateMatchers = {
  "(prefers-reduced-transparency: reduce)": boolean;
  "(prefers-reduced-motion: reduce)": boolean;
  "(prefers-reduced-data: reduce)": boolean;
  "(min-width: 480px)": boolean;
};

const defaultGates: GateMatchers = {
  "(prefers-reduced-transparency: reduce)": false,
  "(prefers-reduced-motion: reduce)": false,
  "(prefers-reduced-data: reduce)": false,
  "(min-width: 480px)": true,
};

type Listener = (event: { matches: boolean }) => void;

interface FakeMQL {
  matches: boolean;
  media: string;
  onchange: Listener | null;
  addEventListener: (type: string, listener: Listener) => void;
  removeEventListener: (type: string, listener: Listener) => void;
  addListener: (listener: Listener) => void;
  removeListener: (listener: Listener) => void;
  dispatchEvent: (event: Event) => boolean;
}

const installMatchMedia = (gates: GateMatchers) => {
  const lists = new Map<string, FakeMQL>();
  const listeners = new Map<string, Set<Listener>>();

  const factory = (query: string): FakeMQL => {
    const matches = (gates as Record<string, boolean>)[query] ?? false;
    if (lists.has(query)) {
      const existing = lists.get(query)!;
      existing.matches = matches;
      return existing;
    }
    const list: FakeMQL = {
      matches,
      media: query,
      onchange: null,
      addEventListener: (_type, listener) => {
        const set = listeners.get(query) ?? new Set();
        set.add(listener);
        listeners.set(query, set);
      },
      removeEventListener: (_type, listener) => {
        listeners.get(query)?.delete(listener);
      },
      addListener: (listener) => list.addEventListener("change", listener),
      removeListener: (listener) =>
        list.removeEventListener("change", listener),
      dispatchEvent: () => true,
    };
    lists.set(query, list);
    return list;
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: factory,
  });

  return {
    update: (query: keyof GateMatchers, value: boolean) => {
      (gates as Record<string, boolean>)[query] = value;
      const list = lists.get(query);
      if (list) list.matches = value;
      const set = listeners.get(query);
      if (set) {
        for (const listener of set) listener({ matches: value });
      }
    },
  };
};

let supportsSpy: MockInstance | undefined;

const installSupports = (result: boolean) => {
  if (typeof CSS === "undefined") {
    Object.defineProperty(window, "CSS", {
      configurable: true,
      writable: true,
      value: {},
    });
  }
  if (typeof CSS.supports !== "function") {
    (CSS as unknown as { supports: (a: string, b?: string) => boolean }).supports = () => result;
  }
  supportsSpy = vi.spyOn(CSS, "supports").mockReturnValue(result);
};

beforeEach(() => {
  // reset window.matchMedia between tests
  // installMatchMedia called inside each test
});

afterEach(() => {
  cleanup();
  supportsSpy?.mockRestore();
  supportsSpy = undefined;
});

describe("useLiquidGlassGates", () => {
  it("returns SSR-safe permissive defaults when window is unavailable", async () => {
    // Simulate SSR by importing the module-level helper directly without a window-bound hook call.
    const { LIQUID_GLASS_SSR_DEFAULTS } = await import(
      "../use-liquid-glass-gates"
    );
    expect(LIQUID_GLASS_SSR_DEFAULTS).toEqual({
      supportsRefraction: true,
      reduceTransparency: false,
      reduceMotion: false,
      reduceData: false,
      isMobile: false,
    });
  });

  it("reads matchMedia gates and CSS.supports on mount", async () => {
    installMatchMedia({
      ...defaultGates,
      "(prefers-reduced-motion: reduce)": true,
      "(min-width: 480px)": false,
    });
    installSupports(true);

    const { useLiquidGlassGates } = await import("../use-liquid-glass-gates");

    let captured: ReturnType<typeof useLiquidGlassGates> | null = null;
    const Probe = () => {
      captured = useLiquidGlassGates();
      return null;
    };
    render(<Probe />);

    expect(captured).toEqual({
      supportsRefraction: true,
      reduceTransparency: false,
      reduceMotion: true,
      reduceData: false,
      isMobile: true, // (min-width: 480px) is false → mobile
    });
  });

  it("flips reduceTransparency when CSS supports refraction is false", async () => {
    installMatchMedia({
      ...defaultGates,
      "(prefers-reduced-transparency: reduce)": true,
    });
    installSupports(false);

    const { useLiquidGlassGates } = await import("../use-liquid-glass-gates");

    let captured: ReturnType<typeof useLiquidGlassGates> | null = null;
    const Probe = () => {
      captured = useLiquidGlassGates();
      return null;
    };
    render(<Probe />);

    expect(captured?.supportsRefraction).toBe(false);
    expect(captured?.reduceTransparency).toBe(true);
  });

  it("subscribes to matchMedia changes and re-renders with new state", async () => {
    const controller = installMatchMedia({ ...defaultGates });
    installSupports(true);

    const { useLiquidGlassGates } = await import("../use-liquid-glass-gates");

    let captured: ReturnType<typeof useLiquidGlassGates> | null = null;
    const Probe = () => {
      captured = useLiquidGlassGates();
      return null;
    };
    render(<Probe />);

    expect(captured?.reduceMotion).toBe(false);

    act(() => {
      controller.update("(prefers-reduced-motion: reduce)", true);
    });

    expect(captured?.reduceMotion).toBe(true);
  });

  it("treats reduced-data gate independently from viewport", async () => {
    installMatchMedia({
      ...defaultGates,
      "(prefers-reduced-data: reduce)": true,
    });
    installSupports(true);

    const { useLiquidGlassGates } = await import("../use-liquid-glass-gates");

    let captured: ReturnType<typeof useLiquidGlassGates> | null = null;
    const Probe = () => {
      captured = useLiquidGlassGates();
      return null;
    };
    render(<Probe />);

    expect(captured?.reduceData).toBe(true);
    expect(captured?.isMobile).toBe(false); // (min-width: 480px) default true → not mobile
  });
});
