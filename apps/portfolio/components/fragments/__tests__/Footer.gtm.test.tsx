/** @vitest-environment jsdom */
import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/en.json";

// Track call order across mocks
const callOrder: string[] = [];

// Mock pushConsentDenial from tracking utils
vi.mock("@/components/tracking/gtm-utils", () => ({
  pushConsentDenial: () => {
    callOrder.push("pushConsentDenial");
  },
}));

// Mock compliance package
vi.mock("@hstrejoluna/compliance", () => ({
  clearConsentState: () => {
    callOrder.push("clearConsentState");
  },
}));

// Mock next-intl navigation
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock window.location.reload
const reloadMock = vi.fn(() => {
  callOrder.push("reload");
});

import Footer from "../Footer";

describe("Footer GTM integration", () => {
  beforeEach(() => {
    callOrder.length = 0;
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("calls pushConsentDenial BEFORE clearConsentState and reload", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Footer />
      </NextIntlClientProvider>,
    );

    const manageButton = screen.getByRole("button", {
      name: /Manage Cookies/i,
    });
    fireEvent.click(manageButton);

    expect(callOrder).toEqual([
      "pushConsentDenial",
      "clearConsentState",
      "reload",
    ]);
  });

  it("calls all three functions exactly once", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Footer />
      </NextIntlClientProvider>,
    );

    const manageButton = screen.getByRole("button", {
      name: /Manage Cookies/i,
    });
    fireEvent.click(manageButton);

    expect(callOrder).toHaveLength(3);
    expect(callOrder.filter((c) => c === "pushConsentDenial")).toHaveLength(1);
    expect(callOrder.filter((c) => c === "clearConsentState")).toHaveLength(1);
    expect(callOrder.filter((c) => c === "reload")).toHaveLength(1);
  });
});
