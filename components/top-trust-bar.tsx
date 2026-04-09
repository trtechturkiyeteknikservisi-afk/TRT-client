'use client';

import React from 'react';
import { ShieldCheck, UserCheck, CheckCircle, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TopTrustBar() {
  const t = useTranslations('Trust');

  const trustItems = [
    { text: t('since_2002'), icon: CheckCircle },
    { text: t('experience_25'), icon: UserCheck },
    { text: t('expert_team'), icon: Award },
    { text: t('no_payment'), icon: ShieldCheck },
  ];

  return (
    <div className="bg-[#0a0a0a] border-b border-white/5 py-2.5 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-8">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-white/80 group">
              <item.icon size={13} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none whitespace-nowrap">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
