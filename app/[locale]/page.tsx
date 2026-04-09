import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { Portfolio } from "@/components/portfolio";
import { Contact } from "@/components/contact";
import { Reviews } from "@/components/reviews";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { AnimatedStats } from "@/components/animated-stats";
import { TrustBadges } from "@/components/trust-badges";
import { RepairProcess } from "@/components/repair-process";
import { getTranslations, setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }, { locale: 'tr' }];
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const stats = [
    { label: t('stat_customers'), value: '15K+' },
    { label: t('stat_devices'), value: '20K+' },
    { label: t('stat_experience'), value: '22+' },
    { label: t('stat_technicians'), value: '15+' },
  ];

  return (
    <main className="min-h-screen selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      <Header />
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-[120vh] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_70%)] pointer-events-none -z-10" />
        <div className="absolute top-[20vh] left-[-10%] w-[40%] h-[60vh] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute top-[40vh] right-[-10%] w-[40%] h-[60vh] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse delay-700" />
        <Hero />
      </div>

      <TrustBadges />
      <AnimatedStats stats={stats} />
      <RepairProcess />

      <Services />
      <div className="bg-muted/30">
        <Portfolio />
      </div>
      <Reviews />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
