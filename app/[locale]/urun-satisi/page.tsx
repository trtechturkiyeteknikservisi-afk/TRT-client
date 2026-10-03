import React from 'react';
import { Metadata } from 'next';
import { ShopHub } from '@/components/shop-hub';
import { CategoryShopView } from '@/components/category-shop-view';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'المنتجات والأسعار | TR TECH' : locale === 'en' ? 'Products & Pricing | TR TECH' : 'Ürünler ve Fiyatlar | TR TECH',
    description: locale === 'ar' 
      ? 'شراء واستعراض أحدث الهواتف، اللابتوبات، المكانس الروبوتية، الساعات وقطع الغيار بأسعار منافسة وضمان حقيقي.'
      : 'Orijinal ve uyumlu teknoloji ürünleri, yedek parçalar ve servis fiyatları en uygun avantajlarla TR TECH’de.'
  };
}

export default async function UrunSatisiPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; brand?: string; q?: string }>;
}) {
  const params = await searchParams;
  const category = params?.category;
  const brand = params?.brand;
  const q = params?.q;

  return (
    <CategoryShopView
      categorySlug={category || 'all'}
      initialBrand={brand}
      initialSearch={q}
    />
  );
}
