'use client';

import React from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

import { 
  InstagramIcon, 
  FacebookIcon, 
  YoutubeIcon, 
  TiktokIcon, 
  SnapchatIcon, 
  TelegramIcon, 
  WhatsappIcon,
  LinkedinIcon,
  PinterestIcon
} from './social-icons';

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
    { image: '/maill.webp', href: `mailto:${supportEmail}` },
    { image: '/location.png', href: 'https://maps.app.goo.gl/9kUMHWGGjDsoswFz9' },
    { image: '/instagram.webp', href: 'https://www.instagram.com/trtservis?igsh=MXcxZ25rNjNydjYxZQ%3D%3D&utm_source=qr' },
    { image: '/calling-new.webp', href: `tel:${supportPhone.replace(/\s/g, '')}` },
    { image: '/whatsap.webp', href: `https://wa.me/${whatsappNumber.replace(/\D/g, '')}` },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col-reverse items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center transition-all duration-500 cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div 
              key="close" 
              initial={{ opacity: 0, rotate: -180 }} 
              animate={{ opacity: 1, rotate: 0 }} 
              exit={{ opacity: 0, rotate: 180 }}
              className="relative flex items-center justify-center w-full h-full rounded-full bg-white dark:bg-white shadow-lg border border-border/10"
            >
              <X size={24} className="text-primary" />
            </motion.div>
          ) : (
            <motion.div 
              key="open" 
              initial={{ opacity: 0, rotate: 90 }} 
              animate={{ opacity: 1, rotate: 0 }} 
              exit={{ opacity: 0, rotate: -90 }} 
              className="w-full h-full rounded-full bg-white dark:bg-white shadow-lg border border-border/10 flex items-center justify-center p-2"
            >
              <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center">
                <Image src="/whatsap.webp" alt="Contact" width={56} height={56} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Social Media Icons Vertical List */}
      <div className="flex flex-col-reverse items-center gap-3">
        <AnimatePresence>
          {isOpen && socialLinks.map((social, idx) => (
              <motion.a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.5 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white dark:bg-white shadow-lg border border-border/10 hover:shadow-xl transition-all duration-300 p-2 group cursor-pointer"
              >
                <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center">
                  <Image src={social.image} alt="" width={56} height={56} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-full overflow-hidden" />
                </div>
              </motion.a>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
