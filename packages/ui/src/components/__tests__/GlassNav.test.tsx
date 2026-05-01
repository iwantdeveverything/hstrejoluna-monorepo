/** @vitest-environment jsdom */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlassNav } from "../GlassNav";

describe("<GlassNav /> — Liquid Glass migration (REQ-7)", () => {
  it("renders its glass surface via <LiquidGlass variant='panel'> (S7.2)", () => {
    const { container } = render(<GlassNav />);
    // The migrated wrapper is the inner glass shell, not the <nav> chrome
    // (which keeps fixed-position layout responsibilities).
    const glass = container.querySelector("[data-lg-variant]");
    expect(glass).not.toBeNull();
    expect(glass?.getAttribute("data-lg-variant")).toBe("panel");
  });

  it("does not use raw `backdrop-blur` Tailwind utilities (S7.1)", () => {
    const { container } = render(<GlassNav />);
    const offenders = container.querySelectorAll("[class*='backdrop-blur']");
    expect(offenders.length).toBe(0);
  });

  it("preserves the navigation landmark + the labelled links", () => {
    const { container, getByText } = render(<GlassNav />);
    const nav = container.querySelector("nav");
    expect(nav).not.toBeNull();
    // Sanity — labelled anchors still render.
    expect(getByText("System")).toBeInstanceOf(HTMLAnchorElement);
    expect(getByText("Projects")).toBeInstanceOf(HTMLAnchorElement);
    expect(getByText("Experience")).toBeInstanceOf(HTMLAnchorElement);
    expect(getByText("Skills")).toBeInstanceOf(HTMLAnchorElement);
  });
});
