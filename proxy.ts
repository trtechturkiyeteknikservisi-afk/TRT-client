import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = routing.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    // Detect country from headers (common headers provided by Vercel, Cloudflare, etc.)
    const country = (request.headers.get('x-vercel-ip-country') || 
                     request.headers.get('cf-ipcountry') || 
                     'TR').toUpperCase();

    // List of Arabic-speaking countries ISO codes
    const arabicCountries = [
      'DZ', 'BH', 'KM', 'DJ', 'EG', 'IQ', 'JO', 'KW', 'LB', 'LY', 
      'MR', 'MA', 'OM', 'PS', 'QA', 'SA', 'SO', 'SD', 'SY', 'TN', 'AE', 'YE'
    ];

    let locale = 'en'; // Default for non-Arabic, non-Turkish countries
    
    if (arabicCountries.includes(country)) {
      locale = 'ar';
    } else if (country === 'TR') {
      locale = 'tr';
    }

    // Redirect to the detected locale
    const url = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};

