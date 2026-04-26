import { describe, it, expect, vi } from 'vitest';
import middleware from './proxy';
import { locales, defaultLocale } from '@hstrejoluna/i18n';

vi.mock('next-intl/middleware', () => ({
  default: () => {
    return (request: { nextUrl: { pathname: string } }) => {
      const pathname = request.nextUrl.pathname;
      const parts = pathname.split('/').filter(Boolean);
      const locale = parts[0];

      if (locales.includes(locale as typeof locales[number])) {
        return { status: 200, locale };
      }

      return { status: 307, redirectTo: `/${defaultLocale}${pathname}` };
    };
  }
}));

describe('i18n Proxy', () => {
  it('identifies supported locales correctly', () => {
    const mockFn = middleware as unknown as (req: { nextUrl: { pathname: string } }) => { status: number; locale?: string };

    const resultEn = mockFn({ nextUrl: { pathname: '/en/projects' } });
    expect(resultEn.status).toBe(200);
    expect(resultEn.locale).toBe('en');

    const resultEs = mockFn({ nextUrl: { pathname: '/es/legal' } });
    expect(resultEs.status).toBe(200);
    expect(resultEs.locale).toBe('es');
  });

  it('redirects to default locale for unlocalized paths', () => {
    const mockFn = middleware as unknown as (req: { nextUrl: { pathname: string } }) => { status: number; redirectTo?: string };

    const result = mockFn({ nextUrl: { pathname: '/projects' } });
    expect(result.status).toBe(307);
    expect(result.redirectTo).toContain(`/${defaultLocale}`);
  });
});
