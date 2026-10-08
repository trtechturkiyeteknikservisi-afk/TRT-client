import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Truck, CreditCard, Headphones, 
  Search, SlidersHorizontal, ShoppingBag, Heart, Check, 
  Grid, List, ChevronRight, ChevronLeft, Star, Award
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { cn, getProductUrl } from '@/lib/utils';
import { BrandIcon } from './brand-icons';
import { useStore } from './store-context';
import { useCurrency } from './currency-context';
import { ProductCard } from './product-card';
import { 
  STORE_CATEGORIES, 
  STORE_BRANDS, 
  INITIAL_STORE_PRODUCTS, 
  StoreProduct 
} from '@/lib/store-data';

interface ShopHubProps {
  initialCategory?: string;
  initialBrand?: string;
  initialSearch?: string;
}

export function ShopHub({ initialCategory, initialBrand, initialSearch }: ShopHubProps) {
  const locale = useLocale();
  const router = useRouter();
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const { formatPrice } = useCurrency();

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'all');
  const [activeBrand, setActiveBrand] = useState<string>(initialBrand || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [selectedItemType, setSelectedItemType] = useState<string>('all'); // 'all' | 'cihaz' | 'yedek_parca' | 'aksesuar'
  const [sortOrder, setSortOrder] = useState<string>('popular'); // 'popular' | 'price-asc' | 'price-desc'
  const [categories, setCategories] = useState<typeof STORE_CATEGORIES>(STORE_CATEGORIES);
  const [liveProducts, setLiveProducts] = useState<StoreProduct[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(15);
  const productsGridRef = useRef<HTMLDivElement>(null);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeBrand, selectedItemType, searchQuery, sortOrder]);

  useEffect(() => {
    let isMounted = true;
    const fetchLive = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        // Fetch dynamic categories
        try {
          const sRes: any = await axios.get(`${API_URL}/settings`);
          if (isMounted && sRes.data?.shop_categories) {
            const parsed = typeof sRes.data.shop_categories === 'string'
              ? JSON.parse(sRes.data.shop_categories)
              : sRes.data.shop_categories;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCategories(parsed);
            }
          }
        } catch (e) {}

        const res = await axios.get(`${API_URL}/pricing`);
        if (isMounted) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const mapped: StoreProduct[] = res.data.map((item: any) => ({
              id: `db-${item.id}`,
              title_tr: item.service_name_tr || item.model_name,
              title_en: item.service_name_en || item.model_name,
              title_ar: item.service_name_ar || item.model_name,
              brand: item.brand,
              category: (item.device_type === 'phone' ? 'telefon' : (item.device_type || 'yedek_parca')) as any,
              part_type: item.part_type || (item.service_slug?.includes('ekran') ? 'ekran' : item.service_slug?.includes('batarya') ? 'batarya' : item.service_slug?.includes('kamera') ? 'kamera' : 'diger'),
              item_type: item.item_type || (item.category_name_tr?.includes('Yedek') || item.service_slug?.includes('ekran') || item.service_slug?.includes('batarya') ? 'yedek_parca' : 'cihaz'),
              series: item.series,
              model: item.model_name,
              specs_tr: item.specs_tr || item.notes_tr || 'Orijinal ve Uyumlu Ürün',
              specs_en: item.specs_en || item.notes_en || 'Original & Compatible',
              specs_ar: item.specs_ar || item.notes_ar || 'منتج مضمون وعالي الجودة',
              price: item.base_price,
              max_price: item.max_price || 0,
              quality: (item.quality_options?.[0]?.quality_tr?.includes('OEM') ? 'OEM' : item.quality_options?.[0]?.quality_tr?.includes('Muadil') ? 'Muadil' : 'Orijinal'),
              show_badge: item.show_badge !== false && item.show_badge !== 0,
              badge_text_tr: item.badge_text_tr,
              badge_text_en: item.badge_text_en,
              badge_text_ar: item.badge_text_ar,
              badge: locale === 'ar' ? (item.badge_text_ar || 'أصلي') : locale === 'en' ? (item.badge_text_en || 'Original') : (item.badge_text_tr || 'Orijinal'),
              in_stock: item.in_stock,
              is_popular: item.is_popular,
              image: item.image_url || '/images/spare-parts-screen.jpg'
            }));
            setLiveProducts(mapped);
          } else {
            setLiveProducts([]);
          }
        }
      } catch (err) {
        if (isMounted) setLiveProducts([]);
      }
    };
    fetchLive();
    return () => { isMounted = false; };
  }, []);

  const allAvailableProducts = useMemo(() => {
    return liveProducts;
  }, [liveProducts]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return allAvailableProducts.filter((item) => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'yedek_parca') {
          if (item.category !== 'yedek_parca' && item.item_type !== 'yedek_parca') return false;
        } else if (item.category !== activeCategory) {
          return false;
        }
      }

      // Brand filter
      if (activeBrand !== 'all') {
        if (!item.brand.toLowerCase().includes(activeBrand.toLowerCase())) return false;
      }

      // Item type filter
      if (selectedItemType !== 'all') {
        if (item.item_type !== selectedItemType) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const t = (item.title_tr + ' ' + item.title_en + ' ' + item.title_ar + ' ' + item.brand + ' ' + item.model).toLowerCase();
        if (!t.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
    });
  }, [allAvailableProducts, activeCategory, activeBrand, selectedItemType, searchQuery, sortOrder]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    productsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const activeCategoryObj = categories.find(c => c.id === activeCategory);

  return (
    <div className="w-full min-h-screen bg-background text-foreground selection:bg-[#E11D48] selection:text-white transition-colors">
      {/* 1. Top Category Bar / Ribbon (Inspired by Screenshot 1, 2, 3) */}
      <div className="w-full border-b border-border bg-card/90 backdrop-blur-md sticky top-[65px] z-30">
        <div className="w-full mx-auto px-4 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-[1536px] py-2 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link
              href="/"
              className="text-xs font-black text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              {locale === 'ar' ? 'الرئيسية' : 'Ana Sayfa'}
            </Link>

            <button
              onClick={() => {
                setActiveCategory('all');
                setActiveBrand('all');
                setSelectedItemType('all');
              }}
              className={cn(
                "text-xs font-black px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer",
                activeCategory === 'all'
                  ? "bg-[#E11D48] text-white shadow-md shadow-red-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {locale === 'ar' ? 'كافة المنتجات' : 'Tüm Ürünler'}
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'yedek_parca') {
                    router.push('/yedek-parcalar');
                  } else {
                    setActiveCategory(cat.id);
                  }
                }}
                className={cn(
                  "text-xs font-black px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer",
                  activeCategory === cat.id
                    ? "bg-[#E11D48] text-white shadow-md shadow-red-950/40"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                )}
              >
                {locale === 'ar' ? cat.title_ar : locale === 'en' ? cat.title_en : cat.title_tr}
              </button>
            ))}

            <Link
              href="/tamir-fiyatlari"
              className="text-xs font-black text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              {locale === 'ar' ? 'قائمة الأسعار' : 'Fiyat Listesi'}
            </Link>
          </div>

          {/* Quick Kampanyalar Badge */}
          <div className="hidden md:flex items-center gap-1 px-3 py-1 rounded-md bg-[#E11D48]/15 border border-[#E11D48]/30 text-[#E11D48] text-xs font-black shrink-0">
            <span>%</span>
            <span>{locale === 'ar' ? 'عروض 2026' : 'Fırsat Ürünleri'}</span>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-[1536px] py-6 sm:py-8 space-y-12">
        {/* 2. Hero Section (Screenshot 1: Teknoloji Ürünleri ve Yedek Parçalar) */}
        {activeCategory === 'all' && (
          <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#121215] shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[380px] sm:min-h-[440px]">
              {/* Left Column: Heading & CTA */}
              <div className="lg:col-span-6 p-6 sm:p-10 md:p-12 space-y-4 sm:space-y-6 z-10">
                <div className="flex items-center gap-2">
                  <span className="h-0.5 w-6 bg-[#E11D48]" />
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E11D48]">
                    TR TECH 2026
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-5xl font-black uppercase tracking-tight leading-[1.15]">
                  <span className="text-white block">
                    {locale === 'ar' ? 'أحدث المنتجات' : 'Teknoloji Ürünleri'}
                  </span>
                  <span className="text-[#E11D48] block">
                    {locale === 'ar' ? 'وقطع الغيار الأصلية' : 've Yedek Parçalar'}
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed font-bold">
                  {locale === 'ar'
                    ? 'منتجات أصلية ومتوافقة بأعلى معايير الجودة، تشكيلة واسعة من الأجهزة وقطع الغيار بأسعار منافسة وضمان حقيقي لدى TR TECH.'
                    : 'Orijinal ve uyumlu ürünler, geniş ürün yelpazesi ve uygun fiyatlarla şimdi TR TECH’de.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="#categories"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-950/50 cursor-pointer active:scale-95"
                  >
                    <span>{locale === 'ar' ? 'استعراض المنتجات' : 'Ürünleri İncele'}</span>
                    <ArrowRight size={15} />
                  </a>

                  <button
                    onClick={() => {
                      setActiveCategory('yedek_parca');
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <span>{locale === 'ar' ? 'كتالوج قطع الغيار' : 'Yedek Parça Kataloğu'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: High Tech Showcase Visual */}
              <div className="lg:col-span-6 relative h-[280px] sm:h-[380px] lg:h-full w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#121215] via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-radial from-[#E11D48]/20 via-transparent to-transparent opacity-60 pointer-events-none" />
                <img
                  src="/images/shop-hero.jpg"
                  alt="TR TECH Ürün Satışı ve Yedek Parçalar"
                  className="w-full h-full object-cover object-center lg:object-right transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Category Horizontal Cards (Screenshot 1: 7 Distinct Category Cards) */}
        <div id="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {locale === 'ar' ? 'الأقسام والمنتجات الرئيسية' : 'Kategoriler'}
              </h2>
              <p className="text-xs text-zinc-400 font-bold mt-0.5">
                {locale === 'ar' ? 'اختر القسم للوصول السريع للأجهزة وقطع الغيار' : 'İhtiyacınız olan ürün veya yedek parçayı seçin'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                }}
                className={cn(
                  "group relative h-44 sm:h-48 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-end p-3.5 shadow-xs",
                  activeCategory === cat.id
                    ? "border-[#E11D48] ring-2 ring-[#E11D48] shadow-lg shadow-red-500/20 scale-[1.02]"
                    : "border-zinc-800/80 hover:border-[#E11D48]/60 hover:shadow-md hover:scale-[1.02]"
                )}
              >
                {/* Category Image - Fills 100% of the Box with Zero Gaps */}
                <img
                  src={cat.image}
                  alt={cat.title_tr}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay for Maximum Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                {/* Circular Red Arrow in Corner */}
                <div className={cn(
                  "absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all",
                  activeCategory === cat.id
                    ? "bg-[#E11D48] text-white scale-110 shadow-red-500/40"
                    : "bg-black/50 backdrop-blur-xs text-white border border-white/20 group-hover:bg-[#E11D48] group-hover:border-[#E11D48] group-hover:scale-110"
                )}>
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </div>

                {/* Text Info Overlay at Bottom */}
                <div className="relative z-10 space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-[#E11D48] transition-colors leading-tight drop-shadow-sm">
                    {locale === 'ar' ? cat.title_ar : locale === 'en' ? cat.title_en : cat.title_tr}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-zinc-300 font-bold leading-snug line-clamp-1 drop-shadow-xs">
                    {locale === 'ar' ? cat.desc_ar : locale === 'en' ? cat.desc_en : cat.desc_tr}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Brands Grid / Carousel (Screenshot 1: Markalara Göre Ürünleri İncele) */}
        <div className="space-y-3.5 p-5 sm:p-6 rounded-lg bg-[#111114] border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
              <span>{locale === 'ar' ? 'استعراض المنتجات حسب الماركة' : 'Markalara Göre Ürünleri İncele'}</span>
            </h3>

            <button
              onClick={() => setActiveBrand('all')}
              className="text-xs font-black text-[#E11D48] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{locale === 'ar' ? 'كافة الماركات' : 'Tüm Markalar'}</span>
              <ArrowRight size={12} className="rtl:rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 sm:gap-2.5">
            {STORE_BRANDS.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBrand(activeBrand === b.id ? 'all' : b.id)}
                className={cn(
                  "p-2.5 rounded-md border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group",
                  activeBrand === b.id
                    ? "bg-[#E11D48]/15 border-[#E11D48] text-white shadow-md shadow-red-950/40"
                    : "bg-[#16161B] border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white"
                )}
              >
                <div className="h-6 flex items-center justify-center">
                  <BrandIcon brand={b.id} size={18} />
                </div>
                <span className="text-[10px] font-black tracking-tight truncate max-w-full">
                  {b.name.replace(' / Apple', '')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Products Header & Filter Bar (Matching Screenshot 3) */}
        <div ref={productsGridRef} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {locale === 'ar' ? 'المنتجات' : 'Ürünler'}{' '}
                <span className="text-zinc-500 text-base font-bold">({filteredProducts.length})</span>
              </h2>

              {/* Type Pills: Cihaz / Yedek Parça / Aksesuar */}
              <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-md text-xs font-black">
                {[
                  { id: 'all', label: locale === 'ar' ? 'الكل' : 'Hepsi' },
                  { id: 'cihaz', label: locale === 'ar' ? 'أجهزة' : 'Cihaz' },
                  { id: 'yedek_parca', label: locale === 'ar' ? 'قطع غيار' : 'Yedek Parça' },
                  { id: 'aksesuar', label: locale === 'ar' ? 'إكسسوارات' : 'Aksesuar' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedItemType(type.id)}
                    className={cn(
                      "px-3 py-1 rounded-md transition-all cursor-pointer",
                      selectedItemType === type.id
                        ? "bg-[#E11D48] text-white shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={locale === 'ar' ? 'ابحث في المعروضات...' : 'Ürünlerde ara...'}
                  className="px-3 py-1.5 pl-8 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-[#E11D48] outline-hidden font-bold w-40 sm:w-56"
                />
                <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 outline-hidden focus:border-[#E11D48] cursor-pointer"
              >
                <option value="popular">{locale === 'ar' ? 'الأكثر طلباً' : 'Öne Çıkanlar'}</option>
                <option value="price-asc">{locale === 'ar' ? 'السعر: من الأقل للأعلى' : 'Fiyat: Artan'}</option>
                <option value="price-desc">{locale === 'ar' ? 'السعر: من الأعلى للأقل' : 'Fiyat: Azalan'}</option>
              </select>
            </div>
          </div>

          {/* 6. Product Cards Grid (Matching Screenshot 2 & 3 Exactly!) */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-lg bg-[#111114] border border-zinc-800 space-y-3">
              <ShoppingBag size={36} className="mx-auto text-zinc-600" />
              <p className="text-base font-bold text-zinc-300">
                {locale === 'ar' ? 'لم يتم العثور على منتجات مطابقة' : 'Aradığınız kriterlere uygun ürün bulunamadı'}
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveBrand('all');
                  setSelectedItemType('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-md bg-[#E11D48] text-white text-xs font-black cursor-pointer"
              >
                {locale === 'ar' ? 'إعادة ضبط الفلاتر' : 'Filtreleri Temizle'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {filteredProducts.length > 0 && totalPages > 1 && (
            <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-zinc-400">
                {locale === 'ar' ? (
                  <span>
                    عرض <span className="text-white font-black">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-white font-black">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> من أصل <span className="text-[#E11D48] font-black">{filteredProducts.length}</span> منتج
                  </span>
                ) : locale === 'en' ? (
                  <span>
                    Showing <span className="text-white font-black">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-white font-black">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="text-[#E11D48] font-black">{filteredProducts.length}</span> products
                  </span>
                ) : (
                  <span>
                    <span className="text-[#E11D48] font-black">{filteredProducts.length}</span> üründen <span className="text-white font-black">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-white font-black">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> arası gösteriliyor
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-3 py-2 rounded-md text-xs font-black transition-all flex items-center gap-1 border",
                    currentPage === 1
                      ? "border-zinc-800/60 text-zinc-600 cursor-not-allowed bg-zinc-900/30"
                      : "border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 bg-[#121215] cursor-pointer active:scale-95"
                  )}
                >
                  <ChevronLeft size={14} className="rtl:rotate-180" />
                  <span className="hidden sm:inline">{locale === 'ar' ? 'السابق' : locale === 'en' ? 'Prev' : 'Önceki'}</span>
                </button>

                {getPageNumbers().map((pNum, idx) => {
                  if (pNum === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-zinc-600 font-bold select-none">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = currentPage === pNum;
                  return (
                    <button
                      key={`page-${pNum}`}
                      onClick={() => handlePageChange(pNum as number)}
                      className={cn(
                        "w-9 h-9 rounded-md text-xs font-black transition-all cursor-pointer border flex items-center justify-center",
                        isCurrent
                          ? "bg-[#E11D48] text-white border-[#E11D48] shadow-lg shadow-red-950/50 scale-105"
                          : "bg-[#121215] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                      )}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-3 py-2 rounded-md text-xs font-black transition-all flex items-center gap-1 border",
                    currentPage === totalPages
                      ? "border-zinc-800/60 text-zinc-600 cursor-not-allowed bg-zinc-900/30"
                      : "border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 bg-[#121215] cursor-pointer active:scale-95"
                  )}
                >
                  <span className="hidden sm:inline">{locale === 'ar' ? 'التالي' : locale === 'en' ? 'Next' : 'Sonraki'}</span>
                  <ChevronRight size={14} className="rtl:rotate-180" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="hidden md:inline">{locale === 'ar' ? 'لكل صفحة:' : 'Sayfa Başı:'}</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-md bg-[#111114] border border-zinc-800 text-xs font-bold text-zinc-300 outline-hidden focus:border-[#E11D48] cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 7. Bottom Trust Badges Bar (Screenshot 1: 4 Trust Badges) */}
        <div className="p-6 sm:p-8 rounded-lg bg-[#111114] border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-md bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">
                {locale === 'ar' ? 'منتجات أصلية ومتوافقة' : 'Orijinal ve Uyumlu Ürünler'}
              </h4>
              <p className="text-[11px] text-zinc-400 font-bold mt-0.5">
                {locale === 'ar' ? 'مستوردة من مصادر معتمدة وموثوقة' : 'Güvenilir kaynaklardan temin edilir.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-md bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">
                {locale === 'ar' ? 'شحن سريع ومجاني' : 'Hızlı Kargo'}
              </h4>
              <p className="text-[11px] text-zinc-400 font-bold mt-0.5">
                {locale === 'ar' ? 'توصيل لكافة مدن ومحافظات تركيا' : 'Tüm Türkiye’ye hızlı teslimat.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-md bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] flex items-center justify-center shrink-0">
              <CreditCard size={24} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">
                {locale === 'ar' ? 'دفع آمن ومتعدد' : 'Güvenli Ödeme'}
              </h4>
              <p className="text-[11px] text-zinc-400 font-bold mt-0.5">
                {locale === 'ar' ? 'خيارات الدفع عند الاستلام والحوالة والبطاقة' : 'Kredi kartı, kapıda ödeme ve havale.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-md bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] flex items-center justify-center shrink-0">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">
                {locale === 'ar' ? 'دعم فني واستشارة' : 'Uzman Desteği'}
              </h4>
              <p className="text-[11px] text-zinc-400 font-bold mt-0.5">
                {locale === 'ar' ? 'فريق متخصص لمساعدتك في اختيار القطعة المناسبة' : 'Ürün seçimi ve montaj konusunda destek.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
