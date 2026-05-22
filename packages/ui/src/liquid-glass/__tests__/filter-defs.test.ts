import { describe, expect, it } from "vitest";
import {
  LG_FILTER_IDS,
  LG_VARIANTS,
} from "../filter-defs";

describe("liquid-glass filter-defs", () => {
  it("exposes a filter id for gooey", () => {
    expect(LG_FILTER_IDS.gooey).toBe("lg-gooey");
  });

  it("declares all five expected variants exactly once", () => {
    expect([...LG_VARIANTS].sort()).toEqual(
      ["circle", "dialog", "dock", "panel", "pill"].sort()
    );
  });
});
