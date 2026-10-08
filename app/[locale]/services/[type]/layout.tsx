import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getLocalizedUrl } from '@/lib/localized-routes';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; locale: string }>;
}): Promise<Metadata> {
  const { type, locale } = await params;

  const validKeys = [
    'phone',
    'laptop',
    'robot',
    'watch',
    'tablet',
    'headphones',
  ];

  let dynamicTitle: string | null = null;
  let dynamicDesc: string | null = null;

  // 1. Fetch dynamic service data from API if available
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${API_URL}/content/services/${encodeURIComponent(type)}?locale=${locale}`, {
      next: { revalidate: 60 }
    });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        dynamicTitle = data.title || (locale === 'ar' ? data.title_ar : locale === 'en' ? data.title_en : data.title_tr) || null;
        dynamicDesc = data.description || (locale === 'ar' ? data.description_ar : locale === 'en' ? data.description_en : data.description_tr) || null;
      }
    }
  } catch (err) {
    // API not reachable during static build or server offline
  }

  // 2. Resolve final title and description
  let serviceTitle = dynamicTitle;
  let serviceDesc = dynamicDesc;

  const isBuiltIn = validKeys.includes(type) || type === 'kulaklik';
  const serviceKey = type === 'kulaklik' ? 'headphones' : type;

  if (!serviceTitle || !serviceDesc) {
    try {
      const t = await getTranslations({
        locale,
        namespace: 'ServiceDetails',
      });
      if (isBuiltIn) {
        if (!serviceTitle) serviceTitle = t(`${serviceKey}.title`);
        if (!serviceDesc) serviceDesc = t(`${serviceKey}.description`);
      }
    } catch (e) {
      // translation load fallback
    }
  }

  // Fallback for custom added services without translation entry
  if (!serviceTitle) {
    const formattedSlug = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    serviceTitle = formattedSlug;
  }
  if (!serviceDesc) {
    serviceDesc = `${serviceTitle} Profesyonel Tamir ve Teknik Servis Hizmetleri`;
  }

  const internalRoute = `/services/${type}`;
  const canonicalUrl = getLocalizedUrl(internalRoute, locale);
  const trUrl = getLocalizedUrl(internalRoute, 'tr');
  const enUrl = getLocalizedUrl(internalRoute, 'en');
  const arUrl = getLocalizedUrl(internalRoute, 'ar');

  return {
    title: `${serviceTitle} | TRT Teknik Servis`,
    description: serviceDesc,
    keywords: `${serviceTitle}, ${type} tamiri, ${type} repair, TRT teknik servis, Bursa`,

    alternates: {
      canonical: canonicalUrl,
      languages: {
        tr: trUrl,
        en: enUrl,
        ar: arUrl,
        'x-default': trUrl,
      },
    },
  };
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
