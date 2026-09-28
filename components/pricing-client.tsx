'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Wrench, ShieldCheck, Clock, CheckCircle2, ChevronDown, ChevronUp,
  Phone, Truck, Database, Award, X, Sparkles, SlidersHorizontal,
  LayoutGrid, Table as TableIcon, AlertCircle, Check, Smartphone, Laptop,
  Watch, Tablet, Headphones, Layers, ChevronRight, Calendar, ArrowRight,
  Filter, RotateCcw, CheckSquare, Square, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useSettings } from './settings-provider';
import toast from 'react-hot-toast';
import { WhatsappIcon, RobotVacuumIcon, AppleHeadphonesIcon } from './social-icons';
import { BrandIcon } from './brand-icons';
import { Link } from '@/i18n/routing';

interface DynamicBanner {
  id: number;
  title: string;
  description: string;
  cta?: string;
  link?: string;
  image: string;
  active: boolean;
}

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


const getServiceIcon = (slug: string, iconName?: string) => {
  const s = (slug || '').toLowerCase();
  if (s.includes('phone') || s.includes('telefon')) return Smartphone;
  if (s.includes('laptop') || s.includes('macbook') || s.includes('bilgisayar')) return Laptop;
  if (s.includes('robot') || s.includes('supurge')) return RobotVacuumIcon;
  if (s.includes('watch') || s.includes('saat')) return Watch;
  if (s.includes('tablet') || s.includes('ipad')) return Tablet;
  if (s.includes('kulaklik') || s.includes('headphone') || s.includes('airpods')) return AppleHeadphonesIcon;
  if (s.includes('parca') || s.includes('part')) return Wrench;
  return Layers;
};

