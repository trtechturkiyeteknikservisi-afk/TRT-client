'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useSettings } from './settings-provider';

export function QuickContactBar() {
  const t = useTranslations('Contact');
  const { settings } = useSettings();
  
  const displaySettings = {
    whatsapp: settings.whatsapp || '908508401505',
    support_phone: settings.support_phone || '0850 840 15 05'
  };

  const whatsappLink = `https://wa.me/${displaySettings.whatsapp.replace(/\D/g, '')}`;
  const phoneLink = `tel:${displaySettings.support_phone.replace(/\s/g, '')}`;

  return (
    <div className="w-full bg-background relative z-30 py-6 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Phone Card */}
          <motion.a
            href={phoneLink}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative flex items-center gap-6 bg-card border-2 border-primary/20 p-6 md:p-8 rounded-xl overflow-hidden transition-all duration-500 shadow-xl shadow-primary/5 hover:shadow-primary/20"
          >
            {/* Top active bar - now full by default */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary transition-transform origin-left duration-500" />
            
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white dark:bg-white shadow-lg border border-border/10 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center">
                <img src="/calling-new.webp" alt="Phone" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-1">{t('phone_label')}</span>
              <span className="text-xl md:text-3xl font-black tracking-tighter text-primary">{displaySettings.support_phone}</span>
            </div>
            
            <div className="ml-auto translate-x-0 transition-all duration-500">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <ArrowRight size={20} />
              </div>
            </div>
          </motion.a>

          {/* WhatsApp Card */}
          <motion.a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative flex items-center gap-6 bg-card border-2 border-emerald-500/20 p-6 md:p-8 rounded-xl overflow-hidden transition-all duration-500 shadow-xl shadow-emerald-500/5 hover:shadow-emerald-500/20"
          >
            {/* Top active bar - now full by default */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 transition-transform origin-left duration-500" />
            
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white dark:bg-white shadow-lg border border-border/10 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center">
                <img src="/whatsap.webp" alt="WhatsApp" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
            </div>         
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-1">{t('whatsapp_label')}</span>
              <span className="text-xl md:text-3xl font-black tracking-tighter text-emerald-500">{t('whatsapp_cta')}</span>
            </div>
            
            <div className="ml-auto translate-x-0 transition-all duration-500">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <ArrowRight size={20} />
              </div>
            </div>
          </motion.a>
        </div>
      </div>
    </div>
  );
}
