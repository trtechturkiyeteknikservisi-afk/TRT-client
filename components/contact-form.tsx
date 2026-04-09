'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Send, CheckCircle, X, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ContactFormProps {
  initialServiceType?: string;
  isSidebar?: boolean;
}

export function ContactForm({ initialServiceType = 'phone', isSidebar = false }: ContactFormProps) {
  const t = useTranslations('Contact');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    message: '',
    serviceType: initialServiceType,
    deviceModel: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Auto-detect city via IP
    const autoDetectCity = async () => {
      const services = [
        'https://ip-api.com/json/',
        'https://ipapi.co/json/',
        'https://api.ipify.org?format=json' // Only IP, but useful for other tools
      ];

      for (const service of services) {
        try {
          const res = await axios.get(service);
          const data = res.data as any;
          let detectedCity = '';
          
          if (service.includes('ip-api') && data?.city) {
            detectedCity = data.city;
          } else if (service.includes('ipapi.co') && data?.city) {
            detectedCity = data.city;
          }

          if (detectedCity) {
            const lowerCity = detectedCity.toLowerCase();
            let cityValue = '';
            if (lowerCity.includes('bursa')) cityValue = 'Bursa';
            else if (lowerCity.includes('istanbul')) cityValue = 'Istanbul';
            else if (lowerCity.includes('ankara')) cityValue = 'Ankara';
            else if (lowerCity.includes('izmir')) cityValue = 'Izmir';
            else if (lowerCity.includes('antalya')) cityValue = 'Antalya';
            
            if (cityValue) {
              setFormData(prev => ({ ...prev, city: cityValue }));
            } else {
              setFormData(prev => ({ ...prev, city: 'Other', address: detectedCity }));
            }
            break; // النجاح في الحصول على المدينة، توقف عن المحاولة
          }
        } catch (error) {
          console.warn(`City detection failed for ${service}, trying next...`);
        }
      }
    };
    autoDetectCity();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        message: '',
        serviceType: initialServiceType,
        deviceModel: ''
      });
    } catch (error) {
      console.error('Error submitting form', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    const fallbackToIP = async () => {
      try {
        const res = await axios.get<{ city?: string }>('https://ipapi.co/json/');
        if (res.data) {
          const city = res.data.city || '';
          const lowerCity = city.toLowerCase();
          let cityValue = 'Other';
          if (lowerCity.includes('bursa')) cityValue = 'Bursa';
          else if (lowerCity.includes('istanbul')) cityValue = 'Istanbul';
          else if (lowerCity.includes('ankara')) cityValue = 'Ankara';
          else if (lowerCity.includes('izmir')) cityValue = 'Izmir';
          else if (lowerCity.includes('antalya')) cityValue = 'Antalya';

          setFormData(prev => ({
            ...prev,
            city: cityValue,
            address: cityValue === 'Other' ? city : prev.address
          }));
        }
      } catch (err) {
        console.error('IP Fallback failed', err);
      } finally {
        setDetectingLocation(false);
      }
    };

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await axios.get<{ address: any }>(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'ar,en,tr' },
              timeout: 5000
            }
          );
          
          if (response.data && response.data.address) {
            const addr = response.data.address;
            const detectedCity = addr.city || addr.town || addr.village || addr.province || '';
            const road = addr.road || '';
            const neighbourhood = addr.neighbourhood || addr.suburb || '';
            const houseNumber = addr.house_number || '';
            
            const lowerCity = detectedCity.toLowerCase();
            let cityValue = 'Other';
            if (lowerCity.includes('bursa')) cityValue = 'Bursa';
            else if (lowerCity.includes('istanbul')) cityValue = 'Istanbul';
            else if (lowerCity.includes('ankara')) cityValue = 'Ankara';
            else if (lowerCity.includes('izmir')) cityValue = 'Izmir';
            else if (lowerCity.includes('antalya')) cityValue = 'Antalya';

            const fullAddress = [houseNumber, road, neighbourhood].filter(Boolean).join(', ');
            
            setFormData(prev => ({
              ...prev,
              city: cityValue,
              address: fullAddress || (detectedCity !== cityValue ? detectedCity : '')
            }));
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          await fallbackToIP();
        } finally {
          setDetectingLocation(false);
        }
      },
      async (error) => {
        console.error('Error getting location:', error);
        await fallbackToIP();
      },
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 60000
      }
    );
  };

  const handleAddressChange = async (val: string) => {
    setFormData({ ...formData, address: val });
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&countrycodes=tr`
      );
      if (Array.isArray(response.data)) {
        setSuggestions(response.data as any[]);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const selectSuggestion = (s: any) => {
    const addr = s.address;
    const houseNumber = addr.house_number || '';
    const road = addr.road || '';
    const neighbourhood = addr.neighbourhood || addr.suburb || '';
    const city = addr.city || addr.town || addr.village || '';
    
    const streetAddress = [houseNumber, road, neighbourhood].filter(Boolean).join(', ');
    const fullDetail = [streetAddress, city].filter(Boolean).join(', ');

    const detectedCity = addr.city || addr.town || addr.village || addr.province || '';
    const lowerCity = detectedCity.toLowerCase();
    
    let cityValue = 'Other';
    if (lowerCity.includes('bursa')) cityValue = 'Bursa';
    else if (lowerCity.includes('istanbul')) cityValue = 'Istanbul';
    else if (lowerCity.includes('ankara')) cityValue = 'Ankara';
    else if (lowerCity.includes('izmir')) cityValue = 'Izmir';
    else if (lowerCity.includes('antalya')) cityValue = 'Antalya';

    setFormData({
      ...formData,
      city: cityValue,
      address: fullDetail || s.display_name
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative group">
      <div className={cn(
        "absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 -z-10",
        isSidebar && "rounded-[2rem]"
      )} />
      
      <div className={cn(
        "bg-card/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border shadow-2xl overflow-hidden relative",
        isSidebar && "p-6 md:p-8 rounded-[2rem]"
      )}>
        
        {/* Form Progress Indicator */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: formData.name ? '33%' : (formData.phone ? '66%' : '10%') }} />
        </div>

        <div className="mb-10 text-center sm:text-left">
          <h3 className={cn("text-2xl font-black tracking-tight", isSidebar && "text-xl")}>{t('send_message')}</h3>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {t('contact_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Phone Row */}
          <div className={cn("grid grid-cols-1 gap-6", !isSidebar && "sm:grid-cols-2")}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t('full_name')}</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-bold placeholder:font-medium"
                placeholder={t('name_placeholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t('phone_number')}</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-bold"
                placeholder="+90"
                dir="ltr"
              />
            </div>
          </div>

          {/* City & Service Row */}
          <div className={cn("grid grid-cols-1 gap-6", !isSidebar && "sm:grid-cols-2")}>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t('city')}</label>
              <select
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full h-14 px-5 rounded-2xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-bold appearance-none cursor-pointer"
              >
                <option value="" disabled>{t('city_placeholder')}</option>
                <option value="Bursa">{t('city_bursa')}</option>
                <option value="Istanbul">{t('city_istanbul')}</option>
                <option value="Ankara">{t('city_ankara')}</option>
                <option value="Izmir">{t('city_izmir')}</option>
                <option value="Antalya">{t('city_antalya')}</option>
                <option value="Other">{t('city_other')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t('service_type')}</label>
              {isSidebar ? (
                <input
                    type="text"
                    required
                    value={formData.deviceModel}
                    onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                    className="w-full h-14 px-5 rounded-2xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-bold placeholder:font-medium"
                    placeholder="e.g. iPhone 15, MacBook Pro"
                />
              ) : (
                <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full h-14 px-5 rounded-2xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-bold appearance-none cursor-pointer"
                >
                    <option value="phone">{t('service_phone')}</option>
                    <option value="laptop">{t('service_laptop')}</option>
                    <option value="tablet">{t('service_tablet')}</option>
                    <option value="robot">{t('service_robot')}</option>
                    <option value="watch">{t('service_watch')}</option>
                </select>
              )}
            </div>
          </div>

          <div className="space-y-2 relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t('address')}</label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1 group"
              >
                {detectingLocation ? (
                  <span className="animate-pulse">{t('detecting_location')}</span>
                ) : (
                  <>
                    <MapPin size={10} className="group-hover:animate-bounce" />
                    <span>{t('detect_location')}</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full h-14 px-5 rounded-2xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-bold placeholder:font-medium"
                placeholder={t('address_placeholder')}
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                  <div className="absolute z-50 w-full mt-2 bg-card/95 backdrop-blur-xl border rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        className="w-full px-6 py-5 text-left hover:bg-primary/10 transition-all border-b last:border-0 group flex items-start gap-4"
                      >
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary mt-0.5 group-hover:scale-110 transition-transform">
                          <MapPin size={18} />
                        </div>
                        <div className="flex flex-col gap-1 overflow-hidden">
                          <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                            {s.address.road || s.name || s.display_name.split(',')[0]}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground line-clamp-1 italic">
                            {s.display_name.split(',').slice(1).join(',')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t('your_message')}</label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full p-5 rounded-2xl border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 font-bold placeholder:font-medium resize-none"
              placeholder={t('message_placeholder')}
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-2">
            <ShieldCheck className="text-primary mt-1 shrink-0" size={20} />
            <p className="text-[13px] font-bold text-foreground leading-relaxed">
              {t('form_note')}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 overflow-hidden shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>{t('sending')}</span>
              </div>
            ) : (
              <>
                <span className="relative z-10">{t('send_message')}</span>
                <Send size={20} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm bg-card p-10 rounded-[3rem] border shadow-[0_30px_100px_-20px_rgba(var(--primary-rgb),0.3)] text-center space-y-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
              
              <div className="relative">
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner relative z-10">
                    <CheckCircle size={48} strokeWidth={2.5} />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-xl -z-0 animate-pulse" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tighter leading-none">{t('success_modal_title')}</h3>
                <p className="text-muted-foreground font-semibold leading-relaxed text-sm px-2">
                  {t('success_modal_desc')}
                </p>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full h-14 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-foreground/90 transition-all active:scale-95 shadow-2xl"
              >
                {t('close')}
              </button>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
