'use client';

import React from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
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

  if (pathname?.includes('/trt-secure-panel-2026')) return null;

  const socialLinks = [
    { image: '/facebook.webp', href: 'https://www.facebook.com/share/185YU5woZA/?mibextid=wwXIfr' },
    { image: '/instagram.webp', href: 'https://www.instagram.com/trtservis?igsh=MXcxZ25rNjNydjYxZQ%3D%3D&utm_source=qr' },
    { image: '/whatsap.webp', href: `https://wa.me/${whatsappNumber.replace(/\D/g, '')}` },
    { image: '/tiktok.webp', href: 'https://www.tiktok.com/@trtservis' },
    { image: '/youtube.webp', href: 'https://youtube.com/@trtservis?si=kb9K3XN-LX4NX-du' },
    { image: '/telegram.webp', href: 'https://t.me/trtservis' },
    { image: '/snapchat.webp', href: 'https://snapchat.com/t/pL3vgBfZ' },
    { image: '/linkedin.webp', href: 'https://www.linkedin.com/in/tr-tech-44a056402?utm_source=share_via&utm_content=profile&utm_medium=member_ios' },
    { image: '/pinterest.webp', href: 'https://tr.pinterest.com/trtservis/?invite_code=6906950e8ba94d7b8b9a3364db735f0d&sender=1122240938304289862' },
    { image: '/calling.webp', href: `tel:${supportPhone.replace(/\s/g, '')}` },
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
              className="relative flex items-center justify-center p-2 !bg-transparent !shadow-none"
              style={{ background: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}
            >
              <X size={24} className="text-primary" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} className="w-full h-full rounded-full overflow-hidden">
              <img src="/whatsap.webp" alt="Contact" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Social Media Icons Vertical List */}
      <div className="flex flex-col-reverse items-center gap-3">
        <AnimatePresence>
          {isOpen && socialLinks.map((social, idx) => {
            const Icon = social.icon as any;
            return (
              <motion.a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.5 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center hover:scale-110 transition-transform group cursor-pointer !bg-transparent !shadow-none !border-0"
                style={{ background: 'none', backgroundColor: 'transparent', boxShadow: 'none', border: 'none' }}
              >
                {social.image ? (
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img src={social.image} alt="" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-full overflow-hidden" />
                  </div>
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-primary !bg-transparent"
                    style={{ background: 'none', backgroundColor: 'transparent' }}
                  >
                    <Icon className="w-6 h-6 md:w-8 md:h-8 transition-transform group-hover:scale-110" />
                  </div>
                )}
              </motion.a>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