export function PricingClient() {
  const t = useTranslations('Pricing');
  const locale = useLocale() as 'ar' | 'en' | 'tr';
  const isRTL = locale === 'ar';
  const { settings } = useSettings();

  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState<'all' | 'original' | 'oem' | 'compat'>('all');
  const [selectedSeries, setSelectedSeries] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [maxDbPrice, setMaxDbPrice] = useState(100000);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Table View Pagination
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 15;

  // Dynamic Banners from Admin Panel
  const [apiBanners, setApiBanners] = useState<DynamicBanner[]>([]);
  // Dynamic Services from Database
  const [systemServices, setSystemServices] = useState<any[]>([]);

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pricingRes, bannersRes, servicesRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/pricing`),
          axios.get(`${API_BASE}/banners?locale=${locale}`),
          axios.get(`${API_BASE}/content/services?locale=${locale}`)
        ]);

        // 1. Process Pricing Items (Database is single source of truth)
        if (pricingRes.status === 'fulfilled') {
          const data = (pricingRes.value.data as PricingItem[]) || [];
          setItems(data);
          if (data.length > 0) {
            const highest = Math.max(...data.map(i => i.base_price || 0));
            const ceiling = Math.ceil(highest / 1000) * 1000 || 50000;
            setMaxDbPrice(ceiling);
            setPriceRange([0, ceiling]);
          } else {
            setMaxDbPrice(0);
            setPriceRange([0, 0]);
          }
        }

        // 2. Process Dynamic Banners
        if (bannersRes.status === 'fulfilled' && Array.isArray(bannersRes.value.data)) {
          setApiBanners(bannersRes.value.data.filter((b: any) => b.active));
        }

        // 3. Process Dynamic Services
        if (servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value.data)) {
          setSystemServices(servicesRes.value.data.filter((s: any) => s.is_active));
        }
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locale]);

  // Category Tabs Configuration (Dynamically generated ONLY from services present in actual pricing items)
  const categoryTabs = useMemo(() => {
    // If no pricing items have been added to the database yet, do NOT show any category tabs
    if (!items || items.length === 0) return [];

    // Find unique categories / service slugs that actually exist in the DB items
    const presentCats = new Set<string>();
    items.forEach(item => {
      if (item.device_type) presentCats.add(item.device_type.toLowerCase().trim());
      if (item.service_slug) presentCats.add(item.service_slug.toLowerCase().trim());
    });

    // Match with system services
    const dynamicTabs = systemServices
      .filter(s => {
        const slug = (s.slug || '').toLowerCase().trim();
        return (
          presentCats.has(slug) ||
          (slug.includes('phone') && (presentCats.has('phone') || presentCats.has('telefon'))) ||
          (slug.includes('laptop') && (presentCats.has('laptop') || presentCats.has('bilgisayar') || presentCats.has('macbook'))) ||
          (slug.includes('robot') && (presentCats.has('robot') || presentCats.has('supurge'))) ||
          (slug.includes('watch') && (presentCats.has('watch') || presentCats.has('saat'))) ||
          (slug.includes('tablet') && (presentCats.has('tablet') || presentCats.has('ipad'))) ||
          (slug.includes('kulaklik') && (presentCats.has('kulaklik') || presentCats.has('headphone') || presentCats.has('airpods')))
        );
      })
      .map(s => ({
        id: s.slug,
        label: locale === 'ar' ? (s.title_ar || s.title) : locale === 'en' ? (s.title_en || s.title) : (s.title_tr || s.title),
        icon: getServiceIcon(s.slug, s.icon)
      }));

    if (dynamicTabs.length === 0) {
      const uniqueTypes = Array.from(new Set(items.map(i => i.device_type).filter(Boolean)));
      if (uniqueTypes.length > 0) {
        const itemTabs = uniqueTypes.map(type => ({
          id: type,
          label: type,
          icon: getServiceIcon(type)
        }));
        return [{ id: 'all', label: t('tab_all'), icon: Layers }, ...itemTabs];
      }
      return [];
    }

    const allTab = { id: 'all', label: t('tab_all'), icon: Layers };
    return [allTab, ...dynamicTabs];
  }, [items, systemServices, locale, t]);

  // Auto-reset selectedCategory if the selected category is no longer present in categoryTabs
  useEffect(() => {
    if (selectedCategory !== 'all' && !categoryTabs.some(c => c.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categoryTabs, selectedCategory]);

  // Reset pagination on filter change
  useEffect(() => {
    setTablePage(1);
  }, [search, selectedCategory, selectedBrand, selectedService, selectedQuality, selectedSeries, priceRange, sortBy]);

  // Derived filter collections
  const categoryFilteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    const cat = selectedCategory.toLowerCase();
    return items.filter(item => {
      const dt = (item.device_type || '').toLowerCase();
      const sSlug = (item.service_slug || '').toLowerCase();
      return dt === cat || sSlug === cat || (cat === 'phone' && (dt.includes('phone') || dt.includes('telefon')));
    });
  }, [items, selectedCategory]);

  const brands = useMemo(() => {
    return Array.from(new Set(categoryFilteredItems.map(i => i.brand))).filter(Boolean);
  }, [categoryFilteredItems]);

  const services = useMemo(() => {
    const map = new Map<string, string>();
    // Only from categoryFilteredItems (actual items added in DB)!
    categoryFilteredItems.forEach(i => {
      if (i.service_slug) {
        const name = locale === 'ar' ? (i.service_name_ar || i.service_name_tr) : locale === 'en' ? (i.service_name_en || i.service_name_tr) : i.service_name_tr;
        map.set(i.service_slug, name);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [categoryFilteredItems, locale]);

  const availableQualities = useMemo(() => {
    let hasOrig = false;
    let hasOem = false;
    let hasCompat = false;
    categoryFilteredItems.forEach(item => {
      item.quality_options?.forEach(q => {
        const name = ((q.quality_tr || '') + ' ' + (q.quality_ar || '') + ' ' + (q.quality_en || '')).toLowerCase();
        if (name.includes('orijinal') || name.includes('servis') || name.includes('وكالة') || name.includes('original')) hasOrig = true;
        if (name.includes('a+') || name.includes('oem') || name.includes('نخب')) hasOem = true;
        if (name.includes('muadil') || name.includes('incell') || name.includes('revize') || name.includes('اقتصادي') || name.includes('تجاري')) hasCompat = true;
      });
    });
    return { hasAny: hasOrig || hasOem || hasCompat, hasOrig, hasOem, hasCompat };
  }, [categoryFilteredItems]);

  // Filter items based on all criteria
  const filteredItems = useMemo(() => {
    return categoryFilteredItems.filter(item => {
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) return false;
      if (selectedService !== 'all' && item.service_slug !== selectedService) return false;
      if (selectedSeries !== 'all' && item.series !== selectedSeries) return false;

      // Price filter
      if (maxDbPrice > 0 && (item.base_price < priceRange[0] || item.base_price > priceRange[1])) return false;

      // Quality filter
      if (selectedQuality !== 'all') {
        if (selectedQuality === 'original') {
          const hasOrig = item.quality_options?.some(q => (q.quality_tr || '').toLowerCase().includes('orijinal') || (q.quality_tr || '').toLowerCase().includes('servis')) || item.notes_tr?.toLowerCase().includes('orijinal');
          if (!hasOrig && item.quality_options?.length > 0) return false;
        } else if (selectedQuality === 'oem') {
          const hasOem = item.quality_options?.some(q => (q.quality_tr || '').toLowerCase().includes('a+') || (q.quality_tr || '').toLowerCase().includes('oem'));
          if (!hasOem && item.quality_options?.length > 0) return false;
        } else if (selectedQuality === 'compat') {
          const hasCompat = item.quality_options?.some(q => (q.quality_tr || '').toLowerCase().includes('muadil') || (q.quality_tr || '').toLowerCase().includes('incell') || (q.quality_tr || '').toLowerCase().includes('revize'));
          if (!hasCompat && item.quality_options?.length > 0) return false;
        }
      }

      // Search filter
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
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.base_price - b.base_price;
      if (sortBy === 'price_desc') return b.base_price - a.base_price;
      if (a.is_popular && !b.is_popular) return -1;
      if (!a.is_popular && b.is_popular) return 1;
      return a.sort_order - b.sort_order;
    });
  }, [categoryFilteredItems, selectedBrand, selectedService, selectedSeries, selectedQuality, priceRange, maxDbPrice, search, sortBy, locale]);

  // Series List for Horizontal Chips
  const seriesList = useMemo(() => {
    const set = new Set<string>();
    categoryFilteredItems.forEach(item => {
      if (selectedBrand === 'all' || item.brand === selectedBrand) {
        if (item.series && item.series.trim()) set.add(item.series.trim());
      }
    });
    return Array.from(set);
  }, [categoryFilteredItems, selectedBrand]);

  // Table pagination calculations
  const totalTablePages = Math.max(1, Math.ceil(filteredItems.length / TABLE_PAGE_SIZE));
  const paginatedTableItems = useMemo(() => {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return filteredItems.slice(start, start + TABLE_PAGE_SIZE);
  }, [filteredItems, tablePage, TABLE_PAGE_SIZE]);

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
      if (badge === 'Ekonomik') return 'Economy';
      if (badge === 'Popüler') return 'Popular';
      if (badge === 'Orijinal') return 'Original';
      if (badge === 'Tavsiye Edilen') return 'Recommended';
      return badge;
    }
    return badge;
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

  const openWhatsAppForModel = (item: PricingItem, qualityName?: string, price?: number) => {
    const serviceName = getLocalizedServiceName(item);
    const qualityText = qualityName ? ` (${qualityName} - ${price?.toLocaleString('tr-TR')} ₺)` : '';
    const message = locale === 'ar'
      ? `مرحباً، أود الاستفسار عن خدمة ${serviceName} لجهاز ${item.model_name}${qualityText} ومعرفة إمكانية الصيانة وموعد الحجز.`
      : locale === 'en'
      ? `Hello, I would like to inquire about ${serviceName} for ${item.model_name}${qualityText} and book a repair appointment.`
      : `Merhaba, ${item.model_name} cihazım için ${serviceName}${qualityText} fiyatı ve servis randevusu almak istiyorum.`;

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

  const resetAllFilters = () => {
    setSearch('');
    setSelectedBrand('all');
    setSelectedService('all');
    setSelectedQuality('all');
    setSelectedSeries('all');
    setPriceRange([0, maxDbPrice]);
  };

  // Fallback category banner images
  const bannerFallbackImage = useMemo(() => {
    if (selectedCategory === 'parts') return '/images/parts-banner.jpg';
    if (selectedCategory === 'laptop') return '/images/laptops-banner.jpg';
    return '/images/phones-banner.jpg';
  }, [selectedCategory]);

  // Dynamic active banner selected from admin panel
  const activeBanner = useMemo(() => {
    if (!apiBanners || apiBanners.length === 0) return null;

    // 1. Check for specific category match in link (e.g. category=phone, category=laptop, /services/phone)
    if (selectedCategory !== 'all') {
      const catMatch = apiBanners.find(b => 
        b.link?.includes(`category=${selectedCategory}`) || 
        b.link?.toLowerCase().includes(selectedCategory)
      );
      if (catMatch) return catMatch;
    }

    // 2. Check for general pricing page link (/tamir-fiyatlari or /pricing)
    const pricingMatch = apiBanners.find(b => 
      b.link?.includes('/tamir-fiyatlari') || b.link?.includes('/pricing')
    );
    if (pricingMatch) return pricingMatch;

    // 3. Fallback to first active banner
    return apiBanners[0];
  }, [apiBanners, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-[#f4f4f5] selection:bg-[#E11D48] selection:text-white pb-20">
      
      {/* 1. TOP SUB-HEADER: CATEGORY TABS & SEARCH BAR (Image 1 Style) */}
      <section className="bg-[#141416] border-b border-white/5 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-lg">
        {/* Search & Actions Bar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Live Search Input (Shown only if pricing items exist in DB) */}
            {items.length > 0 ? (
              <div className="relative flex-1 max-w-2xl">
                <div className="relative flex items-center bg-[#1c1c1f] border border-white/10 rounded-md overflow-hidden focus-within:border-[#E11D48] focus-within:ring-1 focus-within:ring-[#E11D48]/50 transition-all">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={locale === 'ar' ? 'ابحث عن جهاز أو قطعة (مثل iPhone 15 شاشة، Samsung بطارية)...' : locale === 'en' ? 'Search device or part (e.g. iPhone 15 screen, Samsung battery)...' : 'Ürün / model ara... (örnek: iPhone 15 ekran, Samsung batarya)'}
                    className="w-full bg-transparent px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none text-white placeholder:text-zinc-500"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="bg-[#E11D48] hover:bg-[#be123c] text-white px-5 py-2.5 flex items-center justify-center transition-all cursor-pointer shrink-0 font-bold text-xs"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                  {locale === 'ar' ? 'TR TECH | أسعار خدمات الصيانة وقطع الغيار' : locale === 'en' ? 'TR TECH | Repair & Parts Pricing' : 'TR TECH | Tamir ve Parça Fiyatları'}
                </span>
              </div>
            )}

            {/* Top Right Quick Actions (Destek / WhatsApp, Randevu) */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 transition-all cursor-pointer"
              >
                <WhatsappIcon size={14} className="text-emerald-400" />
                <span className="hidden sm:inline">{locale === 'ar' ? 'الدعم الفني' : locale === 'en' ? 'Support' : 'Destek'}</span>
              </a>

              <a
                href={`tel:${supportPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 transition-all cursor-pointer"
              >
                <Phone size={14} className="text-[#E11D48]" />
                <span className="hidden sm:inline">{supportPhone}</span>
              </a>

              {/* Mobile Filter Toggle Button */}
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E11D48] text-white text-xs font-black shadow-md cursor-pointer"
                >
                  <SlidersHorizontal size={14} />
                  <span>{locale === 'ar' ? 'الفلاتر' : locale === 'en' ? 'Filters' : 'Filtreler'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation Pills (Shown ONLY if there are multiple actual categories with items in DB) */}
        {items.length > 0 && categoryTabs.length > 1 && (
          <div className="border-t border-white/5 bg-[#101012]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide py-2">
                <div className="flex items-center gap-1.5">
                  {categoryTabs.map((tab) => {
                    const isActive = selectedCategory === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setSelectedCategory(tab.id as any);
                          setSelectedBrand('all');
                          setSelectedSeries('all');
                        }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-extrabold tracking-wide uppercase transition-all duration-200 whitespace-nowrap cursor-pointer",
                          isActive
                            ? "bg-[#E11D48] text-white shadow-md shadow-red-500/30 scale-[1.02]"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Icon size={14} className={isActive ? "text-white" : "text-zinc-400"} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. BREADCRUMBS BAR */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Link href="/" className="hover:text-zinc-300 transition-colors">
            {locale === 'ar' ? 'الرئيسية' : locale === 'en' ? 'Home' : 'Ana Sayfa'}
          </Link>
          <ChevronRight size={13} className={cn("text-zinc-600", isRTL ? "rotate-180" : "")} />
          <span className="text-zinc-400">
            {locale === 'ar' ? 'أسعار الصيانة' : locale === 'en' ? 'Repair Pricing' : 'Tamir Fiyatları'}
          </span>
          {items.length > 0 && selectedCategory !== 'all' && (
            <>
              <ChevronRight size={13} className={cn("text-zinc-600", isRTL ? "rotate-180" : "")} />
              <span className="text-[#E11D48] font-bold capitalize">
                {categoryTabs.find(c => c.id === selectedCategory)?.label}
              </span>
            </>
          )}
          {items.length > 0 && selectedBrand !== 'all' && (
            <>
              <ChevronRight size={13} className={cn("text-zinc-600", isRTL ? "rotate-180" : "")} />
              <span className="text-white font-bold">{selectedBrand}</span>
            </>
          )}
        </div>
      </div>

      {/* 3. MAIN CATALOG SECTION WITH 2-COLUMN LAYOUT */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className={cn("flex items-start gap-6", items.length === 0 && "justify-center")}>

          {/* === LEFT SIDEBAR: FILTERS (DESKTOP) === */}
          {items.length > 0 && (
            <aside className="w-64 xl:w-72 shrink-0 hidden lg:block space-y-6">
              
              {/* Filter Group 1: Brands list with Logos */}
              {brands.length > 0 && (
                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
                    <span>{t('filter_brands')}</span>
                    <span className="text-[10px] text-zinc-600 font-bold">{brands.length}</span>
                  </h3>

                  <div className="space-y-1">
                    {/* All Brands Option */}
                    <button
                      onClick={() => setSelectedBrand('all')}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-bold transition-all cursor-pointer",
                        selectedBrand === 'all'
                          ? "bg-[#E11D48] text-white shadow-md shadow-red-500/20"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone size={15} />
                        <span>{locale === 'ar' ? 'جميع الماركات' : locale === 'en' ? 'All Brands' : 'Tüm Markalar'}</span>
                      </div>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md font-black",
                        selectedBrand === 'all' ? "bg-white/20 text-white" : "bg-white/5 text-zinc-500"
                      )}>
                        {categoryFilteredItems.length}
                      </span>
                    </button>

                    {/* Individual Brands */}
                    {brands.map(brand => {
                      const count = categoryFilteredItems.filter(i => i.brand === brand).length;
                      const isSelected = selectedBrand === brand;
                      return (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(brand)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-bold transition-all cursor-pointer",
                            isSelected
                              ? "bg-[#E11D48] text-white shadow-md shadow-red-500/20"
                              : "text-zinc-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <BrandIcon brand={brand} size={16} />
                            <span>{brand}</span>
                          </div>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-md font-black",
                            isSelected ? "bg-white/20 text-white" : "bg-white/5 text-zinc-500"
                          )}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter Group 2: Services / Part Categories */}
              {services.length > 0 && (
                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
                    {t('filter_categories')}
                  </h3>

                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
                    <button
                      onClick={() => setSelectedService('all')}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-left rtl:text-right",
                        selectedService === 'all'
                          ? "text-[#E11D48] bg-red-500/10"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <span>{t('all_services')}</span>
                      {selectedService === 'all' && <Check size={14} className="text-[#E11D48]" />}
                    </button>

                    {services.map(s => {
                      const isSelected = selectedService === s.slug;
                      return (
                        <button
                          key={s.slug}
                          onClick={() => setSelectedService(s.slug)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-left rtl:text-right",
                            isSelected
                              ? "text-[#E11D48] bg-red-500/10 font-black"
                              : "text-zinc-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <span className="truncate pr-2 rtl:pr-0 rtl:pl-2">{s.name}</span>
                          {isSelected && <Check size={14} className="text-[#E11D48] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter Group 3: Quality / Durum */}
              {availableQualities.hasAny && (
                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
                    {t('filter_condition')}
                  </h3>

                  <div className="space-y-1.5">
                    {[
                      { id: 'all', label: locale === 'ar' ? 'كافة خيارات الجودة' : locale === 'en' ? 'All Qualities' : 'Tüm Kaliteler', show: true },
                      { id: 'original', label: t('quality_original'), show: availableQualities.hasOrig },
                      { id: 'oem', label: t('quality_oem'), show: availableQualities.hasOem },
                      { id: 'compat', label: t('quality_compat'), show: availableQualities.hasCompat },
                    ].filter(q => q.show).map(q => {
                      const isSelected = selectedQuality === q.id;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQuality(q.id as any)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-left rtl:text-right",
                            isSelected
                              ? "text-[#E11D48] bg-red-500/10"
                              : "text-zinc-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <span className="truncate">{q.label}</span>
                          {isSelected ? <CheckSquare size={15} className="text-[#E11D48]" /> : <Square size={15} className="text-zinc-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter Group 4: Price Range Slider */}
              {maxDbPrice > 0 && (
                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 shadow-sm space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                    {t('filter_price')}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-bold">
                    <div className="flex-1 bg-[#1c1c1f] border border-white/10 rounded-lg px-2.5 py-1.5 text-center text-zinc-300">
                      {priceRange[0].toLocaleString('tr-TR')} ₺
                    </div>
                    <span className="text-zinc-600">-</span>
                    <div className="flex-1 bg-[#1c1c1f] border border-white/10 rounded-lg px-2.5 py-1.5 text-center text-zinc-300">
                      {priceRange[1].toLocaleString('tr-TR')} ₺
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={maxDbPrice}
                    step={100}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-[#E11D48] cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer border border-white/5"
                  >
                    <RotateCcw size={13} />
                    <span>{t('filter_clear_btn')}</span>
                  </button>
                </div>
              )}
            </aside>
          )}

          {/* === RIGHT MAIN CATALOG AREA === */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* 1. HERO PROMOTIONAL BANNER (DYNAMIC FROM ADMIN PANEL) */}
            <div className="relative rounded-lg overflow-hidden border border-white/10 bg-gradient-to-r from-[#141416] via-[#1a1416] to-[#250d12] shadow-2xl min-h-[220px] sm:min-h-[260px] flex items-center">
              {/* Background Product Render Image on the Right */}
              <div className="absolute inset-y-0 right-0 w-full sm:w-1/2 md:w-3/5 pointer-events-none opacity-40 sm:opacity-90 overflow-hidden">
                <img 
                  src={activeBanner?.image || bannerFallbackImage} 
                  alt={activeBanner?.title || "Banner Showcase"} 
                  className="w-full h-full object-cover object-center mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#141416] via-[#141416]/80 to-transparent" />
              </div>

              {/* Banner Text Content */}
              <div className="relative z-10 p-6 sm:p-8 md:p-10 max-w-xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E11D48]/20 border border-[#E11D48]/30 text-[#E11D48] text-[10px] font-black uppercase tracking-widest">
                  <Sparkles size={12} />
                  <span>
                    {locale === 'ar' ? 'قائمة أسعار TR TECH لعام 2026' : locale === 'en' ? 'TR TECH 2026 PRICING LIST' : 'TR TECH 2026 GÜNCEL LİSTE'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                  {activeBanner?.title || (
                    items.length > 0 && selectedCategory !== 'all' && systemServices.find(s => s.slug === selectedCategory)
                      ? (locale === 'ar' 
                          ? (systemServices.find(s => s.slug === selectedCategory)?.title_ar || systemServices.find(s => s.slug === selectedCategory)?.title)
                          : locale === 'en' 
                          ? (systemServices.find(s => s.slug === selectedCategory)?.title_en || systemServices.find(s => s.slug === selectedCategory)?.title)
                          : (systemServices.find(s => s.slug === selectedCategory)?.title_tr || systemServices.find(s => s.slug === selectedCategory)?.title))
                      : (locale === 'ar' ? 'أسعار الصيانة وقطع الغيار' : locale === 'en' ? 'Repair & Spare Parts Pricing' : 'Tamir ve Yedek Parça Fiyatları')
                  )}
                </h1>

                <p className="text-xs sm:text-sm font-medium text-zinc-300 leading-relaxed">
                  {activeBanner?.description || (
                    items.length > 0 && selectedCategory !== 'all' && systemServices.find(s => s.slug === selectedCategory)
                      ? (locale === 'ar' 
                          ? (systemServices.find(s => s.slug === selectedCategory)?.description_ar || systemServices.find(s => s.slug === selectedCategory)?.description_tr)
                          : locale === 'en' 
                          ? (systemServices.find(s => s.slug === selectedCategory)?.description_en || systemServices.find(s => s.slug === selectedCategory)?.description_tr)
                          : systemServices.find(s => s.slug === selectedCategory)?.description_tr)
                      : (locale === 'ar' 
                          ? 'قائمة أسعار واضحة ومحدثة لجميع خدمات صيانة الأجهزة الإلكترونية وقطع الغيار مع ضمان معتمد.' 
                          : locale === 'en' 
                          ? 'Transparent and up-to-date pricing for all device repairs and spare parts with official warranty.' 
                          : 'Tüm cihaz tamirleri ve yedek parçalar için güncel, şeffaf fiyat listesi ve resmi garanti.')
                  )}
                </p>

                {/* Optional CTA Button from Admin Banner */}
                {activeBanner?.cta && (
                  <div className="pt-1">
                    <a
                      href={activeBanner.link || '#'}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-500/20"
                    >
                      <span>{activeBanner.cta}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                {/* 4 Feature Badges */}
                <div className="pt-2 flex items-center gap-3 sm:gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300">
                    <ShieldCheck size={14} className="text-[#E11D48]" />
                    <span>{t('banner_guarantee')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300">
                    <Truck size={14} className="text-[#E11D48]" />
                    <span>{t('banner_fast')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300">
                    <Layers size={14} className="text-[#E11D48]" />
                    <span>{t('banner_range')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300">
                    <Phone size={14} className="text-[#E11D48]" />
                    <span>{t('banner_support')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BRAND QUICK-SELECT CHIPS ROW */}
            {brands.length > 0 && (
              <div className="p-3 bg-[#141416] border border-white/5 rounded-lg">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-black transition-all cursor-pointer shrink-0 border",
                      selectedBrand === 'all'
                        ? "bg-[#E11D48] text-white border-[#E11D48] shadow-md shadow-red-500/20"
                        : "bg-[#1a1a1d] text-zinc-300 border-white/5 hover:border-white/20 hover:text-white"
                    )}
                  >
                    <Smartphone size={14} />
                    <span>{locale === 'ar' ? 'جميع الماركات' : locale === 'en' ? 'All Brands' : 'Tüm Markalar'}</span>
                  </button>

                  {brands.map(brand => {
                    const isSelected = selectedBrand === brand;
                    return (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={cn(
                          "flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-black transition-all cursor-pointer shrink-0 border",
                          isSelected
                            ? "bg-[#E11D48] text-white border-[#E11D48] shadow-md shadow-red-500/20"
                            : "bg-[#1a1a1d] text-zinc-300 border-white/5 hover:border-white/20 hover:text-white"
                        )}
                      >
                        <BrandIcon brand={brand} size={15} />
                        <span>{brand}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. MODEL SERIES QUICK-FILTER ROW */}
            {seriesList.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                <button
                  onClick={() => setSelectedSeries('all')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 border",
                    selectedSeries === 'all'
                      ? "bg-white text-black border-white shadow-xs font-black"
                      : "bg-[#141416] text-zinc-400 border-white/5 hover:border-white/10 hover:text-white"
                  )}
                >
                  {t('all_models_chip')}
                </button>

                {seriesList.map(series => {
                  const isSelected = selectedSeries === series;
                  return (
                    <button
                      key={series}
                      onClick={() => setSelectedSeries(series)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 border",
                        isSelected
                          ? "bg-[#E11D48] text-white border-[#E11D48] shadow-xs font-black"
                          : "bg-[#141416] text-zinc-400 border-white/5 hover:border-white/10 hover:text-white"
                      )}
                    >
                      {series}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 4. RESULTS TOOLBAR (COUNT, SORT, VIEW TOGGLE) */}
            {filteredItems.length > 0 && (
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wide">
                    {selectedBrand !== 'all' ? selectedBrand : (locale === 'ar' ? 'قائمة الأسعار' : locale === 'en' ? 'Pricing List' : 'Ürünler')}
                  </h2>
                  <span className="text-xs font-bold text-zinc-500">
                    ({filteredItems.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#141416] border border-white/10 rounded-md px-3 py-1.5 text-xs font-bold text-zinc-300 outline-none cursor-pointer focus:border-[#E11D48]"
                  >
                    <option value="featured">{t('sort_featured')}</option>
                    <option value="price_asc">{t('sort_price_asc')}</option>
                    <option value="price_desc">{t('sort_price_desc')}</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-[#141416] p-0.5 rounded-md border border-white/10">
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      className={cn(
                        "p-1.5 rounded-lg text-xs transition-all cursor-pointer",
                        viewMode === 'cards'
                          ? "bg-[#E11D48] text-white shadow-xs"
                          : "text-zinc-400 hover:text-white"
                      )}
                      title={t('view_cards')}
                    >
                      <LayoutGrid size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={cn(
                        "p-1.5 rounded-lg text-xs transition-all cursor-pointer",
                        viewMode === 'table'
                          ? "bg-[#E11D48] text-white shadow-xs"
                          : "text-zinc-400 hover:text-white"
                      )}
                      title={t('view_table')}
                    >
                      <TableIcon size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. MAIN CONTENT: PRODUCT CARDS GRID OR TABLE */}
            {loading ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                  {t('loading_prices')}
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-[#141416] p-8 sm:p-12 text-center rounded-lg border border-white/5 max-w-xl mx-auto space-y-5 shadow-xl my-4">
                <div className="w-16 h-16 rounded-full bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20 flex items-center justify-center mx-auto">
                  <Wrench size={30} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {items.length === 0
                      ? (locale === 'ar' ? 'قائمة الأسعار قيد التحديث' : locale === 'en' ? 'Pricing Catalog Being Updated' : 'Fiyat Listesi Güncelleniyor')
                      : t('no_results')}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
                    {items.length === 0
                      ? (locale === 'ar' 
                          ? 'يتم حالياً تجهيز وتحديث قائمة أسعار وموديلات الصيانة وقطع الغيار. يمكنك التواصل معنا مباشرة للحصول على تسعيرة فورية ومخصصة لجهازك.' 
                          : locale === 'en' 
                          ? 'The pricing catalog is currently being updated. You can contact us directly for an instant custom quote for your device and original parts.' 
                          : 'Fiyat listemiz şu anda güncellenmektedir. Cihazınız ve orijinal parçalar için doğrudan WhatsApp veya telefon üzerinden anında fiyat alabilirsiniz.')
                      : t('no_results_desc')}
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  {items.length > 0 && (
                    <button
                      onClick={resetAllFilters}
                      className="px-4 py-2.5 rounded-md bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      {t('clear_filters')}
                    </button>
                  )}
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(locale === 'ar' ? 'مرحباً، أود الاستفسار عن سعر صيانة جهازي وقطع الغيار المتوفرة.' : locale === 'en' ? 'Hello, I would like to inquire about repair pricing for my device.' : 'Merhaba, cihazım için tamir ve parça fiyatı öğrenmek istiyorum.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <WhatsappIcon size={16} />
                    <span>{locale === 'ar' ? 'طلب تسعيرة فورية عبر واتساب' : locale === 'en' ? 'Instant Quote via WhatsApp' : 'WhatsApp ile Anında Fiyat Al'}</span>
                  </a>
                  <a
                    href={`tel:${supportPhone.replace(/\s/g, '')}`}
                    className="px-5 py-2.5 rounded-md bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone size={15} className="text-[#E11D48]" />
                    <span>{supportPhone}</span>
                  </a>
                </div>
              </div>
            ) : viewMode === 'cards' ? (
              /* --- 5-COLUMN PRODUCT CATALOG GRID (IMAGE 1 & 3 EXACT STYLE) --- */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
                {filteredItems.map((item) => {
                  
                  const serviceName = getLocalizedServiceName(item);
                  const isExpanded = !!expandedCards[item.id];
                  const hasQualities = item.quality_options && item.quality_options.length > 0;

                  // Quality tag badge calculation
                  const qualityTag = item.quality_options?.[0]?.badge || (item.service_slug.includes('ekran') ? 'Orijinal' : item.is_popular ? 'Popüler' : 'Cihaz');

                  return (
                    <div
                      key={item.id}
                      className="bg-[#141416] hover:bg-[#18181b] border border-white/5 hover:border-[#E11D48]/50 rounded-xl flex flex-col justify-between transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-red-500/10 relative overflow-hidden"
                    >
                      {/* 1. Full-Bleed Top Image Area (Fills upper part of card completely) */}
                      <div className="relative w-full h-48 sm:h-52 bg-[#0d0d0f] overflow-hidden flex items-center justify-center border-b border-white/5">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.model_name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1c1c20] to-[#101012]">
                            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-[#E11D48] transition-colors shadow-inner">
                              {item.service_slug.includes('ekran') ? (
                                <Smartphone size={32} strokeWidth={1.5} />
                              ) : item.service_slug.includes('batarya') ? (
                                <Wrench size={30} strokeWidth={1.5} />
                              ) : (
                                <Smartphone size={32} strokeWidth={1.5} />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Subtle bottom gradient overlay for smooth transition */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141416]/80 via-transparent to-transparent pointer-events-none" />

                        {/* Floating Top-Start Quality Badge */}
                        <div className="absolute top-3 start-3 z-10">
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-[#E11D48] text-white tracking-wider shadow-md shadow-red-500/30">
                            {getLocalizedBadge(qualityTag) || qualityTag}
                          </span>
                        </div>

                        {/* Floating Top-End Brand Badge */}
                        <div className="absolute top-3 end-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-black shadow-sm">
                          <BrandIcon brand={item.brand} size={13} />
                          <span>{item.brand}</span>
                        </div>

                        {/* Floating Popular Badge */}
                        {item.is_popular && (
                          <div className="absolute bottom-2.5 end-3 z-10">
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/90 text-black shadow-xs flex items-center gap-1">
                              <Sparkles size={10} />
                              {locale === 'ar' ? 'الأكثر طلباً' : locale === 'en' ? 'Popular' : 'Popüler'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 2. Card Content & Details with Proper Padding */}
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        {/* Title & Service Details */}
                        <div className="space-y-1 mb-3">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            {item.brand} • {item.series || item.brand}
                          </p>
                          <h3 className="text-xs sm:text-sm font-black text-white leading-snug break-words group-hover:text-red-400 transition-colors min-h-[2rem]">
                            {item.model_name}
                          </h3>
                          <p className="text-[11px] font-semibold text-zinc-400 break-words leading-tight">
                            {serviceName}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-medium truncate">
                            {hasQualities ? getLocalizedQualityName(item.quality_options[0]) : getLocalizedWarranty(item.warranty)}
                          </p>
                        </div>

                        {/* Stock / Availability Indicator */}
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-400">
                            {t('card_ready_stock')}
                          </span>
                        </div>

                        {/* Price & Primary Action: "Randevu Al" Button (Image 1 Style) */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <div className="flex items-baseline justify-between">
                            <span className="text-base sm:text-lg font-black text-white tracking-tight">
                              {item.base_price.toLocaleString('tr-TR')} {item.currency}
                            </span>
                            {hasQualities && item.quality_options.length > 1 && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(item.id)}
                                className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>+{item.quality_options.length} {locale === 'ar' ? 'خيارات' : 'Seçenek'}</span>
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            )}
                          </div>

                          {/* Collapsible Quality Options Accordion */}
                          {hasQualities && isExpanded && (
                            <div className="space-y-1 pt-1 pb-2">
                              {item.quality_options.map((q, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#101012] border border-white/5 text-[10px]"
                                >
                                  <span className="font-bold text-zinc-300 truncate pr-1">
                                    {getLocalizedQualityName(q)}
                                  </span>
                                  <span className="font-black text-white shrink-0">
                                    {q.price.toLocaleString('tr-TR')} ₺
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons: Red "Randevu Al" CTA & WhatsApp Icon */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setBookingModalItem(item);
                                setBookingForm(prev => ({
                                  ...prev,
                                  selectedQuality: hasQualities ? getLocalizedQualityName(item.quality_options[0]) : ''
                                }));
                              }}
                              className="flex-1 bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-black py-2.5 px-3 rounded-md flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20 active:scale-[0.98] transition-all cursor-pointer"
                            >
                              <Calendar size={14} />
                              <span>{t('card_book_now')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openWhatsAppForModel(item)}
                              className="p-2.5 rounded-md bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all cursor-pointer shrink-0"
                              title="WhatsApp Destek"
                            >
                              <WhatsappIcon size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* --- DETAILED TABULAR VIEW --- */
              <div className="bg-[#141416] border border-white/5 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#101012] border-b border-white/5 text-zinc-400 text-[11px] font-black uppercase tracking-wider">
                        <th className="py-3 px-4">{t('col_model')}</th>
                        <th className="py-3 px-4">{t('col_service')}</th>
                        <th className="py-3 px-4">{t('col_warranty')}</th>
                        <th className="py-3 px-4">{t('col_price')}</th>
                        <th className="py-3 px-4 text-center">{t('col_action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedTableItems.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                            <BrandIcon brand={item.brand} size={15} />
                            <span>{item.model_name}</span>
                          </td>
                          <td className="py-3 px-4 text-zinc-300 font-medium">
                            {getLocalizedServiceName(item)}
                          </td>
                          <td className="py-3 px-4 text-zinc-400">
                            {getLocalizedWarranty(item.warranty)}
                          </td>
                          <td className="py-3 px-4 font-black text-white text-sm">
                            {item.base_price.toLocaleString('tr-TR')} {item.currency}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setBookingModalItem(item);
                                setBookingForm(prev => ({
                                  ...prev,
                                  selectedQuality: item.quality_options?.[0] ? getLocalizedQualityName(item.quality_options[0]) : ''
                                }));
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#E11D48] text-white text-[11px] font-bold hover:bg-[#be123c] transition-colors cursor-pointer"
                            >
                              {t('card_book_now')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                {totalTablePages > 1 && (
                  <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                    <span>
                      {locale === 'ar' ? `صفحة ${tablePage} من ${totalTablePages}` : `Sayfa ${tablePage} / ${totalTablePages}`}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setTablePage(p => Math.max(1, p - 1))}
                        disabled={tablePage === 1}
                        className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40"
                      >
                        {locale === 'ar' ? 'السابق' : 'Önceki'}
                      </button>
                      <button
                        onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
                        disabled={tablePage === totalTablePages}
                        className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40"
                      >
                        {locale === 'ar' ? 'التالي' : 'Sonraki'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. BOTTOM TRUST BADGES (IMAGE 2 STYLE) */}
            <div className="pt-8 border-t border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#E11D48] shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wide">{t('trust_parts_title')}</h4>
                    <p className="text-[11px] text-zinc-400 leading-snug">{t('trust_parts_desc')}</p>
                  </div>
                </div>

                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#E11D48] shrink-0">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wide">{t('trust_shipping_title')}</h4>
                    <p className="text-[11px] text-zinc-400 leading-snug">{t('trust_shipping_desc')}</p>
                  </div>
                </div>

                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#E11D48] shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wide">{t('trust_warranty_title')}</h4>
                    <p className="text-[11px] text-zinc-400 leading-snug">{t('trust_warranty_desc')}</p>
                  </div>
                </div>

                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[#E11D48] shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wide">{t('trust_support_title')}</h4>
                    <p className="text-[11px] text-zinc-400 leading-snug">{t('trust_support_desc')}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* 4. MOBILE SLIDE-OUT FILTER DRAWER */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-xs bg-[#141416] border-r border-white/10 h-full p-5 overflow-y-auto space-y-5 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  {locale === 'ar' ? 'فلاتر البحث' : locale === 'en' ? 'Filters' : 'Filtreler'}
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Brands in Mobile */}
              {brands.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">
                    {t('filter_brands')}
                  </span>
                  <button
                    onClick={() => { setSelectedBrand('all'); setIsMobileFilterOpen(false); }}
                    className={cn(
                      "w-full text-left rtl:text-right px-3 py-1.5 rounded-lg text-xs font-bold",
                      selectedBrand === 'all' ? "bg-[#E11D48] text-white" : "text-zinc-300"
                    )}
                  >
                    {t('filter_all_brands')}
                  </button>
                  {brands.map(b => (
                    <button
                      key={b}
                      onClick={() => { setSelectedBrand(b); setIsMobileFilterOpen(false); }}
                      className={cn(
                        "w-full text-left rtl:text-right px-3 py-1.5 rounded-lg text-xs font-bold",
                        selectedBrand === b ? "bg-[#E11D48] text-white" : "text-zinc-300"
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}

              {/* Services in Mobile */}
              {services.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase block mb-1">
                    {t('filter_categories')}
                  </span>
                  <button
                    onClick={() => { setSelectedService('all'); setIsMobileFilterOpen(false); }}
                    className={cn(
                      "w-full text-left rtl:text-right px-3 py-1.5 rounded-lg text-xs font-bold",
                      selectedService === 'all' ? "bg-[#E11D48] text-white" : "text-zinc-300"
                    )}
                  >
                    {t('all_services')}
                  </button>
                  {services.map(s => (
                    <button
                      key={s.slug}
                      onClick={() => { setSelectedService(s.slug); setIsMobileFilterOpen(false); }}
                      className={cn(
                        "w-full text-left rtl:text-right px-3 py-1.5 rounded-lg text-xs font-bold truncate block",
                        selectedService === s.slug ? "bg-[#E11D48] text-white" : "text-zinc-300"
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Reset Filters */}
              <button
                onClick={() => { resetAllFilters(); setIsMobileFilterOpen(false); }}
                className="w-full py-2.5 rounded-md bg-white/10 text-white font-bold text-xs"
              >
                {t('filter_clear_btn')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. APPOINTMENT BOOKING MODAL */}
      <AnimatePresence>
        {bookingModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingModalItem(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#141416] border border-white/10 rounded-lg p-6 sm:p-8 z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-left rtl:text-right"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-md bg-[#E11D48]/20 border border-[#E11D48]/30 flex items-center justify-center text-[#E11D48]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{t('modal_title')}</h3>
                    <p className="text-xs text-zinc-400">
                      {bookingModalItem.brand} {bookingModalItem.model_name} • {getLocalizedServiceName(bookingModalItem)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setBookingModalItem(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Booking Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4 pt-1">
                {/* Quality selection in modal */}
                {bookingModalItem.quality_options && bookingModalItem.quality_options.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">
                      {t('modal_quality_label')}
                    </label>
                    <select
                      value={bookingForm.selectedQuality}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, selectedQuality: e.target.value }))}
                      className="w-full bg-[#1c1c1f] border border-white/10 rounded-md px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-[#E11D48]"
                    >
                      {bookingModalItem.quality_options.map((q, idx) => (
                        <option key={idx} value={getLocalizedQualityName(q)}>
                          {getLocalizedQualityName(q)} - {q.price.toLocaleString('tr-TR')} ₺
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">
                    {t('modal_name_label')}
                  </label>
                  <input
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('modal_name_placeholder')}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-md px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-[#E11D48]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">
                    {t('modal_phone_label')}
                  </label>
                  <input
                    required
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('modal_phone_placeholder')}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-md px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-[#E11D48]"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">
                    {t('modal_city_label')}
                  </label>
                  <input
                    value={bookingForm.city}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder={t('modal_city_placeholder')}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-md px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-[#E11D48]"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase block mb-1">
                    {t('modal_notes_label')}
                  </label>
                  <textarea
                    rows={2}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={t('modal_notes_placeholder')}
                    className="w-full bg-[#1c1c1f] border border-white/10 rounded-md px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-[#E11D48]"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBookingModalItem(null)}
                    className="px-4 py-2.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {t('modal_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="px-6 py-2.5 rounded-md bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-red-500/20 disabled:opacity-50"
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
