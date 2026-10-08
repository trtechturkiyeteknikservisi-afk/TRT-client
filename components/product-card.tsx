'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn, getProductUrl } from '@/lib/utils';
import { useStore } from './store-context';
import { useCurrency } from './currency-context';
import { BrandIcon } from './brand-icons';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export interface ProductItem {
  id: string | number;
  model_name?: string;
  model?: string;
  brand: string;
  series?: string;
  device_type?: string;
  category?: string;
  title?: string;
  title_tr?: string;
  title_en?: string;
  title_ar?: string;
  service_name_tr?: string;
  service_name_en?: string;
  service_name_ar?: string;
  price?: number;
  base_price?: number;
  max_price?: number;
  image?: string;
  image_url?: string;
  images?: string[];
  specs_tr?: string;
  specs_en?: string;
  specs_ar?: string;
  badge?: string;
  badge_text_ar?: string;
  badge_text_tr?: string;
  badge_text_en?: string;
  show_badge?: boolean;
  in_stock?: boolean;
  quality?: string;
  item_type?: string;
  warranty?: string;
  duration?: string;
  slug?: string;
}

export interface ProductCardProps {
  product: ProductItem;
  viewMode?: 'grid' | 'list';
  className?: string;
  showAddToCart?: boolean;
}

export function ProductCard({
  product,
  viewMode = 'grid',
  className,
  showAddToCart = true
}: ProductCardProps) {
  const locale = useLocale();
  const { addToCart } = useStore();
  const { formatPrice } = useCurrency();

  const isStock = product.in_stock !== false;
  const productUrl = getProductUrl(product);

  const imagesCount = Array.isArray(product.images) && product.images.length > 0
    ? product.images.length
    : 1;

  const displayImage = product.image || product.image_url || (Array.isArray(product.images) && product.images[0]) || '/images/spare-parts-screen.jpg';

  // Resolved display title
  const displayTitle = React.useMemo(() => {
    if (locale === 'ar') {
      return product.title_ar || product.service_name_ar || product.model_name || product.title || '';
    }
    if (locale === 'en') {
      return product.title_en || product.service_name_en || product.model_name || product.title || '';
    }
    return product.title_tr || product.service_name_tr || product.model_name || product.title || '';
  }, [product, locale]);

  // Resolved secondary text / specs
  const displaySubtitle = React.useMemo(() => {
    if (locale === 'ar') {
      return product.specs_ar || (product.model_name && product.service_name_ar !== product.model_name ? product.service_name_ar : product.series) || '';
    }
    if (locale === 'en') {
      return product.specs_en || (product.model_name && product.service_name_en !== product.model_name ? product.service_name_en : product.series) || '';
    }
    return product.specs_tr || (product.model_name && product.service_name_tr !== product.model_name ? product.service_name_tr : product.series) || '';
  }, [product, locale]);

  // Badge logic (without any star icons)
  const showCustomBadge = product.show_badge !== false && (product.show_badge as any) !== 0;
  const badgeLabel = React.useMemo(() => {
    if (locale === 'ar') return product.badge_text_ar || product.badge;
    if (locale === 'en') return product.badge_text_en || product.badge;
    return product.badge_text_tr || product.badge;
  }, [product, locale]);

  // Price values
  const priceVal = product.price ?? product.base_price ?? 0;
  const maxPriceVal = product.max_price;

  return (
    <div
      className={cn(
        "group rounded-lg bg-card border border-border hover:border-[#E11D48]/50 transition-all duration-300 hover:shadow-lg relative flex overflow-hidden",
        viewMode === 'grid' ? "flex-col justify-between" : "flex-row items-center gap-4",
        className
      )}
    >
      {/* Product Image taking the top of the card with no gaps */}
      <Link
        href={productUrl}
        className={cn(
          "relative overflow-hidden bg-muted/40 shrink-0 flex items-center justify-center border-b border-border block cursor-pointer",
          viewMode === 'grid' ? "w-full h-48 sm:h-52" : "w-32 h-32 border-b-0 border-r border-border"
        )}
      >
        {/* Dynamic Custom Badge (Clean, No Stars) */}
        {showCustomBadge && badgeLabel && (
          <span className="absolute top-2.5 start-2.5 z-10 bg-linear-to-r from-rose-600 to-[#E11D48] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-md backdrop-blur-xs flex items-center border border-white/20 select-none">
            <span className="truncate max-w-[120px]">{badgeLabel}</span>
          </span>
        )}

        {/* Multi-image indicator badge */}
        {imagesCount > 1 && (
          <span className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md z-10 flex items-center gap-1">
            📷 {imagesCount} {locale === 'ar' ? 'صور' : locale === 'en' ? 'photos' : 'resim'}
          </span>
        )}

        <img
          src={displayImage}
          alt={displayTitle || product.model_name || 'Product'}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Product Info & Action */}
      <div
        className={cn(
          "flex-1 flex flex-col justify-between",
          viewMode === 'grid' ? "p-3.5 sm:p-4 space-y-3" : "p-3 sm:p-4 flex-row items-center gap-4"
        )}
      >
        <div className="space-y-1">
          {product.brand && (
            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
              <BrandIcon brand={product.brand} size={13} />
              <span>{product.brand}</span>
              {product.series && (
                <>
                  <span>•</span>
                  <span>{product.series}</span>
                </>
              )}
            </div>
          )}

          <Link href={productUrl}>
            <h3 className="text-xs sm:text-sm font-black text-foreground group-hover:text-[#E11D48] transition-colors leading-tight line-clamp-1 cursor-pointer">
              {product.model_name || displayTitle}
            </h3>
          </Link>

          {displaySubtitle && (
            <p className="text-[11px] text-muted-foreground font-bold line-clamp-1">
              {displaySubtitle}
            </p>
          )}

          {/* Stock indicator with colored dot */}
          <div className="flex items-center gap-1.5 pt-1 text-[11px] font-black">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isStock ? "bg-emerald-500" : "bg-muted-foreground"
              )}
            />
            <span className={isStock ? "text-emerald-500 dark:text-emerald-400" : "text-muted-foreground"}>
              {isStock
                ? (locale === 'ar' ? 'متوفر في المخزون' : locale === 'en' ? 'In Stock' : 'Stokta Var')
                : (locale === 'ar' ? 'غير متوفر' : locale === 'en' ? 'Out of Stock' : 'Stokta Yok')}
            </span>
          </div>
        </div>

        {/* Price & Actions */}
        <div
          className={cn(
            "space-y-2 pt-2 border-t border-border w-full",
            viewMode === 'list' && "border-t-0 pt-0 shrink-0 w-52"
          )}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-black text-foreground tracking-tight">
              {formatPrice(priceVal, maxPriceVal)}
            </span>
            <Link
              href={productUrl}
              className="text-[11px] font-bold text-[#E11D48] hover:underline flex items-center gap-0.5"
            >
              <span>{locale === 'ar' ? 'المواصفات' : locale === 'en' ? 'Specs' : 'Detaylar'}</span>
              <ArrowRight size={10} className="rtl:rotate-180" />
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {showAddToCart && (
              <button
                type="button"
                onClick={() =>
                  addToCart({
                    id: product.id,
                    title: product.title_tr || product.model_name || displayTitle,
                    price: priceVal,
                    image: displayImage,
                    brand: product.brand,
                    category: product.category || product.device_type,
                    quality: product.quality,
                    specs: product.specs_tr || displaySubtitle,
                    badge: badgeLabel,
                    item_type: product.item_type as any
                  })
                }
                className="flex-1 py-2 px-3 rounded-md bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-500/20 cursor-pointer active:scale-95"
              >
                <ShoppingBag size={13} />
                <span>{locale === 'ar' ? 'أضف للسلة' : locale === 'en' ? 'Add to Cart' : 'Sepete Ekle'}</span>
              </button>
            )}

            <Link
              href={productUrl}
              className={cn(
                "py-2 px-3 rounded-md bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all border border-border flex items-center justify-center cursor-pointer",
                !showAddToCart && "flex-1"
              )}
              title={locale === 'ar' ? 'عرض تفاصيل ومواصفات المنتج' : 'Ürün detaylarını görüntüle'}
            >
              {locale === 'ar' ? 'التفاصيل' : locale === 'en' ? 'Details' : 'İncele'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductCard;
