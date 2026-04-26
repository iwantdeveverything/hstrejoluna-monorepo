import createMiddleware from 'next-intl/middleware';
import { routing } from '@hstrejoluna/i18n';

const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;
export { intlMiddleware as proxy };

export const config = {
  matcher: [
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)'
  ]
};
