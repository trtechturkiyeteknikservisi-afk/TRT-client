'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import axios from 'axios';

import { useTranslations, useLocale } from 'next-intl';
import { ContactForm } from './contact-form';

export function Hero() {
  const t = useTranslations('Hero');
  const tContact = useTranslations('Contact');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [current, setCurrent] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState("908508401505");
  const [banners, setBanners] = useState([
    {
      title: t('phone_title'),
      description: t('phone_desc'),
      image: 'https://images.unsplash.com/photo-1512428559083-a401a3389575?q=80&w=2070&auto=format&fit=crop',
      cta: t('cta_phone'),
      link: '/services/phone'
    },
    {
      title: t('laptop_title'),
      description: t('laptop_desc'),
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2070&auto=format&fit=crop',
      cta: t('cta_laptop'),
      link: '/services/laptop'
    },
    {
      title: t('robot_title'),
      description: t('robot_desc'),
      image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=2070&auto=format&fit=crop',
      cta: t('cta_robot'),
      link: '/services/robot'
    }
  ]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${API_URL}/banners?locale=${locale}`);
        const fetchedBanners = response.data as any[];
        console.log('Fetched banners:', fetchedBanners);
        if (fetchedBanners && fetchedBanners.length > 0) {
          setBanners(fetchedBanners);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };
    fetchBanners();

    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${API_URL}/settings`);
        const data = res.data as any;
        if (data && data.whatsapp) setWhatsappNumber(data.whatsapp);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, [locale]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (banners.length > 0 ? (prev + 1) % banners.length : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (current >= banners.length) {
      setCurrent(0);
    }
  }, [banners.length, current]);

  return (
    <section className="relative min-h-screen lg:h-[110vh] w-full overflow-hidden bg-background">
      {/* Dynamic Backgrounds */}
      <AnimatePresence mode="wait">
        {banners[current] && (
          <motion.div
            key={`bg-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] scale-105 group-hover:scale-100"
              style={{ backgroundImage: `url(${banners[current].image})` }}
            >
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
        )}
      </AnimatePresence>

      <div className="relative container mx-auto px-4 h-full flex flex-col lg:flex-row items-center lg:justify-between gap-16 lg:gap-24 pt-32 lg:pt-0">
        {/* Animated Content Section */}
        <div className="w-full lg:flex-1 relative h-full flex items-center">
          <AnimatePresence mode="wait">
            {banners[current] && (
              <motion.div
                key={`content-${current}`}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "w-full space-y-6 md:space-y-10", 
                  isRTL ? "text-right lg:border-r-4 border-primary lg:pr-10" : "text-left lg:border-l-4 border-primary lg:pl-10"
                )}
              >
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">{t('badge')}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.85] text-foreground uppercase">
                  {(banners[current]?.title || '').split(' ').map((word, i) => (
                    <span key={i} className={cn("block", i === 1 ? "text-primary italic" : "text-foreground")}>
                      {word}
                    </span>
                  ))}
                </h1>

                <p className="text-lg md:text-2xl text-muted-foreground font-semibold max-w-xl leading-relaxed">
                  {banners[current]?.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <Link
                    href={banners[current]?.link || '#'}
                    className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-4 md:px-12 md:py-6 rounded-2xl font-black text-base md:text-xl hover:bg-primary/95 transition-all hover:scale-105 shadow-sm shadow-primary/10 dark:shadow-3xl dark:shadow-primary/40 active:scale-95 group uppercase tracking-widest"
                  >
                    <span>{banners[current]?.cta}</span>
                    <ArrowRight className={cn("w-5 h-5 md:w-6 md:h-6 transition-transform", isRTL ? "group-hover:-translate-x-2 rotate-180" : "group-hover:translate-x-2")} />
                  </Link>
                  
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center justify-center gap-3 bg-white/5 backdrop-blur-3xl text-foreground px-6 py-4 md:px-12 md:py-6 rounded-2xl font-black text-base md:text-xl hover:bg-white/10 transition-all border border-white/10 hover:border-primary/50 uppercase tracking-widest"
                  >
                    <span>{t('our_works')}</span>
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-4 text-foreground/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary shrink-0" size={20} />
                    <span className="font-semibold">{t('trust_since')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary shrink-0" size={20} />
                    <span className="font-semibold">{t('trust_experience')}</span>
                  </div>
                </div>

                <div className={cn("mt-6 p-4 bg-foreground/5 backdrop-blur-md rounded-2xl border border-foreground/10 flex items-start gap-3 max-w-xl", isRTL && "text-right")}>
                  < ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                  <p className="text-sm font-bold text-foreground/80 leading-relaxed">
                    {tContact('form_note')}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Static Hero Mini Contact Form */}
        <div className="block w-full lg:w-[540px] relative z-20 pb-20 lg:pb-0">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-row items-center justify-center gap-4 mb-5 bg-background/40 backdrop-blur-md p-3 rounded-2xl border border-foreground/5 lg:bg-transparent lg:backdrop-blur-none lg:border-none lg:p-0"
          >
            <a 
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <img src="/whats.png" alt="WhatsApp" className="w-6 h-6 object-contain" />
              <span className="text-lg font-black tracking-tighter text-emerald-500" dir="ltr">{whatsappNumber}</span>
            </a>
            
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
            
            <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-white">
                {useTranslations('Trust')('free_kurye')}
              </span>
            </div>
          </motion.div>
          <ContactForm isHeroMini={true} />
        </div>
      </div>

      <div className={cn("absolute bottom-8 flex flex-col gap-4", isRTL ? "left-8" : "right-8")}>
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "h-12 w-1.5 rounded-full transition-all duration-500",
              current === index ? "bg-primary h-20" : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
            )}
          />
        ))}
      </div>

      <div className={cn("absolute bottom-8 flex items-center gap-4 text-muted-foreground font-bold text-sm tracking-widest uppercase", isRTL ? "right-8" : "left-8")}>
        <span className="text-primary">0{current + 1}</span>
        <div className="w-12 h-px bg-muted-foreground/20" />
        <span>0{banners.length}</span>
      </div>
    </section>
  );
}
