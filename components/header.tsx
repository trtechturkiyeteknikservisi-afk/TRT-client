'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, X, Menu, ChevronDown, Smartphone, Laptop, Watch, Zap, TabletIcon as Tablet } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const t = useTranslations('Header');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const services = [
    { name: t('phone_repair'), href: '/services/phone', icon: Smartphone },
    { name: t('laptop_repair'), href: '/services/laptop', icon: Laptop },
    { name: t('robot_repair'), href: '/services/robot', icon: Zap },
    { name: t('watch_repair'), href: '/services/watch', icon: Watch },
    { name: t('tablet_repair'), href: '/services/tablet', icon: Tablet },
  ];

  const navigation = [
    { name: t('home'), href: '/' },
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
    { name: t('policy'), href: '/policies' },
    { name: t('contact'), href: '#contact' },
  ];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  useEffect(() => setMounted(true), []);

  if (!mounted) return <header className="h-16 border-b" />;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src={theme === 'dark' ? '/night-logo.png' : '/day-logo.png'} 
                alt={t('company_name')} 
                className="h-10 w-auto object-contain transition-all hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              item.isDropdown ? (
                <div 
                  key={item.name} 
                  className="relative group"
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  <button
                    className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-all hover:text-primary active:scale-95"
                  >
                    <span>{item.name}</span>
                    <ChevronDown size={14} className={cn("transition-transform duration-200", isServicesOpen && "rotate-180")} />
                  </button>
                  
                  <AnimatePresence>
                    {isServicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "absolute top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-2",
                          locale === 'ar' ? "-right-4" : "-left-4"
                        )}
                      >
                        {item.subItems?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted transition-colors group/item"
                          >
                            <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                              <sub.icon size={18} />
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
                  className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-all hover:text-primary relative group"
                >
                  {item.name}
                  {item.soon && (
                    <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter animate-pulse border border-primary/20">
                      {t('coming_soon')}
                    </span>
                  )}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              )
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all active:scale-95 border border-transparent hover:border-border"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border">
              {[
                { code: 'en', flag: 'gb' },
                { code: 'ar', flag: 'sa' },
                { code: 'tr', flag: 'tr' }
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all uppercase whitespace-nowrap flex items-center gap-1.5",
                    locale === l.code 
                      ? "bg-background text-primary shadow-sm ring-1 ring-border/50" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <img 
                    src={`https://flagcdn.com/w40/${l.flag}.png`} 
                    alt={l.code}
                    className="w-4 h-4 rounded-full object-cover border border-border/50 shadow-sm"
                  />
                  <span>{l.code}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all active:scale-95 border border-transparent hover:border-border"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
            className="md:hidden border-t bg-background overflow-hidden"
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
                          <sub.icon size={20} className={cn(locale === 'ar' ? 'ml-4' : 'mr-4', "text-primary")} />
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
