/** @vitest-environment jsdom */
import { createRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LiquidGlass } from "../LiquidGlass";
import { LG_VARIANTS } from "../filter-defs";

// ── matchMedia / CSS.supports test rig (lightweight) ───────────────────────
type GateMatchers = {
  "(prefers-reduced-transparency: reduce)": boolean;
  "(prefers-reduced-motion: reduce)": boolean;
  "(prefers-reduced-data: reduce)": boolean;
  "(min-width: 480px)": boolean;
};

const PERMISSIVE: GateMatchers = {
  "(prefers-reduced-transparency: reduce)": false,
  "(prefers-reduced-motion: reduce)": false,
  "(prefers-reduced-data: reduce)": false,
  "(min-width: 480px)": true,
};

const installMatchMedia = (gates: GateMatchers): void => {
  const factory = (query: string) => {
    const matches = (gates as Record<string, boolean>)[query] ?? false;
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    };
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: factory,
  });
};

const installSupports = (result: boolean) => {
  const supports = vi.fn(() => result);
  if (typeof CSS === "undefined") {
    Object.defineProperty(window, "CSS", {
      configurable: true,
      writable: true,
      value: { supports },
    });
  } else {
    Object.defineProperty(CSS, "supports", {
      configurable: true,
      writable: true,
      value: supports,
    });
  }
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("LiquidGlass — S1.1 variants", () => {
  it.each(LG_VARIANTS)(
    "variant '%s' renders root with data-lg-variant attribute",
    (variant) => {
      installMatchMedia(PERMISSIVE);
      installSupports(true);
      const { container } = render(
        <LiquidGlass variant={variant}>x</LiquidGlass>,
      );
      const root = container.firstElementChild;
      expect(root).not.toBeNull();
      expect(root?.getAttribute("data-lg-variant")).toBe(variant);
    },
  );
});

describe("LiquidGlass — S1.2 intensity", () => {
  it("defaults intensity to 'med' when prop is omitted", () => {
    installMatchMedia(PERMISSIVE);
    installSupports(true);
    const { container } = render(<LiquidGlass variant="panel">x</LiquidGlass>);
    const root = container.firstElementChild;
    expect(root?.getAttribute("data-lg-intensity")).toBe("med");
  });

  it.each(["low", "med", "high"] as const)(
    "intensity '%s' is reflected in data-lg-intensity",
    (intensity) => {
      installMatchMedia(PERMISSIVE);
      installSupports(true);
      const { container } = render(
        <LiquidGlass variant="panel" intensity={intensity}>
          x
        </LiquidGlass>,
      );
      expect(
        container.firstElementChild?.getAttribute("data-lg-intensity"),
      ).toBe(intensity);
    },
  );
});

describe("LiquidGlass — S1.3 polymorphic `as`", () => {
  it("defaults to <div>", () => {
    installMatchMedia(PERMISSIVE);
    installSupports(true);
    const { container } = render(<LiquidGlass variant="panel">x</LiquidGlass>);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it.each(["section", "aside", "button"] as const)(
    "as='%s' renders the matching element",
    (tag) => {
      installMatchMedia(PERMISSIVE);
      installSupports(true);
      const { container } = render(
        <LiquidGlass variant="panel" as={tag}>
          x
        </LiquidGlass>,
      );
      expect(container.firstElementChild?.tagName).toBe(tag.toUpperCase());
    },
  );
});

describe("LiquidGlass — S1.4 className merge + ref forwarding + spread", () => {
  it("merges custom className alongside internal classes (no duplication)", () => {
    installMatchMedia(PERMISSIVE);
    installSupports(true);
    const { container } = render(
      <LiquidGlass variant="panel" className="custom-x">
        x
      </LiquidGlass>,
    );
    const root = container.firstElementChild;
    const cls = root?.className ?? "";
    expect(cls).toContain("custom-x");
    expect(cls).toContain("lg-glass");
    // No duplicated tokens
    const tokens = cls.split(/\s+/).filter(Boolean);
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it("spreads native attributes to the resolved element", () => {
    installMatchMedia(PERMISSIVE);
    installSupports(true);
    const { container } = render(
      <LiquidGlass variant="dialog" as="section" aria-labelledby="foo">
        x
      </LiquidGlass>,
    );
    const root = container.firstElementChild;
    expect(root?.getAttribute("aria-labelledby")).toBe("foo");
  });

  it("does NOT set aria-hidden by default — consumers manage semantics", () => {
    installMatchMedia(PERMISSIVE);
    installSupports(true);
    const { container } = render(
      <LiquidGlass variant="panel">content</LiquidGlass>,
    );
    expect(
      container.firstElementChild?.hasAttribute("aria-hidden"),
    ).toBe(false);
  });

  it("forwards ref via React 19 ref-as-prop pattern", () => {
    installMatchMedia(PERMISSIVE);
    installSupports(true);
    const ref = createRef<HTMLDivElement>();
    render(
      <LiquidGlass variant="panel" ref={ref}>
        x
      </LiquidGlass>,
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.getAttribute("data-lg-variant")).toBe("panel");
  });
});

describe("LiquidGlass — gate-driven attributes (REQ-3, REQ-4, REQ-5)", () => {


  it("when reduceTransparency is on, data-lg-fallback='solid' is set", () => {
    installMatchMedia({
      ...PERMISSIVE,
      "(prefers-reduced-transparency: reduce)": true,
    });
    installSupports(true);
    const { container } = render(
      <LiquidGlass variant="panel">x</LiquidGlass>,
    );
    expect(
      container.firstElementChild?.getAttribute("data-lg-fallback"),
    ).toBe("solid");
  });
});
