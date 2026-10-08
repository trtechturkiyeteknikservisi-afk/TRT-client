'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, Heart, ShoppingBag, Grid, 
  List, ChevronRight, ChevronLeft, ShieldCheck, Truck, Headphones, 
  Check, ArrowRight, Smartphone, Laptop, Watch, Battery, 
  Zap, Shield, Camera, Volume2, Mic, Settings, Cpu, 
  Wrench, RefreshCw, Award, Filter, X, ChevronDown, Layers,
  CheckCircle2
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { cn, getProductUrl } from '@/lib/utils';
import { BrandIcon } from './brand-icons';
import { useStore } from './store-context';
import { useCurrency } from './currency-context';
import { ProductCard } from './product-card';
import { getLocalizedUrl } from '@/lib/localized-routes';
import { 
  STORE_CATEGORIES, 
  STORE_BRANDS,
  SPARE_PARTS_MENU,
  IPHONE_SERIES,
  INITIAL_STORE_PRODUCTS, 
  StoreProduct 
} from '@/lib/store-data';

interface CategoryShopViewProps {
  categorySlug?: string;
  initialBrand?: string;
  initialSearch?: string;
  initialPart?: string;
}

export function CategoryShopView({ 
  categorySlug = 'all', 
  initialBrand = 'all',
  initialSearch = '',
  initialPart = 'all'
}: CategoryShopViewProps) {
  const locale = useLocale();
  const router = useRouter();
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const { formatPrice, currentCurrency, currencySymbol } = useCurrency();

  // Active filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || 'all');
  const [selectedPart, setSelectedPart] = useState<string>(initialPart || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand || 'all');
  const [selectedSeries, setSelectedSeries] = useState<string>('Tüm Modeller');
  const [selectedTypeFilters, setSelectedTypeFilters] = useState<string[]>(['all']);
  const [selectedQuality, setSelectedQuality] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(75000);
  const [priceSlider, setPriceSlider] = useState<number>(75000);
  const [searchVal, setSearchVal] = useState<string>(initialSearch || '');
  const [sortOrder, setSortOrder] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [showAllTypes, setShowAllTypes] = useState<boolean>(false);
  const [isPartsExpanded, setIsPartsExpanded] = useState<boolean>(false);
  const [isBrandsExpanded, setIsBrandsExpanded] = useState<boolean>(false);
  const [categories, setCategories] = useState<typeof STORE_CATEGORIES>(STORE_CATEGORIES);
  const [liveProducts, setLiveProducts] = useState<StoreProduct[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(16);
  const productsGridRef = useRef<HTMLDivElement>(null);
  const seriesScrollRef = useRef<HTMLDivElement>(null);

  // Dynamic Category Banners (Attached directly per category in Admin Panel)
  const categoryBanners = useMemo(() => {
    // If a specific category is selected, prioritize its custom banner
    if (selectedCategory !== 'all') {
      const sel = selectedCategory.toLowerCase();
      const cat: any = categories.find(c => c.id.toLowerCase() === sel) 
        || STORE_CATEGORIES.find(c => c.id.toLowerCase() === sel)
        || categories.find(c => (c.id === 'telefon' && sel === 'phone') || (c.id === 'laptop' && sel === 'computer'))
        || STORE_CATEGORIES.find(c => (c.id === 'telefon' && sel === 'phone'));
      if (cat) {
        const title = (locale === 'ar' ? cat.banner_title_ar : locale === 'en' ? cat.banner_title_en : cat.banner_title_tr) 
          || (locale === 'ar' ? (cat.title_ar || cat.name_ar) : locale === 'en' ? (cat.title_en || cat.name_en) : (cat.title_tr || cat.name_tr));
        const desc = (locale === 'ar' ? cat.banner_desc_ar : locale === 'en' ? cat.banner_desc_en : cat.banner_desc_tr) 
          || (locale === 'ar' ? 'قطع غيار وإكسسوارات معتمدة بأعلى معايير الجودة مع ضمان المنتج وشحن وتوصيل سريع.' : locale === 'en' ? 'Certified spare parts and accessories with product warranty and fast delivery.' : 'Orijinal ve A+ kalite parçalar. Resmi ürün garantisi ve hızlı teslimat.');
        const cta = (locale === 'ar' ? cat.banner_cta_ar : locale === 'en' ? cat.banner_cta_en : cat.banner_cta_tr) 
          || (locale === 'ar' ? 'استعراض المنتجات' : locale === 'en' ? 'Browse Products' : 'Ürünleri İncele');
        const img = cat.banner_image || cat.image || '/images/shop-hero.jpg';
        return [{
          categoryId: cat.id,
          title,
          description: desc,
          image: img,
          cta
        }];
      } else {
        return [{
          categoryId: selectedCategory,
          title: locale === 'ar' ? `قسم ${selectedCategory}` : `${selectedCategory} Kategorisi`,
          description: locale === 'ar' ? 'استعراض أحدث الأجهزة وقطع الغيار الأصلية المضمونة بأفضل الأسعار.' : 'Orijinal ve garantili ürünler en iyi fiyat avantajıyla.',
          image: '/images/shop-hero.jpg',
          cta: locale === 'ar' ? 'استعراض المنتجات' : 'Ürünleri İncele'
        }];
      }
    }

    // When "all" categories are shown, rotate through all categories that have banners
    const list = categories
      .filter(c => c.banner_image || c.image)
      .map((cat: any) => {
        const title = (locale === 'ar' ? cat.banner_title_ar : locale === 'en' ? cat.banner_title_en : cat.banner_title_tr) || (locale === 'ar' ? (cat.title_ar || cat.name_ar) : locale === 'en' ? (cat.title_en || cat.name_en) : (cat.title_tr || cat.name_tr));
        const desc = (locale === 'ar' ? cat.banner_desc_ar : locale === 'en' ? cat.banner_desc_en : cat.banner_desc_tr) || (locale === 'ar' ? 'قطع غيار وإكسسوارات معتمدة بأعلى معايير الجودة مع ضمان المنتج وشحن وتوصيل سريع.' : locale === 'en' ? 'Certified spare parts and accessories with product warranty and fast delivery.' : 'Orijinal ve A+ kalite parçalar. Resmi ürün garantisi ve hızlı teslimat.');
        const catName = locale === 'ar' ? (cat.title_ar || cat.name_ar) : locale === 'en' ? (cat.title_en || cat.name_en) : (cat.title_tr || cat.name_tr);
        const cta = (locale === 'ar' ? cat.banner_cta_ar : locale === 'en' ? cat.banner_cta_en : cat.banner_cta_tr) || (locale === 'ar' ? `استعراض ${catName || 'المنتجات'}` : locale === 'en' ? `Browse ${catName || 'Products'}` : `${catName} Ürünlerini İncele`);
        return {
          categoryId: cat.id,
          title,
          description: desc,
          image: cat.banner_image || cat.image,
          cta
        };
      });

    return list;
  }, [categories, selectedCategory, locale]);

  const [currentBannerIdx, setCurrentBannerIdx] = useState<number>(0);

  // Reset banner index when category selection changes
  useEffect(() => {
    setCurrentBannerIdx(0);
  }, [selectedCategory]);

  // Auto-rotate category banners every 6 seconds when multiple exist
  useEffect(() => {
    if (categoryBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIdx(prev => (prev + 1) % categoryBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [categoryBanners.length]);

  const handleBannerCtaClick = (bannerCatId?: string) => {
    if (bannerCatId && selectedCategory !== bannerCatId) {
      setSelectedCategory(bannerCatId);
      setSelectedPart('all');
    }
    productsGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedPart,
    selectedBrand,
    selectedSeries,
    selectedTypeFilters,
    selectedQuality,
    selectedColors,
    minPrice,
    maxPrice,
    priceSlider,
    searchVal,
    sortOrder
  ]);

  // Comprehensive, shallow URL updater reflecting all active filters in the browser URL
  const updateUrlWithFilters = (updated: {
    category?: string;
    part?: string;
    brand?: string;
    series?: string;
    types?: string[];
    quality?: string[];
    q?: string;
    sort?: string;
  }, replace = false) => {
    if (typeof window === 'undefined') return;

    const nextCat = updated.category !== undefined ? updated.category : selectedCategory;
    const nextPart = updated.part !== undefined ? updated.part : selectedPart;
    const nextBrand = updated.brand !== undefined ? updated.brand : selectedBrand;
    const nextSeries = updated.series !== undefined ? updated.series : selectedSeries;
    const nextTypes = updated.types !== undefined ? updated.types : selectedTypeFilters;
    const nextQuality = updated.quality !== undefined ? updated.quality : selectedQuality;
    const nextQ = updated.q !== undefined ? updated.q : searchVal;
    const nextSort = updated.sort !== undefined ? updated.sort : sortOrder;

    const basePath = getLocalizedUrl('/urunler', locale);
    const currentPath = window.location.pathname;
    const isCategorySubpath = categorySlug && categorySlug !== 'all' && currentPath.includes(`/${categorySlug}`);

    let targetPath = currentPath;
    if (isCategorySubpath && updated.category !== undefined && updated.category !== categorySlug) {
      targetPath = basePath;
    }

    const params = new URLSearchParams();

    // 1. Category (only as query param if not in category subpath and not 'all')
    if (targetPath === basePath && nextCat && nextCat !== 'all') {
      params.set('category', nextCat);
    }

    // 2. Part (e.g. part=ekran, part=batarya)
    if (nextPart && nextPart !== 'all') {
      params.set('part', nextPart);
    }

    // 3. Brand (e.g. brand=Apple)
    if (nextBrand && nextBrand !== 'all') {
      params.set('brand', nextBrand);
    }

    // 4. Series (e.g. series=iPhone 15)
    if (nextSeries && nextSeries !== 'Tüm Modeller' && nextSeries !== 'All Models' && nextSeries !== 'كافة الموديلات') {
      params.set('series', nextSeries);
    }

    // 5. Types (e.g. type=yedek_parca)
    if (nextTypes && nextTypes.length > 0 && !nextTypes.includes('all')) {
      params.set('type', nextTypes.join(','));
    }

    // 6. Quality (e.g. quality=Orijinal)
    if (nextQuality && nextQuality.length > 0) {
      params.set('quality', nextQuality.join(','));
    }

    // 7. Search query
    if (nextQ && nextQ.trim()) {
      params.set('q', nextQ.trim());
    }

    // 8. Sort
    if (nextSort && nextSort !== 'popular') {
      params.set('sort', nextSort);
    }

    const queryString = params.toString();
    const finalUrl = queryString ? `${targetPath}?${queryString}` : targetPath;

    if (replace) {
      window.history.replaceState({
        category: nextCat,
        part: nextPart,
        brand: nextBrand,
        series: nextSeries,
        types: nextTypes,
        quality: nextQuality,
        q: nextQ,
        sort: nextSort
      }, '', finalUrl);
    } else {
      window.history.pushState({
        category: nextCat,
        part: nextPart,
        brand: nextBrand,
        series: nextSeries,
        types: nextTypes,
        quality: nextQuality,
        q: nextQ,
        sort: nextSort
      }, '', finalUrl);
    }
  };

  // In-page category selection handler with SEO-friendly shallow URL update
  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedPart('all');
    setCurrentPage(1);
    updateUrlWithFilters({ category: catId, part: 'all' });
    productsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // In-page part selection handler (e.g. ekran, batarya, etc.)
  const handlePartSelect = (partId: string) => {
    setSelectedPart(partId);
    setCurrentPage(1);
    updateUrlWithFilters({ part: partId });
  };

  // In-page brand selection handler (e.g. Apple, Samsung, etc.)
  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
    setCurrentPage(1);
    updateUrlWithFilters({ brand: brandId });
  };

  // In-page series selection handler (e.g. iPhone 15, etc.)
  const handleSeriesSelect = (seriesName: string) => {
    setSelectedSeries(seriesName);
    setCurrentPage(1);
    updateUrlWithFilters({ series: seriesName });
  };

  // Sync when URL query parameter changes (popstate or direct URL visit)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const syncFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const urlCat = params.get('category');
        const urlPart = params.get('part');
        const urlBrand = params.get('brand');
        const urlSeries = params.get('series');
        const urlType = params.get('type');
        const urlQuality = params.get('quality');
        const urlQ = params.get('q');
        const urlSort = params.get('sort');

        if (urlCat) {
          setSelectedCategory(urlCat);
        } else if (categorySlug) {
          setSelectedCategory(categorySlug);
        }

        setSelectedPart(urlPart || initialPart || 'all');
        setSelectedBrand(urlBrand || initialBrand || 'all');
        if (urlSeries) setSelectedSeries(urlSeries);
        if (urlType) setSelectedTypeFilters(urlType.split(',').filter(Boolean));
        if (urlQuality) setSelectedQuality(urlQuality.split(',').filter(Boolean));
        if (urlQ !== null) setSearchVal(urlQ);
        if (urlSort) setSortOrder(urlSort);
      };

      syncFromUrl();

      const handlePopState = () => {
        syncFromUrl();
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    } else if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  }, [categorySlug, initialBrand, initialPart]);

  // Debounced search query sync to URL (replaces state so it doesn't pollute history)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const currentUrlQ = new URLSearchParams(window.location.search).get('q') || '';
        if (searchVal.trim() !== currentUrlQ.trim()) {
          updateUrlWithFilters({ q: searchVal }, true);
        }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchVal]);

  // Fetch live products, dynamic categories & real service banners from backend
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

        // 1. Fetch dynamic categories (with their custom banners) from settings
        try {
          const sRes: any = await axios.get(`${API_URL}/settings`);
          if (isMounted && sRes.data?.shop_categories) {
            const parsed = typeof sRes.data.shop_categories === 'string'
              ? JSON.parse(sRes.data.shop_categories)
              : sRes.data.shop_categories;
            if (Array.isArray(parsed) && parsed.length > 0) {
              const merged = parsed.map((cat: any) => {
                const fallback = STORE_CATEGORIES.find(c => c.id === cat.id);
                return {
                  ...fallback,
                  ...cat,
                  banner_image: cat.banner_image || fallback?.banner_image || cat.image || '',
                  banner_title_tr: cat.banner_title_tr || fallback?.banner_title_tr || cat.name_tr || fallback?.title_tr || '',
                  banner_title_en: cat.banner_title_en || fallback?.banner_title_en || cat.name_en || fallback?.title_en || '',
                  banner_title_ar: cat.banner_title_ar || fallback?.banner_title_ar || cat.name_ar || fallback?.title_ar || '',
                  banner_desc_tr: cat.banner_desc_tr || fallback?.banner_desc_tr || '',
                  banner_desc_en: cat.banner_desc_en || fallback?.banner_desc_en || '',
                  banner_desc_ar: cat.banner_desc_ar || fallback?.banner_desc_ar || '',
                  banner_cta_tr: cat.banner_cta_tr || fallback?.banner_cta_tr || '',
                  banner_cta_en: cat.banner_cta_en || fallback?.banner_cta_en || '',
                  banner_cta_ar: cat.banner_cta_ar || fallback?.banner_cta_ar || '',
                  desc_ar: cat.desc_ar || fallback?.desc_ar || '',
                  desc_tr: cat.desc_tr || fallback?.desc_tr || '',
                  desc_en: cat.desc_en || fallback?.desc_en || '',
                  specs_ar: cat.specs_ar || (fallback as any)?.specs_ar || '',
                  specs_tr: cat.specs_tr || (fallback as any)?.specs_tr || '',
                  specs_en: cat.specs_en || (fallback as any)?.specs_en || '',
                };
              });
              setCategories(merged);
            }
          }
        } catch (e) {}

        const res = await axios.get(`${API_URL}/pricing`);
        if (isMounted) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const mapped: StoreProduct[] = res.data.map((item: any) => {
              const imagesList = Array.isArray(item.images) && item.images.length > 0 
                ? item.images 
                : (item.image_url ? [item.image_url] : []);

              return {
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
                specs_ar: item.specs_ar || item.notes_ar || 'أجهزة وقطع غيار أصلية',
                description_tr: item.description_tr || item.notes_tr || '',
                description_en: item.description_en || item.notes_en || '',
                description_ar: item.description_ar || item.notes_ar || '',
                price: item.base_price,
                max_price: item.max_price || 0,
                quality: (item.quality_options?.[0]?.quality_tr?.includes('OEM') ? 'OEM' : item.quality_options?.[0]?.quality_tr?.includes('Muadil') ? 'Muadil' : 'Orijinal'),
                show_badge: item.show_badge !== false && item.show_badge !== 0,
                badge_text_tr: item.badge_text_tr ?? (item.quality_options?.[0]?.quality_tr?.includes('OEM') ? 'OEM' : item.quality_options?.[0]?.quality_tr?.includes('Muadil') ? 'Muadil' : item.item_type === 'cihaz' ? 'Cihaz' : item.item_type === 'aksesuar' ? 'Aksesuar' : 'Orijinal'),
                badge_text_en: item.badge_text_en ?? (item.quality_options?.[0]?.quality_en?.includes('OEM') ? 'OEM' : item.quality_options?.[0]?.quality_en?.includes('Compatible') ? 'Compatible' : item.item_type === 'cihaz' ? 'Device' : item.item_type === 'aksesuar' ? 'Accessory' : 'Original'),
                badge_text_ar: item.badge_text_ar ?? (item.quality_options?.[0]?.quality_ar?.includes('OEM') ? 'OEM' : item.quality_options?.[0]?.quality_ar?.includes('تجاري') ? 'تجاري' : item.item_type === 'cihaz' ? 'جهاز' : item.item_type === 'aksesuar' ? 'إكسسوار' : 'أصلي'),
                badge: locale === 'ar' ? (item.badge_text_ar || 'أصلي') : locale === 'en' ? (item.badge_text_en || 'Original') : (item.badge_text_tr || 'Orijinal'),
                in_stock: item.in_stock ?? true,
                is_popular: item.is_popular,
                image: imagesList[0] || item.image_url || '/images/phones-category.jpg',
                images: imagesList
              };
            });
            setLiveProducts(mapped);
          } else {
            // User deleted all templates or table is empty -> show empty!
            setLiveProducts([]);
          }
        }
      } catch (e) {
        if (isMounted) setLiveProducts([]);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [locale]);

  // SINGLE SOURCE OF TRUTH: Only display actual products from database
  const allAvailableProducts = useMemo(() => {
    return liveProducts;
  }, [liveProducts]);

  const scrollSeries = (direction: 'left' | 'right') => {
    if (!seriesScrollRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    const adjusted = locale === 'ar' ? -offset : offset;
    seriesScrollRef.current.scrollBy({ left: adjusted, behavior: 'smooth' });
  };

  // Icon mapping for parts
  const partIconMap: Record<string, any> = {
    all: Layers,
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

  // Min & Max prices derived strictly from actual products in database
  const minAvailablePrice = useMemo(() => {
    if (allAvailableProducts.length === 0) return 0;
    return Math.min(...allAvailableProducts.map(p => p.price || 0));
  }, [allAvailableProducts]);

  const maxAvailablePrice = useMemo(() => {
    if (allAvailableProducts.length === 0) return 75000;
    const highest = Math.max(...allAvailableProducts.map(p => p.price || 0));
    return Math.ceil(highest / 500) * 500 || 75000;
  }, [allAvailableProducts]);

  // Sync price slider range when products load
  useEffect(() => {
    if (allAvailableProducts.length > 0) {
      setMinPrice(minAvailablePrice);
      setMaxPrice(maxAvailablePrice);
      setPriceSlider(maxAvailablePrice);
    }
  }, [minAvailablePrice, maxAvailablePrice, allAvailableProducts.length]);

  // Dynamic spare parts list strictly derived from actual products in database
  const dynamicPartsMenu = useMemo(() => {
    if (allAvailableProducts.length === 0) return [];

    const distinctParts = Array.from(
      new Set(allAvailableProducts.map(p => p.part_type?.trim()).filter(Boolean))
    ) as string[];

    if (distinctParts.length === 0) return [];

    const partsList = distinctParts.map(id => {
      const known = SPARE_PARTS_MENU.find(m => m.id.toLowerCase() === id.toLowerCase());
      return {
        id,
        label_tr: known?.label_tr || id,
        label_en: known?.label_en || id,
        label_ar: known?.label_ar || id,
      };
    });

    return [
      { id: 'all', label_tr: 'Tüm Parçalar & Ürünler', label_en: 'All Parts & Products', label_ar: 'كافة المنتجات والقطع' },
      ...partsList
    ];
  }, [allAvailableProducts]);

  // Dynamic Brand Options strictly derived from actual products in database
  const brandOptions = useMemo(() => {
    if (allAvailableProducts.length === 0) return [];

    const distinctBrands = Array.from(
      new Set(allAvailableProducts.map(p => p.brand?.trim()).filter(Boolean))
    ) as string[];

    if (distinctBrands.length === 0) return [];

    return [
      { id: 'all', name: locale === 'ar' ? 'كافة الماركات' : locale === 'en' ? 'All Brands' : 'Tüm Markalar' },
      ...distinctBrands.map(b => ({ id: b, name: b }))
    ];
  }, [allAvailableProducts, locale]);

  // Dynamic Horizontal series quick filter pills derived strictly from actual products in database
  const seriesOptions = useMemo(() => {
    if (allAvailableProducts.length === 0) return [];

    const distinctSeries = Array.from(
      new Set(
        allAvailableProducts
          .filter(p => selectedBrand === 'all' || p.brand?.toLowerCase() === selectedBrand.toLowerCase())
          .map(p => p.series?.trim())
          .filter(Boolean)
      )
    ) as string[];

    if (distinctSeries.length === 0) return [];

    return [
      locale === 'ar' ? 'كافة الموديلات' : locale === 'en' ? 'All Models' : 'Tüm Modeller',
      ...distinctSeries
    ];
  }, [allAvailableProducts, selectedBrand, locale]);

  // Dynamic Quality filter options strictly derived from actual products in database
  const qualityOptions = useMemo(() => {
    if (allAvailableProducts.length === 0) return [];

    const distinctQualities = Array.from(
      new Set(allAvailableProducts.map(p => p.quality?.trim()).filter(Boolean))
    ) as string[];

    if (distinctQualities.length === 0) return [];

    const qualityLabels: Record<string, { tr: string; ar: string; en: string }> = {
      'Orijinal': { tr: 'Orijinal', ar: 'أصلي', en: 'Original' },
      'OEM': { tr: 'OEM (Yüksek Kalite)', ar: 'OEM (نخب أول عالي الجودة)', en: 'OEM (High Quality)' },
      'Muadil': { tr: 'Muadil', ar: 'معادل / متوافق', en: 'Compatible' },
      'Çıkma': { tr: 'Çıkma (Orijinal)', ar: 'مستعمل أصلي (مفكوك)', en: 'Original Used / Pull' }
    };

    return distinctQualities.map(q => ({
      id: q,
      label_tr: qualityLabels[q]?.tr || q,
      label_ar: qualityLabels[q]?.ar || q,
      label_en: qualityLabels[q]?.en || q
    }));
  }, [allAvailableProducts]);

  // Dynamic Color options strictly derived from actual products in database
  const colorOptions = useMemo(() => {
    if (allAvailableProducts.length === 0) return [];

    const distinctColors = Array.from(
      new Set(allAvailableProducts.map(p => p.color?.trim()).filter(Boolean))
    ) as string[];

    if (distinctColors.length === 0) return [];

    const colorLabels: Record<string, { tr: string; ar: string; en: string }> = {
      'Siyah': { tr: 'Siyah', ar: 'أسود', en: 'Black' },
      'Beyaz': { tr: 'Beyaz', ar: 'أبيض', en: 'White' },
      'Mavi': { tr: 'Mavi', ar: 'أزرق', en: 'Blue' },
      'Pembe': { tr: 'Pembe', ar: 'وردي', en: 'Pink' },
      'Gri': { tr: 'Gri', ar: 'رمادي', en: 'Gray' },
      'Kırmızı': { tr: 'Kırmızı', ar: 'أحمر', en: 'Red' },
      'Yeşil': { tr: 'Yeşil', ar: 'أخضر', en: 'Green' },
      'Altın': { tr: 'Altın', ar: 'ذهبي', en: 'Gold' },
      'Gümüş': { tr: 'Gümüş', ar: 'فضي', en: 'Silver' },
      'Diğer': { tr: 'Diğer Renkler', ar: 'ألوان أخرى', en: 'Other Colors' }
    };

    return distinctColors.map(c => ({
      id: c,
      label_tr: colorLabels[c]?.tr || c,
      label_ar: colorLabels[c]?.ar || c,
      label_en: colorLabels[c]?.en || c
    }));
  }, [allAvailableProducts]);

  // Dynamic Type filter options strictly derived from actual products in database
  const dynamicTypeOptions = useMemo(() => {
    if (allAvailableProducts.length === 0) return [];

    const distinctTypes = new Set<string>();
    allAvailableProducts.forEach(p => {
      if (p.item_type && p.item_type.trim()) distinctTypes.add(p.item_type.trim());
      if (p.part_type && p.part_type.trim()) distinctTypes.add(p.part_type.trim());
    });

    if (distinctTypes.size === 0) return [];

    const fallbackLabels: Record<string, { tr: string; ar: string; en: string }> = {
      cihaz: { tr: 'Cihaz', ar: 'أجهزة', en: 'Devices' },
      yedek_parca: { tr: 'Yedek Parça', ar: 'قطع غيار', en: 'Spare Parts' },
      aksesuar: { tr: 'Aksesuar ve Kılıf', ar: 'إكسسوارات وكفرات', en: 'Accessories' },
      ekran: { tr: 'Ekran', ar: 'شاشات', en: 'Screen' },
      batarya: { tr: 'Batarya', ar: 'بطاريات', en: 'Battery' },
      kamera: { tr: 'Kamera', ar: 'كاميرات', en: 'Camera' },
      sarj_soketi: { tr: 'Şarj Soketi', ar: 'منافذ الشحن', en: 'Charging Port' },
      arka_kapak: { tr: 'Arka Kapak', ar: 'أغطية خلفية', en: 'Back Cover' },
      hoparlor: { tr: 'Hoparlör', ar: 'سماعات خارجية', en: 'Speaker' },
      mikrofon: { tr: 'Mikrofon', ar: 'ميكروفون', en: 'Microphone' },
      yan_tuslar: { tr: 'Yan Tuşlar', ar: 'أزرار جانبية', en: 'Side Buttons' },
      flex: { tr: 'Flex Kablo', ar: 'فلاتات وكيابل', en: 'Flex Cable' },
      anakart: { tr: 'Anakart', ar: 'لوحة أم', en: 'Motherboard' },
      diger: { tr: 'Diğer', ar: 'أخرى', en: 'Other' }
    };

    return Array.from(distinctTypes).map(t => ({
      id: t,
      label_tr: fallbackLabels[t.toLowerCase()]?.tr || t,
      label_ar: fallbackLabels[t.toLowerCase()]?.ar || t,
      label_en: fallbackLabels[t.toLowerCase()]?.en || t,
    }));
  }, [allAvailableProducts]);

  // Whether any sidebar filters are applicable
  const hasSidebarFilters = useMemo(() => {
    return allAvailableProducts.length > 0 && (
      dynamicPartsMenu.length > 1 || 
      brandOptions.length > 1 || 
      dynamicTypeOptions.length > 0 || 
      qualityOptions.length > 0 || 
      colorOptions.length > 0 ||
      maxAvailablePrice > minAvailablePrice
    );
  }, [allAvailableProducts.length, dynamicPartsMenu.length, brandOptions.length, dynamicTypeOptions.length, qualityOptions.length, colorOptions.length, maxAvailablePrice, minAvailablePrice]);

  const toggleTypeFilter = (id: string) => {
    setSelectedTypeFilters(prev => {
      let next: string[];
      if (prev.includes(id)) {
        const filtered = prev.filter(x => x !== id);
        next = filtered.length === 0 ? ['all'] : filtered;
      } else {
        const filtered = prev.filter(x => x !== 'all');
        next = [...filtered, id];
      }
      updateUrlWithFilters({ types: next });
      return next;
    });
  };

  const toggleQuality = (id: string) => {
    setSelectedQuality(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      updateUrlWithFilters({ quality: next });
      return next;
    });
  };

  const toggleColor = (id: string) => {
    setSelectedColors(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedPart('all');
    setSelectedBrand('all');
    setSelectedSeries(seriesOptions[0] || 'Tüm Modeller');
    setSelectedTypeFilters(['all']);
    setSelectedQuality([]);
    setSelectedColors([]);
    setMinPrice(minAvailablePrice);
    setPriceSlider(maxAvailablePrice);
    setSearchVal('');
    setCurrentPage(1);
    updateUrlWithFilters({
      category: 'all',
      part: 'all',
      brand: 'all',
      series: 'Tüm Modeller',
      types: ['all'],
      quality: [],
      q: '',
      sort: 'popular'
    });
  };

  // Main filtering logic
  const filteredProducts = useMemo(() => {
    return allAvailableProducts.filter((item) => {
      // 1. Category match
      if (selectedCategory !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        const isMatch = itemCat === selCat || 
          ((itemCat === 'phone' || itemCat === 'telefon') && (selCat === 'phone' || selCat === 'telefon'));
        if (selCat === 'yedek_parca') {
          if (item.category !== 'yedek_parca' && item.item_type !== 'yedek_parca') return false;
        } else if (!isMatch) {
          return false;
        }
      }

      // 2. Part type match (from Left Sidebar Parts Menu)
      if (selectedPart !== 'all') {
        const pType = (item.part_type || '').toLowerCase();
        const selPart = selectedPart.toLowerCase();
        const titleLower = ((item.title_tr || '') + ' ' + (item.specs_tr || '') + ' ' + (item.title_en || '')).toLowerCase();
        const match = pType === selPart || titleLower.includes(selPart);
        if (!match) return false;
      }

      // 3. Brand match
      if (selectedBrand !== 'all') {
        if (selectedBrand === 'Diğer') {
          if (['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Huawei', 'OnePlus', 'Realme', 'Honor', 'Roborock'].some(b => item.brand.toLowerCase().includes(b.toLowerCase()))) {
            return false;
          }
        } else if (!item.brand.toLowerCase().includes(selectedBrand.toLowerCase())) {
          return false;
        }
      }

      // 4. Series match
      const defaultSeriesLabel = seriesOptions[0] || 'Tüm Modeller';
      if (selectedSeries !== defaultSeriesLabel && selectedSeries !== 'Tüm Modeller' && selectedSeries !== 'All Models' && selectedSeries !== 'كافة الموديلات') {
        const itemSeries = (item.series || '').toLowerCase();
        const itemModel = (item.model || '').toLowerCase();
        const itemTitle = (item.title_tr || '').toLowerCase();
        const sKey = selectedSeries.replace(/Serisi|Series|سلسلة/gi, '').trim().toLowerCase();
        if (!itemSeries.includes(sKey) && !itemModel.includes(sKey) && !itemTitle.includes(sKey)) {
          return false;
        }
      }

      // 5. Type filter checklist
      if (!selectedTypeFilters.includes('all')) {
        const matchesType = selectedTypeFilters.some((f) => {
          if (f === 'cihaz') return item.item_type === 'cihaz';
          if (f === 'yedek_parca') return item.item_type === 'yedek_parca';
          if (f === 'aksesuar') return item.item_type === 'aksesuar';
          if (item.part_type === f) return true;
          return false;
        });
        if (!matchesType) return false;
      }

      // 6. Quality checklist
      if (selectedQuality.length > 0) {
        const q = (item.quality || '').toLowerCase();
        const matchesQ = selectedQuality.some(sq => q.includes(sq.toLowerCase()));
        if (!matchesQ) return false;
      }

      // 7. Color checklist
      if (selectedColors.length > 0) {
        const c = ((item.color || '') + ' ' + item.title_tr + ' ' + item.specs_tr).toLowerCase();
        const matchesC = selectedColors.some(sc => c.includes(sc.toLowerCase()));
        if (!matchesC) return false;
      }

      // 8. Price slider
      if (item.price < minPrice || item.price > priceSlider) {
        return false;
      }

      // 9. Search text
      if (searchVal.trim()) {
        const q = searchVal.toLowerCase().trim();
        const fullText = (
          (item.title_tr || '') + ' ' + 
          (item.title_ar || '') + ' ' + 
          (item.title_en || '') + ' ' + 
          (item.brand || '') + ' ' + 
          (item.model || '') + ' ' + 
          (item.specs_tr || '') + ' ' + 
          (item.specs_ar || '') + ' ' + 
          (item.specs_en || '')
        ).toLowerCase();
        if (!fullText.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'price-asc') return a.price - b.price;
      if (sortOrder === 'price-desc') return b.price - a.price;
      if (sortOrder === 'newest') return (b.id > a.id ? 1 : -1);
      return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
    });
  }, [allAvailableProducts, selectedCategory, selectedPart, selectedBrand, selectedSeries, selectedTypeFilters, selectedQuality, selectedColors, minPrice, priceSlider, searchVal, sortOrder]);

  const activeCategoryObj = categories.find(c => c.id === selectedCategory) || STORE_CATEGORIES.find(c => c.id === selectedCategory);
  const activePartObj = dynamicPartsMenu.find(p => p.id === selectedPart);

  // Dynamic hero banner title & description
  const bannerTitle = useMemo(() => {
    if (selectedPart !== 'all' && activePartObj) {
      const partName = locale === 'ar' ? activePartObj.label_ar : locale === 'en' ? activePartObj.label_en : activePartObj.label_tr;
      const brandName = selectedBrand !== 'all' ? selectedBrand : '';
      return { main: brandName || (locale === 'ar' ? 'قطع غيار' : 'Yedek Parça'), highlight: partName };
    }
    if (selectedCategory !== 'all' && activeCategoryObj) {
      const catName = locale === 'ar' ? activeCategoryObj.title_ar : locale === 'en' ? activeCategoryObj.title_en : activeCategoryObj.title_tr;
      return { main: locale === 'ar' ? 'قسم' : 'Kategori', highlight: catName };
    }
    return { 
      main: locale === 'ar' ? 'المنتجات والأسعار' : locale === 'en' ? 'Products & Pricing' : 'Ürünler ve Parçalar', 
      highlight: locale === 'ar' ? 'الأصلية والمضمونة' : locale === 'en' ? 'Original & Guaranteed' : 'TR TECH' 
    };
  }, [selectedPart, activePartObj, selectedCategory, activeCategoryObj, selectedBrand, locale]);

  const bannerImage = useMemo(() => {
    if (selectedPart === 'ekran' || selectedPart === 'batarya') return '/images/spare-parts-screen.jpg';
    if (selectedCategory === 'laptop') return '/images/laptops-banner.jpg';
    if (selectedCategory === 'yedek_parca') return '/images/parts-banner.jpg';
    if (selectedCategory === 'telefon') return '/images/phones-category.jpg';
    return '/images/shop-hero.jpg';
  }, [selectedPart, selectedCategory]);

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

  return (
    <div className="w-full min-h-screen bg-background text-foreground selection:bg-[#E11D48] selection:text-white pb-20 transition-colors">
      <div className="w-full mx-auto px-4 sm:px-6 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-[1536px] py-6 space-y-6">
        {/* 2. TOP IN-PAGE SEARCH BAR */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateUrlWithFilters({ q: searchVal });
                }
              }}
              placeholder={
                locale === 'ar' 
                  ? 'ابحث عن منتج، موديل أو قطعة غيار... (مثال: شاشة آيفون 15، بطارية سامسونج S23)' 
                  : 'Ürün, model veya parça ara... (örnek: iPhone 15 ekran, Samsung batarya)'
              }
              className="w-full px-4 py-3 pl-11 rounded-md bg-card border border-border text-xs sm:text-sm font-bold text-foreground placeholder:text-muted-foreground focus:border-[#E11D48] outline-hidden shadow-xs transition-colors"
            />
            <Search size={18} className="absolute left-4 top-3.5 text-muted-foreground" />
            {searchVal && (
              <button
                onClick={() => {
                  setSearchVal('');
                  updateUrlWithFilters({ q: '' });
                }}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={() => updateUrlWithFilters({ q: searchVal })}
            className="w-full sm:w-auto px-7 py-3 rounded-md bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-500/20 transition-all active:scale-95"
          >
            <Search size={15} />
            <span>{locale === 'ar' ? 'بحث' : 'Ara'}</span>
          </button>
        </div>

        {/* 3. BREADCRUMBS */}
        <div className="flex items-center gap-2 text-[11px] font-black text-muted-foreground uppercase tracking-wider overflow-x-auto no-scrollbar py-1">
          <Link href="/" className="hover:text-foreground whitespace-nowrap">
            {locale === 'ar' ? 'الرئيسية' : locale === 'en' ? 'Home' : 'Ana Sayfa'}
          </Link>
          <ChevronRight size={12} className="rtl:rotate-180 shrink-0" />
          <Link href="/urunler" className="hover:text-foreground whitespace-nowrap">
            {locale === 'ar' ? 'المنتجات والأسعار' : locale === 'en' ? 'Products & Pricing' : 'Ürünler ve Fiyatlar'}
          </Link>
          {selectedCategory !== 'all' && (
            <>
              <ChevronRight size={12} className="rtl:rotate-180 shrink-0" />
              <span className="text-[#E11D48] whitespace-nowrap font-black">
                {locale === 'ar' ? (activeCategoryObj?.title_ar || activeCategoryObj?.title_tr) : locale === 'en' ? (activeCategoryObj?.title_en || activeCategoryObj?.title_tr) : activeCategoryObj?.title_tr}
              </span>
            </>
          )}
          {selectedPart !== 'all' && (
            <>
              <ChevronRight size={12} className="rtl:rotate-180 shrink-0" />
              <span className="text-foreground whitespace-nowrap">
                {locale === 'ar' ? (activePartObj?.label_ar || activePartObj?.label_tr) : locale === 'en' ? (activePartObj?.label_en || activePartObj?.label_tr) : activePartObj?.label_tr}
              </span>
            </>
          )}
          {selectedBrand !== 'all' && (
            <>
              <ChevronRight size={12} className="rtl:rotate-180 shrink-0" />
              <span className="text-foreground whitespace-nowrap">{selectedBrand}</span>
            </>
          )}
        </div>

        {/* 4. DYNAMIC CATEGORY HERO BANNER (Managed in Admin Panel with Categories) */}
        {categoryBanners.length > 0 && categoryBanners[currentBannerIdx] && (
          <div className="relative rounded-lg overflow-hidden border border-border bg-card shadow-lg">
            <div 
              onClick={() => handleBannerCtaClick(categoryBanners[currentBannerIdx]?.categoryId)}
              className="relative w-full cursor-pointer overflow-hidden group select-none"
            >
              {/* Clean, Full-Opacity Category Banner Image */}
              <img
                src={categoryBanners[currentBannerIdx]?.image}
                alt={categoryBanners[currentBannerIdx]?.title || 'Category Banner'}
                className="w-full h-auto min-h-[160px] sm:min-h-[220px] max-h-[380px] object-cover object-center group-hover:scale-[1.01] transition-transform duration-500 block"
              />

              {/* Banner Carousel Controls (Side Arrows + Dots) if multiple */}
              {categoryBanners.length > 1 && (
                <>
                  <div className="absolute top-1/2 -translate-y-1/2 left-3 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBannerIdx(prev => (prev === 0 ? categoryBanners.length - 1 : prev - 1));
                      }}
                      aria-label="Previous banner"
                      className="w-8 h-8 rounded-md bg-black/60 hover:bg-[#E11D48] text-white flex items-center justify-center border border-zinc-700/80 backdrop-blur-md transition-all cursor-pointer shadow-md"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  </div>

                  <div className="absolute top-1/2 -translate-y-1/2 right-3 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBannerIdx(prev => (prev + 1) % categoryBanners.length);
                      }}
                      aria-label="Next banner"
                      className="w-8 h-8 rounded-md bg-black/60 hover:bg-[#E11D48] text-white flex items-center justify-center border border-zinc-700/80 backdrop-blur-md transition-all cursor-pointer shadow-md"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs">
                    {categoryBanners.map((_, bIdx) => (
                      <button
                        key={bIdx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentBannerIdx(bIdx);
                        }}
                        aria-label={`Go to slide ${bIdx + 1}`}
                        className={cn(
                          "h-1.5 rounded-full transition-all cursor-pointer",
                          bIdx === currentBannerIdx ? "w-6 bg-[#E11D48]" : "w-1.5 bg-white/60 hover:bg-white"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 5. CATEGORY CARDS (ALWAYS AVAILABLE ON THE SAME PAGE WITH DEDICATED LINKS) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
              <span>{locale === 'ar' ? 'الأقسام والمنتجات الرئيسية' : locale === 'en' ? 'Main Categories' : 'Kategoriler'}</span>
            </h2>

            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className="text-xs font-black text-[#E11D48] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{locale === 'ar' ? '✕ عرض كافة الأقسام' : locale === 'en' ? '✕ View All Categories' : '✕ Tüm Kategorileri Göster'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {/* All Categories Card */}
            <a
              href={getLocalizedUrl('/urunler', locale)}
              onClick={(e) => {
                e.preventDefault();
                handleCategorySelect('all');
              }}
              className={cn(
                "group relative h-40 sm:h-44 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-end p-3.5 shadow-xs hover:shadow-md",
                selectedCategory === 'all'
                  ? "border-[#E11D48] ring-2 ring-[#E11D48]/50 shadow-md shadow-red-500/20 scale-[1.02] bg-card"
                  : "border-border hover:border-[#E11D48]/60 bg-card/60"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                <Layers size={36} className={cn("transition-transform duration-300 group-hover:scale-110", selectedCategory === 'all' ? "text-[#E11D48]" : "text-zinc-500")} />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

              {selectedCategory === 'all' && (
                <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 z-10 px-2 py-0.5 rounded bg-[#E11D48] text-white text-[9px] font-black uppercase shadow-xs">
                  {locale === 'ar' ? 'الكل' : 'Tümü'}
                </div>
              )}

              <div className="relative z-10 space-y-0.5">
                <h3 className={cn("text-xs sm:text-sm font-black transition-colors leading-tight", selectedCategory === 'all' ? "text-[#E11D48]" : "text-white group-hover:text-[#E11D48]")}>
                  {locale === 'ar' ? 'كافة الأقسام' : locale === 'en' ? 'All Categories' : 'Tüm Kategoriler'}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-zinc-300 font-bold leading-snug line-clamp-1">
                  {allAvailableProducts.length} {locale === 'ar' ? 'منتج متاح' : 'ürün'}
                </p>
              </div>
            </a>

            {/* Individual Category Cards */}
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              const base = getLocalizedUrl('/urunler', locale);
              const catLink = `${base}?category=${cat.id}`;

              return (
                <a
                  key={cat.id}
                  href={catLink}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategorySelect(cat.id);
                  }}
                  className={cn(
                    "group relative h-40 sm:h-44 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-end p-3.5 shadow-xs hover:shadow-md",
                    isSelected
                      ? "border-[#E11D48] ring-2 ring-[#E11D48]/50 shadow-md shadow-red-500/20 scale-[1.02]"
                      : "border-border hover:border-[#E11D48]/60 hover:scale-[1.02]"
                  )}
                >
                  {/* Category Image - Fills 100% of the Box */}
                  <img
                    src={cat.image}
                    alt={cat.title_tr}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Dark Gradient Overlay for Maximum Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                  {/* Active Badge if Selected */}
                  {isSelected ? (
                    <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 z-10 px-2 py-0.5 rounded bg-[#E11D48] text-white text-[9px] font-black uppercase shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>{locale === 'ar' ? 'محدد' : 'Seçili'}</span>
                    </div>
                  ) : (
                    <div className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all bg-black/50 backdrop-blur-xs text-white border border-white/20 group-hover:bg-[#E11D48] group-hover:border-[#E11D48] group-hover:scale-110">
                      <ArrowRight size={13} className="rtl:rotate-180" />
                    </div>
                  )}

                  {/* Text Info Overlay at Bottom */}
                  <div className="relative z-10 space-y-0.5">
                    <h3 className={cn("text-xs sm:text-sm font-black transition-colors leading-tight drop-shadow-sm", isSelected ? "text-[#E11D48]" : "text-white group-hover:text-[#E11D48]")}>
                      {locale === 'ar' ? cat.title_ar : locale === 'en' ? cat.title_en : cat.title_tr}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-300 font-bold leading-snug line-clamp-1 drop-shadow-xs">
                      {locale === 'ar' ? cat.desc_ar : locale === 'en' ? cat.desc_en : cat.desc_tr}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Active Category Status Bar if a specific category is selected */}
          {selectedCategory !== 'all' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#E11D48]/30 bg-card/90 shadow-xs mt-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-pulse" />
                <span className="text-xs sm:text-sm font-black text-foreground">
                  {locale === 'ar' 
                    ? `تصفح منتجات قسم: ${activeCategoryObj?.title_ar || activeCategoryObj?.title_tr || selectedCategory}` 
                    : locale === 'en' 
                      ? `Browsing category: ${activeCategoryObj?.title_en || activeCategoryObj?.title_tr || selectedCategory}` 
                      : `Kategori Ürünleri: ${activeCategoryObj?.title_tr || selectedCategory}`}
                </span>
                <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {filteredProducts.length} {locale === 'ar' ? 'منتج' : 'ürün'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className="text-xs font-black text-[#E11D48] hover:text-[#be123c] px-3 py-1 rounded-md bg-[#E11D48]/10 hover:bg-[#E11D48]/20 transition-all cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
              >
                <span>✕</span>
                <span>{locale === 'ar' ? 'إلغاء التحديد وعرض الكل' : locale === 'en' ? 'Clear & View All' : 'Filtreyi Kaldır'}</span>
              </button>
            </div>
          )}

          {/* Active Category Description & Rich Specifications */}
          {selectedCategory !== 'all' && activeCategoryObj && (() => {
            const catDesc = locale === 'ar' 
              ? (activeCategoryObj.desc_ar || activeCategoryObj.desc_tr) 
              : locale === 'en' 
                ? (activeCategoryObj.desc_en || activeCategoryObj.desc_tr) 
                : activeCategoryObj.desc_tr;
            const catSpecs = locale === 'ar' 
              ? ((activeCategoryObj as any).specs_ar || (activeCategoryObj as any).specs_tr) 
              : locale === 'en' 
                ? ((activeCategoryObj as any).specs_en || (activeCategoryObj as any).specs_tr) 
                : (activeCategoryObj as any).specs_tr;

            if (!catDesc && !catSpecs) return null;

            return (
              <div className="p-4 sm:p-5 rounded-xl border border-border bg-card/80 shadow-xs space-y-3.5 mt-2">
                {catDesc && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                      <span>{locale === 'ar' ? 'عن هذا القسم' : locale === 'en' ? 'About this Category' : 'Bu Kategori Hakkında'}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                      {catDesc}
                    </p>
                  </div>
                )}

                {catSpecs && (
                  <div className="space-y-1.5 pt-1">
                    <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-2">
                      <Wrench size={13} className="text-[#E11D48]" />
                      <span>{locale === 'ar' ? 'المواصفات والمعايير الفنية للقسم' : locale === 'en' ? 'Category Specifications' : 'Kategori Teknik Özellikleri'}</span>
                    </h4>
                    <div className="overflow-x-auto p-4 rounded-xl bg-muted/15 border border-border/60">
                      <div 
                        className="specs-html-content text-xs sm:text-sm"
                        dangerouslySetInnerHTML={{ __html: catSpecs }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* 6. HORIZONTAL SERIES / BRAND CAROUSEL (With Side Arrows and No Scrollbar) */}
        {seriesOptions.length > 1 && (
          <div className="relative group/series">
            <button
              type="button"
              onClick={() => scrollSeries('left')}
              aria-label="Scroll series left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-md bg-card hover:bg-[#E11D48] text-foreground hover:text-white flex items-center justify-center border border-border shadow-md transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <div 
              ref={seriesScrollRef}
              className="flex items-center gap-2 overflow-x-auto px-10 pb-2 no-scrollbar scroll-smooth"
            >
              {seriesOptions.map((s) => {
                const isActive = selectedSeries === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleSeriesSelect(s)}
                    className={cn(
                      "px-4 py-2.5 rounded-md text-xs font-black transition-all shrink-0 cursor-pointer border flex items-center gap-2",
                      isActive
                        ? "bg-card border-[#E11D48] text-foreground shadow-xs ring-1 ring-[#E11D48]"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-[#E11D48]/40"
                    )}
                  >
                    <span>{s}</span>
                    {isActive && <Check size={12} className="text-[#E11D48]" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollSeries('right')}
              aria-label="Scroll series right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-md bg-card hover:bg-[#E11D48] text-foreground hover:text-white flex items-center justify-center border border-border shadow-md transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* MOBILE TOGGLE FOR SIDEBAR FILTERS */}
        {hasSidebarFilters && (
          <div className="lg:hidden flex items-center justify-between p-3 rounded-md bg-card border border-border">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="flex items-center gap-2 text-xs font-black text-white bg-[#E11D48] hover:bg-[#be123c] px-4 py-2.5 rounded-md cursor-pointer shadow-md shadow-red-500/20"
            >
              <SlidersHorizontal size={14} />
              <span>{isMobileFiltersOpen ? (locale === 'ar' ? 'إخفاء الفلاتر' : 'Filtreleri Gizle') : (locale === 'ar' ? 'عرض الفلاتر' : 'Filtreleri Göster')}</span>
              {(selectedBrand !== 'all' || selectedPart !== 'all' || selectedQuality.length > 0 || selectedColors.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>

            <span className="text-xs font-black text-muted-foreground">
              {filteredProducts.length} {locale === 'ar' ? 'منتج متاح' : 'ürün listelendi'}
            </span>
          </div>
        )}

        {/* 6. MAIN TWO-COLUMN SPLIT: LEFT SIDEBAR FILTERS & RIGHT PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* THE LEFT SIDEBAR FILTERS (Only when filters are available) */}
          {/* ======================================================== */}
          {hasSidebarFilters && (
            <div className={cn(
              "lg:col-span-3 space-y-5",
              isMobileFiltersOpen ? "block" : "hidden lg:block"
            )}>
              {/* Block 1: Categories & Spare Parts Vertical Menu */}
              {dynamicPartsMenu.length > 1 && (
                <div className="p-4 rounded-lg bg-card border border-border space-y-2 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={14} className="text-[#E11D48]" />
                      <span>{locale === 'ar' ? 'الأقسام وقطع الغيار' : 'Parçalar & Kategoriler'}</span>
                    </h3>
                    {selectedPart !== 'all' && (
                      <button 
                        onClick={() => handlePartSelect('all')}
                        className="text-[10px] font-bold text-[#E11D48] hover:underline cursor-pointer"
                      >
                        {locale === 'ar' ? 'عرض الكل' : 'Tümü'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {(isPartsExpanded ? dynamicPartsMenu : dynamicPartsMenu.slice(0, 6)).map((p) => {
                      const IconComp = partIconMap[p.id] || Wrench;
                      const isActive = selectedPart === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => handlePartSelect(p.id)}
                          className={cn(
                            "w-full px-3 py-2 rounded-md text-xs font-black flex items-center justify-between transition-all cursor-pointer",
                            isActive
                              ? "bg-[#E11D48] text-white shadow-md shadow-red-500/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <IconComp size={15} className={isActive ? "text-white" : "text-muted-foreground"} />
                            <span className="truncate">{locale === 'ar' ? p.label_ar : locale === 'en' ? p.label_en : p.label_tr}</span>
                          </div>
                          {isActive && <Check size={14} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {dynamicPartsMenu.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setIsPartsExpanded(!isPartsExpanded)}
                      className="w-full mt-2 pt-2 border-t border-border flex items-center justify-center gap-1.5 text-xs font-black text-muted-foreground hover:text-[#E11D48] transition-colors cursor-pointer"
                    >
                      <span>{isPartsExpanded ? (locale === 'ar' ? 'عرض أقل' : 'Daha Az Göster') : (locale === 'ar' ? `عرض المزيد (+${dynamicPartsMenu.length - 6})` : `Daha Fazla Göster (+${dynamicPartsMenu.length - 6})`)}</span>
                      <ChevronDown size={14} className={cn("transition-transform duration-200", isPartsExpanded && "rotate-180")} />
                    </button>
                  )}
                </div>
              )}

              {/* Block 2: Brand Selection with Icons */}
              {brandOptions.length > 1 && (
                <div className="p-4 rounded-lg bg-card border border-border space-y-2 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={14} className="text-[#E11D48]" />
                      <span>{locale === 'ar' ? 'اختر الماركة' : 'Marka Seçin'}</span>
                    </h3>
                    {selectedBrand !== 'all' && (
                      <button 
                        onClick={() => handleBrandSelect('all')}
                        className="text-[10px] font-bold text-[#E11D48] hover:underline cursor-pointer"
                      >
                        {locale === 'ar' ? 'الكل' : 'Tümü'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {(isBrandsExpanded ? brandOptions : brandOptions.slice(0, 6)).map((b) => {
                      const isActive = selectedBrand === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => handleBrandSelect(b.id)}
                          className={cn(
                            "w-full px-3 py-2 rounded-md text-xs font-black flex items-center justify-between transition-all cursor-pointer",
                            isActive
                              ? "bg-[#E11D48] text-white shadow-md shadow-red-500/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {b.id !== 'all' ? (
                              <BrandIcon brand={b.id} size={15} />
                            ) : (
                              <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold">●</span>
                            )}
                            <span>{b.name}</span>
                          </div>
                          {isActive && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>

                  {brandOptions.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setIsBrandsExpanded(!isBrandsExpanded)}
                      className="w-full mt-2 pt-2 border-t border-border flex items-center justify-center gap-1.5 text-xs font-black text-muted-foreground hover:text-[#E11D48] transition-colors cursor-pointer"
                    >
                      <span>{isBrandsExpanded ? (locale === 'ar' ? 'عرض أقل' : 'Daha Az Göster') : (locale === 'ar' ? `عرض المزيد (+${brandOptions.length - 6})` : `Daha Fazla Göster (+${brandOptions.length - 6})`)}</span>
                      <ChevronDown size={14} className={cn("transition-transform duration-200", isBrandsExpanded && "rotate-180")} />
                    </button>
                  )}
                </div>
              )}

              {/* Block 3: Filtrele (Quality, Types, Colors, Price Range Slider) */}
              {(qualityOptions.length > 0 || dynamicTypeOptions.length > 0 || colorOptions.length > 0 || maxAvailablePrice > minAvailablePrice) && (
                <div className="p-4 rounded-lg bg-card border border-border space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal size={14} className="text-[#E11D48]" />
                      <span>{locale === 'ar' ? 'تصفية إضافية' : 'Filtrele'}</span>
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedQuality([]);
                        setSelectedColors([]);
                        setSelectedTypeFilters(['all']);
                        setMinPrice(minAvailablePrice);
                        setPriceSlider(maxAvailablePrice);
                        updateUrlWithFilters({ quality: [], types: ['all'] });
                      }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={10} />
                      <span>{locale === 'ar' ? 'إعادة ضبط' : 'Temizle'}</span>
                    </button>
                  </div>

                  {/* 3.1 Product Quality Checkboxes */}
                  {qualityOptions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-black text-muted-foreground block uppercase">
                        {locale === 'ar' ? 'درجة الجودة' : 'Ürün Kalitesi'}
                      </span>
                      <div className="space-y-1.5">
                        {qualityOptions.map((q) => {
                          const isChecked = selectedQuality.includes(q.id);
                          return (
                            <label
                              key={q.id}
                              className="flex items-center gap-2 text-xs font-bold text-foreground/80 hover:text-foreground cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleQuality(q.id)}
                                className="w-3.5 h-3.5 rounded bg-background border-border text-[#E11D48] accent-[#E11D48] cursor-pointer"
                              />
                              <span>{locale === 'ar' ? q.label_ar : locale === 'en' ? q.label_en : q.label_tr}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3.2 Item Type Checkboxes */}
                  {dynamicTypeOptions.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-border">
                      <span className="text-[11px] font-black text-muted-foreground block uppercase">
                        {locale === 'ar' ? 'نوع المعروض' : 'Kategori / Tür'}
                      </span>
                      <div className="space-y-1.5">
                        {dynamicTypeOptions.slice(0, showAllTypes ? undefined : 6).map((t) => {
                          const isChecked = selectedTypeFilters.includes(t.id);
                          return (
                            <label
                              key={t.id}
                              className="flex items-center gap-2 text-xs font-bold text-foreground/80 hover:text-foreground cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTypeFilter(t.id)}
                                className="w-3.5 h-3.5 rounded bg-background border-border text-[#E11D48] accent-[#E11D48] cursor-pointer"
                              />
                              <span>{locale === 'ar' ? t.label_ar : locale === 'en' ? t.label_en : t.label_tr}</span>
                            </label>
                          );
                        })}
                      </div>
                      {dynamicTypeOptions.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllTypes(!showAllTypes)}
                          className="w-full mt-2 pt-2 border-t border-border flex items-center justify-center gap-1.5 text-xs font-black text-muted-foreground hover:text-[#E11D48] transition-colors cursor-pointer"
                        >
                          <span>{showAllTypes ? (locale === 'ar' ? 'عرض أقل' : 'Daha Az Göster') : (locale === 'ar' ? `عرض المزيد (+${dynamicTypeOptions.length - 6})` : `Daha Fazla Göster (+${dynamicTypeOptions.length - 6})`)}</span>
                          <ChevronDown size={14} className={cn("transition-transform duration-200", showAllTypes && "rotate-180")} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* 3.3 Color Checkboxes */}
                  {colorOptions.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-border">
                      <span className="text-[11px] font-black text-muted-foreground block uppercase">
                        {locale === 'ar' ? 'اللون' : 'Renk'}
                      </span>
                      <div className="space-y-1.5">
                        {colorOptions.map((c) => {
                          const isChecked = selectedColors.includes(c.id);
                          return (
                            <label
                              key={c.id}
                              className="flex items-center gap-2 text-xs font-bold text-foreground/80 hover:text-foreground cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleColor(c.id)}
                                className="w-3.5 h-3.5 rounded bg-background border-border text-[#E11D48] accent-[#E11D48] cursor-pointer"
                              />
                              <span>{locale === 'ar' ? c.label_ar : locale === 'en' ? c.label_en : c.label_tr}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3.4 Price Range Filter & Slider */}
                  {maxAvailablePrice > minAvailablePrice && (
                    <div className="space-y-2.5 pt-3 border-t border-border">
                      <div className="flex justify-between items-baseline text-[11px] font-black">
                        <span className="text-muted-foreground uppercase">
                          {locale === 'ar' ? 'نطاق السعر' : 'Fiyat Aralığı'}
                        </span>
                        <span className="text-[#E11D48] font-bold">{formatPrice(priceSlider)}</span>
                      </div>

                      {/* Min & Max Inputs */}
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 flex items-center">
                          <span className="text-muted-foreground text-[10px] mr-1">Min</span>
                          <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(Number(e.target.value))}
                            className="w-full bg-transparent text-foreground font-bold outline-hidden text-xs"
                          />
                          <span className="text-muted-foreground text-[10px]">TL</span>
                        </div>
                        <span className="text-muted-foreground">-</span>
                        <div className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 flex items-center">
                          <span className="text-muted-foreground text-[10px] mr-1">Max</span>
                          <input
                            type="number"
                            value={priceSlider}
                            onChange={(e) => setPriceSlider(Number(e.target.value))}
                            className="w-full bg-transparent text-foreground font-bold outline-hidden text-xs"
                          />
                          <span className="text-muted-foreground text-[10px]">TL</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min={minAvailablePrice}
                        max={maxAvailablePrice}
                        step="100"
                        value={priceSlider}
                        onChange={(e) => setPriceSlider(Number(e.target.value))}
                        className="w-full accent-[#E11D48] cursor-pointer"
                      />

                      <button
                        onClick={() => {}}
                        className="w-full py-2.5 rounded-md bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-500/20 cursor-pointer active:scale-95"
                      >
                        <Filter size={13} />
                        <span>{locale === 'ar' ? 'تطبيق الفلترة' : 'Filtrele'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* THE RIGHT PRODUCT GRID AREA                              */}
          {/* ======================================================== */}
          <div ref={productsGridRef} className={cn("space-y-5", hasSidebarFilters ? "lg:col-span-9" : "lg:col-span-12")}>
            {/* Header: Products Count & Sort & Grid/List view */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">
                  {locale === 'ar' ? 'المنتجات المعروضة' : 'Ürünler'}{' '}
                  <span className="text-muted-foreground text-sm font-bold">({filteredProducts.length})</span>
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <select
                    value={sortOrder}
                    onChange={(e) => {
                      const newSort = e.target.value;
                      setSortOrder(newSort);
                      updateUrlWithFilters({ sort: newSort });
                    }}
                    className="px-3 py-1.5 rounded-md bg-card border border-border text-xs font-bold text-foreground outline-hidden focus:border-[#E11D48] cursor-pointer"
                  >
                    <option value="popular">{locale === 'ar' ? 'الأكثر طلباً' : 'En Popüler'}</option>
                    <option value="price-asc">{locale === 'ar' ? 'السعر: الأقل' : 'Fiyat: Artan'}</option>
                    <option value="price-desc">{locale === 'ar' ? 'السعر: الأعلى' : 'Fiyat: Azalan'}</option>
                    <option value="newest">{locale === 'ar' ? 'الأحدث' : 'En Yeniler'}</option>
                  </select>
                </div>

                {/* Grid / List view toggle */}
                <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors cursor-pointer",
                      viewMode === 'grid' ? "bg-[#E11D48] text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors cursor-pointer",
                      viewMode === 'list' ? "bg-[#E11D48] text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-16 text-center rounded-lg bg-card border border-border space-y-4">
                <ShoppingBag size={42} className="mx-auto text-muted-foreground" />
                <h3 className="text-base font-black text-foreground">
                  {allAvailableProducts.length === 0
                    ? (locale === 'ar' ? 'لا توجد منتجات متوفرة حالياً' : locale === 'en' ? 'No products currently available.' : 'Şu anda listelenen ürün bulunmuyor.')
                    : (locale === 'ar' ? 'لا توجد منتجات مطابقة لهذا البحث أو الفلتر' : locale === 'en' ? 'No products match this filter or search.' : 'Bu filtrelere uygun ürün bulunamadı.')}
                </h3>
                <p className="text-xs text-muted-foreground font-bold max-w-sm mx-auto">
                  {allAvailableProducts.length === 0
                    ? (locale === 'ar' ? 'يرجى التواصل معنا مباشرة للاستفسار والطلب.' : locale === 'en' ? 'Please contact us directly for inquiries and orders.' : 'Bilgi ve sipariş için lütfen bizimle doğrudan iletişime geçin.')
                    : (locale === 'ar' ? 'جرّب إعادة ضبط الفلاتر أو استخدام كلمات بحث مختلفة.' : locale === 'en' ? 'Try resetting filters or using different keywords.' : 'Filtreleri sıfırlayarak tüm ürünleri görüntüleyebilirsiniz.')}
                </p>
                {allAvailableProducts.length === 0 ? (
                  <a
                    href="https://wa.me/905067006677"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black cursor-pointer shadow-md shadow-emerald-500/20 transition-colors"
                  >
                    {locale === 'ar' ? 'تواصل معنا عبر واتساب' : locale === 'en' ? 'Contact us via WhatsApp' : 'WhatsApp ile İletişime Geçin'}
                  </a>
                ) : (
                  <button
                    onClick={resetAllFilters}
                    className="px-6 py-2.5 rounded-md bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-black cursor-pointer shadow-md shadow-red-500/20"
                  >
                    {locale === 'ar' ? 'إعادة ضبط كافة الفلاتر' : 'Tüm Filtreleri Sıfırla'}
                  </button>
                )}
              </div>
            ) : (
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid'
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}>
                {paginatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Showing Range Info */}
                <div className="text-xs font-bold text-muted-foreground">
                  {locale === 'ar' ? (
                    <span>
                      عرض <span className="text-foreground font-black">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-foreground font-black">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> من أصل <span className="text-[#E11D48] font-black">{filteredProducts.length}</span> منتج
                    </span>
                  ) : locale === 'en' ? (
                    <span>
                      Showing <span className="text-foreground font-black">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-foreground font-black">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="text-[#E11D48] font-black">{filteredProducts.length}</span> products
                    </span>
                  ) : (
                    <span>
                      <span className="text-[#E11D48] font-black">{filteredProducts.length}</span> üründen <span className="text-foreground font-black">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-foreground font-black">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> arası gösteriliyor
                    </span>
                  )}
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Prev Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(
                      "px-3 py-2 rounded-md text-xs font-black transition-all flex items-center gap-1 border",
                      currentPage === 1
                        ? "border-border text-muted-foreground/40 cursor-not-allowed bg-muted/20"
                        : "border-border text-foreground hover:border-[#E11D48] bg-card cursor-pointer active:scale-95"
                    )}
                  >
                    <ChevronLeft size={14} className="rtl:rotate-180" />
                    <span className="hidden sm:inline">{locale === 'ar' ? 'السابق' : locale === 'en' ? 'Prev' : 'Önceki'}</span>
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((pNum, idx) => {
                    if (pNum === '...') {
                      return (
                        <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-muted-foreground font-bold select-none">
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
                            ? "bg-[#E11D48] text-white border-[#E11D48] shadow-md scale-105"
                            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-[#E11D48]/50"
                        )}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "px-3 py-2 rounded-md text-xs font-black transition-all flex items-center gap-1 border",
                      currentPage === totalPages
                        ? "border-border text-muted-foreground/40 cursor-not-allowed bg-muted/20"
                        : "border-border text-foreground hover:border-[#E11D48] bg-card cursor-pointer active:scale-95"
                    )}
                  >
                    <span className="hidden sm:inline">{locale === 'ar' ? 'التالي' : locale === 'en' ? 'Next' : 'Sonraki'}</span>
                    <ChevronRight size={14} className="rtl:rotate-180" />
                  </button>
                </div>

                {/* Items Per Page Selector */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="hidden md:inline">{locale === 'ar' ? 'لكل صفحة:' : 'Sayfa Başı:'}</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-1.5 rounded-md bg-card border border-border text-xs font-bold text-foreground outline-hidden focus:border-[#E11D48] cursor-pointer"
                  >
                    <option value={12}>12</option>
                    <option value={16}>16</option>
                    <option value={24}>24</option>
                    <option value={32}>32</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
