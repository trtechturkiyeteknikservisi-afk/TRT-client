import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: 'Metadata.Portfolio',
  });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),

    alternates: {
      canonical: `/${locale}/our-works`,
      languages: {
        tr: '/tr/our-works',
        en: '/en/our-works',
        ar: '/ar/our-works',
        'x-default': '/tr/our-works',
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
