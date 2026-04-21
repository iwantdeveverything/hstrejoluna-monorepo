import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroFragment } from "./HeroFragment";

vi.mock("@hstrejoluna/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@hstrejoluna/ui")>();
  return {
    ...actual,
    GlitchText: ({ text, className }: { text: string; className?: string }) => (
      <span className={className}>{text}</span>
    ),
  };
});

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
      ),
      button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
      ),
    },
  };
});

const mockProfile = {
  _id: "1",
  _type: "profile" as const,
  name: "Test User",
  headline: "Test Headline",
  bio: "Test Bio",
  socials: [],
};

describe("HeroFragment — Decorative Content Isolation", () => {
  it("hides TelemetryPanel from assistive technology", () => {
    const { container } = render(<HeroFragment profile={mockProfile} />);

    const telemetryText = screen.queryByText(/UPLINK_STATUS/);
    expect(telemetryText).toBeInTheDocument();

    const telemetryPanel = telemetryText!.closest("[aria-hidden]");
    expect(telemetryPanel).toHaveAttribute("aria-hidden", "true");
  });

  it("hides coordinate readout from assistive technology", () => {
    const { container } = render(<HeroFragment profile={mockProfile} />);

    const coordsText = screen.queryByText(/COORDS:/);
    expect(coordsText).toBeInTheDocument();

    const coordsContainer = coordsText!.closest("[aria-hidden]");
    expect(coordsContainer).toHaveAttribute("aria-hidden", "true");
  });

  it("hides grid overlay from assistive technology", () => {
    const { container } = render(<HeroFragment profile={mockProfile} />);

    // The grid overlay is a decorative div with specific classes
    const gridOverlays = container.querySelectorAll("[aria-hidden='true']");
    // At minimum 3 decorative elements must be hidden: telemetry, coords, grid
    expect(gridOverlays.length).toBeGreaterThanOrEqual(3);
  });
});
