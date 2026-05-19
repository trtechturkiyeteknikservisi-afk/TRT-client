'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, ShieldCheck, Truck } from 'lucide-react';
import { AddressComponents, AddressSelector } from './address-selector';
import Image from 'next/image';
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
  const idPrefix = React.useId();
  const supportPhone = settings.support_phone || "0850 840 15 05";
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    addressComponents: null as AddressComponents | null,
    message: '',
    serviceType: initialServiceType,
    deviceModel: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkAccepted) return;

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`Contact request failed: ${response.status}`);
      }
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

  const inputClasses = "w-full h-11 px-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:bg-black/10 dark:focus:bg-white/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm text-foreground";
  const textareaClasses = "w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus:bg-black/10 dark:focus:bg-white/10 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm text-foreground resize-none";

  return (
    <div className="relative group">
      <div className={cn(
        "bg-card/90 backdrop-blur-lg p-6 md:p-8 rounded-xl border border-black/10 dark:border-white/10 shadow-md dark:shadow-xl relative",
        isSidebar && "p-6 rounded-lg",
        isHeroMini && "p-5 md:p-7 rounded-lg bg-white/5 dark:bg-background/20"
      )}>
        
        <div className="mb-6 flex flex-col items-start gap-6">
          <div className={cn(
            "space-y-4 w-full",
            isHeroMini ? "text-left" : "text-left"
          )}>
            <div className="flex flex-wrap gap-2 items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest whitespace-nowrap w-fit">
                 <Truck size={12} className="animate-pulse text-white" />
                 <span className='text-white'>{t('cargo_service')}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap w-fit">
                 <Truck size={12} className="animate-pulse text-white" />
                 <span className='text-white'>{tTrust('free_kurye')}</span>
              </div>
            </div>
            
            <h3 className={cn(
              "text-2xl font-black tracking-tight leading-none",
              isHeroMini && "text-xl"
            )}>
              {t('send_message')}
            </h3>
            
            {!isHeroMini && (
              <p className="text-[13px]  text-muted-foreground font-medium max-w-md">
                {t('contact_subtitle')}
              </p>
            )}

            <div className="flex shrink-0 justify-start w-full mt-2">
              <a 
                href={`tel:${supportPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 px-5 py-3 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl transition-all hover:scale-105 group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-white shadow-md border border-border/10 p-0.5 shrink-0 relative">
                  {/* Radiating Ripple Wave 1 (CSS Animated Outline + Fill) */}
                  <div className="absolute inset-0 rounded-full border border-primary/50 dark:border-white/50 bg-primary/10 dark:bg-white/10 pointer-events-none animate-ripple-1" />
                  
                  {/* Radiating Ripple Wave 2 (CSS Animated Outline + Fill) */}
                  <div className="absolute inset-0 rounded-full border border-primary/30 dark:border-white/30 bg-primary/5 dark:bg-white/5 pointer-events-none animate-ripple-2" />
                  
                  {/* Thick Ambient Glow */}
                  <div className="absolute -inset-2 rounded-full bg-primary/20 dark:bg-white/15 blur-[10px] pointer-events-none animate-breathe" />

                  <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center z-10">
                    <Image src="/calling-new.webp" alt="Phone" width={40} height={40} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  </div>
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{t('phone_label')}</span>
                  <span className="text-base font-black tracking-tighter text-primary" dir="ltr">{supportPhone}</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${idPrefix}-name`} className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">{t('full_name')}</label>
              <input
                id={`${idPrefix}-name`}
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClasses}
                placeholder={t('name_placeholder')}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${idPrefix}-phone`} className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">{t('phone_number')}</label>
              <input
                id={`${idPrefix}-phone`}
                type="tel"
                required
                autoComplete="tel"
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
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">
               {t('address')}
            </p>
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
            <label htmlFor={`${idPrefix}-service`} className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">{t('service_type')}</label>
            {isSidebar || isHeroMini ? (
              <input
                  id={`${idPrefix}-service`}
                  type="text"
                  required
                  autoComplete="off"
                  value={formData.deviceModel}
                  onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                  className={inputClasses}
                  placeholder="e.g. iPhone 15 Pro Max..."
              />
            ) : (
              <div className="relative group">
                <select
                    id={`${idPrefix}-service`}
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
            <label htmlFor={`${idPrefix}-message`} className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">{t('your_message')}</label>
            <textarea
              id={`${idPrefix}-message`}
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
            className="group relative w-full h-14 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-primary/10 dark:shadow-xl dark:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer disabled:cursor-not-allowed"
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
        {showSuccessModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <div
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-150"
            />
            <div
              className="relative w-full max-w-sm bg-card p-10 rounded-xl border shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-150"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${idPrefix}-success-title`}
            >
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto">
                  <CheckCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 id={`${idPrefix}-success-title`} className="text-2xl font-black">{t('success_modal_title')}</h3>
                <p className="text-muted-foreground font-bold text-sm">
                  {t('success_modal_desc')}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full h-12 bg-foreground text-background rounded-xl font-black text-[11px] uppercase tracking-widest cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
