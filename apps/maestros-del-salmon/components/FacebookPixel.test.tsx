/** @vitest-environment jsdom */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FacebookPixel } from './FacebookPixel';
import { useCookieConsent } from '@hstrejoluna/compliance';

// Mock the hook
vi.mock('@hstrejoluna/compliance', () => ({
  useCookieConsent: vi.fn(),
  getConsentState: vi.fn(),
  saveConsentState: vi.fn()
}));

// Mock the fpixel lib
vi.mock('../lib/fpixel', () => ({
  fbPixelId: '123456789'
}));

const mockUseCookieConsent = vi.mocked(useCookieConsent);

describe('FacebookPixel (Consent Gate)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing (null) if marketing consent is not granted', () => {
    mockUseCookieConsent.mockReturnValue({
      consentState: { necessary: true, analytics: false, marketing: false },
      shouldShowBanner: false,
      acceptAll: vi.fn(),
      rejectAll: vi.fn()
    } as any);

    const { container } = render(<FacebookPixel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the pixel scripts if marketing consent is granted', () => {
    mockUseCookieConsent.mockReturnValue({
      consentState: { necessary: true, analytics: true, marketing: true },
      shouldShowBanner: false,
      acceptAll: vi.fn(),
      rejectAll: vi.fn()
    } as any);

    const { container } = render(<FacebookPixel />);
    
    // In JSDOM, Next.js Scripts might not be fully executed but the element should exist in the tree
    // if the component doesn't return null.
    expect(container.firstChild).not.toBeNull();
  });
});
