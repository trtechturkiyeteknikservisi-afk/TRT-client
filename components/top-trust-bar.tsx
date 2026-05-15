'use client';

import React from 'react';
import { ShieldCheck, UserCheck, CheckCircle, Award, AlertCircle, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function TopTrustBar() {
  const t = useTranslations('Trust');
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const trustItems = [
    { text: t('private_service_warning'), icon: AlertCircle, color: 'text-red-500 font-bold' },
    { text: t('since_2002'), icon: CheckCircle },
    { text: t('experience_25'), icon: UserCheck },
    { text: t('expert_team'), icon: Award },
    { text: t('no_payment'), icon: ShieldCheck },
    { text: t('free_kurye'), icon: Truck },
    { text: t('fault_detection_chargeable'), icon: AlertCircle },
  ];

  // Duplicate items for seamless loop on all screens
  const displayItems = [...trustItems, ...trustItems, ...trustItems, ...trustItems];

  return (
    <div className="bg-[#0a0a0a] border-b border-white/5 py-2 overflow-hidden relative w-full">
      <div className="w-full">
        <div className="flex overflow-hidden group cursor-pointer">
          <div 
            className="flex items-center whitespace-nowrap gap-12 md:gap-24 animate-marquee-slow group-hover:[animation-play-state:paused] active:[animation-play-state:paused]"
          >
            {displayItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-white/80 shrink-0">
                <item.icon size={13} className={cn("shrink-0", item.color ? "text-red-500" : "text-primary")} />
                <span className={cn("text-[10px] font-black uppercase tracking-[0.15em] leading-none", item.color && "text-red-500")}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
