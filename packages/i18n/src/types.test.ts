import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, isValidLocale, resolveLocale } from './index';

describe('i18n Shared Foundation', () => {
  it('defines the supported locales correctly', () => {
    expect(locales).toContain('en');
    expect(locales).toContain('es');
    expect(locales.length).toBe(2);
  });

  it('sets the correct default locale', () => {
    expect(defaultLocale).toBe('es');
  });

  it('isValidLocale returns true for supported locales', () => {
    expect(isValidLocale('en')).toBe(true);
    expect(isValidLocale('es')).toBe(true);
  });

  it('isValidLocale returns false for unsupported locales', () => {
    expect(isValidLocale('fr')).toBe(false);
    expect(isValidLocale('')).toBe(false);
    expect(isValidLocale('EN')).toBe(false);
  });

  it('resolveLocale returns the locale when supported', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('es')).toBe('es');
  });

  it('resolveLocale falls back to default for unsupported input', () => {
    expect(resolveLocale('fr')).toBe('es');
    expect(resolveLocale(undefined)).toBe('es');
    expect(resolveLocale(null)).toBe('es');
    expect(resolveLocale('')).toBe('es');
  });
});
