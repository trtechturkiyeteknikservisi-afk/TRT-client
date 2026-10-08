import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ProductDetailView } from '@/components/product-detail-view';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ProductPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const decodedId = decodeURIComponent(id || '').trim();
  const cleanId = decodedId.startsWith('db-') ? decodedId.replace('db-', '') : decodedId;

  try {
    const res = await axios.get<any>(`${API_BASE}/pricing/${encodeURIComponent(cleanId)}`, { timeout: 4000 });
    const product: any = res.data;

    if (product) {
      const title = locale === 'ar'
        ? (product.service_name_ar || product.model_name)
        : locale === 'en'
          ? (product.service_name_en || product.model_name)
          : (product.service_name_tr || product.model_name);

      const desc = locale === 'ar'
        ? (product.description_ar || product.specs_ar || `${title} - قطع غيار وصيانة بأعلى معايير الجودة مع ضمان TR TECH.`)
        : locale === 'en'
          ? (product.description_en || product.specs_en || `${title} - Premium parts and repair with official TR TECH warranty.`)
          : (product.description_tr || product.specs_tr || `${title} - Orijinal yedek parça ve profesyonel teknik servis TR TECH güvencesiyle.`);

      const image = Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : (product.image_url || '/images/spare-parts-screen.jpg');

      return {
        title: `${title} | TR TECH`,
        description: desc.slice(0, 160),
        openGraph: {
          title: `${title} | TR TECH`,
          description: desc.slice(0, 160),
          images: [image]
        }
      };
    }
  } catch (e) {
    // Fallback if backend offline during build
  }

  const fallbackTitle = locale === 'ar' ? 'تفاصيل المنتج والأسعار' : locale === 'en' ? 'Product Details & Pricing' : 'Ürün Detayı ve Fiyatı';
  return {
    title: `${fallbackTitle} | TR TECH`,
    description: locale === 'ar'
      ? 'استعرض تفاصيل ومواصفات المنتج وأسعاره المعتمدة مع ضمان رسمي من TR TECH.'
      : 'TR TECH güvencesiyle ürün özellikleri, teknik detaylar ve güncel fiyat bilgisi.'
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <ProductDetailView productId={id} />;
}
