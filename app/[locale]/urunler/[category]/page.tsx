import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CategoryShopView } from '@/components/category-shop-view';
import { STORE_CATEGORIES } from '@/lib/store-data';

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    category: string;
  }>;
  searchParams: Promise<{
    brand?: string;
    q?: string;
    part?: string;
  }>;
}

const CATEGORY_NAMES: Record<string, { ar: string; en: string; tr: string }> = {
  telefon: { ar: 'الهواتف وقطع الغيار', en: 'Phones & Spare Parts', tr: 'Telefon & Yedek Parçalar' },
  phone: { ar: 'الهواتف وقطع الغيار', en: 'Phones & Spare Parts', tr: 'Telefon & Yedek Parçalar' },
  laptop: { ar: 'الحواسيب واللابتوب', en: 'Laptops & Computers', tr: 'Laptop & Bilgisayar' },
  robot: { ar: 'المكانس الذكية والروبوتية', en: 'Robot Vacuums & Parts', tr: 'Robot Süpürgeler & Parçalar' },
  watch: { ar: 'الساعات الذكية', en: 'Smart Watches', tr: 'Akıllı Saatler' },
  kulaklik: { ar: 'السماعات الصوتية', en: 'Headphones & Audio', tr: 'Kulaklıklar' },
  aksesuar: { ar: 'الإكسسوارات والملحقات', en: 'Accessories', tr: 'Aksesuarlar' },
  yedek_parca: { ar: 'قطع الغيار الأصلية', en: 'Genuine Spare Parts', tr: 'Orijinal Yedek Parçalar' },
  tablet: { ar: 'الأجهزة اللوحية والآيباد', en: 'Tablets & iPads', tr: 'Tablet & iPad' }
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const catNames = CATEGORY_NAMES[category.toLowerCase()] || {
    ar: `قسم ${category}`,
    en: `${category} Department`,
    tr: `${category} Kategorisi`
  };

  const titleName = locale === 'ar' ? catNames.ar : locale === 'en' ? catNames.en : catNames.tr;

  const desc = locale === 'ar'
    ? `استعرض جميع منتجات وأسعار ${titleName} الأصلية والمضمونة بأفضل الأسعار مع صيانة فورية وشحن سريع من TR TECH.`
    : locale === 'en'
      ? `Browse all original products, spare parts and repair prices for ${titleName} with official warranty and fast shipping from TR TECH.`
      : `TR TECH güvencesiyle en kaliteli ${titleName} ürünleri, orijinal parçalar, teknik servis fiyatları ve hızlı teslimat avantajları.`;

  return {
    title: `${titleName} | TR TECH`,
    description: desc,
    openGraph: {
      title: `${titleName} | TR TECH`,
      description: desc
    }
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale, category } = await params;
  const sParams = await searchParams;
  setRequestLocale(locale);

  return (
    <CategoryShopView
      categorySlug={category}
      initialBrand={sParams?.brand}
      initialSearch={sParams?.q}
      initialPart={sParams?.part}
    />
  );
}
