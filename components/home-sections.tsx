'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const NewsBar = dynamic(() => import('@/components/news-bar').then((m) => ({ default: m.NewsBar })), { ssr: false });
const QuickContactBar = dynamic(() => import('@/components/quick-contact-bar').then((m) => ({ default: m.QuickContactBar })), { ssr: false });
const RepairProcess = dynamic(() => import('@/components/repair-process').then((m) => ({ default: m.RepairProcess })), { ssr: false });
const ElegantPhoneBanner = dynamic(() => import('@/components/elegant-phone-banner').then((m) => ({ default: m.ElegantPhoneBanner })), { ssr: false });
const TrustBadges = dynamic(() => import('@/components/trust-badges').then((m) => ({ default: m.TrustBadges })), { ssr: false });
const AnimatedStats = dynamic(() => import('@/components/animated-stats').then((m) => ({ default: m.AnimatedStats })), { ssr: false });
const Services = dynamic(() => import('@/components/services').then((m) => ({ default: m.Services })), { ssr: false });
const Portfolio = dynamic(() => import('@/components/portfolio').then((m) => ({ default: m.Portfolio })), { ssr: false });
const Contact = dynamic(() => import('@/components/contact').then((m) => ({ default: m.Contact })), { ssr: false });
const Reviews = dynamic(() => import('@/components/reviews').then((m) => ({ default: m.Reviews })), { ssr: false });
const FAQ = dynamic(() => import('@/components/faq').then((m) => ({ default: m.FAQ })), { ssr: false });
const LocationMap = dynamic(() => import('@/components/location-map').then((m) => ({ default: m.LocationMap })), { ssr: false });

interface HomeSectionsProps {
  stats: Array<{ label: string; value: string }>;
  trustBadgeLabel: string;
}

export function HomeSections({ stats, trustBadgeLabel }: HomeSectionsProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={sentinelRef}>
      {shouldLoad && (
        <>
          <NewsBar />
          <QuickContactBar />
          <RepairProcess />
          <ElegantPhoneBanner title={trustBadgeLabel} />
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
        </>
      )}
    </div>
  );
}
