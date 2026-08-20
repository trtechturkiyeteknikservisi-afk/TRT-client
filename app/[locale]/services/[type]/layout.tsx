import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

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

  const serviceKey = (
    type === 'kulaklik'
      ? 'headphones'
      : validKeys.includes(type)
        ? type
        : 'phone'
  ) as string;

  const t = await getTranslations({
    locale,
    namespace: 'ServiceDetails',
  });

  const serviceTitle = t(`${serviceKey}.title`);
  const serviceDesc = t(`${serviceKey}.description`);

  return {
    title: `${serviceTitle} | TRT Teknik Servis`,
    description: serviceDesc,
    keywords: `${serviceTitle}, ${serviceKey} tamiri, ${serviceKey} repair, TRT teknik servis, Bursa`,

    alternates: {
      canonical: `/${locale}/services/${type}`,
      languages: {
        tr: `/tr/services/${type}`,
        en: `/en/services/${type}`,
        ar: `/ar/services/${type}`,
        'x-default': `/tr/services/${type}`,
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
