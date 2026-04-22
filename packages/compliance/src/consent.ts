import { useState, useEffect } from "react";

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';
export type ConsentState = Record<ConsentCategory, boolean>;

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const CONSENT_STORAGE_KEY = 'consent_preferences';

export function getConsentState(): ConsentState {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;

  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!stored) return DEFAULT_CONSENT;

  try {
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_CONSENT,
      ...parsed,
      necessary: true, // Always force necessary
    };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function saveConsentState(state: Partial<ConsentState>): void {
  if (typeof window === 'undefined') return;

  const current = getConsentState();
  const next: ConsentState = {
    ...current,
    ...state,
    necessary: true, // Always force necessary
  };

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
    ...next,
    timestamp: new Date().toISOString()
  }));
}

export function clearConsentState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_STORAGE_KEY);
}

export function hasStoredConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(CONSENT_STORAGE_KEY);
}

/**
 * Shared hook to manage cookie consent across apps.
 */
export function useCookieConsent(options: { 
  categories: ConsentCategory[] 
} = { categories: ['analytics', 'marketing'] }) {
  const [consentState, setConsentState] = useState<ConsentState | null>(null);
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const [isGpcActive, setIsGpcActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isGpcTruthy = typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;
    const currentState = getConsentState();
    const hasStored = hasStoredConsent();

    if (isGpcTruthy) {
      // Auto-reject if GPC is active and no preference is stored, or if stored preference is allowed
      const needsUpdate = !hasStored || options.categories.some(cat => currentState[cat]);
      if (needsUpdate) {
        const rejectAll: Partial<ConsentState> = {};
        options.categories.forEach(cat => { rejectAll[cat] = false; });
        saveConsentState(rejectAll);
      }
      setIsGpcActive(true);
      setConsentState(getConsentState());
      setShouldShowBanner(false);
      return;
    }

    if (hasStored) {
      setConsentState(getConsentState());
      setShouldShowBanner(false);
    } else {
      setConsentState(getConsentState());
      setShouldShowBanner(true);
    }
  }, [options.categories.join(',')]);

  const acceptAll = () => {
    const allowAll: Partial<ConsentState> = {};
    options.categories.forEach(cat => { allowAll[cat] = true; });
    saveConsentState(allowAll);
    setConsentState(getConsentState());
    setShouldShowBanner(false);
  };

  const rejectAll = () => {
    const denyAll: Partial<ConsentState> = {};
    options.categories.forEach(cat => { denyAll[cat] = false; });
    saveConsentState(denyAll);
    setConsentState(getConsentState());
    setShouldShowBanner(false);
  };

  return {
    consentState,
    shouldShowBanner,
    isGpcActive,
    acceptAll,
    rejectAll,
    acceptCookies: acceptAll,
    rejectCookies: rejectAll,
  };
}
