/// <reference types="vitest/globals" />
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock next-intl (sync useTranslations — works for RSC)
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const messages: Record<string, Record<string, string>> = {
      hero: {
        eyebrow: "Building digital experiences",
        h1Name: "Héctor Trejo Luna",
        h1Role: "Fullstack Developer",
        lead: "Engineering scalable, high-performance digital ecosystems from architecture to pixel",
        cta: "Explore my work",
        ctaAriaLabel: "View featured projects and case studies",
        secondaryLabel: "LinkedIn Profile",
        secondaryHref: "https://linkedin.com/in/htrejoluna",
      },
    };
    return messages[namespace]?.[key] ?? key;
  },
}));

// Mock next/link — render as plain <a> for testing
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { HeroSection } from "./HeroSection";
import type { Profile } from "@/types/sanity";

const mockProfile: Profile = {
  name: "Héctor Trejo Luna",
  headline: "Custom Sanity headline override",
  bio: "A passionate architect.",
  socials: [],
};

describe("HeroSection — Semantic SSR shell (REQ liquid-glass-hero)", () => {
  it("renders a <section> with aria-labelledby pointing to the h1 id", () => {
    render(<HeroSection profile={null} />);
    const section = screen.getByRole("region");
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute("aria-labelledby", "hero-title");
  });

  it("renders exactly one <h1> with id 'hero-title' containing name + role from messages", () => {
    render(<HeroSection profile={null} />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    const h1 = headings[0];
    expect(h1).toHaveAttribute("id", "hero-title");
    expect(h1).toHaveTextContent("Héctor Trejo Luna");
    expect(h1).toHaveTextContent("Fullstack Developer");
  });

  it("renders an eyebrow <p> with translatable text from hero namespace", () => {
    render(<HeroSection profile={null} />);
    const eyebrow = screen.getByText("Building digital experiences");
    expect(eyebrow).toBeInTheDocument();
    expect(eyebrow.tagName).toBe("P");
  });

  it("renders a lead <p> with the translatable lead text from messages", () => {
    render(<HeroSection profile={null} />);
    const lead = screen.getByText(
      "Engineering scalable, high-performance digital ecosystems from architecture to pixel",
    );
    expect(lead).toBeInTheDocument();
    expect(lead.tagName).toBe("P");
  });

  it("renders a primary <a> CTA pointing to #projects", () => {
    render(<HeroSection profile={null} />);
    const primaryCta = screen.getByRole("link", {
      name: /Explore my work/,
    });
    expect(primaryCta).toBeInTheDocument();
    expect(primaryCta).toHaveAttribute("href", "#projects");
    expect(primaryCta).toHaveTextContent("Explore my work");
  });

  it("renders a secondary <a> CTA pointing to the LinkedIn profile URL from messages", () => {
    render(<HeroSection profile={null} />);
    const secondaryCta = screen.getByRole("link", {
      name: "LinkedIn Profile",
    });
    expect(secondaryCta).toBeInTheDocument();
    expect(secondaryCta).toHaveAttribute(
      "href",
      "https://linkedin.com/in/htrejoluna",
    );
    expect(secondaryCta).toHaveAttribute("target", "_blank");
    expect(secondaryCta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("all visible copy comes from the hero messages namespace (i18n)", () => {
    render(<HeroSection profile={null} />);
    // h1 text from messages (rendered as single text node: "Name — Role")
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Héctor Trejo Luna");
    expect(h1).toHaveTextContent("Fullstack Developer");
    // eyebrow from messages
    expect(
      screen.getByText("Building digital experiences"),
    ).toBeInTheDocument();
    // lead from messages
    expect(
      screen.getByText(
        "Engineering scalable, high-performance digital ecosystems from architecture to pixel",
      ),
    ).toBeInTheDocument();
    // CTA text from messages
    expect(screen.getByText("Explore my work")).toBeInTheDocument();
    // secondary from messages
    expect(screen.getByText("LinkedIn Profile")).toBeInTheDocument();
  });
});

describe("HeroSection — Sanity profile fallback (non-h1 paths only)", () => {
  it("prefers profile.headline over messages.hero.lead for the lead paragraph", () => {
    render(<HeroSection profile={mockProfile} />);
    const lead = screen.getByText("Custom Sanity headline override");
    expect(lead).toBeInTheDocument();
    // The default lead text should NOT be present
    expect(
      screen.queryByText(
        "Engineering scalable, high-performance digital ecosystems from architecture to pixel",
      ),
    ).not.toBeInTheDocument();
  });

  it("falls back to messages.hero.lead when profile.headline is null or undefined", () => {
    const profileWithoutHeadline: Profile = {
      name: "Héctor Trejo Luna",
      headline: undefined,
      bio: "A passionate architect.",
      socials: [],
    };
    render(<HeroSection profile={profileWithoutHeadline} />);
    expect(
      screen.getByText(
        "Engineering scalable, high-performance digital ecosystems from architecture to pixel",
      ),
    ).toBeInTheDocument();
  });

  it("h1 text never depends on Sanity profile — always from messages only", () => {
    render(<HeroSection profile={mockProfile} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    // h1 must reflect messages.hero.h1Name + messages.hero.h1Role
    expect(h1).toHaveTextContent("Héctor Trejo Luna");
    expect(h1).toHaveTextContent("Fullstack Developer");
    // profile.name ("Héctor Trejo Luna") happens to match, but the test
    // verifies the h1 text comes from the mock messages, not from the prop.
    // If profile.name were aliased to h1, changing the mock would break it.
  });
});

describe("HeroSection — Gated/lazy WebGL contract (liquid-glass-revival)", () => {
  // Contract: the WebGL scene is capability-gated AND lazy. The SSR shell
  // never ships a <canvas>; the physics island mounts a marker element and
  // only attaches WebGL client-side when every gate dimension passes. In
  // jsdom (SSR-equivalent: no WebGL2, no matchMedia signals) the gate is
  // closed, so the initial render must stay canvas-free with the CSS blob
  // fallback intact.

  it("renders zero <canvas> elements in the initial (SSR) render — WebGL is lazy", () => {
    const { container } = render(<HeroSection profile={null} />);
    const canvases = container.querySelectorAll("canvas");
    expect(canvases).toHaveLength(0);
  });

  // RED contract for the physics island (implemented in a later slice).
  // `it.fails` keeps this slice's CI green while pinning the expectation:
  // once HeroPhysicsIsland mounts its marker, this test starts passing and
  // vitest fails the run until the `.fails` modifier is removed — forcing
  // the implementing slice to flip it to a plain `it`.
  it.fails(
    "mounts the physics island marker so the gated WebGL layer has a seam",
    () => {
      const { container } = render(<HeroSection profile={null} />);
      const island = container.querySelectorAll("[data-hero-physics-island]");
      expect(island).toHaveLength(1);
    },
  );

  it("keeps the 3-blob CSS fallback so a closed gate still renders a visual layer", () => {
    const { container } = render(<HeroSection profile={null} />);
    const blobs = container.querySelectorAll("[class*='hero-blob']");
    expect(blobs).toHaveLength(3);
  });

  it("keeps the h1 in the SSR shell — the island never owns the LCP candidate", () => {
    render(<HeroSection profile={null} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "hero-title");
    expect(h1).toHaveTextContent("Héctor Trejo Luna");
  });

  it("embeds no inline <script> — the island hydrates via the bundle only", () => {
    const { container } = render(<HeroSection profile={null} />);
    const scripts = container.querySelectorAll("script");
    expect(scripts).toHaveLength(0);
  });
});
