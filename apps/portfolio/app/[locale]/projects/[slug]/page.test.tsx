/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectPage from "./page";

// Mock next-intl server functions
vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(async ({ namespace }) => {
    const messages: any = {
      "fragments.project": {
        home: "Home",
        projects: "Projects",
        role: "Role",
        year: "Year",
        visitSite: "Visit Live Site",
        viewGitHub: "View on GitHub",
      },
      common: { fullName: "Test Author" },
    };
    return (key: string) => messages[namespace]?.[key] || key;
  }),
}));

// Mock Sanity client and helpers
vi.mock("@/lib/sanity", () => ({
  client: {
    fetch: vi.fn(),
  },
  urlFor: () => ({
    url: () => "https://sanity.io/image.png",
  }),
}));

// Mock child components
vi.mock("@/components/Breadcrumbs", () => ({
  Breadcrumbs: ({ items }: any) => (
    <nav data-testid="breadcrumbs">
      {items.map((i: any) => <span key={i.label}>{i.label}</span>)}
    </nav>
  ),
}));

vi.mock("@hstrejoluna/ui", () => ({
  TelemetryHUD: ({ identifier }: any) => <div data-testid="telemetry-hud">{identifier}</div>,
}));

// Mock safeJsonLd
vi.mock("@/lib/safe-json-ld", () => ({
  safeJsonLd: (data: any) => JSON.stringify(data),
}));

const mockProject = {
  _id: "123",
  title: "Test Project",
  slug: { current: "test-project" },
  description: [{ _type: "block", children: [{ text: "Short desc" }] }],
  content: [{ _type: "block", children: [{ text: "Long case study" }] }],
  year: "2024",
  role: "Lead Architect",
  externalLink: "https://github.com/hstrejoluna/test",
  techStack: [{ _id: "s1", name: "Next.js" }],
};

import { client } from "@/lib/sanity";

describe("ProjectPage — Dynamic Rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (client.fetch as any).mockResolvedValue(mockProject);
  });

  it("renders project header with title, role, and year", async () => {
    const params = Promise.resolve({ locale: "en", slug: "test-project" });
    const Page = await ProjectPage({ params });
    render(Page);

    expect(screen.getByRole("heading", { level: 1, name: "Test Project" })).toBeInTheDocument();
    expect(screen.getByText("Lead Architect")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
  });

  it("renders specialized GitHub link when external link points to github.com", async () => {
    const params = Promise.resolve({ locale: "en", slug: "test-project" });
    const Page = await ProjectPage({ params });
    render(Page);

    expect(screen.getByText("View on GitHub")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /github.com\/hstrejoluna\/test/i });
    expect(link).toHaveAttribute("href", "https://github.com/hstrejoluna/test");
    expect(link).toHaveAttribute("rel", "noopener noreferrer external");
  });

  it("includes correct SoftwareSourceCode JSON-LD for the project", async () => {
    const params = Promise.resolve({ locale: "en", slug: "test-project" });
    const Page = await ProjectPage({ params });
    const { container } = render(Page);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    
    const jsonLd = JSON.parse(script?.innerHTML || "{}");
    expect(jsonLd["@type"]).toContain("SoftwareSourceCode");
    expect(jsonLd.name).toBe("Test Project");
    expect(jsonLd.codeRepository).toBe("https://github.com/hstrejoluna/test");
  });

  it("renders Breadcrumbs with correct trace", async () => {
    const params = Promise.resolve({ locale: "en", slug: "test-project" });
    const Page = await ProjectPage({ params });
    render(Page);

    const breadcrumbs = screen.getByTestId("breadcrumbs");
    expect(breadcrumbs).toHaveTextContent("Home");
    expect(breadcrumbs).toHaveTextContent("Projects");
    expect(breadcrumbs).toHaveTextContent("Test Project");
  });
});
