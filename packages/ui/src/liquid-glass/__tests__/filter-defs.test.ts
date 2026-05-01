import { describe, expect, it } from "vitest";
import {
  LG_FILTER_IDS,
  LG_RESTING_SCALE,
  LG_VARIANTS,
} from "../filter-defs";
import { LG_DISPLACEMENT_MAPS } from "../displacement-maps";

describe("liquid-glass filter-defs", () => {
  it("exposes a filter id for every variant", () => {
    for (const variant of LG_VARIANTS) {
      expect(LG_FILTER_IDS[variant]).toBe(`lg-refraction-${variant}`);
    }
  });

  it("filter ids are unique across variants", () => {
    const ids = LG_VARIANTS.map((v) => LG_FILTER_IDS[v]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("declares all five expected variants exactly once", () => {
    expect([...LG_VARIANTS].sort()).toEqual(
      ["circle", "dialog", "dock", "panel", "pill"].sort()
    );
  });

  it("provides a resting scale per variant in pixels", () => {
    for (const variant of LG_VARIANTS) {
      const scale = LG_RESTING_SCALE[variant];
      expect(typeof scale).toBe("number");
      expect(scale).toBeGreaterThan(0);
    }
  });
});

describe("liquid-glass displacement maps", () => {
  it("provides a non-empty data URL per variant", () => {
    for (const variant of LG_VARIANTS) {
      const url = LG_DISPLACEMENT_MAPS[variant];
      expect(url.startsWith("data:image/svg+xml")).toBe(true);
      // a meaningful SVG document — not just the prefix
      expect(url.length).toBeGreaterThan(60);
    }
  });
});
