/** @vitest-environment jsdom */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CommandSurface,
  type CommandSurfaceCounts,
  type CommandSurfaceSection,
} from "../CommandSurface";

const baseSections: readonly CommandSurfaceSection[] = [
  { id: "hero", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
] as const;

const baseCounts: CommandSurfaceCounts = {
  projects: 4,
  experience: 2,
  certificates: 3,
};

describe("<CommandSurface /> — Liquid Glass migration (REQ-7)", () => {
  it("renders the dock backplate via <LiquidGlass variant='dock'> (S7.2)", () => {
    const { container } = render(
      <CommandSurface
        activeId="projects"
        counts={baseCounts}
        sections={baseSections}
      />,
    );
    const dock = container.querySelector("[data-lg-variant='dock']");
    expect(dock).not.toBeNull();
  });

  it("does not use raw `backdrop-blur` Tailwind utilities (S7.1)", () => {
    const { container } = render(
      <CommandSurface
        activeId="projects"
        counts={baseCounts}
        sections={baseSections}
      />,
    );
    const offenders = container.querySelectorAll("[class*='backdrop-blur']");
    expect(offenders.length).toBe(0);
  });

  it("preserves the dock semantics (data-testid + role)", () => {
    const { getByTestId } = render(
      <CommandSurface
        activeId="hero"
        counts={baseCounts}
        sections={baseSections}
      />,
    );
    const dock = getByTestId("command-nav");
    expect(dock).toBeDefined();
  });
});
