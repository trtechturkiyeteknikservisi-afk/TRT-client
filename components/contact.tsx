'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { ContactForm } from './contact-form';
import { useSettings } from './settings-provider';

export function Contact() {
  const t = useTranslations('Contact');
  const { settings: globalSettings } = useSettings();
  
  const settings = {
    whatsapp: globalSettings.whatsapp || '908508401505',
    complaints_whatsapp: '905067006677',
    support_phone: globalSettings.support_phone || '0850 840 15 05',
    support_email: globalSettings.support_email || 'trtech@trtservis.com'
  };

  return (
    <section id="contact" className="py-12 md:py-32 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Contact Information & Title Section */}
          <div className="w-full lg:w-[45%] space-y-10 md:space-y-16">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                  <MessageCircle size={14} className="animate-bounce" />
                  <span>{t('title')}</span>
                </div>
                
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-foreground leading-[1] uppercase">
                  {t('title').split(' ').map((word, i) => (
                    <span key={i} className={cn("block", i === 1 && "text-primary italic opacity-90")}>
                      {word}
                    </span>
                  ))}
                </h2>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="w-16 h-1.5 bg-primary rounded-full" />
                <div className="w-4 h-1.5 bg-primary/30 rounded-full" />
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-lg"
              >
                {t('desc')}
              </motion.p>
            </div>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {[
                { 
                  icon: Phone, 
                  label: t('phone_label'), 
                  value: settings.support_phone, 
                  color: 'primary',
                  link: `tel:${settings.support_phone}`,
                  ltr: true,
                  image: '/calling-new.webp'
                },
                { 
                  icon: MessageCircle, 
                  label: t('whatsapp_label'), 
                  value: t('whatsapp_cta'), 
                  color: 'green-500',
                  link: `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`,
                  isWa: true,
                  image: '/whatsap.webp'
                },
                { 
                  icon: MessageCircle, 
                  label: t('whatsapp_complaints'), 
                  value: t('whatsapp_cta'), 
                  color: 'red-500',
                  link: `https://wa.me/905067006677`,
                  isWa: true,
                  isComplaints: true,
                  image: '/whatsap.webp'
                },
                { 
                  icon: Mail, 
                  label: t('email_label'), 
                  value: settings.support_email, 
                  color: 'indigo-500',
                  link: `mailto:${settings.support_email}`,
                  isEmail: true,
                  image: '/maill.webp'
                },
                { 
                  icon: MapPin, 
                  label: t('location_label'), 
                  value: t('location_value'), 
                  color: 'orange-500',
                  link: 'https://maps.app.goo.gl/9kUMHWGGjDsoswFz9',
                  image: '/location.png'
                }
              ].map((item, idx) => {
                const Icon = item.icon;

                // Dynamic colors for ripple & glow
                let ripple1Class = "border-primary/50 dark:border-white/50 bg-primary/10 dark:bg-white/10";
                let ripple2Class = "border-primary/30 dark:border-white/30 bg-primary/5 dark:bg-white/5";
                let glowClass = "bg-primary/20 dark:bg-white/15";

                if (item.color === 'green-500') {
                  ripple1Class = "border-emerald-500/50 bg-emerald-500/10";
                  ripple2Class = "border-emerald-500/30 bg-emerald-500/5";
                  glowClass = "bg-emerald-500/20";
                } else if (item.color === 'red-500') {
                  ripple1Class = "border-red-500/50 bg-red-500/10";
                  ripple2Class = "border-red-500/30 bg-red-500/5";
                  glowClass = "bg-red-500/20";
                } else if (item.color === 'indigo-500') {
                  ripple1Class = "border-indigo-500/50 bg-indigo-500/10";
                  ripple2Class = "border-indigo-500/30 bg-indigo-500/5";
                  glowClass = "bg-indigo-500/20";
                } else if (item.color === 'orange-500') {
                  ripple1Class = "border-orange-500/50 bg-orange-500/10";
                  ripple2Class = "border-orange-500/30 bg-orange-500/5";
                  glowClass = "bg-orange-500/20";
                }

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative p-6 rounded-xl bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-lg hover:shadow-primary/10 overflow-hidden cursor-pointer flex flex-col items-center text-center animate-ripple-container"
                  >
                    <a 
                      href={item.link !== '#' ? item.link : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-20"
                    />
                    <div className="transition-all duration-500 group-hover:scale-110 flex items-center justify-center rounded-full w-16 h-16 bg-white dark:bg-white shadow-lg border border-border/10 p-0.5 shrink-0 relative">
                      {/* Radiating Ripple Wave 1 (CSS Animated Outline + Fill) */}
                      <div className={cn("absolute inset-0 rounded-full border pointer-events-none animate-ripple-1", ripple1Class)} />
                      
                      {/* Radiating Ripple Wave 2 (CSS Animated Outline + Fill) */}
                      <div className={cn("absolute inset-0 rounded-full border pointer-events-none animate-ripple-2", ripple2Class)} />
                      
                      {/* Thick Ambient Glow */}
                      <div className={cn("absolute -inset-2 rounded-full blur-[10px] pointer-events-none animate-breathe", glowClass)} />

                      <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center z-10">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                        ) : (
                          <Icon size={32} strokeWidth={2.5} className="text-gray-800" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-1 w-full">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
                        {item.label}
                      </p>
                      <p className={cn(
                        "text-base font-black group-hover:text-primary transition-colors block",
                        item.ltr && "truncate" // Keep it readable
                      )} dir={item.ltr ? "ltr" : undefined}>
                        {item.value}
                      </p>
                    </div>
                    
                    {/* Subtle design element */}
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/5 rounded-full group-hover:scale-[3] transition-transform duration-700 -z-10" />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-[55%] relative"
          >
            <ContactForm />
            
            {/* Decorative background for form */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-lg -z-10 animate-bounce-slow" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-lg -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
