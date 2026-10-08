/**
 * TR TECH Multilingual Localized Routes System
 * Maps user-facing SEO localized paths to internal Next.js routes.
 */

export interface RouteMapping {
  internal: string;
  ar: string;
  tr: string;
  en: string;
}

export const ROUTE_MAPPINGS: RouteMapping[] = [
  {
    internal: '/urunler',
    ar: '/المنتجات',
    tr: '/urunler',
    en: '/products'
  },
  {
    internal: '/tamir-fiyatlari',
    ar: '/اسعار-الصيانة',
    tr: '/tamir-fiyatlari',
    en: '/pricing'
  },
  {
    internal: '/about-us',
    ar: '/من-نحن',
    tr: '/hakkimizda',
    en: '/about-us'
  },
  {
    internal: '/services',
    ar: '/خدماتنا',
    tr: '/hizmetler',
    en: '/services'
  },
  {
    internal: '/our-works',
    ar: '/اعمالنا',
    tr: '/projelerimiz',
    en: '/our-works'
  },
  {
    internal: '/blog',
    ar: '/المدونة',
    tr: '/blog',
    en: '/blog'
  },
  {
    internal: '/contact',
    ar: '/اتصل-بنا',
    tr: '/iletisim',
    en: '/contact'
  },
  {
    internal: '/verify',
    ar: '/التحقق',
    tr: '/dogrulama',
    en: '/verify'
  },
  {
    internal: '/policies',
    ar: '/السياسات',
    tr: '/politikalar',
    en: '/policies'
  },
  {
    internal: '/privacy',
    ar: '/سياسة-الخصوصية',
    tr: '/gizlilik-politikasi',
    en: '/privacy'
  },
  {
    internal: '/terms',
    ar: '/الشروط-والاحكام',
    tr: '/kullanim-kosullari',
    en: '/terms'
  }
];

/**
 * Returns the localized URL for a given internal route and locale.
 * Example: getLocalizedUrl('/urunler', 'ar') => '/ar/المنتجات'
 */
export function getLocalizedUrl(route: string, locale: string = 'tr'): string {
  if (!route || route.startsWith('#')) return route || `/${locale}`;
  
  let cleanRoute = route.startsWith('/') ? route : `/${route}`;
  
  // Strip any existing single or duplicated locale prefixes (e.g. /ar, /ar/ar, /tr/urunler)
  cleanRoute = cleanRoute.replace(/^(\/(ar|tr|en))+(\/|$)/, '$3') || '/';
  if (!cleanRoute.startsWith('/')) {
    cleanRoute = `/${cleanRoute}`;
  }

  // Homepage
  if (cleanRoute === '/') {
    return `/${locale}`;
  }
  
  // Exact match
  const found = ROUTE_MAPPINGS.find(m => m.internal === cleanRoute);
  if (found) {
    const locPath = locale === 'ar' ? found.ar : locale === 'en' ? found.en : found.tr;
    return `/${locale}${locPath}`;
  }

  // Check prefix match for nested routes (e.g., /urunler/phone, /services/laptop, /policies/privacy)
  for (const m of ROUTE_MAPPINGS) {
    if (cleanRoute.startsWith(`${m.internal}/`)) {
      const suffix = cleanRoute.slice(m.internal.length);
      const locPath = locale === 'ar' ? m.ar : locale === 'en' ? m.en : m.tr;
      return `/${locale}${locPath}${suffix}`;
    }
  }

  // Fallback to standard locale-prefixed route
  return `/${locale}${cleanRoute}`;
}

/**
 * Resolves an incoming pathname (potentially localized or URL-encoded)
 * to its corresponding internal Next.js route.
 * Returns null if the pathname is already an internal route or not mapped.
 */
export function resolveInternalRoute(pathname: string): { internalPath: string; locale: string } | null {
  if (!pathname || pathname === '/') return null;

  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (e) {}

  // Match locale prefix: /ar, /tr, /en
  const match = decoded.match(/^\/(ar|tr|en)(\/.*)?$/);
  if (!match) return null;

  const locale = match[1] as 'ar' | 'tr' | 'en';
  const subPath = (match[2] || '').replace(/\/+$/, '') || '/';

  if (subPath === '/') return null;

  // Check all mappings
  for (const m of ROUTE_MAPPINGS) {
    const localizedSegment = locale === 'ar' ? m.ar : locale === 'en' ? m.en : m.tr;
    
    // Exact match
    if (subPath === localizedSegment) {
      if (localizedSegment === m.internal) return null; // Already internal path
      return { internalPath: `/${locale}${m.internal}`, locale };
    }

    // Nested match (e.g. /ar/المنتجات/telefon)
    if (subPath.startsWith(`${localizedSegment}/`)) {
      const suffix = subPath.slice(localizedSegment.length);
      if (localizedSegment === m.internal) return null;
      return { internalPath: `/${locale}${m.internal}${suffix}`, locale };
    }

    // Also support cross-language localized links gracefully
    // (e.g. Arabic user visiting /ar/products or /ar/hakkimizda)
    const aliases = [m.ar, m.tr, m.en];
    for (const alias of aliases) {
      if (subPath === alias && alias !== m.internal) {
        return { internalPath: `/${locale}${m.internal}`, locale };
      }
      if (subPath.startsWith(`${alias}/`) && alias !== m.internal) {
        const suffix = subPath.slice(alias.length);
        return { internalPath: `/${locale}${m.internal}${suffix}`, locale };
      }
    }
  }

  return null;
}
