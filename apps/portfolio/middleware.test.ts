import { describe, it, expect, vi } from 'vitest';
import middleware from './middleware';
import { locales, defaultLocale } from '@hstrejoluna/i18n';

// Mock next-intl/middleware
vi.mock('next-intl/middleware', () => ({
  default: (config: any) => {
    // Return a function that mimics the middleware behavior for testing
    return (request: { nextUrl: { pathname: string } }) => {
      const pathname = request.nextUrl.pathname;
      const parts = pathname.split('/').filter(Boolean);
      const locale = parts[0];

      if (locales.includes(locale as any)) {
        return { status: 200, locale };
      }

      // If no locale, we expect a redirect or default locale injection
      return { status: 307, redirectTo: `/${defaultLocale}${pathname}` };
    };
  }
}));

describe('i18n Middleware', () => {
  it('identifies supported locales correctly', () => {
    const mockRequestEn = { nextUrl: { pathname: '/en/projects' } };
    // @ts-ignore
    const resultEn: any = middleware(mockRequestEn);
    expect(resultEn.status).toBe(200);
    expect(resultEn.locale).toBe('en');

    const mockRequestEs = { nextUrl: { pathname: '/es/legal' } };
    // @ts-ignore
    const resultEs: any = middleware(mockRequestEs);
    expect(resultEs.status).toBe(200);
    expect(resultEs.locale).toBe('es');
  });

  it('redirects to default locale for unlocalized paths', () => {
    const mockRequest = { nextUrl: { pathname: '/projects' } };
    // @ts-ignore
    const result: any = middleware(mockRequest);
    expect(result.status).toBe(307);
    expect(result.redirectTo).toContain(`/${defaultLocale}`);
  });
});
