'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useSettings } from './settings-provider';
import Marquee from 'react-fast-marquee';

export function NewsBar() {
  const { settings } = useSettings();
  const locale = useLocale();
  const pathname = usePathname();
  const [news, setNews] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="bg-primary text-primary-foreground py-1.5 overflow-hidden relative border-b border-white/10 shadow-lg cursor-pointer">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none" />
      
      <div className="w-full flex items-center relative px-4">
        {/* Label Prefix */}
        <div className="flex items-center justify-center shrink-0 pr-6 z-10 bg-primary shadow-[10px_0_15px_-5px_hsl(var(--primary))]">
          <Megaphone size={13} className="animate-bounce" />
        </div>
 
        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden group">
          <Marquee speed={isMobile ? 25 : 45} pauseOnHover={true} gradient={false} autoFill={true}>
            <div className="flex items-center gap-20 mr-20">
              {newsItems.map((item, idx) => (
                <span key={idx} className="text-[10px] font-black uppercase tracking-[0.15em] leading-none flex items-center gap-3">
                  {item}
                  <span className="relative flex h-2 w-2 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                </span>
              ))}
            </div>
          </Marquee>
        </div>
      </div>
    </div>
  );
}
