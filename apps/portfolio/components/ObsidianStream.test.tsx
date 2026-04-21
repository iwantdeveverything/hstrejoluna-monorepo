/// <reference types="vitest/globals" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@hstrejoluna/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@hstrejoluna/ui")>();
  return {
    ...actual,
    useReducedMotion: () => false,
    BootSequence: () => null,
  };
});

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: (_: unknown, __: unknown, values: string[]) => values[0],
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    LazyMotion: ({ children }: React.PropsWithChildren) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, style, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
      ),
    },
  };
});

vi.mock("@/hooks/useAutoHideNavigation", () => ({
  useAutoHideNavigation: () => false,
}));

vi.mock("@/hooks/useActiveSection", () => ({
  useActiveSection: () => "hero",
}));

vi.mock("./fragments/HeroFragment", () => ({
  HeroFragment: () => <div data-testid="hero-fragment">Hero</div>,
}));
vi.mock("./fragments/ProjectsOverview", () => ({
  ProjectsOverview: () => <div>Projects</div>,
}));
vi.mock("./fragments/ExperienceOverview", () => ({
  ExperienceOverview: () => <div>Experience</div>,
}));
vi.mock("./fragments/SkillsOverview", () => ({
  SkillsOverview: () => <div>Skills</div>,
}));
vi.mock("./fragments/CertificatesOverview", () => ({
  CertificatesOverview: () => <div>Certificates</div>,
}));
vi.mock("./ui/SectionDock", () => ({
  SectionDock: () => <nav data-testid="section-dock">Dock</nav>,
}));
vi.mock("./ui/CommandNav", () => ({
  CommandNav: () => <nav data-testid="command-nav">Nav</nav>,
}));

import { ObsidianStream } from "./ObsidianStream";

const defaultProps = {
  profile: { _id: "1", _type: "profile" as const, name: "Test User", headline: "Test", bio: "", socials: [] },
  projects: [],
  skills: [],
  experiences: [],
  certificates: [],
};

describe("ObsidianStream — Decorative Content Isolation", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SKIP_BOOT_SEQUENCE = "1";
  });

  it("hides background name watermark from assistive technology", () => {
    render(<ObsidianStream {...defaultProps} />);

    const watermarkText = screen.queryByText("Test User");
    expect(watermarkText).toBeInTheDocument();

    const watermarkContainer = watermarkText!.closest("[aria-hidden]");
    expect(watermarkContainer).toHaveAttribute("aria-hidden", "true");
  });

  it("hides scroll progress bar from assistive technology", () => {
    const { container } = render(<ObsidianStream {...defaultProps} />);

    // The progress bar is a fixed div at the top with bg-white/5
    const progressBarWrapper = container.querySelector(".fixed.top-0.left-0.w-full");
    expect(progressBarWrapper).toBeInTheDocument();
    expect(progressBarWrapper).toHaveAttribute("aria-hidden", "true");
  });
});
