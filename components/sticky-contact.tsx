'use client';

import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

import { useSettings } from './settings-provider';

export function StickyContact() {
  const { settings } = useSettings();
  const t = useTranslations('Contact');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const whatsappNumber = settings.whatsapp || "908508401505";
  const supportPhone = settings.support_phone || "0850 840 15 05";
  const supportEmail = settings.support_email || "trtech@trtservis.com";

  if (pathname?.includes('/trt-secure-panel-2026')) return null;

  const socialLinks = [
    { image: '/maill.webp', href: `mailto:${supportEmail}`, label: t('email_label') },
    { image: '/location.png', href: 'https://maps.app.goo.gl/9kUMHWGGjDsoswFz9', label: t('location_label') },
    { image: '/instagram.webp', href: 'https://www.instagram.com/trtservis?igsh=MXcxZ25rNjNydjYxZQ%3D%3D&utm_source=qr', label: 'Instagram' },
    { image: '/calling-new.webp', href: `tel:${supportPhone.replace(/\s/g, '')}`, label: t('phone_label') },
    { image: '/whatsap.webp', href: `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`, label: t('whatsapp_label') },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col-reverse items-center gap-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label={isOpen ? 'Close contact shortcuts' : 'Open contact shortcuts'}
        aria-expanded={isOpen}
      >
          {isOpen ? (
            <div 
              key="close" 
              className="relative flex items-center justify-center w-full h-full rounded-full bg-white dark:bg-white shadow-lg border border-border/10 animate-in fade-in zoom-in duration-150"
            >
              <X size={28} className="text-primary" />
            </div>
          ) : (
            <div 
              key="open" 
              className="w-full h-full rounded-full bg-white dark:bg-white shadow-lg border border-border/10 flex items-center justify-center p-0.5 relative animate-in fade-in zoom-in duration-150"
            >
              {/* Radiating Ripple Wave 1 (CSS Animated Outline + Fill) */}
              <div className="absolute inset-0 rounded-full border border-primary/50 dark:border-white/50 bg-primary/10 dark:bg-white/10 pointer-events-none animate-ripple-1" />
              
              {/* Radiating Ripple Wave 2 (CSS Animated Outline + Fill) */}
              <div className="absolute inset-0 rounded-full border border-primary/30 dark:border-white/30 bg-primary/5 dark:bg-white/5 pointer-events-none animate-ripple-2" />
              
              {/* Thick Premium Ambient Glow (CSS Animated) */}
              <div className="absolute -inset-2 rounded-full bg-primary/20 dark:bg-white/15 blur-[10px] pointer-events-none animate-breathe" />

              <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center z-10">
                <Image src="/whatsap.webp" alt="Contact" width={56} height={56} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
            </div>
          )}
      </button>

      {/* Social Media Icons Vertical List */}
      <div className="flex flex-col-reverse items-center gap-3">
          {isOpen && socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target={social.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white dark:bg-white shadow-lg border border-border/10 hover:shadow-xl transition-all duration-300 p-0.5 group cursor-pointer animate-in fade-in slide-in-from-bottom-2 zoom-in-95"
                style={{ animationDelay: `${idx * 35}ms` }}
              >
                <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center">
                  <Image src={social.image} alt="" width={56} height={56} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-full overflow-hidden" />
                </div>
              </a>
          ))}
      </div>
    </div>
  );
}
