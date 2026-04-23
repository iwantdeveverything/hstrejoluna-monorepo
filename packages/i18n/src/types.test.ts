import { describe, it, expect } from 'vitest';
import { locales, defaultLocale } from './index';

describe('i18n Shared Foundation', () => {
  it('defines the supported locales correctly', () => {
    expect(locales).toContain('en');
    expect(locales).toContain('es');
    expect(locales.length).toBe(2);
  });

  it('sets the correct default locale', () => {
    expect(defaultLocale).toBe('en');
  });
});
