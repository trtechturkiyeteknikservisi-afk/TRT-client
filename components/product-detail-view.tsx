'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  ChevronRight, ChevronLeft, ShieldCheck, Clock, CheckCircle2, 
  ShoppingBag, Heart, ArrowRight, Share2, Wrench, Smartphone, 
  Truck, Check, AlertCircle, Eye, Star, Layers,
  Shield, FileText, SlidersHorizontal, Info
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { cn, getProductUrl, slugify, getProductSlug } from '@/lib/utils';
import { useStore } from './store-context';
import { useCurrency } from './currency-context';
import { BrandIcon } from './brand-icons';
import { WhatsappIcon } from './social-icons';
import { useSettings } from './settings-provider';
import { ProductCard } from './product-card';
import toast from 'react-hot-toast';

interface ProductDetailViewProps {
  productId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === 'ar';
  const { settings } = useSettings();
  const { formatPrice, currentCurrency, currencySymbol } = useCurrency();
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const decodedProductId = useMemo(() => {
    return decodeURIComponent(productId || '').trim();
  }, [productId]);

  const cleanId = useMemo(() => {
    return decodedProductId.startsWith('db-') ? decodedProductId.replace('db-', '') : decodedProductId;
  }, [decodedProductId]);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [prodRes, allRes] = await Promise.allSettled([
          axios.get<any>(`${API_BASE}/pricing/${encodeURIComponent(cleanId)}`),
          axios.get<any>(`${API_BASE}/pricing`)
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data) {
          if (isMounted) setProduct(prodRes.value.data);
        } else if (allRes.status === 'fulfilled' && Array.isArray(allRes.value.data)) {
          // Fallback search in all pricing items
          const targetSlug = slugify(cleanId);
          const found = (allRes.value.data as any[]).find((item: any) => {
            if (String(item.id) === String(cleanId)) return true;
            if (item.slug && slugify(item.slug) === targetSlug) return true;
            if (slugify(item.model_name) === targetSlug) return true;
            const genSlug = getProductSlug(item);
            if (genSlug === targetSlug) return true;
            if (slugify(`${item.model_name} ${item.service_name_tr || ''}`) === targetSlug) return true;
            if (slugify(`${item.model_name} ${item.service_name_ar || ''}`) === targetSlug) return true;
            if (slugify(`${item.model_name} ${item.service_name_en || ''}`) === targetSlug) return true;
            return false;
          });
          if (isMounted && found) setProduct(found);
        }

        // Fetch related products in the same category or brand
        if (allRes.status === 'fulfilled' && Array.isArray(allRes.value.data)) {
          const all: any[] = allRes.value.data as any[];
          const currentCategory = prodRes.status === 'fulfilled' ? (prodRes.value.data as any)?.device_type : null;
          const currentBrand = prodRes.status === 'fulfilled' ? (prodRes.value.data as any)?.brand : null;
          
          const filtered = all.filter((item: any) => {
            if (String(item.id) === String(cleanId)) return false;
            if (currentCategory && item.device_type === currentCategory) return true;
            if (currentBrand && item.brand === currentBrand) return true;
            return false;
          }).slice(0, 4);

          if (isMounted) setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => { isMounted = false; };
  }, [cleanId]);

