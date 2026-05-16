'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Smartphone, Laptop, Watch, Zap, CheckCircle2, ShieldCheck, Clock, Award, TabletIcon as Tablet, Headphones, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { TrustBadges } from "@/components/trust-badges";
import { ContactForm } from "@/components/contact-form";
import { ServiceBrands } from "@/components/service-brands";
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { AppleHeadphonesIcon, RobotVacuumIcon } from '@/components/social-icons';

const serviceAssets: Record<string, any> = {
  phone: {
    icon: Smartphone,
    image: 'https://images.unsplash.com/photo-1512428559083-a401a3389575?q=80&w=2070&auto=format&fit=crop',
  },
  laptop: {
    icon: Laptop,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2070&auto=format&fit=crop',
  },
  robot: {
    icon: RobotVacuumIcon,
    image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=2070&auto=format&fit=crop',
  },
  watch: {
    icon: Watch,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070&auto=format&fit=crop',
  },
  tablet: {
    icon: Tablet,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2070&auto=format&fit=crop',
  },
  kulaklik: {
    icon: AppleHeadphonesIcon,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop'
  }
};

export default function ServicePage() {
  const t = useTranslations('ServiceDetails');
  const params = useParams() as any;
  const type = params.type as string;
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [supportPhone, setSupportPhone] = useState<string>("0850 840 15 05");
  const assets = serviceAssets[type] || serviceAssets.phone;

  React.useEffect(() => {
    const fetchBanner = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${API_URL}/banners`);
        const fetchedBanners = response.data as any[];
        const match = fetchedBanners.find(b => b.link && b.link.includes(type));
        if (match && match.image) {
          setCustomImage(match.image);
        }
      } catch (error) {
        console.error('Failed to fetch banner for service:', error);
      }
    };
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${API_URL}/settings`);
        const data = res.data as any;
        if (data.support_phone) setSupportPhone(data.support_phone);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchBanner();
    fetchSettings();
  }, [type]);

  // Type-safe translation access
  const validKeys = ['phone', 'laptop', 'robot', 'watch', 'tablet', 'headphones'];
  const serviceKey = (type === 'kulaklik' ? 'headphones' : (validKeys.includes(type) ? type : 'phone')) as 'phone' | 'laptop' | 'robot' | 'watch' | 'tablet' | 'headphones';
  
  let features: string[] = [];
  try {
    const rawFeatures = t.raw(`${serviceKey}.features`);
    features = Array.isArray(rawFeatures) ? rawFeatures : [];
  } catch (e) {
    console.error('Failed to load features:', e);
  }

  return (
    <main className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden pt-8 md:pt-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-105"
          style={{ backgroundImage: `url(${customImage || assets.image})` }}
        >
          <div className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] dark:backdrop-blur-sm transition-colors duration-300" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent dark:from-background dark:via-transparent dark:to-black/20 transition-colors duration-300" />
        </div>
        <div className="relative container mx-auto px-4 text-center dark:text-white text-foreground transition-colors duration-300">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex p-4 bg-primary/20 rounded-xl mb-6 backdrop-blur-md border border-white/10"
          >

            {assets.customIcon ? (
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center">
                <img src={assets.customIcon} alt="" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all scale-110" />
              </div>
            ) : (
              <assets.icon size={80} className="text-red-600" />
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter"
          >
            {t(`${serviceKey}.title`)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium"
          >
            {t(`${serviceKey}.description`)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <a 
              href={`tel:${supportPhone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-black/30 backdrop-blur-xl border border-white/30 rounded-xl hover:bg-black/40 transition-all group shadow-none dark:shadow-2xl dark:shadow-black/20"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                <img src="/calling.webp" alt="Phone" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">{t('contact_us')}</p>
                <p className="text-xl font-black tracking-tight">{supportPhone}</p>
              </div>
            </a>
          </motion.div>
        </div>
      </section>

      <ServiceBrands type={serviceKey} />
      
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

    </main>
  );
}
