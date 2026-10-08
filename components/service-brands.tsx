'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const brandsData: Record<string, string[]> = {
  phone: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo', 'Realme', 'Google', 'OnePlus', 'Motorola', 'Sony', 'Asus'],
  laptop: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Toshiba', 'Microsoft', 'Razer', 'Gigabyte', 'Alienware'],
  robot: ['Xiaomi', 'Roborock', 'Viomi', 'Dreame', 'Ecovacs', 'iRobot', 'Samsung', 'Lydsto', 'Proscenic', 'Roidmi'],
  watch: ['Apple', 'Samsung', 'Huawei', 'Garmin', 'Xiaomi', 'Honor', 'Oppo', 'Google Pixel', 'OnePlus', 'Amazfit', 'Fitbit', 'Suunto', 'Polar'],
  tablet: ['Apple', 'Samsung', 'Huawei', 'Lenovo', 'Microsoft', 'Xiaomi', 'Amazon', 'Google', 'Honor'],
  headphones: ['Apple', 'Sony', 'Bose', 'JBL', 'Sennheiser', 'Beats', 'Marshall', 'Harman Kardon', 'Audio-Technica', 'Skullcandy'],
  playstation: ['Sony PlayStation', 'PS5', 'PS4', 'DualSense', 'Nintendo Switch', 'Xbox Series X', 'Xbox Series S', 'Steam Deck', 'Logitech', 'Razer'],
  gaming: ['Sony PlayStation', 'PS5', 'PS4', 'DualSense', 'Nintendo Switch', 'Xbox Series X', 'Xbox Series S', 'Steam Deck', 'Logitech', 'Razer'],
  general: ['Apple', 'Samsung', 'Sony', 'Microsoft', 'Xiaomi', 'Asus', 'Lenovo', 'HP', 'Dell', 'Google', 'Huawei', 'Logitech']
};

interface ServiceBrandsProps {
  type: string;
}

export function ServiceBrands({ type }: ServiceBrandsProps) {
  const lower = (type || '').toLowerCase();
  let brandsKey = 'general';
  if (brandsData[lower]) {
    brandsKey = lower;
  } else if (lower.includes('playstation') || lower.includes('konsol') || lower.includes('oyun') || lower.includes('xbox') || lower.includes('nintendo') || lower.includes('ps5') || lower.includes('ps4')) {
    brandsKey = 'playstation';
  } else if (lower.includes('kulaklik') || lower.includes('headphone')) {
    brandsKey = 'headphones';
  } else if (lower.includes('saat') || lower.includes('watch')) {
    brandsKey = 'watch';
  } else if (lower.includes('robot') || lower.includes('supurge')) {
    brandsKey = 'robot';
  } else if (lower.includes('laptop') || lower.includes('bilgisayar') || lower.includes('computer')) {
    brandsKey = 'laptop';
  } else if (lower.includes('tablet') || lower.includes('ipad')) {
    brandsKey = 'tablet';
  } else if (lower.includes('telefon') || lower.includes('phone')) {
    brandsKey = 'phone';
  }

  const brands = brandsData[brandsKey] || brandsData.general;
  // Duplicate brands to create a seamless loop
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-card/30 border-y border-white/5 py-8 overflow-hidden relative group">
      {/* Subtle Label */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 rotate-180 [writing-mode:vertical-lr]">
           Supported Brands
         </span>
      </div>

      <div className="flex select-none [direction:ltr]" dir="ltr">
        <motion.div
          animate={{
            x: [0, -182 * brands.length],
          }}
          transition={{
            duration: brands.length * 3,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex gap-8 items-center"
        >
          {duplicatedBrands.map((brand, index) => (
            <div
              key={`${brand}-${index}`}
              className="flex items-center justify-center w-[150px] h-16 bg-background/40 border border-primary/10 dark:border-white/5 rounded-xl px-8 hover:border-primary/30 transition-all group/item"
            >
              <span className="text-xl font-black tracking-tighter text-muted-foreground/60 group-hover/item:text-primary transition-colors uppercase whitespace-nowrap">
                {brand}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Fade Overlays */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
    </div>
  );
}
