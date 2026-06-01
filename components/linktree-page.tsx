'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  ArrowRight, 
  ShieldCheck
} from 'lucide-react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface LinktreePageProps {
  translations: {
    title: string;
    description: string;
    website: string;
    website_desc: string;
    whatsapp_support: string;
    whatsapp_support_desc: string;
    whatsapp_complaints: string;
    whatsapp_complaints_desc: string;
    phone_call: string;
    phone_call_desc: string;
    email_us: string;
    email_us_desc: string;
    location_map: string;
    location_map_desc: string;
    google_reviews: string;
    google_reviews_desc: string;
    instagram: string;
    instagram_desc: string;
    tiktok: string;
    tiktok_desc: string;
    facebook: string;
    facebook_desc: string;
    youtube: string;
    youtube_desc: string;
    telegram: string;
    telegram_desc: string;
    snapchat: string;
    snapchat_desc: string;
    pinterest: string;
    pinterest_desc: string;
    linkedin: string;
    linkedin_desc: string;
  };
  locale: string;
}

// Custom official multicolored Google SVG Icon for reviews card
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 object-contain shrink-0" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export function LinktreePage({ translations, locale }: LinktreePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveTheme = resolvedTheme || theme;

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const t = (key: keyof typeof translations) => translations[key];

  // Links list mapped in the exact client-approved ordering:
  const links = [
    {
      label: t('whatsapp_support'),
      desc: t('whatsapp_support_desc'),
      href: "https://wa.me/905067006677",
      image: "/whatsap.webp",
      color: "hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-500 dark:hover:text-emerald-400 hover:shadow-emerald-500/5 border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/5",
      external: true,
      vip: true
    },
    {
      label: t('phone_call'),
      desc: t('phone_call_desc'),
      href: "tel:+908508401505",
      image: "/calling-new.webp",
      color: "hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-500 dark:hover:text-blue-400 hover:shadow-blue-500/5",
      external: true
    },
    {
      label: t('location_map'),
      desc: t('location_map_desc'),
      href: "https://maps.app.goo.gl/9kUMHWGGjDsoswFz9",
      image: "/location.png",
      color: "hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:hover:text-white hover:shadow-primary/5",
      external: true
    },
    {
      label: t('google_reviews'),
      desc: t('google_reviews_desc'),
      href: "https://maps.app.goo.gl/9kUMHWGGjDsoswFz9",
      image: "",
      isGoogle: true,
      color: "hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-blue-500/5",
      external: true
    },
    {
      label: t('instagram'),
      desc: t('instagram_desc'),
      href: "https://www.instagram.com/trtservis?igsh=MXcxZ25rNjNydjYxZQ%3D%3D&utm_source=qr",
      image: "/instagram.webp",
      color: "hover:border-pink-500/40 hover:bg-pink-500/5 hover:text-pink-500 dark:hover:text-pink-400 hover:shadow-pink-500/5",
      external: true
    },
    {
      label: t('website'),
      desc: t('website_desc'),
      href: "/",
      image: "/globe.svg",
      color: "hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:hover:text-white hover:shadow-primary/5",
      external: false
    },
    {
      label: t('tiktok'),
      desc: t('tiktok_desc'),
      href: "https://www.tiktok.com/@trtservis",
      image: "/tiktok.webp",
      color: "hover:border-foreground/30 hover:bg-foreground/5 hover:text-foreground dark:hover:text-white hover:shadow-foreground/5",
      external: true
    },
    {
      label: t('youtube'),
      desc: t('youtube_desc'),
      href: "https://youtube.com/@trtservis?si=kb9K3XN-LX4NX-du",
      image: "/youtube.webp",
      color: "hover:border-red-600/40 hover:bg-red-600/5 hover:text-red-600 dark:hover:text-red-400 hover:shadow-red-600/5",
      external: true
    },
    {
      label: t('email_us'),
      desc: t('email_us_desc'),
      href: "mailto:info@trtservis.com",
      image: "/maill.webp",
      color: "hover:border-orange-500/40 hover:bg-orange-500/5 hover:text-orange-500 dark:hover:text-orange-400 hover:shadow-orange-500/5",
      external: true
    },
    {
      label: t('facebook'),
      desc: t('facebook_desc'),
      href: "https://www.facebook.com/TRTechServis/",
      image: "/facebook.webp",
      color: "hover:border-blue-600/40 hover:bg-blue-600/5 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-blue-600/5",
      external: true
    },
    {
      label: t('linkedin'),
      desc: t('linkedin_desc'),
      href: "https://www.linkedin.com/company/trtservis/",
      image: "/linkedin.webp",
      color: "hover:border-blue-700/40 hover:bg-blue-700/5 hover:text-blue-700 dark:hover:text-blue-400 hover:shadow-blue-700/5",
      external: true
    },
    {
      label: t('telegram'),
      desc: t('telegram_desc'),
      href: "https://t.me/trtservis",
      image: "/telegram.webp",
      color: "hover:border-sky-500/40 hover:bg-sky-500/5 hover:text-sky-500 dark:hover:text-sky-400 hover:shadow-sky-500/5",
      external: true
    },
    {
      label: t('pinterest'),
      desc: t('pinterest_desc'),
      href: "https://tr.pinterest.com/trtservis/?invite_code=6906950e8ba94d7b8b9a3364db735f0d&sender=1122240938304289862",
      image: "/pinterest.webp",
      color: "hover:border-red-700/40 hover:bg-red-700/5 hover:text-red-700 dark:hover:text-red-400 hover:shadow-red-700/5",
      external: true
    },
    {
      label: t('snapchat'),
      desc: t('snapchat_desc'),
      href: "https://snapchat.com/t/pL3vgBfZ",
      image: "/snapchat.webp",
      color: "hover:border-yellow-500/40 hover:bg-yellow-500/5 hover:text-yellow-600 dark:hover:text-yellow-400 hover:shadow-yellow-500/5",
      external: true
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring" as const, 
        stiffness: 110, 
        damping: 15 
      } 
    }
  } as const;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start py-12 px-4 selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-[150vh] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_65%)] pointer-events-none -z-10" />
      <div className="absolute top-[30vh] left-[-20%] w-[60vw] h-[60vw] bg-rose-500/3 blur-[120px] rounded-full pointer-events-none -z-10 animate-breathe" />
      <div className="absolute top-[60vh] right-[-20%] w-[60vw] h-[60vw] bg-blue-500/3 blur-[120px] rounded-full pointer-events-none -z-10 animate-breathe" style={{ animationDelay: '2s' }} />

      {/* Floating Action Controls */}
      <div className="w-full max-w-md mx-auto flex justify-between items-center mb-8 gap-4 z-10">
        {/* Language Switches */}
        <div className="flex bg-card/60 backdrop-blur-xl rounded-full p-1 border border-border shadow-md">
          {[
            { code: 'ar', label: 'AR', flag: 'sa' },
            { code: 'tr', label: 'TR', flag: 'tr' },
            { code: 'en', label: 'EN', flag: 'gb' }
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              aria-label={`Switch to ${l.code.toUpperCase()}`}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-black transition-all duration-300 cursor-pointer flex items-center gap-1",
                locale === l.code 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Image 
                src={l.flag === 'tr' ? 'https://flagcdn.com/w80/tr.png' : `https://flagcdn.com/w40/${l.flag}.png`} 
                alt=""
                width={16}
                height={11}
                unoptimized
                className="w-4 h-2.5 rounded-xs object-cover border border-white/10 shrink-0"
              />
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          {/* Theme Button */}
          <button
            onClick={() => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')}
            aria-label={mounted && effectiveTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2.5 bg-card/60 backdrop-blur-xl border border-border rounded-full hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all shadow-md cursor-pointer"
          >
            {mounted && effectiveTheme === 'dark' ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-blue-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md mx-auto flex flex-col items-center text-center z-10"
      >
        {/* Profile Card Header */}
        <motion.div variants={itemVariants} className="w-full flex flex-col items-center mb-8">
          {/* Avatar Area */}
          <div className="relative mb-5 group">
            {/* Spinning/Breathing Border */}
            <div className="absolute inset-0 -m-1 bg-gradient-to-tr from-primary via-rose-500 to-primary rounded-full blur-[2px] animate-pulse pointer-events-none opacity-80" />
            <div className="relative w-24 h-24 rounded-full bg-card border-2 border-primary p-2 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 overflow-hidden">
              <div className="w-full h-full relative flex items-center justify-center">
                <Image 
                  src="/day-logo.png" 
                  alt="TRT Logo"
                  width={140}
                  height={40}
                  priority
                  className="w-full h-auto object-contain dark:hidden"
                />
                <Image 
                  src="/night-logo.png" 
                  alt="TRT Logo"
                  width={140}
                  height={40}
                  priority
                  className="w-full h-auto object-contain hidden dark:block"
                />
              </div>
            </div>
          </div>

          {/* Title & Trust badge */}
          <div className="flex items-center justify-center gap-1.5 mb-2.5">
            <h1 className="text-xl font-extrabold tracking-wide text-foreground">
              TR TECH -trtservis
            </h1>
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 blur-[3px] rounded-full animate-ping" />
              <ShieldCheck size={20} className="text-primary fill-primary/10 shrink-0 relative" />
            </div>
          </div>

          {/* Short description */}
          <p className="text-sm text-muted-foreground font-semibold px-4 max-w-sm leading-relaxed">
            {translations.description}
          </p>
        </motion.div>

        {/* Link Cards List */}
        <div className="w-full space-y-3.5 mb-10 px-1 sm:px-0">
          {links.map((link, idx) => {
            const isVip = link.vip;
            
            const cardContent = (
              <div className="flex items-center gap-3.5">
                {/* Custom circular frame hosting the public folder image asset */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center p-0.5 transition-transform duration-300 group-hover:scale-110 shrink-0 bg-white dark:bg-white shadow-sm border border-border/10 relative">
                  <div className="w-full h-full relative overflow-hidden rounded-full flex items-center justify-center">
                    {link.isGoogle ? (
                      <GoogleIcon />
                    ) : (
                      <Image 
                        src={link.image} 
                        alt={link.label} 
                        width={48}
                        height={48}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                    )}
                  </div>
                  {isVip && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-emerald-600"></span>
                    </span>
                  )}
                </div>
                
                <div className="text-start">
                  <h2 className={cn(
                    "text-sm sm:text-base font-black transition-colors duration-200",
                    isVip 
                      ? "text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300"
                      : "text-foreground/90 group-hover:text-foreground"
                  )}>
                    {link.label}
                  </h2>
                  <p className={cn(
                    "text-[11px] sm:text-xs font-semibold leading-normal",
                    isVip 
                      ? "text-emerald-600/80 dark:text-emerald-400/80"
                      : "text-muted-foreground group-hover:text-foreground/75"
                  )}>
                    {link.desc}
                  </p>
                </div>
              </div>
            );

            return (
              <motion.div key={idx} variants={itemVariants} className="w-full">
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group relative flex items-center justify-between p-4 bg-card/65 backdrop-blur-md border border-border hover:border-foreground/20 rounded-2xl transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99] w-full",
                      link.color
                    )}
                  >
                    {cardContent}
                    <ArrowRight className={cn(
                      "opacity-50 group-hover:opacity-100 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-all duration-200 shrink-0",
                      isVip ? "text-emerald-500" : "text-muted-foreground group-hover:text-primary"
                    )} size={18} />
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      "group relative flex items-center justify-between p-4 bg-card/65 backdrop-blur-md border border-border hover:border-foreground/20 rounded-2xl transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99] w-full",
                      link.color
                    )}
                  >
                    {cardContent}
                    <ArrowRight className="text-muted-foreground group-hover:text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-all duration-200 shrink-0" size={18} />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Short footer info */}
        <motion.div variants={itemVariants} className="w-full flex flex-col items-center gap-4 border-t border-border/60 pt-6">
          <div className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            {locale === 'ar' ? 'تي آر تي للخدمات الفنية © جميع الحقوق محفوظة' : `© ${new Date().getFullYear()} TR TECH. ALL RIGHTS RESERVED.`}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
