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
    namespace: 'Metadata.Blog',
  });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),

    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        tr: '/tr/blog',
        en: '/en/blog',
        ar: '/ar/blog',
        'x-default': '/tr/blog',
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
