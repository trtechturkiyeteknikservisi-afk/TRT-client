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
    { icon: Phone, href: `tel:${supportPhone.replace(/\s/g, '')}`, color: '#dc2626' },
    { icon: WhatsappIcon, href: `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`, color: '#25D366', isImg: true },
    { icon: InstagramIcon, href: 'https://www.instagram.com/trtservis?igsh=MXcxZ25rNjNydjYxZQ%3D%3D&utm_source=qr', color: '#E1306C' },
    { icon: TiktokIcon, href: 'https://www.tiktok.com/@trtservis', color: '#000000' },
    { icon: FacebookIcon, href: 'https://www.facebook.com/share/185YU5woZA/?mibextid=wwXIfr', color: '#1877F2' },
    { icon: YoutubeIcon, href: 'https://youtube.com/@trtservis?si=kb9K3XN-LX4NX-du', color: '#FF0000' },
    { icon: TelegramIcon, href: 'https://t.me/trtservis', color: '#0088cc' },
    { icon: SnapchatIcon, href: 'https://snapchat.com/t/pL3vgBfZ', color: '#FFFC00', iconColor: 'text-black' },
    { icon: LinkedinIcon, href: 'https://www.linkedin.com/in/tr-tech-44a056402?utm_source=share_via&utm_content=profile&utm_medium=member_ios', color: '#0A66C2' },
    { icon: PinterestIcon, href: 'https://tr.pinterest.com/trtservis/?invite_code=6906950e8ba94d7b8b9a3364db735f0d&sender=1122240938304289862', color: '#E60023' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse items-center gap-4">
      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-500 overflow-hidden",
          isOpen ? "bg-white text-primary" : "bg-primary text-primary-foreground"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div 
              key="close" 
              initial={{ opacity: 0, rotate: -180 }} 
              animate={{ opacity: 1, rotate: 0 }} 
              exit={{ opacity: 0, rotate: 180 }}
              className="relative flex items-center justify-center"
            >
              {/* Rotating Circle Only */}
              <svg className="w-10 h-10 animate-[spin_2s_linear_infinite]" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray="180"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
              <img src="/whats.png" alt="Contact" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
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
                className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-white shadow-xl hover:scale-110 transition-transform group"
              >
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center transition-colors"
                  style={{ color: social.color }}
                >
                  <Icon size={32} className={cn("transition-transform group-hover:scale-110", social.iconColor || "")} />
                </div>
              </motion.a>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
