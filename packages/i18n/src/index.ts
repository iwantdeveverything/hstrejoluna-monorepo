import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

/**
 * Type guard to verify if a string is a valid supported locale.
 */
export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

export type Dictionary = typeof import('./locales/en.json');

/**
 * Factory for next-intl request configuration.
 * Loads the appropriate JSON dictionary from the shared package.
 */
export async function getI18nConfig(locale: string) {
  const safeLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;

  try {
    // Use a static-analysis-friendly dynamic import
    // The path must be relative to this file in the bundle
    const messages = (await import(`./locales/${safeLocale}.json`)).default;

    return {
      locale: safeLocale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error);
    // Fallback to defaultLocale if the requested (but valid) locale failed to load
    const fallbackMessages = (await import(`./locales/${defaultLocale}.json`)).default;
    return {
      locale: defaultLocale,
      messages: fallbackMessages
    };
  }
}


