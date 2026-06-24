/** @vitest-environment jsdom */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tier matrix for `useHeroTier` (design §3 decision order):
 *  1. kill switch off → static
 *  2. preference gates (reduceMotion/reduceData/saveData/reduceTransparency) → static
 *  3. SSR / pre-hydration snapshot → static
 *  4. mobile viewport (< 1024px) → cap at css-only
 *  5. WebGL2 probe fail OR reportWebglFailure latched → css-only
 *  6. otherwise → css+webgl
 *
 * The module keeps internal memoized state (WebGL probe, failure latch), so
 * every test re-imports it after `vi.resetModules()`.
 */

type Listener = (event: { matches: boolean }) => void;

interface MediaMatchers {
  reduceTransparency: boolean;
  reduceMotion: boolean;
  reduceData: boolean;
  /** `(min-width: 480px)` — gates' desktop floor. */
  desktopFloor: boolean;
  /** `(min-width: 1024px)` — hero HD viewport. */
  hdViewport: boolean;
}

const capableMatchers: MediaMatchers = {
  reduceTransparency: false,
  reduceMotion: false,
  reduceData: false,
  desktopFloor: true,
  hdViewport: true,
};

const matcherFor = (matchers: MediaMatchers, query: string): boolean => {
  if (query.includes("prefers-reduced-transparency"))
    return matchers.reduceTransparency;
  if (query.includes("prefers-reduced-motion")) return matchers.reduceMotion;
  if (query.includes("prefers-reduced-data")) return matchers.reduceData;
  if (query.includes("min-width: 1024")) return matchers.hdViewport;
  if (query.includes("min-width: 480")) return matchers.desktopFloor;
  return false;
};

const installMatchMedia = (overrides: Partial<MediaMatchers> = {}) => {
  const matchers: MediaMatchers = { ...capableMatchers, ...overrides };
  const listeners = new Map<string, Set<Listener>>();
  const lists = new Map<string, { matches: boolean }>();

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => {
      const list = {
        matches: matcherFor(matchers, query),
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: Listener) => {
          const set = listeners.get(query) ?? new Set<Listener>();
          set.add(listener);
          listeners.set(query, set);
        },
        removeEventListener: (_type: string, listener: Listener) => {
          listeners.get(query)?.delete(listener);
        },
        addListener: (listener: Listener) => {
          const set = listeners.get(query) ?? new Set<Listener>();
          set.add(listener);
          listeners.set(query, set);
        },
        removeListener: (listener: Listener) => {
          listeners.get(query)?.delete(listener);
        },
        dispatchEvent: () => true,
      };
      lists.set(query, list);
      return list;
    },
  });

  return {
    update: (key: keyof MediaMatchers, value: boolean) => {
      matchers[key] = value;
      for (const [query, list] of lists) {
        const next = matcherFor(matchers, query);
        if (list.matches !== next) {
          list.matches = next;
          const set = listeners.get(query);
          if (set) for (const listener of set) listener({ matches: next });
        }
      }
    },
  };
};

const installConnection = (saveData: boolean) => {
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    value: {
      saveData,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    },
  });
};

const originalGetContext = HTMLCanvasElement.prototype.getContext;

const installWebgl2 = (available: boolean) => {
  HTMLCanvasElement.prototype.getContext = function getContext(
    contextId: string,
  ) {
    if (contextId === "webgl2") return available ? ({} as never) : null;
    return null;
  } as typeof HTMLCanvasElement.prototype.getContext;
};

/** Capable-desktop baseline: every probe passes, kill switch on. */
const installCapableEnvironment = (
  overrides: Partial<MediaMatchers> = {},
) => {
  vi.stubEnv("NEXT_PUBLIC_HERO_LIQUID", "true");
  installConnection(false);
  installWebgl2(true);
  return installMatchMedia(overrides);
};

const importHook = async () => import("./use-hero-tier");

type HookModule = Awaited<ReturnType<typeof importHook>>;
type HookResult = ReturnType<HookModule["useHeroTier"]>;

