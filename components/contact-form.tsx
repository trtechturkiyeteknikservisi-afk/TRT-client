'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Send, CheckCircle, X, ShieldCheck, Truck, Phone } from 'lucide-react';
import { AddressSelector } from './address-selector';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import { KVKKCheckbox } from './kvkk-checkbox';
import { useSettings } from './settings-provider';

interface ContactFormProps {
  initialServiceType?: string;
  isSidebar?: boolean;
  isHeroMini?: boolean;
}

export function ContactForm({ initialServiceType = 'phone', isSidebar = false, isHeroMini = false }: ContactFormProps) {
  const t = useTranslations('Contact');
  const tTrust = useTranslations('Trust');
  const { settings } = useSettings();
  const supportPhone = settings.support_phone || "0850 840 15 05";
  const whatsappNumber = settings.whatsapp || "908508401505";
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    addressComponents: null as any,
    message: '',
    serviceType: initialServiceType,
    deviceModel: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkAccepted) return;

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.post(`${API_URL}/contacts`, formData);
      setShowSuccessModal(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        city: '',
        address: '',
        addressComponents: null,
        message: '',
        serviceType: initialServiceType,
        deviceModel: ''
      });
      setKvkkAccepted(false);
    } catch (error) {
      console.error('Error submitting form', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return (
    <div className={cn(
      "bg-card/40 backdrop-blur-xl p-6 rounded-3xl border border-black/10 dark:border-white/10 animate-pulse",
      isHeroMini && "p-4"
    )}>
      <div className="h-6 bg-muted rounded w-1/2 mb-4" />
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  );

  const inputClasses = "w-full h-11 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:bg-black/10 dark:focus:bg-white/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm text-foreground";
  const textareaClasses = "w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:bg-black/10 dark:focus:bg-white/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm text-foreground resize-none";

  return (
    <div className="relative group">
      <div className={cn(
        "bg-card/90 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-black/10 dark:border-white/10 shadow-lg dark:shadow-2xl relative",
        isSidebar && "p-6 rounded-2xl",
        isHeroMini && "p-5 md:p-7 rounded-2xl bg-white/5 dark:bg-background/20"
      )}>
        
        <div className="mb-6 flex flex-row items-start justify-between gap-4">
          <div className={cn(
            "space-y-4",
            isHeroMini ? "text-left" : "text-left"
          )}>
            <div className="flex flex-col gap-2 items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest whitespace-nowrap w-fit">
                 <Truck size={12} className="animate-pulse" />
                 <span>{t('cargo_service')}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap w-fit">
                 <Truck size={12} className="animate-pulse" />
                 <span>{tTrust('free_kurye')}</span>
              </div>
            </div>
            
            <h3 className={cn(
              "text-2xl font-black tracking-tight leading-none",
              isHeroMini && "text-xl"
            )}>
              {t('send_message')}
            </h3>
            
            {!isHeroMini && (
              <p className="text-[13px] text-muted-foreground font-medium max-w-md">
                {t('contact_subtitle')}
              </p>
            )}
          </div>
          
          <div className="flex shrink-0 justify-end">
            <a 
              href={`tel:${supportPhone.replace(/\s/g, '')}`}
              className="flex items-center gap-3 px-5 py-3 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-2xl transition-all hover:scale-105 group"
            >
              <div className="p-2 bg-primary text-primary-foreground rounded-lg group-hover:rotate-12 transition-transform">
                <Phone size={18} />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{t('phone_label')}</span>
                <span className="text-base font-black tracking-tighter text-primary" dir="ltr">{supportPhone}</span>
              </div>
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">{t('full_name')}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClasses}
                placeholder={t('name_placeholder')}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">{t('phone_number')}</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClasses}
                placeholder="+90"
                dir="ltr"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">
               {t('address')}
            </label>
            <AddressSelector 
              isHeroMini={isHeroMini}
              onAddressChange={(fullAddress, components) => {
                setFormData(prev => ({ 
                  ...prev, 
                  address: fullAddress,
                  city: components.city,
                  addressComponents: components
                }));
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px) font-black uppercase tracking-widest text-foreground ml-1">{t('service_type')}</label>
            {isSidebar || isHeroMini ? (
              <input
                  type="text"
                  required
                  value={formData.deviceModel}
                  onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                  className={inputClasses}
                  placeholder="e.g. iPhone 15 Pro Max..."
              />
            ) : (
              <div className="relative group">
                <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className={cn(inputClasses, "appearance-none cursor-pointer")}
                >
                    <option value="phone" className="bg-card text-foreground">{t('service_phone')}</option>
                    <option value="laptop" className="bg-card text-foreground">{t('service_laptop')}</option>
                    <option value="tablet" className="bg-card text-foreground">{t('service_tablet')}</option>
                    <option value="robot" className="bg-card text-foreground">{t('service_robot')}</option>
                    <option value="watch" className="bg-card text-foreground">{t('service_watch')}</option>
                    <option value="headphones" className="bg-card text-foreground">{t('service_headphones')}</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">{t('your_message')}</label>
            <textarea
              rows={isHeroMini ? 2 : 3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={textareaClasses}
              placeholder={t('message_placeholder')}
            />
          </div>

          <KVKKCheckbox accepted={kvkkAccepted} onChange={setKvkkAccepted} />

          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <ShieldCheck className="text-primary mt-0.5 shrink-0" size={16} />
            <p className="text-[11px] font-bold text-foreground/60 leading-relaxed">
              {t('form_note')}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !kvkkAccepted}
            className="group relative w-full h-14 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-primary/10 dark:shadow-xl dark:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>{t('sending')}</span>
              </div>
            ) : (
              <>
                <span className="relative z-10">{t('send_message')}</span>
                <Send size={16} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>

        </form>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-card p-10 rounded-3xl border shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto">
                  <CheckCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">{t('success_modal_title')}</h3>
                <p className="text-muted-foreground font-bold text-sm">
                  {t('success_modal_desc')}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full h-12 bg-foreground text-background rounded-xl font-black text-[11px] uppercase tracking-widest"
              >
                {t('close')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
