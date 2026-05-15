import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { Portfolio } from "@/components/portfolio";
import { Contact } from "@/components/contact";
import { Reviews } from "@/components/reviews";
import { FAQ } from "@/components/faq";
import { AnimatedStats } from "@/components/animated-stats";
import { TrustBadges } from "@/components/trust-badges";
import { RepairProcess } from "@/components/repair-process";
import { QuickContactBar } from "@/components/quick-contact-bar";
import { ElegantPhoneBanner } from "@/components/elegant-phone-banner";
import { LocationMap } from "@/components/location-map";
import { NewsBar } from "@/components/news-bar";
import { getTranslations, setRequestLocale } from "next-intl/server";

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

  return (
    <main className="min-h-screen selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-[120vh] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_70%)] pointer-events-none -z-10" />
        <div className="absolute top-[20vh] left-[-10%] w-[40%] h-[60vh] bg-primary/3 blur-[80px] rounded-full -z-10 animate-pulse" />
        <div className="absolute top-[40vh] right-[-10%] w-[40%] h-[60vh] bg-primary/3 blur-[80px] rounded-full -z-10 animate-pulse delay-700" />
        <Hero />
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
