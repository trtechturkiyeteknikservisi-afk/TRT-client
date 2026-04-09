'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { ContactForm } from './contact-form';

export function Contact() {
  const t = useTranslations('Contact');
  const [settings, setSettings] = useState({
    whatsapp: '905302094094',
    support_phone: '+90 530 209 40 94',
    support_email: 'elektroteknikticaret@hotmail.com'
  });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${API_URL}/settings`);
        if (res.data) {
          const data = res.data as any;
          setSettings({
            whatsapp: data.whatsapp || '905302094094',
            support_phone: data.support_phone || '+90 530 209 40 94',
            support_email: data.support_email || 'elektroteknikticaret@hotmail.com'
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings for contact component", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section id="contact" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Contact Information & Title Section */}
          <div className="w-full lg:w-[45%] space-y-16">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { 
                  icon: Phone, 
                  label: t('phone_label'), 
                  value: settings.support_phone, 
                  color: 'primary',
                  link: `tel:${settings.support_phone}`,
                  ltr: true
                },
                { 
                  icon: MessageCircle, 
                  label: t('whatsapp_label'), 
                  value: t('whatsapp_cta'), 
                  color: 'green-500',
                  link: `https://wa.me/${settings.whatsapp}`,
                  isWa: true
                },
                { 
                  icon: Mail, 
                  label: t('email_label'), 
                  value: settings.support_email, 
                  color: 'indigo-500',
                  link: `mailto:${settings.support_email}`,
                  isEmail: true
                },
                { 
                  icon: MapPin, 
                  label: t('location_label'), 
                  value: t('location_value'), 
                  color: 'orange-500',
                  link: '#' 
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative p-6 rounded-[2rem] bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
                >
                  <div className={cn(
                    "p-3 rounded-2xl w-fit transition-all duration-500 group-hover:scale-110 shadow-lg",
                    item.isWa ? "bg-green-500 text-white shadow-green-500/20" : "bg-primary text-primary-foreground shadow-primary/20"
                  )}>
                    <item.icon size={24} strokeWidth={2.5} />
                  </div>
                  
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </p>
                    {item.link !== '#' ? (
                      <a 
                        href={item.link} 
                        className="text-base font-black group-hover:text-primary transition-colors block cursor-pointer"
                        dir={item.ltr ? "ltr" : "auto"}
                        target={item.isWa ? "_blank" : "_self"}
                        rel={item.isWa ? "noopener noreferrer" : ""}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-base font-black">{item.value}</p>
                    )}
                  </div>
                  
                  {/* Subtle design element */}
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/5 rounded-full group-hover:scale-[3] transition-transform duration-700 -z-10" />
                </motion.div>
              ))}
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
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl -z-10 animate-bounce-slow" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
