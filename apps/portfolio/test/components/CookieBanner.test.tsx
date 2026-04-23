import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CookieBanner from '../../components/fragments/CookieBanner';
import { useCookieConsent } from '@hstrejoluna/compliance';

// Mock the hook
vi.mock('@hstrejoluna/compliance', () => ({
  useCookieConsent: vi.fn()
}));

const mockUseCookieConsent = vi.mocked(useCookieConsent);

describe('CookieBanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render if shouldShowBanner is false', () => {
    mockUseCookieConsent.mockReturnValue({
      shouldShowBanner: false,
      acceptAll: vi.fn(),
      rejectAll: vi.fn(),
      consentState: { necessary: true, analytics: false, marketing: false },
      isGpcActive: false
    } as any);

    const { container } = render(<CookieBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when shouldShowBanner is true, includes correct ARIA attributes', () => {
    mockUseCookieConsent.mockReturnValue({
      shouldShowBanner: true,
      acceptAll: vi.fn(),
      rejectAll: vi.fn(),
      consentState: { necessary: true, analytics: false, marketing: false },
      isGpcActive: false
    } as any);

    render(<CookieBanner />);
    
    const banner = screen.getByRole('complementary', { name: /common\.cookie_banner\.title/i });
    expect(banner).toBeInTheDocument();
  });

  it('calls acceptAll when the user clicks the Accept button', () => {
    const acceptAllMock = vi.fn();
    mockUseCookieConsent.mockReturnValue({
      shouldShowBanner: true,
      acceptAll: acceptAllMock,
      rejectAll: vi.fn(),
      consentState: { necessary: true, analytics: false, marketing: false },
      isGpcActive: false
    } as any);

    render(<CookieBanner />);
    
    const acceptButton = screen.getByRole('button', { name: /common\.cookie_banner\.accept/i });
    fireEvent.click(acceptButton);
    expect(acceptAllMock).toHaveBeenCalledTimes(1);
  });
});
