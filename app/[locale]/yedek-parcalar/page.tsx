import React from 'react';
import { Metadata } from 'next';
import { CategoryShopView } from '@/components/category-shop-view';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'قطع الغيار الأصلية والمعادلة للهواتف والأجهزة | TR TECH' : 'Yedek Parçalar | Orijinal ve Uyumlu Parçalar | TR TECH',
    description: locale === 'ar'
      ? 'شراء شاشات، بطاريات، كاميرات ومنافذ شحن أصلية ومضمونة لجميع موديلات آيفون وسامسونج وشاومي.'
      : 'iPhone, Samsung ve Xiaomi için orijinal ve yüksek kaliteli ekran, batarya, kamera ve şarj soketi yedek parçaları.'
  };
}

export default function YedekParcalarPage() {
  return <CategoryShopView categorySlug="yedek_parca" />;
}
