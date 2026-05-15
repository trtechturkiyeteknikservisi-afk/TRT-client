'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useSettings } from './settings-provider';

export function NewsBar() {
  const { settings } = useSettings();
  const locale = useLocale();
  const pathname = usePathname();
  const [news, setNews] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pathname?.includes('/trt-secure-panel-2026')) {
      setIsVisible(false);
      return;
    }
    
    const newsKey = `news_bar_${locale}`;
    const newsContent = settings[newsKey] || settings['news_bar_en'] || '';
    
    if (newsContent.trim()) {
      setNews(newsContent);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [locale, pathname, settings]);

  if (!isVisible) return null;

  const newsItems = news.split('\n').filter(item => item.trim());

  return (
    <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden relative border-b border-white/10 shadow-lg z-[200]">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none" />
      
      <div className="w-full flex items-center gap-6 relative px-4">
        {/* Label Prefix */}
        <div className="flex items-center justify-center shrink-0 bg-white/20 w-8 h-8 rounded-full border border-white/20 backdrop-blur-sm shadow-sm">
          <Megaphone size={14} className="animate-bounce" />
        </div>

        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden group cursor-pointer">
          <div
            className="whitespace-nowrap flex items-center gap-20 animate-marquee group-hover:[animation-play-state:paused] active:[animation-play-state:paused]"
          >
            {/* عرض قائمة الأخبار */}
            {newsItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wide flex items-center gap-3">
                  {item}
                  {newsItems.length > 1 && (
                    <span className="relative flex h-2 w-2 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}
                </span>
              </React.Fragment>
            ))}
            
            {/* التكرار لضمان حركة مستمرة سلسة */}
            {newsItems.map((item, idx) => (
              <React.Fragment key={`rep-${idx}`}>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wide flex items-center gap-3">
                  {item}
                  {newsItems.length > 1 && (
                    <span className="relative flex h-2 w-2 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
