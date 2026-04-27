import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CookieBanner from "../../components/fragments/CookieBanner";
import { useCookieConsent } from "@hstrejoluna/compliance";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

// Mock next-intl navigation
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock the hook
vi.mock("@hstrejoluna/compliance", () => ({
  useCookieConsent: vi.fn(),
}));

const mockUseCookieConsent = vi.mocked(useCookieConsent);

describe("CookieBanner Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render if shouldShowBanner is false", () => {
    mockUseCookieConsent.mockReturnValue({
      shouldShowBanner: false,
      acceptCookies: vi.fn(),
      rejectCookies: vi.fn(),
      acceptAll: vi.fn(),
      rejectAll: vi.fn(),
      consentState: { necessary: true, analytics: false, marketing: false },
      isGpcActive: false,
    });

    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CookieBanner />
      </NextIntlClientProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders correctly when shouldShowBanner is true, includes correct ARIA attributes", () => {
    mockUseCookieConsent.mockReturnValue({
      shouldShowBanner: true,
      acceptCookies: vi.fn(),
      rejectCookies: vi.fn(),
      acceptAll: vi.fn(),
      rejectAll: vi.fn(),
      consentState: { necessary: true, analytics: false, marketing: false },
      isGpcActive: false,
    });

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CookieBanner />
      </NextIntlClientProvider>,
    );

    const banner = screen.getByRole("complementary", {
      name: /Cookie Consent/i,
    });
    expect(banner).toBeInTheDocument();
  });

  it("calls acceptCookies when the user clicks the Accept button", () => {
    const acceptCookiesMock = vi.fn();
    mockUseCookieConsent.mockReturnValue({
      shouldShowBanner: true,
      acceptCookies: acceptCookiesMock,
      rejectCookies: vi.fn(),
      acceptAll: vi.fn(),
      rejectAll: vi.fn(),
      consentState: { necessary: true, analytics: false, marketing: false },
      isGpcActive: false,
    });

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CookieBanner />
      </NextIntlClientProvider>,
    );

    const acceptButton = screen.getByRole("button", { name: /Accept/i });
    fireEvent.click(acceptButton);
    expect(acceptCookiesMock).toHaveBeenCalledTimes(1);
  });
});
