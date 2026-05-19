'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import axios from 'axios';

import { useTranslations, useLocale } from 'next-intl';
import { ContactForm } from './contact-form';
import { useSettings } from './settings-provider';

export interface BannerItem {
  title: string;
  description: string;
  image: string;
  cta: string;
  link: string;
}

interface HeroProps {
  initialBanners?: BannerItem[];
}

export function Hero({ initialBanners }: HeroProps) {
  const t = useTranslations('Hero');
  const tContact = useTranslations('Contact');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { settings } = useSettings();
  const [current, setCurrent] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<number[]>([0]);
  const whatsappNumber = settings.whatsapp || "908508401505";
  const [banners, setBanners] = useState<BannerItem[]>(() => {
    if (initialBanners && initialBanners.length > 0) {
      return initialBanners;
    }
    return [
      {
        title: t('phone_title'),
        description: t('phone_desc'),
        image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=70&w=1200&auto=format&fit=crop',
        cta: t('cta_phone'),
        link: '/services/phone'
      },
      {
        title: t('laptop_title'),
        description: t('laptop_desc'),
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=70&w=1200&auto=format&fit=crop',
        cta: t('cta_laptop'),
        link: '/services/laptop'
      },
      {
        title: t('robot_title'),
        description: t('robot_desc'),
        image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=70&w=1200&auto=format&fit=crop',
        cta: t('cta_robot'),
        link: '/services/robot'
      }
    ];
  });

  useEffect(() => {
    if (!loadedIndices.includes(current)) {
      setLoadedIndices((prev) => [...prev, current]);
    }
  }, [current, loadedIndices]);

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      return;
    }
    const fetchBanners = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${API_URL}/banners?locale=${locale}`);
        const fetchedBanners = response.data as any[];
        if (fetchedBanners && fetchedBanners.length > 0) {
          setBanners(fetchedBanners);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };
    fetchBanners();
  }, [locale, initialBanners]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (banners.length > 0 ? (prev + 1) % banners.length : 0));
    }, 6000); // 6 Seconds as requested
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (current >= banners.length) {
      setCurrent(0);
    }
  }, [banners.length, current]);

  return (
    <section 
      style={{ overflowAnchor: 'none' }}
      className="relative min-h-screen w-full overflow-hidden bg-background flex flex-col pt-8 lg:justify-center pb-10 lg:pb-16"
    >
      {/* Dynamic Backgrounds */}
      <div className="absolute inset-0 overflow-hidden">
        {banners.map((banner, index) => (
          <motion.div
            key={`bg-${index}`}
            initial={{ opacity: 0, visibility: 'hidden' }}
            animate={{ 
              opacity: index === current ? 1 : 0,
              visibility: index === current ? 'visible' : 'hidden'
            }}
            transition={{ duration: 1.5 }} // Smoother background fade
            className="absolute inset-0 z-0"
            style={{ pointerEvents: index === current ? 'auto' : 'none' }}
          >
            <div className="absolute inset-0 transition-transform duration-[20s] scale-105 group-hover:scale-100">
              {loadedIndices.includes(index) && (
                <Image 
                  src={banner.image}
                  alt="Banner Background"
                  fill
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  className="object-cover"
                  sizes="100vw"
                />
              )}
              {/* Multi-layered gradient for depth */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-background via-background/5 dark:via-background/20 to-transparent",
                isRTL 
                  ? "bg-gradient-to-l from-background via-background/10 dark:via-background/80 to-transparent" 
                  : "bg-gradient-to-r from-background via-background/10 dark:via-background/80 to-transparent"
              )} />
              <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative container mx-auto px-4 w-full flex flex-col lg:flex-row items-center lg:justify-between gap-8 lg:gap-16 z-10">
        {/* Animated Content Section */}
        <div className="w-full lg:flex-1 relative h-[600px] sm:h-[650px] lg:h-[750px] flex items-center">
          {banners.map((banner, index) => (
            <motion.div
              key={`content-${index}`}
              initial={{ opacity: 0, x: isRTL ? 40 : -40, visibility: 'hidden' }}
              animate={{ 
                opacity: index === current ? 1 : 0,
                x: index === current ? 0 : (isRTL ? -40 : 40),
                visibility: index === current ? 'visible' : 'hidden'
              }}
              style={{
                pointerEvents: index === current ? 'auto' : 'none'
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={cn(
                "absolute inset-0 flex flex-col justify-center space-y-4 md:space-y-6 z-10", 
                isRTL ? "text-right lg:border-r-4 border-primary lg:pr-10" : "text-left lg:border-l-4 border-primary lg:pl-10"
              )}
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-lg w-fit">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">{t('badge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight md:leading-[0.85] text-foreground uppercase">
                {(banner?.title || '').split(' ').map((word, i) => (
                  <span key={i} className={cn(i === 1 ? "text-primary italic" : "text-foreground", "inline")}>
                    {word}{' '}
                  </span>
                ))}
              </h1>

              <p className="text-lg md:text-2xl text-muted-foreground font-semibold max-w-xl leading-relaxed">
                {banner?.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Link
                  href={banner?.link || '#'}
                  className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-4 md:px-12 md:py-6 rounded-xl font-black text-base md:text-xl hover:bg-primary/95 transition-all hover:scale-105 shadow-md shadow-primary/20 dark:shadow-xl dark:shadow-primary/30 active:scale-95 group uppercase tracking-widest"
                >
                  <span>{banner?.cta}</span>
                  <ArrowRight className={cn("w-5 h-5 md:w-6 md:h-6 transition-transform", isRTL ? "group-hover:-translate-x-2 rotate-180" : "group-hover:translate-x-2")} />
                </Link>
                
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center gap-3 bg-white/5 backdrop-blur-lg text-foreground px-6 py-4 md:px-12 md:py-6 rounded-xl font-black text-base md:text-xl hover:bg-white/10 transition-all border border-white/10 hover:border-primary/50 uppercase tracking-widest"
                >
                  <span>{t('our_works')}</span>
                </Link>
              </div>

              <div className="hidden lg:flex flex-col sm:flex-row gap-4 sm:gap-8 pt-4 text-foreground/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary shrink-0" size={20} />
                  <span className="font-semibold">{t('trust_since')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary shrink-0" size={20} />
                  <span className="font-semibold">{t('trust_experience')}</span>
                </div>
              </div>

              <div className={cn("hidden lg:flex mt-6 p-4 bg-foreground/5 backdrop-blur-lg rounded-xl border border-foreground/10 items-start gap-3 max-w-xl", isRTL && "text-right")}>
                <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-bold text-foreground/80 leading-relaxed">
                  {tContact('form_note')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Contact Form & Trust Section */}
        <div className="block w-full lg:w-[540px] relative z-20 space-y-6">
          <ContactForm isHeroMini={true} />
          
          {/* Mobile-only Trust Badges & Indicators (Under the form) */}
          <div className="lg:hidden space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-4 text-foreground/90 bg-card/40 backdrop-blur-md p-6 rounded-xl border border-border/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary shrink-0" size={20} />
                <span className="font-semibold">{t('trust_since')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary shrink-0" size={20} />
                <span className="font-semibold">{t('trust_experience')}</span>
              </div>
            </div>

            <div className={cn("p-4 bg-foreground/5 backdrop-blur-lg rounded-xl border border-foreground/10 flex items-start gap-3", isRTL && "text-right")}>
              <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-bold text-foreground/80 leading-relaxed">
                {tContact('form_note')}
              </p>
            </div>

            <div className="flex flex-row items-center justify-center gap-8 py-4">
              <div className="flex items-center gap-4 text-white font-black text-xs tracking-widest uppercase drop-shadow-lg">
                <span className="text-primary bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">0{current + 1}</span>
                <div className="w-8 h-px bg-white/40" />
                <span className="bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">0{banners.length}</span>
              </div>
              
              <div className="flex flex-row gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={cn(
                      "w-8 h-1 rounded-full transition-all duration-500 cursor-pointer",
                      current === index ? "bg-primary w-12" : "bg-white/20"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop-only Absolute Indicators */}
      <div className={cn("hidden lg:flex absolute bottom-8 flex-col gap-4 z-[30]", isRTL ? "left-8" : "right-8")}>
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "h-12 w-1.5 rounded-full transition-all duration-500 cursor-pointer",
              current === index ? "bg-primary h-20" : "bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>

      <div className={cn("hidden lg:flex absolute bottom-8 items-center gap-4 text-white font-black text-sm tracking-widest uppercase z-[30] drop-shadow-lg", isRTL ? "right-8" : "left-8")}>
        <span className="text-primary bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">0{current + 1}</span>
        <div className="w-12 h-px bg-white/40" />
        <span className="bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">0{banners.length}</span>
      </div>
    </section>
  );
}
