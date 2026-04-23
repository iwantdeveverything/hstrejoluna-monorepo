import createMiddleware from 'next-intl/middleware';
import { routing } from '@hstrejoluna/i18n';

const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;
export { intlMiddleware as proxy };

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_static (inside /public)
    // - all root files inside /public (e.g. /favicon.ico)
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
    // Match all pathnames within locales
    `/(${routing.locales.join('|')})/:path*`
  ]
};
