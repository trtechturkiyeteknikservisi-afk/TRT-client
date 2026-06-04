'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, ShieldCheck, Truck, Mail } from 'lucide-react';
import { AddressComponents, AddressSelector } from './address-selector';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

import { KVKKCheckbox } from './kvkk-checkbox';
import { useSettings } from './settings-provider';

const COUNTRIES = [
  { code: '+90', flag: 'tr', name: 'Turkey / Türkiye', digits: 10, placeholder: '532 123 45 67' },
  { code: '+966', flag: 'sa', name: 'Saudi Arabia / السعودية', digits: 9, placeholder: '50 123 4567' },
  { code: '+971', flag: 'ae', name: 'UAE / الإمارات', digits: 9, placeholder: '50 123 4567' },
  { code: '+20', flag: 'eg', name: 'Egypt / مصر', digits: 10, placeholder: '10 1234 5678' },
  { code: '+962', flag: 'jo', name: 'Jordan / الأردن', digits: 9, placeholder: '7 9123 4567' },
  { code: '+963', flag: 'sy', name: 'Syria / سوريا', digits: 9, placeholder: '93 123 4567' },
  { code: '+964', flag: 'iq', name: 'Iraq / العراق', digits: 10, placeholder: '770 123 4567' },
  { code: '+965', flag: 'kw', name: 'Kuwait / الكويت', digits: 8, placeholder: '5123 4567' },
  { code: '+974', flag: 'qa', name: 'Qatar / قطر', digits: 8, placeholder: '5123 4567' },
  { code: '+973', flag: 'bh', name: 'Bahrain / البحرين', digits: 8, placeholder: '3123 4567' },
  { code: '+968', flag: 'om', name: 'Oman / عُمان', digits: 8, placeholder: '9123 4567' },
  { code: '+961', flag: 'lb', name: 'Lebanon / لبنان', digits: 8, placeholder: '3 123 456' },
];

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
  const whatsappNumber = settings.whatsapp || "908508401505";
  const supportEmail = settings.support_email || "trtech@trtservis.com";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;
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
  const [errors, setErrors] = useState({ phone: '', email: '', general: '' });

  const [localPhone, setLocalPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const validatePhoneLive = (phoneVal: string, country: typeof COUNTRIES[0]) => {
    const stripped = phoneVal.replace(/\D/g, '');
    if (stripped.length === 0) {
      return '';
    }

    if (country.code === '+90') {
      if (!stripped.startsWith('5')) {
        return t('error_phone_turkey_start') || 'Turkish phone number must start with 5.';
      }
      if (stripped.length !== 10) {
        return t('error_phone_turkey_length') || 'Turkish phone number must be exactly 10 digits.';
      }
    } else {
      if (stripped.length !== country.digits) {
        return t('error_phone_country_length', { digits: country.digits }) || `Phone number must be exactly ${country.digits} digits.`;
      }
    }
    return '';
  };

  const handlePhoneChange = (val: string, country: typeof COUNTRIES[0]) => {
    let cleanVal = val.replace(/[^\d\s-]/g, '');

    if (country.code === '+90') {
      const tempDigits = cleanVal.replace(/\D/g, '');
      if (tempDigits.startsWith('0')) {
        cleanVal = cleanVal.replace(/^[0\s-]+/, '');
      }
    }

    const tempDigits = cleanVal.replace(/\D/g, '');
    if (tempDigits.length > country.digits) {
      let digitCount = 0;
      let truncated = '';
      for (let char of cleanVal) {
        if (/\d/.test(char)) {
          if (digitCount < country.digits) {
            truncated += char;
            digitCount++;
          }
        } else {
          truncated += char;
        }
      }
      cleanVal = truncated;
    }

    setLocalPhone(cleanVal);

    const err = validatePhoneLive(cleanVal, country);
    setErrors(prev => ({ ...prev, phone: err, general: '' }));
  };

  const handleCountryChange = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setDropdownOpen(false);

    const err = validatePhoneLive(localPhone, country);
    setErrors(prev => ({ ...prev, phone: err, general: '' }));
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { phone: '', email: '', general: '' };

    const phoneVal = localPhone.trim();
    const emailVal = formData.email.trim();

    if (!phoneVal && !emailVal) {
      newErrors.general = t('error_phone_or_email') || 'Please enter either a phone number or an email address.';
      isValid = false;
    }

    if (phoneVal) {
      const liveErr = validatePhoneLive(phoneVal, selectedCountry);
      if (liveErr) {
        newErrors.phone = liveErr;
        isValid = false;
      }
    }

    if (emailVal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        newErrors.email = t('error_email_invalid') || 'Please enter a valid email address.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkAccepted) return;
    if (!validate()) return;

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const fullPhone = localPhone.trim() ? `${selectedCountry.code} ${localPhone.trim()}` : '';

      const response = await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: fullPhone
        }),
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
      setLocalPhone('');
      setSelectedCountry(COUNTRIES[0]);
      setErrors({ phone: '', email: '', general: '' });
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
              <p className="text-[13px] text-muted-foreground font-medium max-w-md">
                {t('contact_subtitle')}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              {/* Phone Link */}
              <a 
                href={`tel:${supportPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 px-3 py-2 sm:py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl transition-all hover:scale-105 group flex-1 sm:justify-start"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-white shadow-md border border-border/10 p-0.5 shrink-0 relative">
                  {/* Radiating Ripple Wave 1 */}
                  <div className="absolute inset-0 rounded-full border border-primary/50 dark:border-white/50 bg-primary/10 dark:bg-white/10 pointer-events-none animate-ripple-1" />
                  
                  {/* Radiating Ripple Wave 2 */}
                  <div className="absolute inset-0 rounded-full border border-primary/30 dark:border-white/30 bg-primary/5 dark:bg-white/5 pointer-events-none animate-ripple-2" />
                  
                  {/* Thick Ambient Glow */}
                  <div className="absolute -inset-1 rounded-full bg-primary/20 dark:bg-white/15 blur-[5px] pointer-events-none animate-breathe" />

                  <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center z-10">
                    <Image src="/calling-new.webp" alt="Phone" width={28} height={28} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  </div>
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">{t('phone_label')}</span>
                  <span className="text-xs font-black tracking-tighter text-primary" dir="ltr">{supportPhone}</span>
                </div>
              </a>

              {/* Email Link */}
              <a 
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2 px-3 py-2 sm:py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl transition-all hover:scale-105 group flex-1  sm:justify-start"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-white shadow-md border border-border/10 p-0.5 shrink-0 relative">
                  {/* Radiating Ripple Wave 1 */}
                  <div className="absolute inset-0 rounded-full border border-primary/50 bg-primary/10 pointer-events-none animate-ripple-1" />
                  
                  {/* Thick Ambient Glow */}
                  <div className="absolute -inset-1 rounded-full bg-primary/20 dark:bg-white/15 blur-[5px] pointer-events-none animate-breathe" />

                  <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center z-10">
                    <Image src="/maill.webp" alt="Mail" width={28} height={28} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  </div>
                </div>
                <div className="flex flex-col items-start leading-tight min-w-0">
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">Email</span>
                  <span className="text-xs font-black tracking-tighter text-primary truncate max-w-[120px] sm:max-w-none" dir="ltr">{supportEmail}</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Row */}
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

          {/* Phone & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={`${idPrefix}-phone`} className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">
                {t('phone_number')}
              </label>
              <div 
                dir="ltr"
                className={cn(
                  "relative flex items-center h-11 w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 focus-within:bg-black/10 dark:focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-primary/20 outline-none transition-all font-bold text-sm text-foreground overflow-visible",
                  errors.phone && "border-red-500 focus-within:ring-red-500/20"
                )}
              >
                {/* Country Code Dropdown */}
                <div className="relative h-full shrink-0">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 h-full px-3 hover:bg-black/5 dark:hover:bg-white/5 border-r border-black/10 dark:border-white/10 rounded-l-xl transition-colors cursor-pointer"
                  >
                    <img 
                      src={`https://flagcdn.com/w40/${selectedCountry.flag}.png`} 
                      alt="" 
                      className="w-5 h-3.5 object-cover rounded-sm shrink-0 border border-black/10 dark:border-white/10 select-none"
                    />
                    <span className="text-xs font-black select-none" dir="ltr">{selectedCountry.code}</span>
                    <span className="text-[8px] opacity-60 select-none">▼</span>
                  </button>
                  
                  {dropdownOpen && (
                    <>
                      {/* Backdrop to close dropdown on click outside */}
                      <div className="fixed inset-0 z-[100]" onClick={() => setDropdownOpen(false)} />
                      {/* Dropdown menu */}
                      <div className="absolute left-0 mt-1 w-52 max-h-60 overflow-y-auto bg-card border border-black/10 dark:border-white/10 rounded-xl shadow-xl z-[101] py-1">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => handleCountryChange(c)}
                            className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 font-bold transition-colors cursor-pointer text-xs text-foreground"
                          >
                            <img 
                              src={`https://flagcdn.com/w40/${c.flag}.png`} 
                              alt="" 
                              className="w-5 h-3.5 object-cover rounded-sm shrink-0 border border-black/10 dark:border-white/10"
                            />
                            <span className="shrink-0 font-mono" dir="ltr">{c.code}</span>
                            <span className="text-muted-foreground text-[10px] font-medium truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Real Phone Input */}
                <input
                  id={`${idPrefix}-phone`}
                  type="tel"
                  autoComplete="tel"
                  value={localPhone}
                  onChange={(e) => handlePhoneChange(e.target.value, selectedCountry)}
                  className="flex-1 h-full px-3 bg-transparent outline-none border-none font-bold text-sm text-foreground placeholder:text-muted-foreground/35"
                  placeholder={selectedCountry.placeholder}
                  dir="ltr"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${idPrefix}-email`} className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">
                {t('email_label') || 'Email'}
              </label>
              <input
                id={`${idPrefix}-email`}
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors(prev => ({ ...prev, email: '', general: '' }));
                }}
                className={cn(inputClasses, errors.email && "border-red-500 focus:ring-red-500/20")}
                placeholder={t('email_placeholder') || 'example@email.com'}
              />
              {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email}</p>}
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

          {errors.general && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl text-center">
              {errors.general}
            </div>
          )}

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
