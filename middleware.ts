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
    return NextResponse.redirect(new URL(`/${locale}/our-works`, request.url), 301);
  }
  if (pathname === '/portfolio' || pathname === '/portfolio/') {
    return NextResponse.redirect(new URL(`/our-works`, request.url), 301);
  }

  // Manual device language detection only for the root path and if no locale cookie is set
  if (pathname === '/') {
    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
    
    if (!localeCookie) {
      const acceptLang = request.headers.get('accept-language')?.toLowerCase() || '';
      
      // Parse Accept-Language header in order of preference (e.g. "en-US,en;q=0.9,ar;q=0.8,tr;q=0.7")
      // Extract the 2-letter language codes and filter for our supported locales: tr, ar, en
      const preferredLocales = acceptLang
        .split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2))
        .filter(lang => ['tr', 'ar', 'en'].includes(lang));

      const detectedLocale = preferredLocales[0] || 'tr'; // Fallback to Turkish 'tr'
      return NextResponse.redirect(new URL(`/${detectedLocale}`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Matcher for all paths except static files and internal Next.js paths
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};
