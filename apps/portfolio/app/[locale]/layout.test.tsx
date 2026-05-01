/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-intl server functions
vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
  getMessages: vi.fn(),
}));

// Mock next/font/google to avoid font loading in tests
vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-sans" }),
  Space_Grotesk: () => ({ variable: "--font-display" }),
  JetBrains_Mono: () => ({ variable: "--font-mono" }),
}));

// Mock next-intl NextIntlClientProvider
vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({
    children,
    locale,
    messages,
  }: {
    children: React.ReactNode;
    locale: string;
    messages: Record<string, unknown>;
  }) => (
    <div data-testid="intl-provider" data-locale={locale} data-messages={JSON.stringify(messages)}>
      {children}
    </div>
  ),
}));

// Mock child components that use client features
vi.mock("../../components/fragments/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock("../../components/fragments/CookieBanner", () => ({
  default: () => <div data-testid="cookie-banner">CookieBanner</div>,
}));

vi.mock("../../components/tracking/GoogleTagManager", () => ({
  default: ({ gtmId }: { gtmId: string }) => (
    <div data-testid="gtm" data-gtm-id={gtmId}>GTM</div>
  ),
}));

// Mock the MotionProvider client boundary that the layout wraps the subtree
// in. We only care that the layout actually wraps via the provider (REQ-6
// S6.3 — LazyMotion + domAnimation lives there). Actual Framer Motion
// runtime is covered by component-level tests.
vi.mock("../../components/providers/MotionProvider", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-test-lazy-motion="dom">{children}</div>
  ),
  MotionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-test-lazy-motion="dom">{children}</div>
  ),
}));

import { getMessages, setRequestLocale } from "next-intl/server";
import LocaleLayout from "./layout";

const mockMessages = {
  common: { skipToContent: "Skip to main content" },
  hero: { headline: "Test headline" },
  nav: { projects: "Projects" },
};

describe("LocaleLayout — Locale-Aware Rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getMessages as ReturnType<typeof vi.fn>).mockResolvedValue(mockMessages);
  });

  it("renders html element with lang='en' for English locale", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Layout = await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    // jsdom does not allow <html> inside a <div>, so we render to a
    // custom container attached to documentElement and inspect the raw HTML.
    const jsx = Layout as React.ReactElement<{ lang: string }>;
    // Verify the JSX tree contains the correct lang attribute
    expect(jsx.props.lang).toBe("en");
  });

  it("renders html element with lang='es' for Spanish locale", async () => {
    const params = Promise.resolve({ locale: "es" });
    const Layout = await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    const jsx = Layout as React.ReactElement<{ lang: string }>;
    expect(jsx.props.lang).toBe("es");
  });

  it("calls setRequestLocale with the resolved locale", async () => {
    const params = Promise.resolve({ locale: "en" });
    await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    expect(setRequestLocale).toHaveBeenCalledWith("en");
  });

  it("wraps children in NextIntlClientProvider with correct messages", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Layout = await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    const { container } = render(Layout as React.ReactElement);
    const provider = screen.getByTestId("intl-provider");
    expect(provider).toHaveAttribute("data-locale", "en");

    const passedMessages = JSON.parse(provider.getAttribute("data-messages") || "{}");
    expect(passedMessages).toEqual(mockMessages);
  });

  it("preserves skip-to-content accessibility link", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Layout = await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    render(Layout as React.ReactElement);
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("renders Footer and CookieBanner", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Layout = await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    render(Layout as React.ReactElement);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument();
  });

  it("includes a semantic header landmark for site branding", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Layout = await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    render(Layout as React.ReactElement);
    const header = screen.getByRole("banner");
    expect(header).toHaveAttribute("aria-label", "Site branding");
    expect(header).toHaveTextContent("Dark Kinetic");
  });

  it("mounts <LiquidGlassFilters /> exactly once (REQ-2 S2.1, S2.3)", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Layout = await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    const { container } = render(Layout as React.ReactElement);
    const filterMounts = container.querySelectorAll("[data-lg-filters]");
    expect(filterMounts).toHaveLength(1);
  });

  it("filter defs include every variant id (REQ-2 S2.4)", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Layout = await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    const { container } = render(Layout as React.ReactElement);
    const expectedIds = [
      "lg-refraction-panel",
      "lg-refraction-pill",
      "lg-refraction-dock",
      "lg-refraction-circle",
      "lg-refraction-dialog",
    ];
    for (const id of expectedIds) {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it("wraps client subtree in <LazyMotion features={domAnimation}> (REQ-6 S6.3)", async () => {
    const params = Promise.resolve({ locale: "en" });
    const Layout = await LocaleLayout({
      children: <p>Content</p>,
      params,
    });

    const { container } = render(Layout as React.ReactElement);
    // LazyMotion is mocked below to expose a marker we can assert against.
    expect(container.querySelector("[data-test-lazy-motion='dom']")).not.toBeNull();
  });
});
