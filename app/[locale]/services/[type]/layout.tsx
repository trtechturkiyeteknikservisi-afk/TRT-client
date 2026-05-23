import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ type: string, locale: string }> }): Promise<Metadata> {
  const { type, locale } = await params;
  const validKeys = ['phone', 'laptop', 'robot', 'watch', 'tablet', 'headphones'];
  const serviceKey = (type === 'kulaklik' ? 'headphones' : (validKeys.includes(type) ? type : 'phone')) as string;
  
  const t = await getTranslations({ locale, namespace: 'ServiceDetails' });
  
  return {
    title: `${t(`${serviceKey}.title`)} | TRT`,
    description: t(`${serviceKey}.description`),
    keywords: `${serviceKey} repair, ${t(`${serviceKey}.title`)}, TRT services`,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
