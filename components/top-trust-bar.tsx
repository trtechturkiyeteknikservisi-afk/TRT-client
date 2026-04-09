'use client';

import React from 'react';
import { ShieldCheck, UserCheck, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TopTrustBar() {
  const t = useTranslations('Trust');

  const trustItems = [
    { text: t('expert_team'), icon: UserCheck },
    { text: t('warranty'), icon: ShieldCheck },
    { text: t('secure_process'), icon: CheckCircle },
  ];

  return (
    <div className="bg-[#0a0a0a] border-b border-white/5 py-2 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-white/70">
              <item.icon size={14} className="text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest leading-none">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
