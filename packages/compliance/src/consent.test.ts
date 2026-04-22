/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getConsentState, saveConsentState, DEFAULT_CONSENT } from './consent';

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

describe('Consent Logic (Shared Compliance Package)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('provides the correct DEFAULT_CONSENT with necessary=true and others=false', () => {
    expect(DEFAULT_CONSENT).toEqual({
      necessary: true,
      analytics: false,
      marketing: false
    });
  });

  it('returns default consent when localStorage is empty', () => {
    const state = getConsentState();
    expect(state).toEqual(DEFAULT_CONSENT);
  });

  it('persists and retrieves consent state from localStorage', () => {
    const newState = { necessary: true, analytics: true, marketing: true };
    saveConsentState(newState);
    
    const retrieved = getConsentState();
    expect(retrieved).toMatchObject(newState);
    expect(retrieved).toHaveProperty('timestamp');
    
    const stored = localStorage.getItem('consent_preferences');
    expect(stored).toContain('"analytics":true');
    expect(stored).toContain('"marketing":true');
  });

  it('merges default values with partial stored state to handle schema evolution', () => {
    // Only analytics stored
    localStorage.setItem('consent_preferences', JSON.stringify({ analytics: true }));
    
    const state = getConsentState();
    expect(state.necessary).toBe(true); // From defaults
    expect(state.analytics).toBe(true); // From store
    expect(state.marketing).toBe(false); // From defaults
  });
});
