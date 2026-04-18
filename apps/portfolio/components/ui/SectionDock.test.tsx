import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as navigation from "@/lib/navigation";
import { navSections } from "@/lib/sections";
import { SectionDock } from "./SectionDock";

vi.mock("@hstrejoluna/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@hstrejoluna/ui")>();
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

describe("SectionDock", () => {
  it("renders semantic dock navigation with active marker", () => {
    render(<SectionDock sections={navSections} activeId="projects" />);

    expect(
      screen.getByRole("navigation", { name: /section timeline navigation/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /navigate to projects/i })).toHaveAttribute(
      "aria-current",
      "location"
    );
  });

  it("uses shared smooth-scroll helper when selecting a section", () => {
    const scrollSpy = vi
      .spyOn(navigation, "scrollToSection")
      .mockReturnValue(true);

    render(<SectionDock sections={navSections} activeId="projects" />);

    fireEvent.click(screen.getByRole("link", { name: /navigate to skills/i }));

    expect(scrollSpy).toHaveBeenCalledWith({
      id: "skills",
      reducedMotion: false,
    });
  });

  it("hides the section dock when hideOnScroll is enabled", () => {
    render(<SectionDock sections={navSections} activeId="projects" hideOnScroll />);

    expect(
      screen.getByRole("navigation", { name: /section timeline navigation/i })
    ).toHaveAttribute("data-hidden", "true");
  });
});