  // Extract all images into array
  const allImages = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];

    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img: any) => {
        if (typeof img === 'string' && img.trim()) list.push(img.trim());
      });
    }

    if (list.length === 0 && product.image_url) {
      list.push(product.image_url);
    }

    if (list.length === 0) {
      list.push('/images/spare-parts-screen.jpg');
    }

    return list;
  }, [product]);

  // Localized Titles & Content
  const localizedTitle = useMemo(() => {
    if (!product) return '';
    if (locale === 'ar') return product.service_name_ar || product.model_name || '';
    if (locale === 'en') return product.service_name_en || product.model_name || '';
    return product.service_name_tr || product.model_name || '';
  }, [product, locale]);

  const localizedCategoryName = useMemo(() => {
    if (!product) return '';
    if (locale === 'ar') return product.category_name_ar || product.category_name_tr || product.device_type || 'المنتجات';
    if (locale === 'en') return product.category_name_en || product.category_name_tr || product.device_type || 'Products';
    return product.category_name_tr || product.category_name_ar || product.device_type || 'Ürünler';
  }, [product, locale]);

  const localizedSpecs = useMemo(() => {
    if (!product) return '';
    if (locale === 'ar') return product.specs_ar || product.specs_tr || product.specs_en || '';
    if (locale === 'en') return product.specs_en || product.specs_tr || product.specs_ar || '';
    return product.specs_tr || product.specs_en || product.specs_ar || '';
  }, [product, locale]);



  const localizedWarranty = useMemo(() => {
    if (!product?.warranty) {
      return locale === 'ar' ? 'ضمان 6 أشهر رسمي' : locale === 'en' ? '6 Months Official Warranty' : '6 Ay Resmi Garanti';
    }
    const w = product.warranty;
    if (locale === 'ar') {
      return w
        .replace(/(\d+)\s*Ay Garanti/gi, 'ضمان $1 أشهر')
        .replace(/1 Yıl Garanti/gi, 'ضمان سنة واحدة')
        .replace(/(\d+)\s*Yıl Garanti/gi, 'ضمان $1 سنوات')
        .replace(/Ömür Boyu Garanti/gi, 'ضمان مدى الحياة');
    }
    if (locale === 'en') {
      return w
        .replace(/(\d+)\s*Ay Garanti/gi, '$1 Months Warranty')
        .replace(/1 Yıl Garanti/gi, '1 Year Warranty')
        .replace(/(\d+)\s*Yıl Garanti/gi, '$1 Years Warranty')
        .replace(/Ömür Boyu Garanti/gi, 'Lifetime Warranty');
    }
    return w;
  }, [product, locale]);

  const localizedDescription = useMemo(() => {
    if (!product) return '';
    if (locale === 'ar') return product.description_ar || product.notes_ar || '';
    if (locale === 'en') return product.description_en || product.notes_en || '';
    return product.description_tr || product.notes_tr || '';
  }, [product, locale]);

  const showCustomBadge = Boolean(product && product.show_badge !== false && (product.show_badge as any) !== 0);
  const customBadgeLabel = useMemo(() => {
    if (!product) return '';
    if (locale === 'ar') return product.badge_text_ar || product.badge || '';
    if (locale === 'en') return product.badge_text_en || product.badge || '';
    return product.badge_text_tr || product.badge || '';
  }, [product, locale]);

  const hasHtmlSpecs = useMemo(() => {
    return Boolean(localizedSpecs && /<[a-z][\s\S]*>/i.test(localizedSpecs));
  }, [localizedSpecs]);

  const hasSpecsContent = useMemo(() => {
    if (!localizedSpecs) return false;
    const stripped = localizedSpecs.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return stripped.length > 0 || /<img|<table|<iframe|<ul|<ol|<video/i.test(localizedSpecs);
  }, [localizedSpecs]);

  // Formatted price using dynamic currency engine
  const formattedPrice = useMemo(() => {
    if (!product) return '0 ' + currencySymbol;
    return formatPrice(product.base_price, product.max_price);
  }, [product, formatPrice, currencySymbol]);

  // Plain specs lines if pipe-delimited
  const plainSpecsLines = useMemo<string[]>(() => {
    if (!localizedSpecs || hasHtmlSpecs) return [];
    if (localizedSpecs.includes('|')) {
      return localizedSpecs.split('|').map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  }, [localizedSpecs, hasHtmlSpecs]);

  const scrollToSpecs = () => {
    const el = document.getElementById('product-specifications');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const rawWhatsapp = settings['whatsapp'] || '905302094094';
  const cleanWhatsapp = rawWhatsapp.replace(/\D/g, '');

  const openWhatsAppOrder = () => {
    if (!product) return;
    const msg = locale === 'ar'
      ? `مرحباً TR TECH، أود الاستفسار وشراء المنتج التالي:\n- المنتج: ${localizedTitle}\n- الموديل: ${product.model_name}\n- السعر: ${formattedPrice}\n- الكمية: ${quantity}\nرابط المنتج: ${typeof window !== 'undefined' ? window.location.href : ''}`
      : locale === 'en'
        ? `Hello TR TECH, I would like to inquire about and purchase:\n- Product: ${localizedTitle}\n- Model: ${product.model_name}\n- Price: ${formattedPrice}\n- Qty: ${quantity}\nProduct URL: ${typeof window !== 'undefined' ? window.location.href : ''}`
        : `Merhaba TR TECH, aşağıdaki ürün hakkında bilgi almak ve sipariş vermek istiyorum:\n- Ürün: ${localizedTitle}\n- Model: ${product.model_name}\n- Fiyat: ${formattedPrice}\n- Adet: ${quantity}\nÜrün Linki: ${typeof window !== 'undefined' ? window.location.href : ''}`;

    window.open(`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: `db-${product.id}`,
      title: localizedTitle,
      brand: product.brand,
      category: product.device_type,
      item_type: product.item_type || 'yedek_parca',
      price: product.base_price || 0,
      image: allImages[0] || product.image_url || '/images/spare-parts-screen.jpg',
      specs: localizedSpecs,
      badge: customBadgeLabel || (product.item_type === 'cihaz' ? 'Cihaz' : 'Yedek Parça'),
      quantity
    });
    toast.success(
      locale === 'ar' 
        ? `تمت إضافة (${localizedTitle}) إلى سلتك!` 
        : locale === 'en' 
          ? `Added (${localizedTitle}) to your cart!` 
          : `(${localizedTitle}) sepetinize eklendi!`
    );
  };


  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 py-20 bg-background text-foreground">
        <div className="w-12 h-12 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          {locale === 'ar' ? 'جاري تحميل تفاصيل ومواصفات المنتج...' : 'Ürün detayları yükleniyor...'}
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-5 py-20 bg-background text-foreground text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black">
          {locale === 'ar' ? 'لم يتم العثور على المنتج المطلوب' : 'Aradığınız ürün bulunamadı'}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
          {locale === 'ar' 
            ? 'قد يكون هذا المنتج غير متوفر حالياً أو تم تعديل رابطه. يمكنك العودة لصفحة المنتجات والأقسام.' 
            : 'Bu ürün mevcut olmayabilir veya bağlantısı güncellenmiş olabilir.'}
        </p>
        <Link
          href="/urunler"
          className="px-6 py-2.5 rounded-md bg-[#E11D48] text-white text-xs font-black uppercase tracking-wider hover:bg-[#be123c] transition-all shadow-md"
        >
          {locale === 'ar' ? 'العودة لجميع المنتجات والأقسام' : 'Tüm Ürünlere Dön'}
        </Link>
      </div>
    );
  }

  const categorySlug = product.device_type === 'phone' ? 'telefon' : (product.device_type || 'yedek_parca');

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. BREADCRUMBS BAR */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md sticky top-16 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-foreground transition-colors whitespace-nowrap">
              {locale === 'ar' ? 'الرئيسية' : locale === 'en' ? 'Home' : 'Ana Sayfa'}
            </Link>
            <ChevronRight size={13} className={cn("text-muted-foreground/60 shrink-0", isRTL && "rotate-180")} />
            
            <Link href="/urunler" className="hover:text-foreground transition-colors whitespace-nowrap">
              {locale === 'ar' ? 'المنتجات والأسعار' : locale === 'en' ? 'Products & Pricing' : 'Ürünler ve Fiyatlar'}
            </Link>
            <ChevronRight size={13} className={cn("text-muted-foreground/60 shrink-0", isRTL && "rotate-180")} />

            <Link href={`/urunler/${categorySlug}`} className="hover:text-[#E11D48] transition-colors whitespace-nowrap font-black">
              {localizedCategoryName}
            </Link>
            <ChevronRight size={13} className={cn("text-muted-foreground/60 shrink-0", isRTL && "rotate-180")} />

            <span className="text-foreground font-black whitespace-nowrap truncate max-w-[220px] sm:max-w-none">
              {product.model_name}
            </span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-12">
        {/* 2. PRODUCT HERO SECTION (2 COLUMNS: GALLERY & SPECS/BUY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          
          {/* === LEFT COLUMN: MULTI-IMAGE GALLERY (5/12 or 6/12) === */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-4 min-w-0">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-2xl border border-border bg-card overflow-hidden shadow-md group flex items-center justify-center p-4 sm:p-6 lg:p-8">
              {/* Main Image Display */}
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={allImages[activeImageIdx] || allImages[0]}
                  alt={product.model_name}
                  className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-102 select-none drop-shadow-xs"
                />
              </div>

              {/* Prev / Next Arrows on Hero Image if Multiple */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    aria-label="Previous image"
                    className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-[#E11D48] text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer opacity-80 hover:opacity-100 shadow-md z-10"
                  >
                    <ChevronLeft size={18} className="rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIdx(prev => (prev + 1) % allImages.length)}
                    aria-label="Next image"
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-[#E11D48] text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer opacity-80 hover:opacity-100 shadow-md z-10"
                  >
                    <ChevronRight size={18} className="rtl:rotate-180" />
                  </button>

                  {/* Counter Pill */}
                  <div className="absolute bottom-3 end-3 bg-black/75 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs z-10">
                    {activeImageIdx + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip (If Multiple Images - Fixed without overflow) */}
            {allImages.length > 1 && (
              <div className="w-full min-w-0 rounded-xl border border-border/70 bg-muted/20 p-2 overflow-hidden">
                <div className="flex items-center gap-2.5 overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-muted">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={cn(
                        "relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden bg-card shrink-0 p-1.5 transition-all cursor-pointer shadow-xs",
                        activeImageIdx === idx 
                          ? "border-[#E11D48] ring-2 ring-[#E11D48]/30 opacity-100" 
                          : "border-border/80 hover:border-[#E11D48]/60 opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Guarantees Strip */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl border border-border bg-card/60 flex flex-col items-center text-center space-y-1">
                <ShieldCheck size={20} className="text-emerald-500" />
                <span className="text-[11px] font-black">{localizedWarranty}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card/60 flex flex-col items-center text-center space-y-1">
                <Clock size={20} className="text-[#E11D48]" />
                <span className="text-[11px] font-black">{product.duration || (locale === 'ar' ? 'شحن فوري' : 'Hızlı Teslimat')}</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-card/60 flex flex-col items-center text-center space-y-1">
                <Truck size={20} className="text-blue-500" />
                <span className="text-[11px] font-black">{locale === 'ar' ? 'شحن لكافة تركيا' : 'Tüm Türkiye Kargo'}</span>
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN: PRODUCT INFO & PURCHASE ACTIONS (6/12 or 7/12) === */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-5 min-w-0">
            
            {/* Header: Brand & Series & Title */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-black uppercase bg-primary/10 text-primary border border-primary/20">
                    <BrandIcon brand={product.brand} size={15} />
                    <span>{product.brand}</span>
                  </span>

                  {showCustomBadge && customBadgeLabel && (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-black uppercase bg-linear-to-r from-rose-600 to-[#E11D48] text-white shadow-xs border border-white/20 select-none">
                      <span>{customBadgeLabel}</span>
                    </span>
                  )}

                  <span className="text-xs font-extrabold text-muted-foreground">
                    {product.series}
                  </span>
                </div>

                {/* زر المواصفات الفنية مع أيقونة إصبع لأسفل */}
                {hasSpecsContent && (
                  <button
                    type="button"
                    onClick={scrollToSpecs}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-linear-to-r from-rose-500/15 via-[#E11D48]/10 to-amber-500/15 hover:from-[#E11D48] hover:to-rose-600 text-[#E11D48] hover:text-white border border-[#E11D48]/30 hover:border-transparent text-xs font-black transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md hover:shadow-[#E11D48]/25 active:scale-95 group select-none"
                    title={locale === 'ar' ? 'الانتقال للمواصفات الفنية' : 'Scroll down to specifications'}
                  >
                    <span>{locale === 'ar' ? 'المواصفات الفنية' : locale === 'en' ? 'Specifications' : 'Teknik Özellikler'}</span>
                    <span className="text-sm">
                      👇
                    </span>
                  </button>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-foreground tracking-tight leading-tight">
                {product.model_name}
              </h1>

              {localizedTitle !== product.model_name && (
                <p className="text-base font-bold text-muted-foreground">
                  {localizedTitle}
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl border border-border bg-card/90 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  {locale === 'ar' ? 'السعر الرسمي الإجمالي' : locale === 'en' ? 'Official Total Price' : 'Resmi Toplam Fiyat'}
                </div>
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-[#E11D48] tracking-tight">
                  {formattedPrice}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {locale === 'ar' ? '(شامل الضريبة والضمان الرسمي)' : '(KDV ve Resmi Garanti Dahil)'}
                </span>
              </div>
            </div>

            {/* Description Section (Placed right after Title & Price as requested) */}
            <div className="p-4 rounded-xl border border-border bg-card/70 space-y-2 shadow-2xs">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
                <FileText size={15} className="text-[#E11D48]" />
                <span>{locale === 'ar' ? 'الوصف وتفاصيل المنتج' : locale === 'en' ? 'Product Description' : 'Ürün Açıklaması'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-line">
                {localizedDescription || (locale === 'ar'
                  ? `منتج ${product.model_name} أصلي ومطابق للمواصفات الرسمية، تم اختباره لضمان أعلى درجات الأداء والاستقرار مع ضمان رسمي معتمد من TR TECH.`
                  : `${product.model_name} orijinal ve standartlara uygun garantili ürün.`)}
              </p>
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase text-foreground">
                  {locale === 'ar' ? 'الكمية:' : 'Adet:'}
                </span>
                <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-9 h-9 flex items-center justify-center text-foreground hover:bg-muted font-black text-sm cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-black">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-9 h-9 flex items-center justify-center text-foreground hover:bg-muted font-black text-sm cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Big Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#E11D48] hover:bg-[#be123c] text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <ShoppingBag size={18} />
                  <span>{locale === 'ar' ? 'أضف إلى السلة' : 'Sepete Ekle'}</span>
                </button>

                {/* 2. Direct WhatsApp Order Button */}
                <button
                  type="button"
                  onClick={openWhatsAppOrder}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
                >
                  <WhatsappIcon size={18} />
                  <span>{locale === 'ar' ? 'طلب فوري عبر واتساب' : 'WhatsApp ile Sipariş'}</span>
                </button>
              </div>
            </div>

            {/* Trust Points */}
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2 text-xs text-muted-foreground font-semibold">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>{locale === 'ar' ? 'فحص فني مجاني ومطابقة 100% للموديل' : '%100 Uyumlu & Orijinal Parça Garantisi'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>{locale === 'ar' ? 'توصيل سريع مع إمكانية الدفع عند الاستلام' : 'Hızlı kargo ve kapıda ödeme seçeneği'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500 shrink-0" />
                <span>{locale === 'ar' ? 'فريق دعم فني متواصل 7/24' : '7/24 Kesintisiz Uzman Teknik Destek'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TECHNICAL SPECIFICATIONS ONLY (المواصفات الفنية المضافة عبر Jodit كما هي تماماً) */}
        {hasSpecsContent && (
          <section id="product-specifications" className="scroll-mt-28 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wrench size={18} className="text-[#E11D48]" />
                <h2 className="font-black text-sm sm:text-base uppercase tracking-wider text-foreground">
                  {locale === 'ar' ? 'المواصفات الفنية' : locale === 'en' ? 'Technical Specifications' : 'Teknik Özellikler'}
                </h2>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {hasHtmlSpecs ? (
                <div className="overflow-x-auto">
                  <div 
                    className="specs-html-content"
                    dangerouslySetInnerHTML={{ __html: localizedSpecs }}
                  />
                </div>
              ) : plainSpecsLines.length > 0 ? (
                <ul className="space-y-2.5 text-xs sm:text-sm text-foreground">
                  {plainSpecsLines.map((line: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-2 shrink-0" />
                      <span className="font-medium leading-relaxed">{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="whitespace-pre-line text-xs sm:text-sm text-foreground leading-relaxed font-medium">
                  {localizedSpecs}
                </div>
              )}
            </div>
          </section>
        )}


        {/* 4. RELATED PRODUCTS IN SAME CATEGORY */}
        {relatedProducts.length > 0 && (
          <section className="space-y-5 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
                  <span>{locale === 'ar' ? 'منتجات أخرى في نفس القسم' : 'Bu Bölümdeki Diğer Ürünler'}</span>
                </h2>
                <p className="text-xs text-muted-foreground font-bold">
                  {locale === 'ar' ? 'تصفح أيضاً الموديلات والقطع المشابهة' : 'İlginizi çekebilecek benzer ürünler'}
                </p>
              </div>

              <Link
                href={`/urunler/${categorySlug}`}
                className="text-xs font-black text-[#E11D48] hover:underline flex items-center gap-1"
              >
                <span>{locale === 'ar' ? 'عرض كافة منتجات القسم' : 'Tüm Bölümü Gör'}</span>
                <ArrowRight size={13} className={cn(isRTL && "rotate-180")} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

    </div>
  );
}
