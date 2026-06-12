/// <reference types="vitest/globals" />
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroText } from "./HeroText";

/**
 * HeroText RSC contract (design §2, ADR-3, ADR-6):
 *  - the 3 decorative hero-blob divs are GONE
 *  - an SSR poster <img> ships in the initial HTML (z-0, aria-hidden) as the
 *    background LCP candidate
 *  - the <HeroBackdrop /> island mounts ONLY when
 *    `NEXT_PUBLIC_HERO_LIQUID === "true"` (RSC-level kill switch)
 *  - the h1 semantic shell is unchanged
 */

vi.mock("next-intl/server", () => ({
  getTranslations: () =>
    Promise.resolve((key: string) => {
      const messages: Record<string, string> = {
        eyebrow: "Engineer",
        h1Name: "Hernán",
        h1Role: "Architect",
        lead: "Lead copy",
        cta: "View work",
        secondaryLabel: "GitHub",
        secondaryHref: "https://example.com",
        ctaAriaLabel: "Go to",
      };
      return messages[key] ?? key;
    }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("./hero/HeroBackdrop", () => ({
  HeroBackdrop: () => <div data-testid="hero-backdrop" />,
}));

const renderHero = async () => {
  const ui = await HeroText({ profile: null, locale: "en" });
  return render(ui);
};

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("HeroText — blob demolition", () => {
  it("renders NO hero-blob elements", async () => {
    const { container } = await renderHero();
    expect(container.querySelectorAll(".hero-blob")).toHaveLength(0);
  });
});

describe("HeroText — SSR poster (ADR-6)", () => {
  it("ships a poster <img> in initial HTML, z-0 and aria-hidden", async () => {
    const { container } = await renderHero();
    const poster = container.querySelector("img");
    expect(poster).not.toBeNull();
    expect(poster).toHaveAttribute("aria-hidden", "true");
    expect(poster?.getAttribute("src")).toContain("hero-poster");
    expect(poster?.className).toContain("z-0");
  });
});

describe("HeroText — kill switch (ADR-3)", () => {
  it("does NOT render HeroBackdrop when the flag is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_HERO_LIQUID", "false");
    const { queryByTestId } = await renderHero();
    expect(queryByTestId("hero-backdrop")).toBeNull();
  });

  it("does NOT render HeroBackdrop when the flag is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_HERO_LIQUID", "");
    const { queryByTestId } = await renderHero();
    expect(queryByTestId("hero-backdrop")).toBeNull();
  });

  it("renders HeroBackdrop only when the flag is exactly \"true\"", async () => {
    vi.stubEnv("NEXT_PUBLIC_HERO_LIQUID", "true");
    const { queryByTestId } = await renderHero();
    expect(queryByTestId("hero-backdrop")).not.toBeNull();
  });
});

describe("HeroText — semantic shell unchanged", () => {
  it("keeps the h1 protagonist markup", async () => {
    const { container } = await renderHero();
    const h1 = container.querySelector("h1#hero-title");
    expect(h1).not.toBeNull();
    expect(within(h1 as HTMLElement).getByText(/Hernán/)).toBeTruthy();
    expect(within(h1 as HTMLElement).getByText(/Architect/)).toBeTruthy();
  });
});
