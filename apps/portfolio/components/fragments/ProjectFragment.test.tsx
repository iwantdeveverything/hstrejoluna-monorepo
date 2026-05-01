/** @vitest-environment jsdom */
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";

import { ProjectFragment } from "./ProjectFragment";
import messages from "../../messages/en.json";

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} data-testid="project-image" />,
}));

vi.mock("@/lib/sanity", () => ({
  urlFor: () => ({ url: () => "https://example.com/image.jpg" }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/navigation", () => ({
  getProjectUrl: () => "/projects/test",
}));

vi.mock("@hstrejoluna/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@hstrejoluna/ui")>();
  return {
    ...actual,
    GlitchText: ({ text, className }: { text: string; className?: string }) => (
      <span className={className}>{text}</span>
    ),
    TelemetryHUD: ({ identifier }: { identifier: string }) => (
      <div data-testid="telemetry-hud">{identifier}</div>
    ),
  };
});

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    m: {
      div: ({
        children,
        ...props
      }: React.PropsWithChildren<Record<string, unknown>>) => (
        <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>
          {children}
        </div>
      ),
      span: ({
        children,
        ...props
      }: React.PropsWithChildren<Record<string, unknown>>) => (
        <span {...(props as React.HTMLAttributes<HTMLSpanElement>)}>
          {children}
        </span>
      ),
    },
  };
});

const project = {
  _id: "1",
  _type: "project" as const,
  title: "Test Project",
  description: "Test description",
  image: { asset: { _ref: "image-ref", _type: "reference" as const } },
  slug: { _type: "slug" as const, current: "test-project" },
  techStack: [
    { _id: "s1", name: "Next.js", proficiency: 90, category: "frontend" },
  ],
};

describe("<ProjectFragment /> — Liquid Glass migration (REQ-7)", () => {
  it("renders the image frame via <LiquidGlass variant='panel'> (S7.2)", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProjectFragment project={project} index={0} />
      </NextIntlClientProvider>,
    );
    const glass = container.querySelector("[data-lg-variant='panel']");
    expect(glass).not.toBeNull();
  });

  it("does not use raw `backdrop-blur` Tailwind utilities (S7.1)", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ProjectFragment project={project} index={0} />
      </NextIntlClientProvider>,
    );
    const offenders = container.querySelectorAll("[class*='backdrop-blur']");
    expect(offenders.length).toBe(0);
  });
});
