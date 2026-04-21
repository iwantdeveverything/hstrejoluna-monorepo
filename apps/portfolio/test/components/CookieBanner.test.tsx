import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CookieBanner from '../../components/fragments/CookieBanner';
import { useCookieConsent } from '../../hooks/useCookieConsent';

// Mock the hook
vi.mock('../../hooks/useCookieConsent', () => ({
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
      acceptCookies: vi.fn(),
      rejectCookies: vi.fn(),
      hasConsented: false,
      isGpcActive: false
    });

    const { container } = render(<CookieBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when shouldShowBanner is true, includes correct ARIA attributes', () => {
    mockUseCookieConsent.mockReturnValue({
      shouldShowBanner: true,
      acceptCookies: vi.fn(),
      rejectCookies: vi.fn(),
      hasConsented: false,
      isGpcActive: false
    });

    render(<CookieBanner />);
    
    const banner = screen.getByRole('complementary', { name: /Cookie Consent/i });
    expect(banner).toBeInTheDocument();
  });

  it('calls acceptCookies when the user clicks the Accept button', () => {
    const acceptCookiesMock = vi.fn();
    mockUseCookieConsent.mockReturnValue({
      shouldShowBanner: true,
      acceptCookies: acceptCookiesMock,
      rejectCookies: vi.fn(),
      hasConsented: false,
      isGpcActive: false
    });

    render(<CookieBanner />);
    
    const acceptButton = screen.getByRole('button', { name: /Accept/i });
    fireEvent.click(acceptButton);
    expect(acceptCookiesMock).toHaveBeenCalledTimes(1);
  });
});
