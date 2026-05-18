'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sun, Moon, X, Menu, ChevronDown, Smartphone, Laptop, Watch, Zap, Headphones, TabletIcon as Tablet, Gavel, Lock, ShieldCheck, FileText, Truck, Scale } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AppleHeadphonesIcon, RobotVacuumIcon } from './social-icons';

export function Header() {
  const t = useTranslations('Header');
  const tFooter = useTranslations('Footer');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const services = [
    { name: t('phone_repair'), href: '/services/phone', icon: Smartphone },
    { name: t('laptop_repair'), href: '/services/laptop', icon: Laptop },
    { name: t('robot_repair'), href: '/services/robot', icon: RobotVacuumIcon },
    { name: t('watch_repair'), href: '/services/watch', icon: Watch },
    { name: t('tablet_repair'), href: '/services/tablet', icon: Tablet },
    { name: t('headphones_repair'), href: '/services/kulaklik', icon: AppleHeadphonesIcon },
  ];

  const legalPolicies = [
    { name: tFooter('kvkk'), href: '/policies/kvkk', icon: Gavel },
    { name: tFooter('privacy_policy'), href: '/policies/privacy', icon: Lock },
    { name: tFooter('service_terms'), href: '/policies/terms', icon: FileText },
    { name: tFooter('warranty_terms'), href: '/policies/warranty', icon: ShieldCheck },
    { name: tFooter('shipping_terms'), href: '/policies/shipping', icon: Truck },
    { name: tFooter('official_doc'), href: '/policies/custom', icon: ShieldCheck },
  ];

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('about_us'), href: '/about-us' },
    { 
      name: t('services'), 
      href: '#services', 
      isDropdown: true,
      subItems: services
    },
    { name: t('works'), href: '/portfolio' },
    { name: t('blog'), href: '/blog' },
    { name: t('merchants'), href: '#', soon: true },
    { name: t('track_shipment'), href: '#', soon: true },
    { 
      name: t('policy'), 
      href: '/policies',
      isDropdown: true,
      subItems: legalPolicies
    },
    { name: t('contact'), href: '#contact' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  useEffect(() => setMounted(true), []);

  const isLinkActive = (item: typeof navigation[0]) => {
    if (item.isDropdown) {
      return item.subItems?.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/')) ?? false;
    }
    if (item.href === '/') {
      return pathname === '/';
    }
    if (item.href.startsWith('#')) {
      return false;
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="w-full container mx-auto px-2 sm:px-4 xl:px-4 ">
        <div className="flex min-h-[4rem] items-center justify-between gap-2 py-2 md:py-0">
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex flex-col items-center group">
              <Image 
                src="/day-logo.png" 
                alt={t('company_name')}
                width={120}
                height={40}
                priority
                className="h-8 md:h-10 w-auto min-w-[90px] md:min-w-[120px] object-contain transition-all group-hover:scale-105 dark:hidden block"
              />
              <Image 
                src="/night-logo.png" 
                alt={t('company_name')}
                width={120}
                height={40}
                priority
                className="h-8 md:h-10 w-auto min-w-[90px] md:min-w-[120px] object-contain transition-all group-hover:scale-105 hidden dark:block"
              />
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-primary mt-1 opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {t('cargo_service')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center justify-between xl:gap-x-2.5 2xl:gap-x-5 py-1 flex-grow flex-shrink-0 ml-4 xl:ml-8 mr-4 xl:mr-6 2xl:mr-8 max-w-full">
            {navigation.map((item) => (
              item.isDropdown ? (
                <div 
                  key={item.name} 
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 text-[10px] lg:text-[10.5px] xl:text-[10.5px] 2xl:text-[12.5px] font-extrabold uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap relative pb-1",
                      isLinkActive(item) 
                        ? "text-primary dark:text-white" 
                        : "text-muted-foreground hover:text-primary dark:hover:text-white"
                    )}
                  >
                    <span>{item.name}</span>
                    <ChevronDown size={14} className={cn("transition-transform duration-200", activeDropdown === item.name && "rotate-180")} />
                    <span 
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 transition-all group-hover:w-full",
                        isLinkActive(item) 
                          ? "w-full bg-black dark:bg-primary" 
                          : "w-0 bg-primary"
                      )} 
                    />
                  </Link>
                  
                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "absolute top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden p-2",
                          locale === 'ar' ? "-right-4" : "-left-4"
                        )}
                      >
                        {item.subItems?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted transition-colors group/item"
                          >
                            <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors overflow-hidden">
                              {'customIcon' in sub && sub.customIcon ? (
                                  <Image src={sub.customIcon as string} alt="" width={24} height={24} className="w-[24px] h-[24px] object-contain group-hover/item:brightness-0 group-hover/item:invert" />
                                ) : (
                                  <sub.icon size={24} />
                                )}
                            </div>
                            <span className="text-sm font-bold text-muted-foreground group-hover/item:text-foreground">{sub.name}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 text-[10px] lg:text-[10.5px] xl:text-[10.5px] 2xl:text-[12.5px] font-extrabold uppercase tracking-wider transition-all relative group whitespace-nowrap pb-1",
                    isLinkActive(item) 
                      ? "text-primary dark:text-white" 
                      : "text-muted-foreground hover:text-primary dark:hover:text-white"
                  )}
                >
                  {item.name}
                  {item.soon && (
                    <span className="hidden 2xl:inline-block text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter animate-pulse border border-primary/20">
                      {t('coming_soon')}
                    </span>
                  )}
                  <span 
                    className={cn(
                      "absolute bottom-0 left-0 h-0.5 transition-all group-hover:w-full",
                      isLinkActive(item) 
                        ? "w-full bg-black dark:bg-primary" 
                        : "w-0 bg-primary"
                    )} 
                  />
                </Link>
              )
            ))}
          </nav>


          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex p-1.5 xl:p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all active:scale-95 border border-transparent hover:border-border cursor-pointer flex-shrink-0"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />
              ) : (
                <div className="w-5 h-5" />
              )}
            </button>

              {/* Language Switcher */}
            <div className="flex items-center bg-muted/50 rounded-xl p-0.5 xl:p-1 border border-border flex-shrink-0">
              {[
                { code: 'en', label: 'En', flag: 'gb' },
                { code: 'ar', label: 'AR', flag: 'sa' },
                { code: 'tr', label: 'TR', flag: 'tr' }
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  className={cn(
                    "px-1 lg:px-1.5 xl:px-1.5 2xl:px-2 py-1 rounded-lg text-[9px] xl:text-[9.5px] 2xl:text-[10px] font-extrabold whitespace-nowrap flex items-center justify-center gap-0.5 sm:gap-1 2xl:gap-1 cursor-pointer",
                    locale === l.code 
                      ? "bg-background text-primary shadow-sm ring-1 ring-border/50" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Image 
                    src={l.flag === 'tr' ? 'https://flagcdn.com/w80/tr.png' : `https://flagcdn.com/w40/${l.flag}.png`} 
                    alt=""
                    width={20}
                    height={14}
                    unoptimized
                    className="w-4 h-2.5 sm:w-4.5 sm:h-3 xl:w-4.5 xl:h-3 2xl:w-5 2xl:h-3.5 rounded-sm object-cover border border-border/50 shadow-sm"
                  />
                  <span className="hidden xl:inline">{l.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="xl:hidden p-1 rounded-lg text-muted-foreground transition-all active:scale-95 flex-shrink-0 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden border-t bg-background overflow-hidden"
          >
            <div className="space-y-1 px-4 pb-6 pt-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.isDropdown ? (
                    <div className="space-y-1 my-2">
                      <div className="px-4 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground/50 border-b border-border/50 mb-2">
                        {item.name}
                      </div>
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="flex items-center gap-4 px-4 py-3 text-base font-bold text-muted-foreground hover:bg-muted hover:text-primary rounded-xl transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className={cn(locale === 'ar' ? 'ml-4' : 'mr-4', "w-7 h-7 flex items-center justify-center")}>
                            {'customIcon' in sub && sub.customIcon ? (
                              <Image src={sub.customIcon as string} alt="" width={28} height={28} className="w-full h-full object-contain" />
                            ) : (
                              <sub.icon size={28} className="text-primary" />
                            )}
                          </div>
                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center justify-between px-4 py-3 text-base font-bold text-muted-foreground hover:bg-muted hover:text-primary rounded-xl transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{item.name}</span>
                      {item.soon && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter border border-primary/20">
                          {t('coming_soon')}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
