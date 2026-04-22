import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectsOverview } from "./ProjectsOverview";

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: Record<string, unknown>) => (
    <img alt={alt as string} data-testid="project-image" />
  ),
}));

vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({ url: () => "https://example.com/image.jpg" }),
}));

vi.mock("@hstrejoluna/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@hstrejoluna/ui")>();
  return {
    ...actual,
    HudChip: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
    GlowBorder: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
    MicroInteraction: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  };
});

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    m: {
      div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
      ),
    },
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
      ),
    },
  };
});

vi.mock("lucide-react", () => ({
  ExternalLink: () => <span data-testid="icon-external" />,
  Activity: () => <span data-testid="icon-activity" />,
}));

const projectWithImage = {
  _id: "p1",
  _type: "project" as const,
  title: "Awesome App",
  description: "A great application",
  image: { asset: { _ref: "image-ref", _type: "reference" as const } },
  technologies: ["React", "TypeScript"],
  links: [],
};

const projectWithoutImage = {
  _id: "p2",
  _type: "project" as const,
  title: "No Image Project",
  description: "A project without image",
  image: null,
  technologies: ["Go"],
  links: [],
};

describe("ProjectsOverview — Descriptive Image Alt Text", () => {
  it("uses descriptive alt text on project images, not just the title", () => {
    render(<ProjectsOverview projects={[projectWithImage]} />);

    const image = screen.getByTestId("project-image");
    const altText = image.getAttribute("alt");
    expect(altText).toContain("Screenshot of");
    expect(altText).toContain("Awesome App");
  });

  it("hides placeholder gradient from assistive technology when no image", () => {
    const { container } = render(<ProjectsOverview projects={[projectWithoutImage]} />);

    const gradientDiv = container.querySelector(".bg-gradient-to-br");
    expect(gradientDiv).toBeInTheDocument();
    expect(gradientDiv).toHaveAttribute("aria-hidden", "true");
  });
});
