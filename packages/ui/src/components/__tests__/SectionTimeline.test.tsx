/** @vitest-environment jsdom */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionTimeline } from "../SectionTimeline";

const sections = [
  { id: "system", label: "System" },
  { id: "projects", label: "Projects" },
];

describe("<SectionTimeline /> — Liquid Glass migration (REQ-7)", () => {
  it("renders rail pills via <LiquidGlass variant='pill'> (S7.2)", () => {
    const { container } = render(
      <SectionTimeline sections={sections} activeId="system" />,
    );
    const pills = container.querySelectorAll("[data-lg-variant='pill']");
    expect(pills.length).toBe(sections.length);
  });

  it("does not use raw `backdrop-blur` Tailwind utilities (S7.1)", () => {
    // Documented intentional skip: SectionTimeline renders solid-color
    // animated dots, NOT a translucent glass surface. There is no glass
    // treatment to migrate. This sentinel test pins the no-backdrop-blur
    // rule so future authors must migrate via <LiquidGlass> if they ever
    // introduce one (REQ-7 S7.1).
    const { container } = render(
      <SectionTimeline sections={sections} activeId="system" />,
    );
    const offenders = container.querySelectorAll("[class*='backdrop-blur']");
    expect(offenders.length).toBe(0);
  });
});
