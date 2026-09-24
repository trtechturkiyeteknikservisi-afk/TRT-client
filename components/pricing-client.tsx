'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Wrench, ShieldCheck, Clock, CheckCircle2, ChevronDown, ChevronUp,
  Phone, Truck, Database, Award, X, Sparkles,
  LayoutGrid, Table as TableIcon, AlertCircle, Check, Smartphone, Layers,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useSettings } from './settings-provider';
import toast from 'react-hot-toast';
import { WhatsappIcon } from './social-icons';

interface QualityOption {
  quality_tr: string;
  quality_en: string;
  quality_ar: string;
  price: number;
  badge?: string;
  available?: boolean;
}

interface PricingItem {
  id: number;
  brand: string;
  device_type: string;
  series: string;
  model_name: string;
  service_slug: string;
  service_name_tr: string;
  service_name_en: string;
  service_name_ar: string;
  base_price: number;
  currency: string;
  duration: string;
  warranty: string;
  quality_options: QualityOption[];
  is_popular: boolean;
  in_stock: boolean;
  sort_order: number;
  notes_tr?: string;
  notes_en?: string;
  notes_ar?: string;
  image_url?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function PricingClient() {
  const t = useTranslations('Pricing');
  const locale = useLocale() as 'ar' | 'en' | 'tr';
  const { settings } = useSettings();

  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Table View Pagination for peak performance
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 15;

  // Appointment Modal State
  const [bookingModalItem, setBookingModalItem] = useState<PricingItem | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    city: '',
    notes: '',
    selectedQuality: ''
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const supportPhone = settings['support_phone'] || '0850 840 15 05';
  const rawWhatsapp = settings['whatsapp'] || '905302094094';
  const cleanWhatsapp = rawWhatsapp.replace(/\D/g, '');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/pricing`);
        const data = res.data as PricingItem[];
        setItems(data);
        setExpandedCards({});
      } catch (err) {
        console.error('Failed to load pricing items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  // Reset pagination and series filter on filter change
  useEffect(() => {
    setTablePage(1);
    setSelectedSeries('all');
  }, [search, selectedBrand, selectedService]);

  // Filter items
  const brands = useMemo(() => {
    return Array.from(new Set(items.map(i => i.brand))).filter(Boolean);
  }, [items]);

  const services = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach(i => {
      const name = locale === 'ar' ? (i.service_name_ar || i.service_name_tr) : locale === 'en' ? (i.service_name_en || i.service_name_tr) : i.service_name_tr;
      map.set(i.service_slug, name);
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [items, locale]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) return false;
      if (selectedService !== 'all' && item.service_slug !== selectedService) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const serviceName = (locale === 'ar' ? (item.service_name_ar || item.service_name_tr) : locale === 'en' ? (item.service_name_en || item.service_name_tr) : item.service_name_tr).toLowerCase();
        const match = item.model_name.toLowerCase().includes(q) ||
                      item.series.toLowerCase().includes(q) ||
                      item.brand.toLowerCase().includes(q) ||
                      serviceName.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [items, selectedBrand, selectedService, search, locale]);

  // Table pagination calculations
  const totalTablePages = Math.max(1, Math.ceil(filteredItems.length / TABLE_PAGE_SIZE));
  const paginatedTableItems = useMemo(() => {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return filteredItems.slice(start, start + TABLE_PAGE_SIZE);
  }, [filteredItems, tablePage, TABLE_PAGE_SIZE]);

  const tableStartIndex = filteredItems.length === 0 ? 0 : (tablePage - 1) * TABLE_PAGE_SIZE + 1;
  const tableEndIndex = Math.min(tablePage * TABLE_PAGE_SIZE, filteredItems.length);

  // Group by series for Feza Teknik style card presentation
  const seriesGroups = useMemo(() => {
    const groups: Record<string, PricingItem[]> = {};
    filteredItems.forEach(item => {
      const key = item.series || (locale === 'ar' ? 'موديلات أخرى' : locale === 'en' ? 'Other Models' : 'Diğer Modeller');
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filteredItems, locale]);

  // Unique series list for quick pills navigation
  const seriesList = useMemo(() => {
    const set = new Set<string>();
    filteredItems.forEach(item => {
      const key = item.series || (locale === 'ar' ? 'موديلات أخرى' : locale === 'en' ? 'Other Models' : 'Diğer Modeller');
      if (key) set.add(key);
    });
    return Array.from(set);
  }, [filteredItems, locale]);

  // Displayed groups (either all or filtered by selected series)
  const displayedSeriesGroups = useMemo(() => {
    if (selectedSeries === 'all') return seriesGroups;
    const singleGroup: Record<string, PricingItem[]> = {};
    if (seriesGroups[selectedSeries]) {
      singleGroup[selectedSeries] = seriesGroups[selectedSeries];
    }
    return singleGroup;
  }, [seriesGroups, selectedSeries]);

  const toggleExpand = (id: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getLocalizedServiceName = (item: PricingItem) => {
    if (locale === 'ar') {
      if (item.service_name_ar && item.service_name_ar.trim()) return item.service_name_ar;
      if (item.service_slug === 'ekran-degisimi') return 'تبديل الشاشة';
      if (item.service_slug === 'batarya-degisimi') return 'تبديل البطارية';
      if (item.service_slug === 'kasa-degisimi') return 'تبديل الهيكل';
      if (item.service_slug === 'arka-cam-degisimi') return 'تبديل الزجاج الخلفي';
      if (item.service_slug === 'kamera-degisimi') return 'تبديل الكاميرا';
      if (item.service_slug === 'anakart-tamiri') return 'صيانة اللوحة الأم';
      return item.service_name_tr;
    }
    if (locale === 'en') {
      if (item.service_name_en && item.service_name_en.trim()) return item.service_name_en;
      if (item.service_slug === 'ekran-degisimi') return 'Screen Replacement';
      if (item.service_slug === 'batarya-degisimi') return 'Battery Replacement';
      if (item.service_slug === 'kasa-degisimi') return 'Housing Replacement';
      if (item.service_slug === 'arka-cam-degisimi') return 'Back Glass Replacement';
      if (item.service_slug === 'kamera-degisimi') return 'Camera Replacement';
      if (item.service_slug === 'anakart-tamiri') return 'Motherboard Repair';
      return item.service_name_tr;
    }
    return item.service_name_tr;
  };

  const getLocalizedQualityName = (q: QualityOption) => {
    if (locale === 'ar') {
      if (q.quality_ar && q.quality_ar.trim()) return q.quality_ar;
      const tr = q.quality_tr || '';
      if (tr.includes('Servis') || tr.includes('Orijinal Servis')) return 'شاشة وكالة سيرفس أصلية';
      if (tr.includes('Uyarısız')) return 'شاشة أصلية بدون رسالة تنبيه';
      if (tr.includes('Uyarılı')) return 'شاشة أصلية مع رسالة تنبيه';
      if (tr.includes('A+')) return 'شاشة فرز أول نخب A+';
      if (tr.includes('Revize')) return 'شاشة مجددة وكالة (ريفيز)';
      if (tr.includes('OLED')) return 'شاشة أوليد فائقة الوضوح';
      if (tr.includes('İncell') || tr.includes('Incell')) return 'شاشة إن سيل اقتصادية';
      return tr;
    }
    if (locale === 'en') {
      if (q.quality_en && q.quality_en.trim()) return q.quality_en;
      const tr = q.quality_tr || '';
      if (tr.includes('Servis') || tr.includes('Orijinal Servis')) return 'Original Service Pack Screen';
      if (tr.includes('Uyarısız')) return 'Original Warning-Free Screen';
      if (tr.includes('Uyarılı')) return 'Original Screen (With Warning)';
      if (tr.includes('A+')) return 'A+ High Quality Screen';
      if (tr.includes('Revize')) return 'Refurbished Original Screen';
      if (tr.includes('OLED')) return 'OLED High Definition Screen';
      if (tr.includes('İncell') || tr.includes('Incell')) return 'Incell Economy Screen';
      return tr;
    }
    return q.quality_tr;
  };

  const getLocalizedBadge = (badge?: string) => {
    if (!badge) return '';
    if (locale === 'ar') {
      if (badge === 'En İyi Seçim') return 'الخيار الأفضل';
      if (badge === 'Ekonomik') return 'اقتصادي';
      if (badge === 'Popüler') return 'الأكثر طلباً';
      if (badge === 'Orijinal') return 'أصلي معتمد';
      if (badge === 'Tavsiye Edilen') return 'موصى به';
      return badge;
    }
    if (locale === 'en') {
      if (badge === 'En İyi Seçim') return 'Best Choice';
      if (badge === 'Ekonomik') return 'Budget';
      if (badge === 'Popüler') return 'Popular';
      if (badge === 'Orijinal') return 'Original';
      if (badge === 'Tavsiye Edilen') return 'Recommended';
      return badge;
    }
    return badge;
  };

  const getLocalizedSeries = (series: string) => {
    if (!series) {
      return locale === 'ar' ? 'موديلات أخرى' : locale === 'en' ? 'Other Models' : 'Diğer Modeller';
    }
    if (locale === 'ar') {
      if (series.toLowerCase().includes('diğer') || series.toLowerCase().includes('other')) {
        return 'موديلات أخرى';
      }
      if (series.includes('Serisi')) {
        return `فئة ${series.replace(/Serisi/i, '').trim()}`;
      }
      if (series.startsWith('سلسلة')) {
        return series.replace(/^سلسلة\s*/, 'فئة ');
      }
      return series;
    }
    if (locale === 'en') {
      if (series.toLowerCase().includes('diğer')) {
        return 'Other Models';
      }
      if (series.includes('Serisi')) {
        return `${series.replace(/Serisi/i, '').trim()} Series`;
      }
      return series;
    }
    return series;
  };

  const getLocalizedDuration = (duration: string) => {
    if (!duration) return locale === 'ar' ? '30 دقيقة' : locale === 'en' ? '30 Minutes' : '30 Dakika';
    if (locale === 'ar') {
      return duration
        .replace(/(\d+)\s*Dakika/gi, '$1 دقيقة')
        .replace(/(\d+)\s*Saat/gi, '$1 ساعة')
        .replace(/Aynı Gün Teslim/gi, 'تسليم بنفس اليوم')
        .replace(/Hemen Teslim/gi, 'تسليم فوري');
    }
    if (locale === 'en') {
      return duration
        .replace(/(\d+)\s*Dakika/gi, '$1 Minutes')
        .replace(/(\d+)\s*Saat/gi, '$1 Hours')
        .replace(/Aynı Gün Teslim/gi, 'Same Day Delivery')
        .replace(/Hemen Teslim/gi, 'Immediate Delivery');
    }
    return duration;
  };

  const getLocalizedWarranty = (warranty: string) => {
    if (!warranty) return locale === 'ar' ? 'ضمان 6 أشهر' : locale === 'en' ? '6 Months Warranty' : '6 Ay Garanti';
    if (locale === 'ar') {
      return warranty
        .replace(/(\d+)\s*Ay Garanti/gi, 'ضمان $1 أشهر')
        .replace(/1 Yıl Garanti/gi, 'ضمان سنة واحدة')
        .replace(/(\d+)\s*Yıl Garanti/gi, 'ضمان $1 سنوات')
        .replace(/Ömür Boyu Garanti/gi, 'ضمان مدى الحياة');
    }
    if (locale === 'en') {
      return warranty
        .replace(/(\d+)\s*Ay Garanti/gi, '$1 Months Warranty')
        .replace(/1 Yıl Garanti/gi, '1 Year Warranty')
        .replace(/(\d+)\s*Yıl Garanti/gi, '$1 Years Warranty')
        .replace(/Ömür Boyu Garanti/gi, 'Lifetime Warranty');
    }
    return warranty;
  };

  const getLocalizedNotes = (item: PricingItem) => {
    if (locale === 'ar') return item.notes_ar || item.notes_tr;
    if (locale === 'en') return item.notes_en || item.notes_tr;
    return item.notes_tr;
  };

  const getLocalizedDeviceTitle = (item: PricingItem) => {
    const serviceName = getLocalizedServiceName(item);
    if (locale === 'ar') {
      return `${serviceName} - ${item.model_name}`;
    }
    return `${item.model_name} ${serviceName}`;
  };

  const openWhatsAppForModel = (item: PricingItem, qualityName?: string, price?: number) => {
    const serviceName = getLocalizedServiceName(item);
    const qualityText = qualityName ? ` (${qualityName} - ${price?.toLocaleString('tr-TR')} ₺)` : '';
    const message = locale === 'ar'
      ? `مرحباً، أود الاستفسار عن خدمة ${serviceName} لجهاز ${item.model_name}${qualityText} ومعرفة إمكانية الصيانة.`
      : locale === 'en'
      ? `Hello, I would like to inquire about ${serviceName} for ${item.model_name}${qualityText} and book a repair.`
      : `Merhaba, ${item.model_name} cihazım için ${serviceName}${qualityText} fiyatı ve randevu hakkında bilgi almak istiyorum.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanWhatsapp}?text=${encoded}`, '_blank');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) {
      toast.error(t('modal_validation'));
      return;
    }

    setBookingSubmitting(true);
    try {
      const serviceName = bookingModalItem ? getLocalizedServiceName(bookingModalItem) : '';
      const modelName = bookingModalItem ? bookingModalItem.model_name : '';
      const messageContent = `[TAMİR RANDEVU TALEBİ / REPAIR REQUEST]\n` +
        `Cihaz / Device: ${bookingModalItem?.brand} ${modelName}\n` +
        `Hizmet / Service: ${serviceName}\n` +
        `Seçilen Kalite: ${bookingForm.selectedQuality || 'Belirtilmedi'}\n` +
        `Şehir / İlçe: ${bookingForm.city || 'Belirtilmedi'}\n` +
        `Müşteri Notu: ${bookingForm.notes || 'Yok'}`;

      await axios.post(`${API_BASE}/contacts`, {
        name: bookingForm.name,
        email: 'appointment@trtservis.com',
        phone: bookingForm.phone,
        serviceType: serviceName,
        message: messageContent
      });

      toast.success(t('modal_success'));

      // Optionally offer WhatsApp continuation
      if (bookingModalItem) {
        openWhatsAppForModel(bookingModalItem, bookingForm.selectedQuality);
      }

      setBookingModalItem(null);
      setBookingForm({ name: '', phone: '', city: '', notes: '', selectedQuality: '' });
    } catch (err) {
      console.error('Error submitting appointment:', err);
      toast.error(t('modal_error'));
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors selection:bg-primary selection:text-primary-foreground">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-14 md:pt-16 md:pb-20 overflow-hidden border-b border-border/40 bg-gradient-to-b from-card/80 via-background to-background">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-primary/10 blur-[130px] -z-10 pointer-events-none" />
        <div className="absolute -top-24 right-10 w-80 h-80 bg-red-500/10 blur-[100px] -z-10 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6 shadow-xs"
          >
            <Sparkles size={14} />
            <span>{t('tag_2026')}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-5 leading-tight"
          >
            {t('title')}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground font-semibold max-w-3xl mx-auto leading-relaxed mb-8"
          >
            {t('subtitle')}
          </motion.p>

          {/* Interactive Live Search Box (Clean, tags removed, badge removed) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative flex items-center bg-card border-2 border-primary/30 rounded-xl shadow-lg hover:border-primary/50 focus-within:border-primary transition-all p-1">
              <Search className="text-primary ml-3 mr-2 shrink-0" size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full bg-transparent px-2 py-2.5 text-sm sm:text-base font-bold outline-none placeholder:text-muted-foreground/60"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="p-2 text-muted-foreground hover:text-foreground mr-1 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FILTER BAR & VIEW TOGGLE */}
      <section className="sticky top-[48px] z-30 bg-background/90 backdrop-blur-md border-b border-border/50 py-3 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Brand Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedBrand('all')}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer",
                  selectedBrand === 'all'
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {t('all_brands')} ({items.length})
              </button>

              {brands.map(brand => {
                const count = items.filter(i => i.brand === brand).length;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
                      selectedBrand === brand
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card border hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{brand}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-md font-bold",
                      selectedBrand === brand ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Service Filter & View Switcher */}
            <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
              {/* Service Select */}
              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="bg-card border border-border/80 rounded-lg px-3.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">{t('all_services')}</option>
                  {services.map(s => (
                    <option key={s.slug} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all cursor-pointer",
                    viewMode === 'cards'
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title={t('view_cards')}
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline">{t('view_cards')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all cursor-pointer",
                    viewMode === 'table'
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title={t('view_table')}
                >
                  <TableIcon size={14} />
                  <span className="hidden sm:inline">{t('view_table')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN PRICING CONTENT */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {t('loading_prices')}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-card p-10 text-center rounded-xl border max-w-xl mx-auto space-y-4 shadow-sm">
              <AlertCircle size={40} className="mx-auto text-primary" />
              <h3 className="text-xl font-bold">{t('no_results')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('no_results_desc')}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => { setSearch(''); setSelectedBrand('all'); setSelectedService('all'); }}
                  className="px-4 py-2 rounded-lg bg-muted text-xs font-bold hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  {t('clear_filters')}
                </button>
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(locale === 'ar' ? 'مرحباً، أود الاستفسار عن سعر صيانة جهازي.' : 'Merhaba, cihazımın tamir fiyatını öğrenmek istiyorum.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <WhatsappIcon size={15} />
                  <span>{t('ask_custom_quote')}</span>
                </a>
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            /* --- REFINED SERIES CATALOG: COMPACT 3-COL GRID & SERIES NAVIGATION PILLS --- */
            <div className="space-y-8">
              {/* Series Navigation Pills Bar */}
              {seriesList.length > 1 && (
                <div className="p-3 rounded-xl bg-card border border-border/70 shadow-xs">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-0.5">
                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap shrink-0 flex items-center gap-1.5 pl-1 rtl:pl-0 rtl:pr-1">
                      <Smartphone size={14} className="text-primary" />
                      <span>{locale === 'ar' ? 'تصفية حسب الفئة:' : locale === 'en' ? 'Series Filter:' : 'Seri Filtresi:'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedSeries('all')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5",
                        selectedSeries === 'all'
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                      )}
                    >
                      <span>{locale === 'ar' ? 'جميع الفئات' : locale === 'en' ? 'All Series' : 'Tüm Seriler'}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-md font-bold",
                        selectedSeries === 'all' ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {filteredItems.length}
                      </span>
                    </button>

                    {seriesList.map(ser => {
                      const count = seriesGroups[ser]?.length || 0;
                      const isSelected = selectedSeries === ser;
                      return (
                        <button
                          key={ser}
                          type="button"
                          onClick={() => setSelectedSeries(ser)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                          )}
                        >
                          <span>{getLocalizedSeries(ser)}</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded-md font-bold",
                            isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                          )}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Series Groups Loop */}
              <div className="space-y-10">
                {Object.entries(displayedSeriesGroups).map(([seriesTitle, seriesItems]) => (
                  <div key={seriesTitle} className="space-y-4">
                    {/* Series Title Header */}
                    <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-border/70">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Smartphone size={16} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                          {getLocalizedSeries(seriesTitle)}
                        </h2>
                      </div>
                      <span className="text-xs bg-muted text-muted-foreground font-bold px-2.5 py-1 rounded-md border border-border/60">
                        {seriesItems.length} {t('models_count')}
                      </span>
                    </div>

                    {/* Series Grid of Models (Sleek 3-Column Compact Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                      {seriesItems.map(item => {
                        const isExpanded = !!expandedCards[item.id];
                        const hasQualities = Array.isArray(item.quality_options) && item.quality_options.length > 0;

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "bg-card rounded-xl border flex flex-col justify-between transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 group",
                              item.is_popular ? "border-primary/40 ring-1 ring-primary/20" : "border-border/70"
                            )}
                          >
                            <div className="p-4 sm:p-5 space-y-3.5 flex-1">
                              {/* Top Badges & Image Row */}
                              <div className="flex items-start gap-3">
                                {item.image_url ? (
                                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg border bg-muted/20 p-1 shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-xs">
                                    <img
                                      src={item.image_url}
                                      alt={item.model_name}
                                      className="w-full h-full object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-lg border bg-muted/20 flex items-center justify-center shrink-0 text-muted-foreground/40 shadow-xs">
                                    <Smartphone size={20} />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 shrink-0">
                                      {item.brand}
                                    </span>
                                    {item.is_popular && (
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                        {t('popular_badge')}
                                      </span>
                                    )}
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 shrink-0">
                                      <Check size={11} /> {t('in_stock_badge')}
                                    </span>
                                  </div>

                                  <h3 className="text-sm sm:text-base font-black tracking-tight text-foreground leading-snug break-words">
                                    {getLocalizedDeviceTitle(item)}
                                  </h3>
                                </div>
                              </div>

                              {/* Price & Service & Warranty Strip */}
                              <div className="pt-2 border-t border-border/50 flex items-baseline justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                                    {t('starting_from')}
                                  </span>
                                  <span className="text-lg sm:text-xl font-black text-primary tracking-tight">
                                    {item.base_price.toLocaleString('tr-TR')} {item.currency}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    <ShieldCheck size={12} className="shrink-0" />
                                    <span>{getLocalizedWarranty(item.warranty)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quality Breakdown Options (Clean Collapsed-by-default Accordion) */}
                            {hasQualities && (
                              <div className="border-t border-border/60 bg-muted/20">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(item.id)}
                                  className="w-full px-4 py-2 flex items-center justify-between text-xs font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Layers size={13} className="text-primary shrink-0" />
                                    <span>{t('select_quality_title')} ({item.quality_options.length})</span>
                                  </span>
                                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                </button>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-3.5 pt-1 space-y-1.5">
                                        {item.quality_options.map((q, qIdx) => {
                                          const qName = getLocalizedQualityName(q);
                                          return (
                                            <div
                                              key={qIdx}
                                              className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/70 text-xs shadow-xs"
                                            >
                                              <div className="min-w-0 pr-2 rtl:pr-0 rtl:pl-2">
                                                <span className="font-bold text-foreground block truncate">{qName}</span>
                                                {q.badge && (
                                                  <span className="text-[8px] font-black px-1 py-0.2 rounded bg-primary/10 text-primary uppercase">
                                                    {getLocalizedBadge(q.badge)}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-black text-foreground">{q.price.toLocaleString('tr-TR')} ₺</span>
                                                <button
                                                  type="button"
                                                  onClick={() => openWhatsAppForModel(item, qName, q.price)}
                                                  className="px-2 py-1 rounded-md bg-emerald-600/10 hover:bg-[#25D366] text-emerald-700 dark:text-emerald-400 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                                >
                                                  <WhatsappIcon size={12} />
                                                  <span>{t('select_action')}</span>
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            {/* Card Footer Actions */}
                            <div className="p-3 bg-muted/30 border-t border-border/60 flex items-center justify-between gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setBookingModalItem(item);
                                  setBookingForm(prev => ({
                                    ...prev,
                                    selectedQuality: hasQualities ? getLocalizedQualityName(item.quality_options[0]) : ''
                                  }));
                                }}
                                className="flex-1 py-2 px-2.5 rounded-lg bg-card border hover:border-primary/40 text-foreground font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                              >
                                <Wrench size={13} className="text-primary shrink-0" />
                                <span>{t('book_appointment')}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openWhatsAppForModel(item)}
                                className="flex-1 py-2 px-2.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                              >
                                <WhatsappIcon size={14} className="shrink-0 text-white" />
                                <span>{t('whatsapp_inquiry')}</span>
                              </button>

                              <a
                                href={`tel:${supportPhone.replace(/\s/g, '')}`}
                                className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-all flex items-center justify-center border border-border/50 cursor-pointer active:scale-95 shrink-0"
                                title={t('call_us')}
                                aria-label={t('call_us')}
                              >
                                <Phone size={14} className="shrink-0" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* --- GSM İLETİŞİM STYLE: INTERACTIVE HIGH-PERFORMANCE PAGINATED PRICING TABLE --- */
            <div className="space-y-4">
              {/* Responsive Scroll Hint for Mobile/Tablet */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground px-2">
                <span className="flex items-center gap-2 font-bold text-foreground">
                  <TableIcon size={16} className="text-primary" />
                  <span>{t('table_comparison_title')}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex sm:hidden items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                    ↔ {locale === 'ar' ? 'اسحب الجدول أفقياً للمزيد' : locale === 'en' ? 'Scroll horizontally for more' : 'Tabloyu kaydırın'}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground/80 hidden sm:inline">
                    {t('table_scroll_hint')}
                  </span>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[1050px] border-collapse text-start" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                    <colgroup>
                      <col className="w-[360px] sm:w-[400px]" />
                      <col className="w-[140px]" />
                      <col className="w-[300px]" />
                      <col className="w-[140px]" />
                      <col className="w-[140px]" />
                      <col className="w-[180px]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-muted/70 border-b border-border/80 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="py-4 px-6 text-start min-w-[320px] sm:min-w-[380px]">{t('col_model')}</th>
                        <th className="py-4 px-5 text-start">{t('col_service')}</th>
                        <th className="py-4 px-5 text-start">{t('col_quality')}</th>
                        <th className="py-4 px-5 text-start">{t('col_warranty')}</th>
                        <th className="py-4 px-5 text-start">{t('col_price')}</th>
                        <th className="py-4 px-6 text-end">{t('col_action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                      {paginatedTableItems.map(item => {
                        const serviceName = getLocalizedServiceName(item);
                        const hasQualities = Array.isArray(item.quality_options) && item.quality_options.length > 0;

                        return (
                          <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                            {/* 1. Model & Series & Photo (Spacious & Highly Responsive) */}
                            <td className="py-4 px-6 align-middle text-start min-w-[320px] sm:min-w-[380px]">
                              <div className="flex items-center gap-3.5">
                                {item.image_url ? (
                                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border bg-muted/20 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                                    <img
                                      src={item.image_url}
                                      alt={item.model_name}
                                      className="w-full h-full object-contain"
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border bg-muted/20 flex items-center justify-center shrink-0 text-muted-foreground/40 shadow-xs">
                                    <Smartphone size={20} />
                                  </div>
                                )}

                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60 shrink-0">
                                      {item.brand}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/15 shrink-0">
                                      {getLocalizedSeries(item.series)}
                                    </span>
                                    {item.is_popular && (
                                      <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-black uppercase shrink-0">
                                        {t('popular_badge')}
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-black text-sm sm:text-base text-foreground tracking-tight leading-snug break-words">
                                    {item.model_name}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Service Type */}
                            <td className="py-4 px-5 align-middle text-start whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold border border-primary/15">
                                <Wrench size={13} className="shrink-0" />
                                <span>{serviceName}</span>
                              </span>
                            </td>

                            {/* 3. Quality Options */}
                            <td className="py-4 px-5 align-middle text-start">
                              {hasQualities ? (
                                <div className="space-y-1.5">
                                  {item.quality_options.map((q, idx) => {
                                    const qName = getLocalizedQualityName(q);
                                    return (
                                      <div 
                                        key={idx} 
                                        className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="text-xs font-bold text-foreground truncate">
                                            {qName}
                                          </span>
                                          {q.badge && (
                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase shrink-0">
                                              {getLocalizedBadge(q.badge)}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs font-black text-foreground shrink-0 tabular-nums">
                                          {q.price.toLocaleString('tr-TR')} ₺
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground font-semibold italic">{t('single_quality')}</span>
                              )}
                            </td>

                            {/* 4. Warranty */}
                            <td className="py-4 px-5 align-middle text-start whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                                <ShieldCheck size={14} className="shrink-0" />
                                <span>{getLocalizedWarranty(item.warranty)}</span>
                              </span>
                            </td>

                            {/* 6. Starting Price */}
                            <td className="py-3.5 px-5 align-middle text-start">
                              <div className="font-black text-lg text-primary tracking-tight whitespace-nowrap">
                                {item.base_price.toLocaleString('tr-TR')} {item.currency}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mt-0.5 whitespace-nowrap">
                                {t('vat_included')}
                              </span>
                            </td>

                            {/* 7. Action Buttons */}
                            <td className="py-3.5 px-6 align-middle text-end">
                              <div className="flex flex-col gap-1.5 items-stretch">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBookingModalItem(item);
                                    setBookingForm(prev => ({
                                      ...prev,
                                      selectedQuality: hasQualities ? getLocalizedQualityName(item.quality_options[0]) : ''
                                    }));
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                  <Wrench size={13} />
                                  <span>{t('book_appointment')}</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openWhatsAppForModel(item)}
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                    title="WhatsApp"
                                  >
                                    <WhatsappIcon size={14} className="shrink-0" />
                                    <span>WhatsApp</span>
                                  </button>

                                  <a
                                    href={`tel:${supportPhone.replace(/\s/g, '')}`}
                                    className="p-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all flex items-center justify-center border border-border/60"
                                    title={t('call_us')}
                                    aria-label={t('call_us')}
                                  >
                                    <Phone size={14} className="shrink-0" />
                                  </a>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table View Performance Pagination Controls */}
                {totalTablePages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t bg-muted/20 text-xs">
                    <div className="text-muted-foreground font-semibold">
                      {locale === 'ar'
                        ? `عرض ${tableStartIndex} إلى ${tableEndIndex} من أصل ${filteredItems.length} موديل`
                        : locale === 'en'
                        ? `Showing ${tableStartIndex} to ${tableEndIndex} of ${filteredItems.length} models`
                        : `${filteredItems.length} modelden ${tableStartIndex} - ${tableEndIndex} arası gösteriliyor`}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTablePage(1)}
                        disabled={tablePage === 1}
                        className="p-1.5 rounded-lg border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                        title="First Page"
                      >
                        {locale === 'ar' ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setTablePage(prev => Math.max(1, prev - 1))}
                        disabled={tablePage === 1}
                        className="p-1.5 rounded-lg border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                        title={locale === 'ar' ? 'السابق' : locale === 'en' ? 'Previous' : 'Önceki'}
                      >
                        {locale === 'ar' ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                      </button>

                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalTablePages }, (_, i) => i + 1)
                          .filter(page => page === 1 || page === totalTablePages || Math.abs(page - tablePage) <= 1)
                          .map((page, idx, arr) => {
                            const prev = arr[idx - 1];
                            return (
                              <React.Fragment key={page}>
                                {prev && page - prev > 1 && (
                                  <span className="px-1 text-muted-foreground select-none">...</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setTablePage(page)}
                                  className={cn(
                                    "w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer",
                                    tablePage === page
                                      ? "bg-primary text-primary-foreground font-black shadow-xs"
                                      : "border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setTablePage(prev => Math.min(totalTablePages, prev + 1))}
                        disabled={tablePage === totalTablePages}
                        className="p-1.5 rounded-lg border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                        title={locale === 'ar' ? 'التالي' : locale === 'en' ? 'Next' : 'Sonraki'}
                      >
                        {locale === 'ar' ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setTablePage(totalTablePages)}
                        disabled={tablePage === totalTablePages}
                        className="p-1.5 rounded-lg border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                        title="Last Page"
                      >
                        {locale === 'ar' ? <ChevronsLeft size={15} /> : <ChevronsRight size={15} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Disclaimer Note */}
          <div className="mt-12 p-6 rounded-xl bg-card border border-border/70 text-center max-w-3xl mx-auto space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed">
              {t('pricing_note')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a 
                href={`tel:${supportPhone.replace(/\s/g, '')}`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
              >
                <Phone size={13} className="shrink-0" /> {supportPhone}
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#25D366] hover:underline flex items-center gap-1.5"
              >
                <WhatsappIcon size={14} className="shrink-0" />
                <span>{t('whatsapp_live_support')}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOOKING APPOINTMENT MODAL (Strictly translated & rounded-lg & image thumbnail support) */}
      <AnimatePresence>
        {bookingModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b bg-muted/20">
                <div className="flex items-center gap-3">
                  {bookingModalItem.image_url ? (
                    <img 
                      src={bookingModalItem.image_url} 
                      alt={bookingModalItem.model_name}
                      className="w-11 h-11 object-contain rounded-lg border bg-muted/30 p-0.5 shrink-0" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Wrench size={18} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-lg uppercase flex items-center gap-2">
                      <span>{t('modal_title')}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {bookingModalItem.brand} {bookingModalItem.model_name} • {getLocalizedServiceName(bookingModalItem)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBookingModalItem(null)}
                  className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                {/* Quality selection dropdown if available */}
                {Array.isArray(bookingModalItem.quality_options) && bookingModalItem.quality_options.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      {t('modal_quality_label')}
                    </label>
                    <select
                      value={bookingForm.selectedQuality}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, selectedQuality: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {bookingModalItem.quality_options.map((q, idx) => (
                        <option key={idx} value={getLocalizedQualityName(q)}>
                          {getLocalizedQualityName(q)} — {q.price.toLocaleString('tr-TR')} ₺
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      {t('modal_name_label')}
                    </label>
                    <input
                      required
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('modal_name_placeholder')}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      {t('modal_phone_label')}
                    </label>
                    <input
                      required
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder={t('modal_phone_placeholder')}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    {t('modal_city_label')}
                  </label>
                  <input
                    value={bookingForm.city}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder={t('modal_city_placeholder')}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    {t('modal_notes_label')}
                  </label>
                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={t('modal_notes_placeholder')}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t">
                  <button
                    type="button"
                    onClick={() => setBookingModalItem(null)}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 cursor-pointer"
                  >
                    {t('modal_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {bookingSubmitting ? t('modal_submitting') : t('modal_confirm')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
