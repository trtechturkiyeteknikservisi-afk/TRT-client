'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useSettings } from '@/components/settings-provider';

interface ContactCard {
  key: string;
  icon: string | null;
  lucideIcon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc?: string | null;
  lines?: string[];
  action: string;
  link: string;
  isButton: boolean;
}

export default function ContactPage() {
  const t = useTranslations('ContactPage');
  const { settings: globalSettings } = useSettings();

  const settings = {
    whatsapp: globalSettings.whatsapp || '908508401505',
    support_phone: globalSettings.support_phone || '0850 840 15 05',
    support_email: globalSettings.support_email || 'trtech@trtservis.com'
  };

  const cards: ContactCard[] = [
    {
      key: 'whatsapp',
      icon: '/whatsap.webp',
      title: t('whatsapp_title'),
      desc: t('whatsapp_desc'),
      action: t('whatsapp_action'),
      link: `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`,
      isButton: true
    },
    {
      key: 'phone',
      icon: '/calling-new.webp',
      title: t('phone_title'),
      desc: t('phone_desc'),
      action: settings.support_phone,
      link: `tel:${settings.support_phone.replace(/\s+/g, '')}`,
      isButton: true
    },
    {
      key: 'whatsapp_complaints',
      icon: '/whatsap.webp',
      title: t('whatsapp_complaints_title'),
      desc: t('whatsapp_complaints_desc'),
      action: t('whatsapp_complaints_action'),
      link: 'https://wa.me/905067006677',
      isButton: true
    },
    {
      key: 'email',
      icon: '/maill.webp',
      title: t('email_title'),
      desc: t('email_desc'),
      action: settings.support_email,
      link: `mailto:${settings.support_email}`,
      isButton: true
    },
    {
      key: 'map',
      icon: '/location.png',
      title: t('map_title'),
      desc: t('map_desc'),
      action: t('map_action'),
      link: 'https://maps.app.goo.gl/9kUMHWGGjDsoswFz9',
      isButton: true
    },
    {
      key: 'youtube',
      icon: '/youtube.webp',
      title: t('youtube_title'),
      desc: t('youtube_desc'),
      action: t('youtube_action'),
      link: 'https://youtube.com/@trtservis?si=kb9K3XN-LX4NX-du',
      isButton: true
    },
    {
      key: 'facebook',
      icon: '/facebook.webp',
      title: t('facebook_title'),
      desc: t('facebook_desc'),
      action: t('facebook_action'),
      link: 'https://www.facebook.com/TRTechServis/',
      isButton: true
    },
    {
      key: 'telegram',
      icon: '/telegram.webp',
      title: t('telegram_title'),
      desc: t('telegram_desc'),
      action: t('telegram_action'),
      link: 'https://t.me/trtservis',
      isButton: true
    },
    {
      key: 'snapchat',
      icon: '/snapchat.webp',
      title: t('snapchat_title'),
      desc: t('snapchat_desc'),
      action: t('snapchat_action'),
      link: 'https://snapchat.com/t/pL3vgBfZ',
      isButton: true
    },
    {
      key: 'linkedin',
      icon: '/linkedin.webp',
      title: t('linkedin_title'),
      desc: t('linkedin_desc'),
      action: t('linkedin_action'),
      link: 'https://www.linkedin.com/company/trtservis/',
      isButton: true
    },
    {
      key: 'pinterest',
      icon: '/pinterest.webp',
      title: t('pinterest_title'),
      desc: t('pinterest_desc'),
      action: t('pinterest_action'),
      link: 'https://tr.pinterest.com/trtservis/?invite_code=6906950e8ba94d7b8b9a3364db735f0d&sender=1122240938304289862',
      isButton: true
    }
  ];

  return (
    <main className="min-h-screen bg-muted/20 dark:bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
      
          
          <h1
            className="text-4xl md:text-6xl font-black tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {t('title')}
          </h1>
          
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl font-medium animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100"
          >
            {t('subtitle')}
          </p>

          <div
            className="w-20 h-1 bg-primary rounded-full animate-in fade-in zoom-in-x duration-500 delay-200"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5">
          {cards.map((card, idx) => {
            const LucideIcon = card.lucideIcon;

            return (
              <a
                key={card.key}
                href={card.link}
                target={card.link.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label={`${card.title}: ${card.action}`}
                className="group flex flex-col justify-between items-center text-center p-8 bg-card border border-black/10 dark:border-border/40 rounded-xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${idx * 35}ms` }}
              >

                <div className="flex flex-col items-center w-full space-y-6">
                  {/* Icon with White Circle Background */}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center p-0.5 transition-transform duration-300 group-hover:scale-110 shrink-0 bg-white dark:bg-white shadow-md border border-border/10">
                    {card.icon ? (
                      <div className="w-full h-full relative overflow-hidden rounded-full flex items-center justify-center">
                        <Image 
                          src={card.icon} 
                          alt={card.title} 
                          width={64}
                          height={64}
                          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                        />
                      </div>
                    ) : LucideIcon ? (
                      <LucideIcon size={32} className="text-slate-800" />
                    ) : null}
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-3 w-full">
                    <h3 className="text-xl font-black uppercase tracking-wider text-foreground">
                      {card.title}
                    </h3>
                    
                    {card.desc && (
                      <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                        {card.desc}
                      </p>
                    )}

                    {card.lines && (
                      <div className="space-y-1 text-sm font-black text-muted-foreground">
                        {card.lines.map((line, lIdx) => (
                          <p key={lIdx}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action button/value */}
                <div className="mt-8 w-full z-20">
                  {card.isButton ? (
                    <div className="w-full py-2.5 px-4 rounded-xl border border-primary text-primary font-black text-sm transition-all duration-300 bg-background group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                      <span>{card.action}</span>
                      <ExternalLink size={14} className="opacity-70" />
                    </div>
                  ) : (
                    <div className="text-primary font-black text-base md:text-lg hover:underline transition-all block cursor-pointer" dir="ltr">
                      {card.action}
                    </div>
                  )}
                </div>

              </a>
            );
          })}
        </div>

      </div>
    </main>
  );
}
