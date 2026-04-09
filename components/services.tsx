'use client';

import React from 'react';
import { Smartphone, Laptop, Watch, Zap, ArrowRight, TabletIcon as Tablet } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';

export function Services() {
  const t = useTranslations('Services');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const services = [
    {
      title: t('phone'),
      description: t('phone_desc'),
      icon: Smartphone,
      color: 'bg-blue-500/10 text-blue-600',
      link: '/services/phone'
    },
    {
      title: t('laptop'),
      description: t('laptop_desc'),
      icon: Laptop,
      color: 'bg-purple-500/10 text-purple-600',
      link: '/services/laptop'
    },
    {
      title: t('robot'),
      description: t('robot_desc'),
      icon: Zap,
      color: 'bg-yellow-500/10 text-yellow-600',
      link: '/services/robot'
    },
    {
      title: t('watch'),
      description: t('watch_desc'),
      icon: Watch,
      color: 'bg-red-500/10 text-red-600',
      link: '/services/watch'
    },
    {
      title: t('tablet'),
      description: t('tablet_desc'),
      icon: Tablet,
      color: 'bg-emerald-500/10 text-emerald-600',
      link: '/services/tablet'
    }
  ];

  return (
    <section id="services" className="py-32 bg-background relative overflow-hidden">
      <div className={cn("absolute top-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10", isRTL ? "right-[-10%]" : "left-[-10%]")} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.8] uppercase">
              {t('title').split(' ').map((word, i) => (
                <span key={i} className={cn("block", i === 1 && "text-primary italic")}>{word}</span>
              ))}
            </h2>
            <div className="w-24 h-2 bg-primary mx-auto" />
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-semibold leading-relaxed">
              {t('desc')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-card/50 backdrop-blur-xl p-10 rounded-[3rem] border-2 border-border/50 transition-all hover:border-primary hover:bg-card hover:shadow-[0_40px_80px_-15px_rgba(255,0,0,0.15)] flex flex-col h-full overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -z-10 transition-colors group-hover:bg-primary/10" />
              <div className="inline-flex p-5 rounded-3xl mb-10 w-fit transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground bg-muted text-foreground ring-1 ring-border/50">
                {service.icon && <service.icon size={36} strokeWidth={2.5} />}
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-4 text-foreground tracking-tight uppercase">{service.title}</h3>
              <p className="text-lg text-muted-foreground mb-10 font-semibold leading-relaxed flex-grow">
                {service.description}
              </p>
              <Link
                href={service.link}
                className="inline-flex items-center justify-between w-full p-4 rounded-3xl bg-muted/50 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all font-black uppercase tracking-widest text-xs border border-border/50 group-hover:border-primary"
              >
                <span>{t('view_service') || 'Details'}</span>
                <ArrowRight size={18} className={cn(isRTL && "rotate-180")} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
