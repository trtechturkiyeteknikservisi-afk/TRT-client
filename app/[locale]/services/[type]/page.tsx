'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Link } from '@/i18n/routing';
import { Smartphone, Laptop, Watch, Zap, CheckCircle2, ShieldCheck, Clock, Award, TabletIcon as Tablet } from 'lucide-react';
import { motion } from 'framer-motion';
import { TrustBadges } from "@/components/trust-badges";
import { ContactForm } from "@/components/contact-form";
import axios from 'axios';
import { useTranslations } from 'next-intl';

const serviceAssets: Record<string, any> = {
  phone: {
    icon: Smartphone,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop',
  },
  laptop: {
    icon: Laptop,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=2070&auto=format&fit=crop',
  },
  robot: {
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=2070&auto=format&fit=crop',
  },
  watch: {
    icon: Watch,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070&auto=format&fit=crop',
  },
  tablet: {
    icon: Tablet,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2070&auto=format&fit=crop',
  }
};

export default function ServicePage() {
  const t = useTranslations('ServiceDetails');
  const params = useParams();
  const type = params.type as string;
  const assets = serviceAssets[type] || serviceAssets.phone;

  // Type-safe translation access
  const serviceKey = type as 'phone' | 'laptop' | 'robot' | 'watch' | 'tablet';
  const features = t.raw(`${serviceKey}.features`) as string[];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${assets.image})` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex p-4 bg-primary/20 rounded-2xl mb-6 backdrop-blur-md border border-white/10"
          >
            <assets.icon size={40} className="text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t(`${serviceKey}.title`)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            {t(`${serviceKey}.description`)}
          </motion.p>
        </div>
      </section>

      <TrustBadges />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Details & Features */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-8">{t('features_title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature: string, index: number) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl border border-border"
                    >
                      <CheckCircle2 className="text-primary" size={24} />
                      <span className="font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-card rounded-2xl border">
                  <ShieldCheck size={40} className="mx-auto text-primary mb-4" />
                  <h3 className="font-bold mb-2">{t('guaranteed')}</h3>
                  <p className="text-sm text-muted-foreground">{t('guaranteed_desc')}</p>
                </div>
                <div className="text-center p-6 bg-card rounded-2xl border">
                  <Clock size={40} className="mx-auto text-primary mb-4" />
                  <h3 className="font-bold mb-2">{t('fast_service')}</h3>
                  <p className="text-sm text-muted-foreground">{t('fast_service_desc')}</p>
                </div>
                <div className="text-center p-6 bg-card rounded-2xl border">
                  <Award size={40} className="mx-auto text-primary mb-4" />
                  <h3 className="font-bold mb-2">{t('original_parts')}</h3>
                  <p className="text-sm text-muted-foreground">{t('original_parts_desc')}</p>
                </div>
              </div>
            </div>

            {/* Request Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                 <ContactForm initialServiceType={type} isSidebar={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
