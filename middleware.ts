import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old portfolio paths to our-works for SEO and backward compatibility
  const portfolioMatch = pathname.match(/^\/(ar|en|tr)\/portfolio\/?$/);

  if (portfolioMatch) {
    const locale = portfolioMatch[1];

    return NextResponse.redirect(
      new URL(`/${locale}/our-works`, request.url),
      301
    );
  }

  if (pathname === '/portfolio' || pathname === '/portfolio/') {
    return NextResponse.redirect(
      new URL('/our-works', request.url),
      301
    );
  }

  // Manual device language detection only for the root path
  // and only if no locale cookie is set
  if (pathname === '/') {
    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;

    if (!localeCookie) {
      const acceptLang =
        request.headers.get('accept-language')?.toLowerCase() || '';

      const preferredLocales = acceptLang
        .split(',')
        .map((lang) => lang.split(';')[0].trim().substring(0, 2))
        .filter((lang) => ['tr', 'ar', 'en'].includes(lang));

      const detectedLocale = preferredLocales[0] || 'tr';

      return NextResponse.redirect(
        new URL(`/${detectedLocale}`, request.url)
      );
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
