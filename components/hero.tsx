'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import axios from 'axios';

import { useTranslations, useLocale } from 'next-intl';

export function Hero() {
  const t = useTranslations('Hero');
  const tContact = useTranslations('Contact');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [current, setCurrent] = useState(0);
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
        if (fetchedBanners && fetchedBanners.length > 0) {
          setBanners(fetchedBanners);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      }
    };
    fetchBanners();
  }, [locale]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section className="relative h-[95vh] w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
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
              "absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent",
              isRTL 
                ? "bg-gradient-to-l from-background via-background/80 to-transparent" 
                : "bg-gradient-to-r from-background via-background/80 to-transparent"
            )} />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className={cn(
              "max-w-4xl space-y-10", 
              isRTL ? "text-right mr-0 ml-auto border-r-4 border-primary pr-8" : "text-left mr-auto ml-0 border-l-4 border-primary pl-8"
            )}>
              <motion.div
                initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">{t('badge')}</span>
              </motion.div>

              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-foreground uppercase"
              >
                {banners[current].title.split(' ').map((word, i) => (
                  <span key={i} className={cn("block", i === 1 ? "text-primary italic" : "text-foreground")}>
                    {word}
                  </span>
                ))}
              </motion.h1>

              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg md:text-2xl text-muted-foreground font-semibold max-w-xl leading-relaxed"
              >
                {banners[current].description}
              </motion.p>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className={cn("flex flex-col sm:flex-row gap-6 pt-4", isRTL && "sm:flex-row-reverse")}
              >
                <Link
                  href={banners[current].link}
                  className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-12 py-6 rounded-2xl font-black text-xl hover:bg-primary/95 transition-all hover:scale-105 shadow-3xl shadow-primary/40 active:scale-95 group uppercase tracking-widest"
                >
                  <span>{banners[current].cta}</span>
                  <ArrowRight size={24} className={cn("transition-transform", isRTL ? "group-hover:-translate-x-2 rotate-180" : "group-hover:translate-x-2")} />
                </Link>
                
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center gap-3 bg-white/5 backdrop-blur-3xl text-foreground px-12 py-6 rounded-2xl font-black text-xl hover:bg-white/10 transition-all border border-white/10 hover:border-primary/50 uppercase tracking-widest"
                >
                  <span>{t('our_works')}</span>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className={cn("flex flex-col sm:flex-row gap-4 sm:gap-8 pt-4 text-white/90", isRTL && "sm:flex-row-reverse")}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary shrink-0" size={20} />
                  <span className="font-semibold">{t('trust_since')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary shrink-0" size={20} />
                  <span className="font-semibold">{t('trust_experience')}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className={cn("mt-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-start gap-3 max-w-xl", isRTL && "flex-row-reverse text-right")}
              >
                <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-bold text-white/80 leading-relaxed">
                  {tContact('form_note')}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

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
