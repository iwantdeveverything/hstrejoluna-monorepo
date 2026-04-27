/** @vitest-environment jsdom */
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import Footer from "../../components/fragments/Footer";

import { vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const messages: Record<string, Record<string, string>> = {
      footer: {
        freeFork: "Free to fork.",
        privacyPolicy: "Privacy Policy",
        cookiePolicy: "Cookie Policy",
        legalNotice: "Legal Notice",
        manageCookies: "Manage Cookies",
      },
    };

    return messages[namespace]?.[key] ?? key;
  },
}));

describe("Footer Component (Legal)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all mandatory legal links", () => {
    render(<Footer />);

    const privacyLink = screen.getByRole("link", { name: /Privacy Policy/i });
    const cookiesLink = screen.getByRole("link", { name: /Cookie Policy/i });
    const legalLink = screen.getByRole("link", { name: /Legal Notice/i });

    expect(privacyLink.getAttribute("href")).toBe("/privacy");
    expect(cookiesLink.getAttribute("href")).toBe("/cookies");
    expect(legalLink.getAttribute("href")).toBe("/legal");
  });

  it("renders a button to manage cookie preferences", () => {
    render(<Footer />);

    const manageButton = screen.getByRole("button", {
      name: /Manage Cookies/i,
    });
    expect(manageButton).toBeDefined();
  });

  it("displays the brand/copyright with a year", () => {
    render(<Footer />);
    // Match text regardless of spans, looking for YYYY Dark Kinetic
    expect(
      screen.getByText(
        (content) => content.includes("Dark Kinetic") && /\d{4}/.test(content),
      ),
    ).toBeDefined();
  });
});
