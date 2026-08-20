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
    namespace: 'Metadata.AboutUs',
  });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),

    alternates: {
      canonical: `/${locale}/about-us`,
      languages: {
        tr: '/tr/about-us',
        en: '/en/about-us',
        ar: '/ar/about-us',
        'x-default': '/tr/about-us',
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
