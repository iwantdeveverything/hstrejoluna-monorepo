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

export function resolveLocale(locale: unknown): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export async function getI18nConfig(locale: string) {
  const safeLocale = resolveLocale(locale);

  try {
    const messages = (await import(`./locales/${safeLocale}.json`)).default;

    return {
      locale: safeLocale,
      messages
    };
  } catch {
    const fallbackMessages = (await import(`./locales/${defaultLocale}.json`)).default;
    return {
      locale: defaultLocale,
      messages: fallbackMessages
    };
  }
}
