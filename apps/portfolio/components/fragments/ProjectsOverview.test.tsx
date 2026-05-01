import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectsOverview } from "./ProjectsOverview";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

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
    HudChip: ({ children }: React.PropsWithChildren) => (
      <span>{children}</span>
    ),
    GlowBorder: ({ children }: React.PropsWithChildren) => (
      <div>{children}</div>
    ),
    MicroInteraction: ({ children }: React.PropsWithChildren) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    m: {
      div: ({
        children,
        ...props
      }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>
          {children}
        </div>
      ),
    },
    motion: {
      ...actual.motion,
      div: ({
        children,
        ...props
      }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>
          {children}
        </div>
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

describe("ProjectsOverview — Liquid Glass migration (REQ-7)", () => {
  it("renders each project card shell via <LiquidGlass variant='panel'> (S7.2)", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProjectsOverview projects={[projectWithImage, projectWithoutImage]} />
      </NextIntlClientProvider>,
    );

    const panels = container.querySelectorAll("[data-lg-variant='panel']");
    expect(panels.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the deployed status pill via <LiquidGlass variant='pill'> (S7.2)", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProjectsOverview projects={[projectWithImage]} />
      </NextIntlClientProvider>,
    );

    const pill = container.querySelector("[data-lg-variant='pill']");
    expect(pill).not.toBeNull();
    // The migrated surface is the small status badge (deployed indicator).
    expect(pill?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it("does not use raw `backdrop-blur` Tailwind utilities (S7.1)", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProjectsOverview projects={[projectWithImage]} />
      </NextIntlClientProvider>,
    );

    const offenders = container.querySelectorAll("[class*='backdrop-blur']");
    expect(offenders.length).toBe(0);
  });

  it("renders the expanded frame via <LiquidGlass variant='panel'> when opened (S7.2)", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProjectsOverview projects={[projectWithImage]} />
      </NextIntlClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /\[click_to_expand\]/i }));
    const expanded = container.querySelector("#project-panel-p1");
    const frame = expanded?.querySelector("[data-lg-variant='panel']");
    expect(frame).not.toBeNull();
  });
});

describe("ProjectsOverview — Descriptive Image Alt Text", () => {
  it("uses descriptive alt text on project images, not just the title", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProjectsOverview projects={[projectWithImage]} />
      </NextIntlClientProvider>,
    );

    const image = screen.getByTestId("project-image");
    const altText = image.getAttribute("alt");
    expect(altText).toContain("Screenshot of");
    expect(altText).toContain("Awesome App");
  });

  it("hides placeholder gradient from assistive technology when no image", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProjectsOverview projects={[projectWithoutImage]} />
      </NextIntlClientProvider>,
    );

    const gradientDiv = container.querySelector(".bg-gradient-to-br");
    expect(gradientDiv).toBeInTheDocument();
    expect(gradientDiv).toHaveAttribute("aria-hidden", "true");
  });
});
