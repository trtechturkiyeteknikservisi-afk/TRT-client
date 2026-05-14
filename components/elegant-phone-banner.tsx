'use client';

import React, { useState, useEffect } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useSettings } from './settings-provider';

interface ElegantPhoneBannerProps {
  title?: string;
}

export function ElegantPhoneBanner({ title }: ElegantPhoneBannerProps) {
  const t = useTranslations('Contact');
  const { settings } = useSettings();
  const phone = settings.support_phone || '0850 840 15 05';

  return (
    <div className="relative w-full py-6 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-[1.5rem] bg-gradient-to-r from-primary/5 via-primary/2 to-transparent border border-primary/10 backdrop-blur-sm group"
        >
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Phone size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                {title || t('phone_label')}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">
              {phone}
            </h2>
          </div>

          <a 
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all group/btn"
          >
            {t('contact_us')}
            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
