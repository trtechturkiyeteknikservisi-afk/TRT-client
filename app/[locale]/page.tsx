import { Metadata } from "next";
import { Hero } from "@/components/hero";
import { HomeSections } from "@/components/home-sections";
import { getTranslations, setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }, { locale: 'tr' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata.Home' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const t_trust = await getTranslations('Trust');
  const stats = [
    { label: t('stat_customers'), value: locale === 'tr' ? '15B+' : '15K+' },
    { label: t('stat_devices'), value: locale === 'tr' ? '20B+' : '20K+' },
    { label: t('stat_experience'), value: `${new Date().getFullYear() - 2002}+` },
    { label: t('stat_technicians'), value: '15+' },
  ];

  let initialBanners = [];
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${API_URL}/banners?locale=${locale}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1000)
    });
    if (res.ok) {
      initialBanners = await res.json();
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.warn("Could not prefetch banners server-side:", message);
  }

  return (
    <main className="min-h-screen selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-[120vh] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.06),transparent_70%)] pointer-events-none -z-10" />
        <Hero initialBanners={initialBanners} />
      </div>

      <HomeSections stats={stats} trustBadgeLabel={t_trust('badge_label')} />
    </main>
  );
}
