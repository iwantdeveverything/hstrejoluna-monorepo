/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCookieConsent } from '@hstrejoluna/compliance';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useCookieConsent Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();

    // Reset GPC mock
    Object.defineProperty(navigator, 'globalPrivacyControl', {
      value: undefined,
      configurable: true,
    });
  });

  it('initializes with no consent and no GPC', () => {
    const { result } = renderHook(() => useCookieConsent());
    
    expect(result.current.consentState).not.toBeNull();
    expect(result.current.isGpcActive).toBe(false);
    expect(result.current.shouldShowBanner).toBe(true);
  });

  it('respects Global Privacy Control when truthy', () => {
    Object.defineProperty(navigator, 'globalPrivacyControl', {
      value: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.isGpcActive).toBe(true);
    expect(result.current.shouldShowBanner).toBe(false);
    // Auto-reject occurs
    const stored = localStorage.getItem('consent_preferences');
    expect(stored).toContain('"analytics":false');
  });

  it('persists explicit consent to localStorage and hides banner', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.acceptCookies();
    });

    expect(result.current.consentState?.analytics).toBe(true);
    expect(result.current.shouldShowBanner).toBe(false);

    const stored = localStorage.getItem('consent_preferences');
    expect(stored).toContain('"analytics":true');
  });
});
