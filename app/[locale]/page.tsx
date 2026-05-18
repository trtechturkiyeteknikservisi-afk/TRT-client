import dynamic from "next/dynamic";
import { Hero } from "@/components/hero";
import { getTranslations, setRequestLocale } from "next-intl/server";

// Lazy-load all below-fold components to reduce initial bundle size
const NewsBar = dynamic(() => import("@/components/news-bar").then(m => ({ default: m.NewsBar })));
const QuickContactBar = dynamic(() => import("@/components/quick-contact-bar").then(m => ({ default: m.QuickContactBar })));
const RepairProcess = dynamic(() => import("@/components/repair-process").then(m => ({ default: m.RepairProcess })));
const ElegantPhoneBanner = dynamic(() => import("@/components/elegant-phone-banner").then(m => ({ default: m.ElegantPhoneBanner })));
const TrustBadges = dynamic(() => import("@/components/trust-badges").then(m => ({ default: m.TrustBadges })));
const AnimatedStats = dynamic(() => import("@/components/animated-stats").then(m => ({ default: m.AnimatedStats })));
const Services = dynamic(() => import("@/components/services").then(m => ({ default: m.Services })));
const Portfolio = dynamic(() => import("@/components/portfolio").then(m => ({ default: m.Portfolio })));
const Contact = dynamic(() => import("@/components/contact").then(m => ({ default: m.Contact })));
const Reviews = dynamic(() => import("@/components/reviews").then(m => ({ default: m.Reviews })));
const FAQ = dynamic(() => import("@/components/faq").then(m => ({ default: m.FAQ })));
const LocationMap = dynamic(() => import("@/components/location-map").then(m => ({ default: m.LocationMap })));

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }, { locale: 'tr' }];
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const t_trust = await getTranslations('Trust');
  const stats = [
    { label: t('stat_customers'), value: locale === 'tr' ? '15B+' : '15K+' },
    { label: t('stat_devices'), value: locale === 'tr' ? '20B+' : '20K+' },
    { label: t('stat_experience'), value: '22+' },
    { label: t('stat_technicians'), value: '15+' },
  ];

  let initialBanners = [];
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${API_URL}/banners?locale=${locale}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      initialBanners = await res.json();
    }
  } catch (error: any) {
    console.warn("Could not prefetch banners server-side:", error.message);
  }

  return (
    <main className="min-h-screen selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-[120vh] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_70%)] pointer-events-none -z-10" />
        <div className="absolute top-[20vh] left-[-10%] w-[40%] h-[60vh] bg-primary/3 blur-[80px] rounded-full -z-10 animate-pulse" />
        <div className="absolute top-[40vh] right-[-10%] w-[40%] h-[60vh] bg-primary/3 blur-[80px] rounded-full -z-10 animate-pulse delay-700" />
        <Hero initialBanners={initialBanners} />
      </div>

      <NewsBar />
      <QuickContactBar />
      <RepairProcess />
      <ElegantPhoneBanner title={t_trust('badge_label')} />
      <TrustBadges />
      <AnimatedStats stats={stats} />
      <ElegantPhoneBanner />

      <Services />
      <div className="bg-muted/30">
        <Portfolio />
      </div>
      <Contact />
      <Reviews />
      <FAQ />
      <LocationMap />
    </main>
  );
}
