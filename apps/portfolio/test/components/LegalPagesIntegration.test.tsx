/** @vitest-environment jsdom */
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";

import { vi } from "vitest";
import PrivacyPage from "../../app/[locale]/privacy/page";
import CookiesPage from "../../app/[locale]/cookies/page";
import LegalPage from "../../app/[locale]/legal/page";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async ({ namespace }: { namespace: string }) => {
    const dictionaries: Record<string, Record<string, string>> = {
      legal: {
        lastUpdatedPrefix: "Last updated:",
        contactHeading: "Contact Information",
        contactDescription:
          "If you have any questions or concerns about this policy or our practices, please contact us at:",
      },
      "legal.privacyPolicy": {
        title: "Privacy Policy",
        lastUpdated: "April 2026",
        "sections.introduction.heading": "1. Introduction",
        "sections.introduction.body": "Privacy intro",
        "sections.dataCollection.heading": "2. Data We Collect",
        "sections.dataCollection.body": "Privacy data collection",
        "sections.gpc.heading": "3. Global Privacy Control (GPC)",
        "sections.gpc.body": "Privacy gpc",
        metaTitle: "Privacy meta title",
        metaDescription: "Privacy meta description",
      },
      "legal.cookiePolicy": {
        title: "Cookie Policy",
        lastUpdated: "April 2026",
        "sections.whatAreCookies.heading": "1. What Are Cookies?",
        "sections.whatAreCookies.body": "Cookie intro",
        "sections.howWeUseCookies.heading": "2. How We Use Cookies",
        "sections.howWeUseCookies.body": "Cookie usage",
        "sections.managingPreferences.heading": "3. Managing Your Preferences",
        "sections.managingPreferences.body": "Cookie preferences",
        metaTitle: "Cookie meta title",
        metaDescription: "Cookie meta description",
      },
      "legal.legalNotice": {
        title: "Legal Notice",
        lastUpdated: "April 2026",
        "sections.ownership.heading": "1. Ownership",
        "sections.ownership.body": "Legal ownership",
        "sections.intellectualProperty.heading": "2. Intellectual Property",
        "sections.intellectualProperty.body": "Legal IP",
        "sections.disclaimers.heading": "3. Disclaimers",
        "sections.disclaimers.body": "Legal disclaimers",
        metaTitle: "Legal meta title",
        metaDescription: "Legal meta description",
      },
    };

    return (key: string) => dictionaries[namespace]?.[key] ?? key;
  }),
}));

describe("Legal Pages Integration (Portfolio)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders Privacy Policy page correctly", async () => {
    const Page = await PrivacyPage({
      params: Promise.resolve({ locale: "en" }),
    });
    render(Page);
    expect(
      screen.getByRole("heading", { name: /Privacy Policy/i, level: 1 }),
    ).toBeDefined();
    expect(screen.getByText(/Contact Information/i)).toBeDefined();
  });

  it("renders Cookie Policy page correctly", async () => {
    const Page = await CookiesPage({
      params: Promise.resolve({ locale: "en" }),
    });
    render(Page);
    expect(
      screen.getByRole("heading", { name: /Cookie Policy/i, level: 1 }),
    ).toBeDefined();
    expect(screen.getByText(/Contact Information/i)).toBeDefined();
  });

  it("renders Legal Notice page correctly", async () => {
    const Page = await LegalPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(
      screen.getByRole("heading", { name: /Legal Notice/i, level: 1 }),
    ).toBeDefined();
    expect(screen.getByText(/Contact Information/i)).toBeDefined();
  });
});
