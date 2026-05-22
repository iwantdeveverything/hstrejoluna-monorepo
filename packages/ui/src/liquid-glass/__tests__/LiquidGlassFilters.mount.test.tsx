/** @vitest-environment jsdom */
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LiquidGlassFilters } from "../LiquidGlassFilters";
import { LG_FILTER_IDS } from "../filter-defs";

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

  it("declares gooey filter inside <defs>", () => {
    render(<LiquidGlassFilters />);
    const svg = document.querySelector("[data-lg-filters]");
    expect(svg).not.toBeNull();
    const defs = svg?.querySelector("defs");
    expect(defs).not.toBeNull();
    const filterId = LG_FILTER_IDS.gooey;
    const filterEl = defs?.querySelector(`#${CSS.escape(filterId)}`);
    expect(filterEl, `expected filter#${filterId} to exist`).not.toBeNull();
    expect(filterEl?.tagName.toLowerCase()).toBe("filter");
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
