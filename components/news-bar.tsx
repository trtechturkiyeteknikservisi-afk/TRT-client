'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export function NewsBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const [news, setNews] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide if on admin pages
    if (pathname?.includes('/admin')) {
      setIsVisible(false);
      return;
    }
    const fetchNews = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${API_URL}/settings`);
        const data = response.data as any;
        
        // Get localized news
        const newsKey = `news_bar_${locale}`;
        const newsContent = data[newsKey] || data['news_bar_en'] || '';
        
        if (newsContent.trim()) {
          setNews(newsContent);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Failed to fetch news bar content', error);
      }
    };
    fetchNews();
  }, [locale]);

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden relative border-b border-white/10 shadow-lg z-[200]">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none" />
      
      <div className="container mx-auto flex items-center gap-6 relative px-4">
        {/* Label Prefix */}
        <div className="flex items-center gap-2 shrink-0 bg-white/20 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm shadow-sm">
          <Megaphone size={14} className="animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {locale === 'ar' ? 'آخر الأخبار' : locale === 'tr' ? 'Son Haberler' : 'Latest News'}
          </span>
        </div>

        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="whitespace-nowrap flex items-center gap-20"
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
              {news}
            </span>
            {/* Duplicate for seamless scroll */}
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
              {news}
            </span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
              {news}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
