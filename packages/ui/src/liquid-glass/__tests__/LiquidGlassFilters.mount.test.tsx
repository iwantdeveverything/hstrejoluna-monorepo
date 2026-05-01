/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LiquidGlassFilters } from "../LiquidGlassFilters";
import { LG_FILTER_IDS, LG_VARIANTS } from "../filter-defs";

afterEach(() => {
  cleanup();
});

describe("<LiquidGlassFilters />", () => {
  it("mounts a single hidden SVG with [data-lg-filters] (S2.3 baseline)", () => {
    render(<LiquidGlassFilters />);
    const svgs = document.querySelectorAll("[data-lg-filters]");
    expect(svgs).toHaveLength(1);
    const svg = svgs[0] as SVGElement;
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  it("declares one <filter> per variant inside <defs>", () => {
    render(<LiquidGlassFilters />);
    const svg = document.querySelector("[data-lg-filters]");
    expect(svg).not.toBeNull();
    const defs = svg?.querySelector("defs");
    expect(defs).not.toBeNull();
    for (const variant of LG_VARIANTS) {
      const filterId = LG_FILTER_IDS[variant];
      const filterEl = defs?.querySelector(`#${CSS.escape(filterId)}`);
      expect(filterEl, `expected filter#${filterId} to exist`).not.toBeNull();
      expect(filterEl?.tagName.toLowerCase()).toBe("filter");
    }
  });

  it("renders <feDisplacementMap scale> with the resting amplitude per variant", () => {
    render(<LiquidGlassFilters />);
    const svg = document.querySelector("[data-lg-filters]");
    for (const variant of LG_VARIANTS) {
      const filterId = LG_FILTER_IDS[variant];
      const dm = svg?.querySelector(
        `#${CSS.escape(filterId)} feDisplacementMap`,
      );
      expect(dm, `expected feDisplacementMap for ${variant}`).not.toBeNull();
      const scaleAttr = dm?.getAttribute("scale");
      expect(scaleAttr).not.toBeNull();
      expect(Number(scaleAttr)).toBeGreaterThan(0);
    }
  });

  it("does not duplicate [data-lg-filters] on remount (S2.3)", () => {
    const first = render(<LiquidGlassFilters />);
    expect(document.querySelectorAll("[data-lg-filters]")).toHaveLength(1);
    first.unmount();
    expect(document.querySelectorAll("[data-lg-filters]")).toHaveLength(0);
    render(<LiquidGlassFilters />);
    expect(document.querySelectorAll("[data-lg-filters]")).toHaveLength(1);
  });
});
