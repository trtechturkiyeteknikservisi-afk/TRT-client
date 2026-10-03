'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Smartphone, Battery, Zap, Shield, Camera, Volume2, Mic, 
  Settings, Cpu, Wrench, Heart, ShoppingBag, ArrowRight, 
  ChevronRight, SlidersHorizontal, Check, RefreshCw, Truck, Award
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { BrandIcon } from './brand-icons';
import { useStore } from './store-context';
import { 
  SPARE_PARTS_MENU, 
  IPHONE_SERIES, 
  INITIAL_STORE_PRODUCTS, 
  StoreProduct 
} from '@/lib/store-data';

export function SparePartsShop() {
  const locale = useLocale();
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  const [selectedPart, setSelectedPart] = useState<string>('ekran');
  const [selectedBrand, setSelectedBrand] = useState<string>('Apple');
  const [selectedSeries, setSelectedSeries] = useState<string>('iPhone 15 Serisi');
  const [selectedQuality, setSelectedQuality] = useState<string[]>(['Orijinal']);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [priceSlider, setPriceSlider] = useState<number>(10000);
  const [sortOrder, setSortOrder] = useState<string>('popular');
  const [liveProducts, setLiveProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLive = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_URL}/pricing`);
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: StoreProduct[] = res.data.map((item: any) => ({
            id: `db-${item.id}`,
            title_tr: item.service_name_tr || item.model_name,
            title_en: item.service_name_en || item.model_name,
            title_ar: item.service_name_ar || item.model_name,
            brand: item.brand,
            category: 'yedek_parca',
            part_type: item.part_type || (item.service_slug?.includes('ekran') ? 'ekran' : item.service_slug?.includes('batarya') ? 'batarya' : item.service_slug?.includes('kamera') ? 'kamera' : 'diger'),
            item_type: 'yedek_parca',
            series: item.series,
            model: item.model_name,
            specs_tr: item.specs_tr || item.notes_tr || 'A+ Kalite • True Tone Destekli',
            specs_en: item.specs_en || item.notes_en || 'A+ Grade • True Tone Supported',
            specs_ar: item.specs_ar || item.notes_ar || 'نخب أول A+ • تدعم ترو تون',
            price: item.base_price,
            quality: (item.quality_options?.[0]?.quality_tr?.includes('OEM') ? 'OEM' : item.quality_options?.[0]?.quality_tr?.includes('Muadil') ? 'Muadil' : 'Orijinal'),
            badge: (item.quality_options?.[0]?.quality_tr?.includes('OEM') ? 'OEM' : item.quality_options?.[0]?.quality_tr?.includes('Muadil') ? 'Muadil' : 'Orijinal'),
            in_stock: item.in_stock,
            is_popular: item.is_popular,
            image: item.image_url || '/images/spare-parts-screen.jpg'
          }));
          setLiveProducts(mapped);
        } else {
          setLiveProducts([]);
        }
      } catch (e) {
        if (isMounted) setLiveProducts([]);
      }
    };
    fetchLive();
    return () => { isMounted = false; };
  }, []);

  const allAvailableProducts = useMemo(() => {
    return liveProducts;
  }, [liveProducts]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val) + ' TL';
  };

  const partIconMap: Record<string, any> = {
    ekran: Smartphone,
    batarya: Battery,
    sarj_soketi: Zap,
    arka_kapak: Shield,
    kamera: Camera,
    hoparlor: Volume2,
    mikrofon: Mic,
    yan_tuslar: Settings,
    flex: Zap,
    anakart: Cpu,
    diger: Wrench
  };

  const brands = [
    { id: 'Apple', name: 'Apple' },
    { id: 'Samsung', name: 'Samsung' },
    { id: 'Xiaomi', name: 'Xiaomi' },
    { id: 'Oppo', name: 'Oppo' },
    { id: 'Huawei', name: 'Huawei' },
    { id: 'OnePlus', name: 'OnePlus' },
    { id: 'Diğer', name: 'Diğer Markalar' }
  ];

  const qualities = ['Orijinal', 'OEM (Yüksek Kalite)', 'Muadil'];
  const colors = ['Siyah', 'Beyaz', 'Mavi', 'Pembe', 'Diğer'];

  const toggleQuality = (q: string) => {
    const cleanQ = q.includes('OEM') ? 'OEM' : q;
    setSelectedQuality(prev => 
      prev.includes(cleanQ) ? prev.filter(item => item !== cleanQ) : [...prev, cleanQ]
    );
  };

  const toggleColor = (c: string) => {
    setSelectedColor(prev => 
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
  };

  // Filtered spare parts list
  const filteredProducts = useMemo(() => {
    return allAvailableProducts.filter((item) => {
      // Must be spare part
      if (item.category !== 'yedek_parca' && item.item_type !== 'yedek_parca') return false;

      // Part type match
      if (selectedPart !== 'all' && item.part_type && item.part_type !== selectedPart) {
        return false;
      }

      // Brand match
      if (selectedBrand !== 'Diğer' && !item.brand.toLowerCase().includes(selectedBrand.toLowerCase())) {
        return false;
      }

      // Series match
      if (selectedSeries !== 'Tüm Modeller' && item.series && item.series !== selectedSeries) {
        return false;
      }

      // Quality match
      if (selectedQuality.length > 0 && item.quality) {
        const matches = selectedQuality.some(q => item.quality?.toLowerCase().includes(q.toLowerCase()));
        if (!matches) return false;
      }

      // Price filter
      if (item.price > priceSlider) return false;

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
    });
  }, [allAvailableProducts, selectedPart, selectedBrand, selectedSeries, selectedQuality, priceSlider, sortOrder]);

  const dynamicPartsMenu = useMemo(() => {
    const list = [...SPARE_PARTS_MENU];
    const seen = new Set(list.map(p => p.id.toLowerCase()));
    liveProducts.forEach(p => {
      if (p.part_type && p.part_type.trim()) {
        const idTrimmed = p.part_type.trim();
        const idLower = idTrimmed.toLowerCase();
        if (!seen.has(idLower)) {
          seen.add(idLower);
          list.push({
            id: idTrimmed,
            label_tr: idTrimmed,
            label_en: idTrimmed,
            label_ar: idTrimmed
          });
        }
      }
    });
    return list;
  }, [liveProducts]);

  const currentPartObj = dynamicPartsMenu.find(p => p.id === selectedPart);

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-zinc-100 selection:bg-[#E11D48] selection:text-white pb-16">
      {/* 1. Secondary Category Ribbon (Matching Screenshot 2) */}
      <div className="w-full border-b border-zinc-800/80 bg-[#0F0F13]/90 backdrop-blur-md sticky top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/"
              className="text-xs font-black text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              {locale === 'ar' ? 'الرئيسية' : 'Ana Sayfa'}
            </Link>

            <Link
              href="/urun-satisi"
              className="text-xs font-black text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              {locale === 'ar' ? 'الأجهزة والمنتجات' : 'Cihazlar ˅'}
            </Link>

            {/* Active Red Tab: Yedek Parçalar */}
            <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-[#E11D48] text-white shadow-md shadow-red-950/40 whitespace-nowrap">
              {locale === 'ar' ? 'قطع الغيار' : 'Yedek Parçalar'}
            </span>

            {['Samsung', 'Xiaomi', 'Apple', 'Laptop', 'Robot Süpürge', 'Akıllı Saat', 'Kulaklık'].map((b) => (
              <button
                key={b}
                onClick={() => {
                  setSelectedBrand(b.includes('Apple') ? 'Apple' : b.includes('Samsung') ? 'Samsung' : b);
                }}
                className={cn(
                  "text-xs font-black px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer",
                  selectedBrand.toLowerCase() === b.toLowerCase()
                    ? "text-[#E11D48] bg-zinc-900 border border-zinc-800"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E11D48]/15 border border-[#E11D48]/30 text-[#E11D48] text-xs font-black shrink-0">
            <span>%</span>
            <span>{locale === 'ar' ? 'عروض خاصة' : 'Kampanyalar'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* 2. Breadcrumbs (Screenshot 2: Ana Sayfa > Yedek Parçalar > Ekran > iPhone) */}
        <div className="flex items-center gap-2 text-[11px] font-black text-zinc-500 uppercase tracking-wider">
          <Link href="/" className="hover:text-zinc-300">Ana Sayfa</Link>
          <ChevronRight size={12} className="rtl:rotate-180" />
          <Link href="/yedek-parcalar" className="hover:text-zinc-300">Yedek Parçalar</Link>
          <ChevronRight size={12} className="rtl:rotate-180" />
          <span className="text-zinc-300">{currentPartObj?.label_tr || 'Ekran'}</span>
          <ChevronRight size={12} className="rtl:rotate-180" />
          <span className="text-[#E11D48]">{selectedBrand}</span>
        </div>

        {/* 3. Main Split View: Left Sidebar & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar (Filters, Categories, Brands) */}
          <div className="lg:col-span-3 space-y-5">
            {/* 3.1 Category Vertical Menu */}
            <div className="p-4 rounded-2xl bg-[#111114] border border-zinc-800 space-y-3">
              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-800">
                <ChevronRight size={14} className="text-[#E11D48] rotate-180" />
                <span>{locale === 'ar' ? 'أقسام قطع الغيار' : 'Yedek Parçalar'}</span>
              </h3>

              <div className="space-y-1">
                {dynamicPartsMenu.map((item) => {
                  const Icon = partIconMap[item.id] || Smartphone;
                  const isActive = selectedPart === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedPart(item.id)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer",
                        isActive
                          ? "bg-[#E11D48] text-white shadow-md shadow-red-950/40"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                      )}
                    >
                      <Icon size={14} className={isActive ? "text-white" : "text-zinc-500"} />
                      <span>{locale === 'ar' ? item.label_ar : locale === 'en' ? item.label_en : item.label_tr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3.2 Brand Selector */}
            <div className="p-4 rounded-2xl bg-[#111114] border border-zinc-800 space-y-3">
              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider pb-2 border-b border-zinc-800">
                {locale === 'ar' ? 'اختر الماركة' : 'Marka Seçin'}
              </h3>

              <div className="space-y-1">
                {brands.map((b) => {
                  const isActive = selectedBrand === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.id)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl text-xs font-black flex items-center justify-between transition-all cursor-pointer",
                        isActive
                          ? "bg-[#E11D48] text-white shadow-md shadow-red-950/40"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <BrandIcon brand={b.id} size={15} />
                        <span>{b.name}</span>
                      </div>
                      {isActive && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3.3 Detailed Filters: Quality, Color, Price */}
            <div className="p-4 rounded-2xl bg-[#111114] border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-[#E11D48]" />
                  <span>{locale === 'ar' ? 'فلاتر إضافية' : 'Filtrele'}</span>
                </h3>
                <button
                  onClick={() => {
                    setSelectedQuality(['Orijinal']);
                    setSelectedColor([]);
                    setPriceSlider(10000);
                  }}
                  className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {locale === 'ar' ? 'إعادة ضبط' : 'Temizle'}
                </button>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-zinc-400 block uppercase">
                  {locale === 'ar' ? 'درجة الجودة' : 'Ürün Kalitesi'}
                </span>
                <div className="space-y-1.5">
                  {qualities.map((q) => {
                    const cleanQ = q.includes('OEM') ? 'OEM' : q;
                    const isChecked = selectedQuality.includes(cleanQ);
                    return (
                      <label
                        key={q}
                        className="flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleQuality(q)}
                          className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-[#E11D48] accent-[#E11D48] cursor-pointer"
                        />
                        <span>{q}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Color Checklist */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-[11px] font-black text-zinc-400 block uppercase">
                  {locale === 'ar' ? 'اللون' : 'Renk'}
                </span>
                <div className="space-y-1.5">
                  {colors.map((c) => {
                    const isChecked = selectedColor.includes(c);
                    return (
                      <label
                        key={c}
                        className="flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleColor(c)}
                          className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-[#E11D48] accent-[#E11D48] cursor-pointer"
                        />
                        <span>{c}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Slider */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex justify-between items-baseline text-[11px] font-black">
                  <span className="text-zinc-400 uppercase">
                    {locale === 'ar' ? 'نطاق السعر' : 'Fiyat Aralığı'}
                  </span>
                  <span className="text-[#E11D48]">{formatPrice(priceSlider)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="250"
                  value={priceSlider}
                  onChange={(e) => setPriceSlider(Number(e.target.value))}
                  className="w-full accent-[#E11D48] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                  <span>0 TL</span>
                  <span>15.000 TL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* 3.4 Category Hero Banner (Matching Screenshot 2 Exactly!) */}
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-[#121215] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-3 max-w-lg z-10">
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
                  <span className="text-white">{selectedBrand} </span>
                  <span className="text-[#E11D48]">{currentPartObj?.label_tr || 'Ekran'}</span>
                </h1>

                <p className="text-xs sm:text-sm text-zinc-400 font-bold leading-relaxed">
                  {locale === 'ar'
                    ? `قطع غيار ${selectedBrand} ${currentPartObj?.label_ar || 'شاشات'} أصلية ومضمونة بأعلى مواصفات الجودة، شحن فوري سريع لكافة مدن تركيا.`
                    : `Orijinal ve yüksek kaliteli ${selectedBrand} ${currentPartObj?.label_tr || 'ekran'} yedek parçaları, uygun fiyatlarla hemen sipariş verin.`}
                </p>

                {/* 3 Feature Badges on right / bottom */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-black text-zinc-300 bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl">
                    <Award size={14} className="text-[#E11D48]" />
                    <span>{locale === 'ar' ? 'جودة أصلية ومعادلة' : 'Kaliteli Ürünler'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black text-zinc-300 bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl">
                    <Truck size={14} className="text-[#E11D48]" />
                    <span>{locale === 'ar' ? 'شحن فوري بنفس اليوم' : 'Hızlı Kargo'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black text-zinc-300 bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-xl">
                    <Wrench size={14} className="text-[#E11D48]" />
                    <span>{locale === 'ar' ? 'دعم التركيب الفني' : 'Montaj Desteği'}</span>
                  </div>
                </div>
              </div>

              {/* Banner Visual */}
              <div className="relative w-48 sm:w-64 h-36 sm:h-44 rounded-2xl overflow-hidden border border-zinc-800/80 shrink-0">
                <img
                  src="/images/spare-parts-screen.jpg"
                  alt={`${selectedBrand} ${currentPartObj?.label_tr || 'Ekran'}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 3.5 Series Selector Pills (Screenshot 2: Horizontal scrollable series pills) */}
            <div className="space-y-2">
              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                {locale === 'ar' ? 'اختر السلسلة أو الموديل' : 'Seri ve Model Seçimi'}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {IPHONE_SERIES.map((ser) => {
                  const isActive = selectedSeries === ser;
                  return (
                    <button
                      key={ser}
                      onClick={() => setSelectedSeries(ser)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer border",
                        isActive
                          ? "bg-[#18181E] border-[#E11D48] text-white shadow-md shadow-red-950/40 ring-1 ring-[#E11D48]"
                          : "bg-[#111114] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                      )}
                    >
                      {ser}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3.6 Products Section Header & Sorting */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  {selectedSeries} {currentPartObj?.label_tr || 'Ekran'}
                </h2>
                <p className="text-[11px] text-zinc-400 font-bold">
                  {filteredProducts.length} {locale === 'ar' ? 'قطعة مطابقة متوفرة' : 'uygun yedek parça bulundu'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 font-bold hidden sm:inline">
                  {locale === 'ar' ? 'ترتيب:' : 'Sırala:'}
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 outline-hidden focus:border-[#E11D48] cursor-pointer"
                >
                  <option value="popular">{locale === 'ar' ? 'الأكثر طلباً' : 'En Popüler'}</option>
                  <option value="price-asc">{locale === 'ar' ? 'السعر: من الأقل للأعلى' : 'Fiyat: Artan'}</option>
                  <option value="price-desc">{locale === 'ar' ? 'السعر: من الأعلى للأقل' : 'Fiyat: Azalan'}</option>
                </select>
              </div>
            </div>

            {/* 3.7 Products Grid (Cards Matching Screenshot 2 Exactly!) */}
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#111114] border border-zinc-800 space-y-3">
                <Smartphone size={36} className="mx-auto text-zinc-600" />
                <p className="text-sm font-bold text-zinc-300">
                  {locale === 'ar' ? 'لا توجد قطع غيار مطابقة لهذه الفلاتر' : 'Seçilen kriterlerde yedek parça bulunamadı.'}
                </p>
                <button
                  onClick={() => {
                    setSelectedSeries('Tüm Modeller');
                    setSelectedQuality(['Orijinal']);
                    setPriceSlider(10000);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-black cursor-pointer"
                >
                  {locale === 'ar' ? 'عرض جميع الموديلات' : 'Tüm Modelleri Göster'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((item) => {
                  const fav = isFavorite(item.id);
                  return (
                    <div
                      key={item.id}
                      className="group rounded-2xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-black/50 relative"
                    >
                      {/* Top Quality Badge & Wishlist Heart */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs",
                          item.quality === 'Orijinal'
                            ? "bg-[#E11D48] text-white"
                            : item.quality === 'OEM'
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-800 text-zinc-300"
                        )}>
                          {item.quality || 'Yedek Parça'}
                        </span>

                        <button
                          onClick={() => toggleFavorite(item.id, item.title_tr)}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Heart
                            size={16}
                            className={fav ? "fill-rose-500 text-rose-500" : ""}
                          />
                        </button>
                      </div>

                      {/* Part Image */}
                      <div className="w-full h-44 rounded-xl bg-black/60 border border-zinc-800/80 overflow-hidden mb-3 relative flex items-center justify-center p-2">
                        <img
                          src={item.image}
                          alt={item.title_tr}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Details */}
                      <div className="space-y-1 mb-3">
                        <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-[#E11D48] transition-colors leading-tight line-clamp-1">
                          {locale === 'ar' ? item.title_ar : locale === 'en' ? item.title_en : item.title_tr}
                        </h3>

                        <p className="text-[11px] text-zinc-400 font-bold line-clamp-1">
                          {locale === 'ar' ? item.specs_ar : locale === 'en' ? item.specs_en : item.specs_tr}
                        </p>
                      </div>

                      {/* Price & Action */}
                      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                        <div className="flex items-baseline justify-between">
                          <span className="text-base font-black text-white tracking-tight">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{locale === 'ar' ? 'متوفر بالمخزن' : 'Stokta Var'}</span>
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            addToCart({
                              id: item.id,
                              title: item.title_tr,
                              price: item.price,
                              image: item.image,
                              brand: item.brand,
                              category: item.category,
                              quality: item.quality,
                              specs: item.specs_tr,
                              badge: item.quality,
                              item_type: 'yedek_parca'
                            })
                          }
                          className="w-full py-2.5 px-3 rounded-xl bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-red-950/40 cursor-pointer active:scale-95"
                        >
                          <ShoppingBag size={14} />
                          <span>{locale === 'ar' ? 'أضف للسلة' : 'Sepete Ekle'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
