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
  // Products
  {
    internal: '/urunler',
    ar: '/المنتجات',
    tr: '/urunler',
    en: '/products'
  },
  // Repair Pricing
  {
    internal: '/tamir-fiyatlari',
    ar: '/اسعار-الصيانة',
    tr: '/tamir-fiyatlari',
    en: '/pricing'
  },
  // About Us
  {
    internal: '/about-us',
    ar: '/من-نحن',
    tr: '/hakkimizda',
    en: '/about-us'
  },
  // Specific Services (Must be placed before base /services for exact matching)
  {
    internal: '/services/phone',
    ar: '/خدماتنا/صيانة-الهواتف',
    tr: '/hizmetler/telefon',
    en: '/services/phone'
  },
  {
    internal: '/services/laptop',
    ar: '/خدماتنا/صيانة-اللابتوب',
    tr: '/hizmetler/laptop',
    en: '/services/laptop'
  },
  {
    internal: '/services/robot',
    ar: '/خدماتنا/صيانة-المكانس',
    tr: '/hizmetler/robot-supurge',
    en: '/services/robot-vacuum'
  },
  {
    internal: '/services/watch',
    ar: '/خدماتنا/صيانة-الساعات',
    tr: '/hizmetler/akilli-saat',
    en: '/services/smartwatch'
  },
  {
    internal: '/services/tablet',
    ar: '/خدماتنا/صيانة-التابلت',
    tr: '/hizmetler/tablet',
    en: '/services/tablet'
  },
  {
    internal: '/services/kulaklik',
    ar: '/خدماتنا/صيانة-السماعات',
    tr: '/hizmetler/kulaklik',
    en: '/services/headphones'
  },
  // Base Services route
  {
    internal: '/services',
    ar: '/خدماتنا',
    tr: '/hizmetler',
    en: '/services'
  },
  // Works / Portfolio
  {
    internal: '/our-works',
    ar: '/اعمالنا',
    tr: '/projelerimiz',
    en: '/our-works'
  },
  // Blog
  {
    internal: '/blog',
    ar: '/المدونة',
    tr: '/blog',
    en: '/blog'
  },
  // Contact
  {
    internal: '/contact',
    ar: '/اتصل-بنا',
    tr: '/iletisim',
    en: '/contact'
  },
  // Verify
  {
    internal: '/verify',
    ar: '/التحقق',
    tr: '/dogrulama',
    en: '/verify'
  },
  // Specific Policies (Must be placed before base /policies for exact matching)
  {
    internal: '/policies/kvkk',
    ar: '/السياسات/حماية-البيانات',
    tr: '/politikalar/kvkk',
    en: '/policies/kvkk'
  },
  {
    internal: '/policies/warranty',
    ar: '/السياسات/شروط-الضمان',
    tr: '/politikalar/garanti-kosullari',
    en: '/policies/warranty-terms'
  },
  {
    internal: '/policies/shipping',
    ar: '/السياسات/الشحن-والتوصيل',
    tr: '/politikalar/kargo-ve-teslimat',
    en: '/policies/shipping-delivery'
  },
  {
    internal: '/policies/custom',
    ar: '/السياسات/الوثائق-الرسمية',
    tr: '/politikalar/resmi-belgeler',
    en: '/policies/official-documents'
  },
  // Base Policies route
  {
    internal: '/policies',
    ar: '/السياسات',
    tr: '/politikalar',
    en: '/policies'
  },
  // Privacy
  {
    internal: '/privacy',
    ar: '/سياسة-الخصوصية',
    tr: '/gizlilik-politikasi',
    en: '/privacy'
  },
  {
    internal: '/policies/privacy',
    ar: '/سياسة-الخصوصية',
    tr: '/gizlilik-politikasi',
    en: '/privacy'
  },
  // Terms
  {
    internal: '/terms',
    ar: '/الشروط-والاحكام',
    tr: '/kullanim-kosullari',
    en: '/terms'
  },
  {
    internal: '/policies/terms',
    ar: '/الشروط-والاحكام',
    tr: '/kullanim-kosullari',
    en: '/terms'
  }
];

function findMapping(cleanRoute: string): { mapping: RouteMapping; suffix: string } | null {
  // 1. Exact match on internal, ar, tr, or en
  for (const m of ROUTE_MAPPINGS) {
    if (cleanRoute === m.internal || cleanRoute === m.ar || cleanRoute === m.tr || cleanRoute === m.en) {
      return { mapping: m, suffix: '' };
    }
  }

  // 2. Prefix match on internal, ar, tr, or en (e.g. /services/phone or /hizmetler/phone or /خدماتنا/phone)
  for (const m of ROUTE_MAPPINGS) {
    const segments = [m.internal, m.ar, m.tr, m.en];
    for (const seg of segments) {
      if (cleanRoute.startsWith(`${seg}/`)) {
        return { mapping: m, suffix: cleanRoute.slice(seg.length) };
      }
    }
  }

  return null;
}

/**
 * Returns the localized path WITHOUT the locale prefix.
 * Suitable for next-intl's <Link> component which automatically adds the current locale.
 * Example: getLocalizedPath('/about-us', 'ar') => '/من-نحن' (Link renders: /ar/من-نحن)
 * Example: getLocalizedPath('/about-us', 'tr') => '/hakkimizda' (Link renders: /tr/hakkimizda)
 * Example: getLocalizedPath('/about-us', 'en') => '/about-us' (Link renders: /en/about-us)
 * Example: getLocalizedPath('/', 'ar') => '/' (Link renders: /ar)
 */
export function getLocalizedPath(route: string, locale: string = 'tr'): string {
  if (!route || route.startsWith('#')) return route || '/';
  
  let cleanRoute = route.startsWith('/') ? route : `/${route}`;
  
  // Strip any existing single or duplicated locale prefixes
  cleanRoute = cleanRoute.replace(/^(\/(ar|tr|en))+(\/|$)/, '$3') || '/';
  if (!cleanRoute.startsWith('/')) {
    cleanRoute = `/${cleanRoute}`;
  }

  // Homepage
  if (cleanRoute === '/') {
    return '/';
  }

  const match = findMapping(cleanRoute);
  if (match) {
    const locPath = locale === 'ar' ? match.mapping.ar : locale === 'en' ? match.mapping.en : match.mapping.tr;
    return `${locPath}${match.suffix}`;
  }

  return cleanRoute;
}

/**
 * Returns the localized URL for a given internal route and locale.
 * Example: getLocalizedUrl('/urunler', 'ar') => '/ar/المنتجات'
 * Example: getLocalizedUrl('/urunler', 'tr') => '/tr/urunler'
 * Example: getLocalizedUrl('/urunler', 'en') => '/en/products'
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
  
  const match = findMapping(cleanRoute);
  if (match) {
    const locPath = locale === 'ar' ? match.mapping.ar : locale === 'en' ? match.mapping.en : match.mapping.tr;
    return `/${locale}${locPath}${match.suffix}`;
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
