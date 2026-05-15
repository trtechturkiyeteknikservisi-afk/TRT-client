import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Manual country detection only for the root path and if no locale cookie is set
  if (pathname === '/') {
    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
    
    if (!localeCookie) {
      const country = (request.headers.get('x-vercel-ip-country') || 
                       request.headers.get('cf-ipcountry') || 
                       '').toUpperCase();

      const arabicCountries = [
        'DZ', 'BH', 'KM', 'DJ', 'EG', 'IQ', 'JO', 'KW', 'LB', 'LY', 
        'MR', 'MA', 'OM', 'PS', 'QA', 'SA', 'SO', 'SD', 'SY', 'TN', 'AE', 'YE'
      ];

      if (arabicCountries.includes(country)) {
        return NextResponse.redirect(new URL('/ar', request.url));
      } else if (country === 'TR') {
        return NextResponse.redirect(new URL('/tr', request.url));
      }
      // If no specific country match, just let intlMiddleware handle it via Accept-Language (Browser preference)
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Matcher for all paths except static files and internal Next.js paths
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};
