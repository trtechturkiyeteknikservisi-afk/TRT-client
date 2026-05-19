'use client';

import React from 'react';
import { ShieldCheck, UserCheck, CheckCircle, Award, AlertCircle, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Marquee from 'react-fast-marquee';

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

  return (
    <div className="bg-[#0a0a0a] border-b border-white/5 py-2 overflow-hidden scrollbar-hide relative w-full cursor-pointer" dir="ltr">
      <Marquee speed={isMobile ? 25 : 45} pauseOnHover={true} gradient={false} autoFill={true}>
        <div className="flex items-center gap-12 md:gap-24 mx-6 md:mx-12">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-white/80 shrink-0">
              <item.icon size={13} className={cn("shrink-0", item.color ? "text-red-500" : "text-primary")} />
              <span className={cn("text-[10px] font-black uppercase tracking-[0.15em] leading-none", item.color && "text-red-500")}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}
