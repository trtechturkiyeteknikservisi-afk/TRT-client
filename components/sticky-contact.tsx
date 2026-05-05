'use client';

import React from 'react';
import { MessageCircle, X } from 'lucide-react';
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
  WhatsappIcon 
} from './social-icons';

export function StickyContact() {
  const t = useTranslations('Contact');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [whatsappNumber, setWhatsappNumber] = React.useState("905302094094");

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.whatsapp) setWhatsappNumber(data.whatsapp);
        }
      } catch (err) {
        console.error("Failed to fetch settings in StickyContact", err);
      }
    };
    fetchSettings();
  }, []);

  if (pathname?.includes('/admin')) return null;

  const socialLinks = [
    { icon: () => <img src="/whats.png" alt="WhatsApp" className="w-7 h-7 object-contain" />, href: `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`, color: 'bg-[#25D366]' },
    { icon: InstagramIcon, href: 'https://www.instagram.com/trtservis?igsh=MXcxZ25rNjNydjYxZQ%3D%3D&utm_source=qr', color: 'bg-[#E1306C]' },
    { icon: TiktokIcon, href: 'https://www.tiktok.com/@trtservis', color: 'bg-[#000000]', isTiktok: true },
    { icon: FacebookIcon, href: 'https://www.facebook.com/share/185YU5woZA/?mibextid=wwXIfr', color: 'bg-[#1877F2]' },
    { icon: YoutubeIcon, href: 'https://youtube.com/@trtservis?si=kb9K3XN-LX4NX-du', color: 'bg-[#FF0000]' },
    { icon: TelegramIcon, href: 'https://t.me/trtservis', color: 'bg-[#0088cc]' },
    { icon: SnapchatIcon, href: 'https://snapchat.com/t/pL3vgBfZ', color: 'bg-[#FFFC00]', iconColor: 'text-black' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col-reverse items-center gap-4">
      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500",
          isOpen ? "bg-red-500 text-white rotate-90" : "bg-primary text-primary-foreground"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <X size={28} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
              <img src="/whats.png" alt="Contact" className="w-10 h-10 object-contain" />
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
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform",
                  social.color
                )}
              >
                <Icon size={20} className={social.iconColor || "text-white"} />
              </motion.a>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
