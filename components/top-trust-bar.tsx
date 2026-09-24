'use client';

import React from 'react';
import { ShieldCheck, UserCheck, CheckCircle, Award, AlertCircle, Truck, Sparkles } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import Marquee from 'react-fast-marquee';
import { useSettings } from './settings-provider';
import { usePathname } from 'next/navigation';

interface TopTrustBarProps {
  className?: string;
}

const icons = [CheckCircle, ShieldCheck, Award, UserCheck, Truck, Sparkles];

export function TopTrustBar({ className }: TopTrustBarProps) {
  const t = useTranslations('Trust');
  const locale = useLocale();
  const pathname = usePathname();
  const { settings } = useSettings();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide in admin panel
  if (pathname?.includes('/trt-secure-panel-2026')) {
    return null;
  }

  // Check global enable/disable setting
  if (settings['trust_bar_enabled'] === 'false') {
    return null;
  }

  // Get dynamic items from settings for the current locale
  const key = `trust_bar_${locale}`;
  const customItemsRaw = settings[key];

  let items: { text: string; icon: any; color?: string; isWarning?: boolean }[] = [];

  if (customItemsRaw && customItemsRaw.trim()) {
    const lines = customItemsRaw.split('\n').map(l => l.trim()).filter(Boolean);
    items = lines.map((line, idx) => {
      const isWarning = line.startsWith('[!]') || line.startsWith('[warning]');
      const cleanText = line.replace(/^(\[!\]|\[warning\])\s*/i, '');
      return {
        text: cleanText,
        icon: isWarning ? AlertCircle : icons[idx % icons.length],
        color: isWarning ? 'text-red-500 font-black' : undefined,
        isWarning
      };
    });
  }

  // Fallback to default items if not configured
  if (items.length === 0) {
    items = [
      { text: t('private_service_warning'), icon: AlertCircle, color: 'text-red-500 font-bold', isWarning: true },
      { text: t('since_2002'), icon: CheckCircle },
      { text: t('experience_25'), icon: UserCheck },
      { text: t('expert_team'), icon: Award },
      { text: t('no_payment'), icon: ShieldCheck },
      { text: t('free_kurye'), icon: Truck },
      { text: t('fault_detection_chargeable'), icon: AlertCircle, isWarning: true },
    ];
  }

  const speedSetting = parseInt(settings['trust_bar_speed'] || '', 10);
  const baseSpeed = !isNaN(speedSetting) && speedSetting > 0 ? speedSetting : 45;
  const currentSpeed = isMobile ? Math.max(20, Math.round(baseSpeed * 0.6)) : baseSpeed;

  return (
    <div 
      className={cn(
        "bg-[#0a0a0a] border-b border-white/5 py-2 text-white/90 overflow-hidden scrollbar-hide relative w-full cursor-pointer select-none transition-colors z-30",
        className
      )} 
      dir="ltr"
    >
      <Marquee speed={currentSpeed} pauseOnHover={true} gradient={false} autoFill={true}>
        <div className="flex items-center gap-12 md:gap-24 mx-6 md:mx-12">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2.5 text-white/85 shrink-0 group hover:text-white transition-colors">
              <item.icon 
                size={13} 
                className={cn("shrink-0 transition-transform group-hover:scale-110", item.isWarning ? "text-red-500 animate-pulse" : "text-primary")} 
              />
              <span className={cn(
                "font-black uppercase tracking-[0.16em] leading-none text-[10.5px]", 
                item.isWarning ? "text-red-500 font-black tracking-[0.18em]" : "text-white/85"
              )}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}
