'use client';

import React from 'react';
import { ShieldCheck, UserCheck, Search, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

export function TrustBadges() {
  const t = useTranslations('Trust');
  const locale = useLocale();

  const trustItems = [
    { 
      title: t('expert_team'), 
      desc: t('expert_team_desc'), 
      icon: UserCheck 
    },
    { 
      title: t('warranty'), 
      desc: t('warranty_desc'), 
      icon: ShieldCheck 
    },
    { 
      title: t('secure_process'), 
      desc: t('secure_process_desc'), 
      icon: Search 
    },
  ];

  return (
    <section className="py-20 bg-background relative border-y border-border/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
            <div className="flex justify-center mb-16">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-black uppercase tracking-widest">
                     <Zap size={16} /> {t('badge_label')}
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {trustItems.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="group relative flex flex-col items-center text-center p-8 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-primary/10"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-12 transition-all duration-500 ring-4 ring-background shadow-lg">
                            <item.icon size={36} strokeWidth={2} className="text-primary group-hover:text-white" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black mb-4 text-foreground uppercase tracking-tight leading-tight">
                            {item.title}
                        </h3>
                        <p className="text-muted-foreground font-semibold leading-relaxed">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
}