const renderTierProbe = (useHeroTier: HookModule["useHeroTier"]) => {
  const captured: { current: HookResult | null } = { current: null };
  const Probe = () => {
    captured.current = useHeroTier();
    return null;
  };
  render(<Probe />);
  return captured;
};

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  delete (navigator as { connection?: unknown }).connection;
});

describe("useHeroTier", () => {
  describe("kill switch (rollback flag)", () => {
    it.each(["", "false"])(
      "forces static when NEXT_PUBLIC_HERO_LIQUID is %j on a capable device",
      async (flag) => {
        installCapableEnvironment();
        vi.stubEnv("NEXT_PUBLIC_HERO_LIQUID", flag);

        const { useHeroTier } = await importHook();
        const captured = renderTierProbe(useHeroTier);

        expect(captured.current?.tier).toBe("static");
      },
    );

    it("selects the highest passing tier when the flag is 'true'", async () => {
      installCapableEnvironment();

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("css+webgl");
    });
  });

  describe("preference gates → static", () => {
    it("returns static under prefers-reduced-motion", async () => {
      installCapableEnvironment({ reduceMotion: true });

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("static");
    });

    it("returns static under prefers-reduced-data", async () => {
      installCapableEnvironment({ reduceData: true });

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("static");
    });

    it("returns static under prefers-reduced-transparency", async () => {
      installCapableEnvironment({ reduceTransparency: true });

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("static");
    });

    it("returns static when navigator.connection.saveData is on", async () => {
      installCapableEnvironment();
      installConnection(true);

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("static");
    });
  });

  describe("SSR snapshot", () => {
    it("renders static on the server even with the flag on", async () => {
      installCapableEnvironment();

      const { useHeroTier } = await importHook();
      const Probe = () => {
        const { tier } = useHeroTier();
        return <span data-testid="tier">{tier}</span>;
      };

      const html = renderToStaticMarkup(<Probe />);

      expect(html).toContain("static");
      expect(html).not.toContain("webgl");
    });
  });

  describe("mobile cap", () => {
    it("caps at css-only below 1024px even with WebGL2 available", async () => {
      installCapableEnvironment({ hdViewport: false });

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("css-only");
    });
  });

  describe("WebGL2 demotion", () => {
    it("falls back to css-only when the WebGL2 probe fails", async () => {
      installCapableEnvironment();
      installWebgl2(false);

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("css-only");
    });

    it("demotes to css-only when reportWebglFailure is called", async () => {
      installCapableEnvironment();

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("css+webgl");

      act(() => {
        captured.current?.reportWebglFailure();
      });

      expect(captured.current?.tier).toBe("css-only");
    });

    it("keeps the failure latched across remounts in the same page load", async () => {
      installCapableEnvironment();

      const { useHeroTier } = await importHook();
      const first = renderTierProbe(useHeroTier);
      act(() => {
        first.current?.reportWebglFailure();
      });
      cleanup();

      const second = renderTierProbe(useHeroTier);
      expect(second.current?.tier).toBe("css-only");
    });
  });

  describe("runtime reactivity", () => {
    it("re-evaluates to static when prefers-reduced-motion flips on at runtime", async () => {
      const controller = installCapableEnvironment();

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("css+webgl");

      act(() => {
        controller.update("reduceMotion", true);
      });

      expect(captured.current?.tier).toBe("static");
    });

    it("re-evaluates the mobile cap when the viewport crosses 1024px", async () => {
      const controller = installCapableEnvironment();

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.tier).toBe("css+webgl");

      act(() => {
        controller.update("hdViewport", false);
      });

      expect(captured.current?.tier).toBe("css-only");
    });
  });

  describe("result contract", () => {
    it("exposes gate facts (including saveData) alongside the tier", async () => {
      installCapableEnvironment();
      installConnection(true);

      const { useHeroTier } = await importHook();
      const captured = renderTierProbe(useHeroTier);

      expect(captured.current?.gates).toMatchObject({
        reduceMotion: false,
        reduceData: false,
        reduceTransparency: false,
        saveData: true,
      });
      expect(typeof captured.current?.reportWebglFailure).toBe("function");
    });
  });
});
