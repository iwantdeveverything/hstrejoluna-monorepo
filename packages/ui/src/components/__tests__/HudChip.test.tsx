/** @vitest-environment jsdom */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HudChip } from "../HudChip";

describe("<HudChip /> — Liquid Glass migration (REQ-7)", () => {
  it("renders its glass surface via <LiquidGlass variant='pill'> (S7.2)", () => {
    const { container } = render(<HudChip>STACK</HudChip>);
    const glass = container.querySelector("[data-lg-variant]");
    expect(glass).not.toBeNull();
    expect(glass?.getAttribute("data-lg-variant")).toBe("pill");
    expect(glass?.textContent).toContain("STACK");
  });

  it("does not use raw `backdrop-blur` Tailwind utilities (S7.1)", () => {
    const { container } = render(<HudChip>STACK</HudChip>);
    const offenders = container.querySelectorAll("[class*='backdrop-blur']");
    expect(offenders.length).toBe(0);
  });

  it("forwards a custom className without dropping caller styling (S1.4)", () => {
    const { container } = render(
      <HudChip className="custom-token">STACK</HudChip>,
    );
    const glass = container.querySelector("[data-lg-variant]");
    expect(glass?.className).toContain("custom-token");
  });
});
