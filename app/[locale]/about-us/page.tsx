'use client';

import React from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Award, Users, Target } from 'lucide-react';
import { TrustBadges } from "@/components/trust-badges";

export default function AboutUsPage() {
  const t = useTranslations('AboutUs');

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-primary/5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] -z-10 rounded-full" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 mb-6"
          >
            <Users size={14} />
            <span>{t('title')}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tighter mb-6 uppercase"
          >
            {t('title')} <span className="text-primary italic">TR TECH</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground font-semibold max-w-3xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>
      </section>

      <TrustBadges />

      {/* Content Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">{t('title')}</h2>
              <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed">
                <p>{t('content1')}</p>
                <p>{t('content2')}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="p-6 bg-card border rounded-3xl space-y-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Target size={24} />
                  </div>
                  <h3 className="font-black text-xl">{t('mission_title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('mission_desc')}</p>
                </div>
                <div className="p-6 bg-card border rounded-3xl space-y-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Award size={24} />
                  </div>
                  <h3 className="font-black text-xl">{t('vision_title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('vision_desc')}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full -z-10 group-hover:bg-primary/30 transition-colors" />
              <img 
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop" 
                alt="About TR TECH" 
                className="rounded-[3rem] shadow-2xl border-4 border-background object-cover aspect-square lg:aspect-video"
              />
              <div className="absolute bottom-8 left-8 right-8 p-8 bg-background/80 backdrop-blur-xl rounded-[2rem] border shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black text-2xl">20+</div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-tighter">Years of Experience</h4>
                    <p className="text-sm text-muted-foreground font-bold italic">Excellence in Technical Service</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
