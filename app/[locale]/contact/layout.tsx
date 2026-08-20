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
    namespace: 'Metadata.Contact',
  });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),

    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        tr: '/tr/contact',
        en: '/en/contact',
        ar: '/ar/contact',
        'x-default': '/tr/contact',
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
