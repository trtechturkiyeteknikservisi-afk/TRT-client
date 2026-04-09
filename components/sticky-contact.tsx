'use client';

import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export function StickyContact() {
  const t = useTranslations('Contact');
  const pathname = usePathname();
  const isArabic = pathname?.startsWith('/ar');

  // We only show this on the main customer-facing pages, not on admin pages
  if (pathname?.includes('/admin')) return null;

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If we're not on the home page, redirect to home page with #contact anchor
      window.location.href = `/${isArabic ? 'ar' : pathname.split('/')[1] || 'en'}#contact`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8, type: 'spring' }}
      className="fixed top-1/2 -translate-y-1/2 z-[100] left-0"
    >
      <a
        href="#contact"
        onClick={scrollToContact}
        className="group relative flex flex-col items-center bg-primary text-primary-foreground py-4 px-3 sm:px-2  transition-all duration-500 rounded-r-[2rem] border-y border-r border-white/20 hover:pl-6 hover:translate-x-2"
      >
        {/* Glowing background effect */}
        <div className="absolute  bg-primary/20 rounded-inherit -z-10   transition-all duration-700" />
        
        <div className="flex flex-col items-center gap-6">
          {/* Pulsing Icon */}
          <div className="relative">
            <MessageSquare size={26} className="group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 border-2 border-primary rounded-full animate-pulse" />
          </div>
          
          {/* Vertical Text - Always Visible */}
          <span className="[writing-mode:vertical-lr] rotate-180 text-sm sm:text-base font-black uppercase tracking-[0.2em] whitespace-nowrap  transition-opacity">
            {t('sticky_contact_cta')}
          </span>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute overflow-hidden rounded-inherit pointer-events-none">
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[150%] transition-all duration-1000 ease-in-out" />
        </div>
      </a>
    </motion.div>
  );
}
