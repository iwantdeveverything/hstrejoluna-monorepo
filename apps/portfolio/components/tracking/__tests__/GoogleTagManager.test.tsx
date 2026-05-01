/** @vitest-environment jsdom */
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock next/script to capture rendered props
const mockScriptProps: Record<string, unknown>[] = [];
vi.mock("next/script", () => ({
  default: (props: Record<string, unknown>) => {
    mockScriptProps.push(props);
    return <script data-testid="gtm-script" />;
  },
}));

// Mock useCookieConsent from @hstrejoluna/compliance
const mockUseCookieConsent = vi.fn();
vi.mock("@hstrejoluna/compliance", () => ({
  useCookieConsent: (...args: unknown[]) => mockUseCookieConsent(...args),
}));

// Import AFTER mocks are set up
import GoogleTagManager from "../GoogleTagManager";

describe("GoogleTagManager", () => {
  beforeEach(() => {
    window.dataLayer = [];
    mockScriptProps.length = 0;
    mockUseCookieConsent.mockReturnValue({ consentState: null });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders nothing when gtmId is empty string", () => {
    const { container } = render(<GoogleTagManager gtmId="" />);
    expect(container.innerHTML).toBe("");
  });

  it("pushes consent defaults (all 4 denied) on mount", () => {
    render(<GoogleTagManager gtmId="GTM-TEST123" />);

    // Find the consent default push
    const consentDefault = window.dataLayer.find(
      (entry) =>
        Array.isArray(entry) &&
        entry[0] === "consent" &&
        entry[1] === "default",
    ) as unknown[] | undefined;

    expect(consentDefault).toBeDefined();
    expect(consentDefault![2]).toEqual({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("loads GTM script via next/script with afterInteractive strategy", () => {
    render(<GoogleTagManager gtmId="GTM-TEST123" />);

    expect(mockScriptProps.length).toBeGreaterThan(0);
    const scriptProps = mockScriptProps[0];
    expect(scriptProps.strategy).toBe("afterInteractive");
    expect(scriptProps.src).toContain("googletagmanager.com/gtm.js");
    expect(scriptProps.src).toContain("GTM-TEST123");
  });

  it("pushes consent update when consentState changes", () => {
    mockUseCookieConsent.mockReturnValue({
      consentState: {
        necessary: true,
        analytics: true,
        marketing: false,
      },
    });

    render(<GoogleTagManager gtmId="GTM-TEST123" />);

    // Find the consent update push (not the default push)
    const consentUpdate = window.dataLayer.find(
      (entry) =>
        Array.isArray(entry) &&
        entry[0] === "consent" &&
        entry[1] === "update",
    ) as unknown[] | undefined;

    expect(consentUpdate).toBeDefined();
    expect(consentUpdate![2]).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("does not push consent update when consentState is null", () => {
    mockUseCookieConsent.mockReturnValue({ consentState: null });

    render(<GoogleTagManager gtmId="GTM-TEST123" />);

    const consentUpdates = window.dataLayer.filter(
      (entry) =>
        Array.isArray(entry) &&
        entry[0] === "consent" &&
        entry[1] === "update",
    );

    expect(consentUpdates).toHaveLength(0);
  });

  it("renders noscript element when gtmId is provided", () => {
    const { container } = render(<GoogleTagManager gtmId="GTM-TEST123" />);

    // jsdom strips noscript children (JS-enabled env), so we can only
    // verify the noscript element is present in the DOM.
    // The iframe URL correctness is implicitly covered by the script src
    // test (same gtmId interpolation pattern).
    const noscript = container.querySelector("noscript");
    expect(noscript).not.toBeNull();
  });

  it("does not render noscript when gtmId is empty", () => {
    const { container } = render(<GoogleTagManager gtmId="" />);

    const noscript = container.querySelector("noscript");
    expect(noscript).toBeNull();
  });

  it("pushes gtm.start event on mount", () => {
    render(<GoogleTagManager gtmId="GTM-TEST123" />);

    const gtmStart = window.dataLayer.find(
      (entry) =>
        !Array.isArray(entry) &&
        typeof entry === "object" &&
        entry !== null &&
        "event" in entry &&
        entry.event === "gtm.js",
    );

    expect(gtmStart).toBeDefined();
    expect(gtmStart).toHaveProperty("gtm.start");
  });
});
