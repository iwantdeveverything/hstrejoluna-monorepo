/** @vitest-environment jsdom */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock external dependencies BEFORE page import (vi.mock hoisting)
vi.mock("@/lib/sanity", () => ({
  client: { fetch: vi.fn() },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  setRequestLocale: vi.fn(),
}));

vi.mock("@/lib/safe-json-ld", () => ({
  safeJsonLd: vi.fn().mockReturnValue("{}"),
}));

vi.mock("@/lib/json-ld", () => ({
  buildPersonJsonLd: vi.fn().mockReturnValue({}),
  buildProjectListJsonLd: vi.fn().mockReturnValue({}),
}));

vi.mock("@/components/HeroText", () => ({
  HeroText: ({ profile, locale }: { profile: unknown; locale: string }) => (
    <section id="hero" aria-labelledby="hero-title" data-testid="hero-text">
      <h1 id="hero-title">Test Hero</h1>
    </section>
  ),
}));

vi.mock("@/components/ObsidianStreamLoader", () => ({
  ObsidianStreamLoader: (props: Record<string, unknown>) => (
    <div
      data-testid="obsidian-stream-dynamic"
      data-skip-hero={String(props.skipHero)}
    >
      ObsidianStreamLoader
    </div>
  ),
}));

vi.mock("@/components/ProjectsGrid", () => ({
  ProjectsGrid: () => <div data-testid="projects-grid">ProjectsGrid</div>,
}));

import PortfolioPage from "./page";
import { client } from "@/lib/sanity";

const mockProfile = {
  _id: "1",
  _type: "profile" as const,
  name: "Test User",
  headline: "Test Headline",
};
const mockProjects = [
  { _id: "p1", title: "Project 1", slug: { current: "proj-1" } },
];
const mockSkills = [{ _id: "s1", name: "React" }];
const mockExperiences = [{ _id: "e1", company: "ACME" }];
const mockCertificates = [{ _id: "c1", name: "AWS" }];

function setupFetchMock() {
  const fetchMock = client.fetch as ReturnType<typeof vi.fn>;
  fetchMock.mockImplementation((query: string) => {
    if (query.includes('_type == "profile"'))
      return Promise.resolve(mockProfile);
    if (query.includes('_type == "project"'))
      return Promise.resolve(mockProjects);
    if (query.includes('_type == "skill"')) return Promise.resolve(mockSkills);
    if (query.includes('_type == "experience"'))
      return Promise.resolve(mockExperiences);
    if (query.includes('_type == "certificate"'))
      return Promise.resolve(mockCertificates);
    return Promise.resolve([]);
  });
}

describe("PortfolioPage — HeroText + Dynamic ObsidianStream Wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupFetchMock();
  });

  it("renders HeroText as direct RSC in the SSR output (REQ: HeroText RSC Shell)", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Page = await PortfolioPage({ params });
    render(Page as React.ReactElement);

    const heroText = screen.getByTestId("hero-text");
    expect(heroText).toBeInTheDocument();
    expect(heroText.tagName).toBe("SECTION");
    expect(heroText).toHaveAttribute("id", "hero");

    // h1 is the LCP candidate — must be present in SSR HTML
    const h1 = within(heroText).getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
  });

  it("renders ObsidianStream via dynamic import with skipHero=true (REQ: Dynamic ObsidianStream Import)", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Page = await PortfolioPage({ params });
    render(Page as React.ReactElement);

    const obsidianEl = screen.getByTestId("obsidian-stream-dynamic");
    expect(obsidianEl).toBeInTheDocument();
    expect(obsidianEl.dataset.skipHero).toBe("true");
  });

  it("preserves JSON-LD script tags for structured data (REQ: Existing Test Continuity)", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Page = await PortfolioPage({ params });
    const { container } = render(Page as React.ReactElement);

    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts.length).toBeGreaterThanOrEqual(2);
  });

  it("exports revalidate = 60 (ISR contract intact)", async () => {
    const mod = await import("./page");
    expect(mod.revalidate).toBe(60);
  });

  it("does NOT export force-dynamic config option", async () => {
    const mod = await import("./page");
    expect(mod).not.toHaveProperty("dynamic");
  });

  it("HeroText appears BEFORE ObsidianStreamDynamic in render order", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Page = await PortfolioPage({ params });
    render(Page as React.ReactElement);

    const heroEl = screen.getByTestId("hero-text");
    const obsidianEl = screen.getByTestId("obsidian-stream-dynamic");

    // DOM order: HeroText must precede ObsidianStreamDynamic
    expect(
      heroEl.compareDocumentPosition(obsidianEl) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  // ---- TRIANGULATE: different locale ----

  it("renders HeroText correctly with Spanish locale", async () => {
    const params = Promise.resolve({ locale: "es" });
    const Page = await PortfolioPage({ params });
    render(Page as React.ReactElement);

    const heroText = screen.getByTestId("hero-text");
    expect(heroText).toBeInTheDocument();
    expect(heroText).toHaveAttribute("id", "hero");
  });

  it("HeroText appears before ObsidianStreamDynamic with Spanish locale too", async () => {
    const params = Promise.resolve({ locale: "es" });
    const Page = await PortfolioPage({ params });
    render(Page as React.ReactElement);

    const heroEl = screen.getByTestId("hero-text");
    const obsidianEl = screen.getByTestId("obsidian-stream-dynamic");
    expect(
      heroEl.compareDocumentPosition(obsidianEl) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("passes skipHero=true to ObsidianStreamDynamic for Spanish locale", async () => {
    const params = Promise.resolve({ locale: "es" });
    const Page = await PortfolioPage({ params });
    render(Page as React.ReactElement);

    const obsidianEl = screen.getByTestId("obsidian-stream-dynamic");
    expect(obsidianEl.dataset.skipHero).toBe("true");
  });

  // ---- EDGE CASE: static import eliminated ----

  it("does NOT expose ObsidianStream as a statically importable named export", async () => {
    // The page module must not re-export or statically depend on ObsidianStream.
    // With dynamic import and ssr: false, the page module loads without needing
    // the ObsidianStream bundle at module evaluation time.
    const mod = await import("./page");

    // ObsidianStream is NOT a named export of the module
    expect(mod).not.toHaveProperty("ObsidianStream");
  });
});
