import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_/\\]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProductSlug(item: any): string {
  if (!item) return '';
  if (item.slug && typeof item.slug === 'string' && item.slug.trim()) {
    return slugify(item.slug);
  }

  const model = (item.model_name || item.model || item.title || '').trim();
  const service = (item.service_name_tr || item.title_tr || item.service_name_en || item.title_en || item.service_name_ar || item.title_ar || '').trim();

  let combined = model;
  if (service && !model.toLowerCase().includes(service.toLowerCase())) {
    combined = combined ? `${model} ${service}` : service;
  } else if (!combined) {
    combined = service;
  }

  const slug = slugify(combined);
  const cleanId = String(item.id || 'product').replace(/^db-/, '');
  return slug || cleanId;
}

export function getProductUrl(item: any): string {
  const slug = getProductSlug(item);
  return `/urunler/product/${encodeURIComponent(slug)}`;
}

