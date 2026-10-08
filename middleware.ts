import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { resolveInternalRoute, ROUTE_MAPPINGS } from './lib/localized-routes';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Detect and fix duplicated locale prefixes (e.g. /ar/ar, /ar/ar/, /ar/ar/services, /tr/tr/...)
  // Immediately redirect 301 to the cleaned single-locale URL to prevent 404s and fix SEO
  const duplicateLocaleMatch = pathname.match(/^\/(ar|tr|en)(?:\/(?:ar|tr|en))+(\/.*)?$/);
  if (duplicateLocaleMatch) {
    const locale = duplicateLocaleMatch[1];
    const rest = duplicateLocaleMatch[2] || '';
    const cleanUrl = new URL(`/${locale}${rest}`, request.url);
    cleanUrl.search = request.nextUrl.search;
    return NextResponse.redirect(cleanUrl, 301);
  }

  // 1. Redirect root-level localized Arabic/Turkish/English paths to their locale prefix for perfect SEO
  let decodedPath = pathname;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (e) {}

  // If path doesn't start with /ar, /tr, /en, check if it matches a localized slug
  if (!pathname.match(/^\/(ar|tr|en)(\/|$)/)) {
    const cleanNoSlash = decodedPath.replace(/\/+$/, '') || '/';
    for (const m of ROUTE_MAPPINGS) {
      if (cleanNoSlash === m.ar) {
        return NextResponse.redirect(new URL(`/ar${m.ar}`, request.url), 301);
      }
      if (cleanNoSlash === m.tr && m.tr !== m.internal) {
        return NextResponse.redirect(new URL(`/tr${m.tr}`, request.url), 301);
      }
      if (cleanNoSlash === m.en && m.en !== m.internal) {
        return NextResponse.redirect(new URL(`/en${m.en}`, request.url), 301);
      }
    }
  }

  // 2. Check if the incoming request has a localized path (e.g. /ar/المنتجات, /tr/hakkimizda, /en/products)
  // and rewrite it internally to the corresponding Next.js page
  const resolved = resolveInternalRoute(pathname);
  if (resolved) {
    const url = request.nextUrl.clone();
    url.pathname = resolved.internalPath;
    return NextResponse.rewrite(url);
  }

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
