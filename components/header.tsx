'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sun, Moon, X, Menu, ChevronDown, Smartphone, Laptop, Watch, TabletIcon as Tablet, Gavel, Lock, ShieldCheck, FileText, Truck } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { AppleHeadphonesIcon, RobotVacuumIcon } from './social-icons';

export function Header() {
  const t = useTranslations('Header');
  const tFooter = useTranslations('Footer');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const effectiveTheme = resolvedTheme || theme;
  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

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
    { name: t('works'), href: '/our-works' },
    { name: t('blog'), href: '/blog' },
    { name: t('merchants'), href: '#', soon: true },
    { name: t('track_shipment'), href: '#', soon: true },
    { 
      name: t('policy'), 
      href: '/policies',
      isDropdown: true,
      subItems: legalPolicies
    },
    
  ];

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

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
      <div className="w-full mx-auto px-4 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-[1536px]">
        <div className="flex min-h-[4rem] items-center justify-between gap-1 sm:gap-2 py-2 md:py-0">
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex flex-col items-center group mb-2">
              <Image 
                src="/day-logo.png" 
                alt={t('company_name')}
                width={120}
                height={40}
                priority
                className="h-8 md:h-10 w-auto min-w-[90px] xl:min-w-[105px] 2xl:min-w-[120px] object-contain transition-all group-hover:scale-105 dark:hidden block"
              />
              <Image 
                src="/night-logo.png" 
                alt={t('company_name')}
                width={120}
                height={40}
                className="h-8 md:h-10 w-auto min-w-[90px] xl:min-w-[105px] 2xl:min-w-[120px] object-contain transition-all group-hover:scale-105 hidden dark:block"
              />
              <span className="block text-[7.5px] md:text-[9px] font-black uppercase tracking-[0.22em] text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 -mt-0.5 rounded shadow-sm shadow-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent whitespace-nowrap">
                {t('cargo_service')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center justify-center gap-x-2 2xl:gap-x-3 py-1 flex-1 min-w-0 mx-1 2xl:mx-4">
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
                      "flex items-center gap-1.5 text-[9px] xl:text-[9.5px] 2xl:text-[11px] font-extrabold uppercase tracking-wide 2xl:tracking-wider transition-all active:scale-95 whitespace-nowrap relative pb-1",
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
                  
                  {activeDropdown === item.name && (
                    <div
                      className={cn(
                        "absolute top-full w-64 pt-2 z-50",
                        locale === 'ar' ? "-right-4" : "-left-4"
                      )}
                    >
                      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden p-2 animate-in fade-in slide-in-from-top-1 duration-150">
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
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "items-center gap-1.5 text-[9px] xl:text-[9.5px] 2xl:text-[11px] font-extrabold uppercase tracking-wide 2xl:tracking-wider transition-all relative group whitespace-nowrap pb-1 flex",
                    isLinkActive(item) 
                      ? "text-primary dark:text-white" 
                      : "text-muted-foreground hover:text-primary dark:hover:text-white"
                  )}
                >
                  {item.name}
                  {item.soon && (
                    <span className="inline-block text-[7.5px] bg-primary/10 text-primary px-1 py-0.25 rounded-sm font-black uppercase tracking-tighter animate-pulse border border-primary/20">
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


          <div className="flex items-center gap-0 sm:gap-1 shrink-0">
            {/* Bize Ulaşın Button */}
            <Link
              href="/contact"
              className={cn(
                "hidden lg:flex items-center justify-center gap-1 px-1.5 py-1 xl:px-1.5 xl:py-1 2xl:px-2.5 2xl:py-2 border border-border rounded-lg bg-card hover:bg-muted text-foreground transition-all duration-300 active:scale-95 text-[9px] xl:text-[9px] 2xl:text-[11px] font-black uppercase tracking-wide 2xl:tracking-wider cursor-pointer mr-0.5 ml-1 xl:ml-1 2xl:ml-2",
                pathname === '/contact' && "border-primary text-primary"
              )}
            >
              <span className="relative flex items-center h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="leading-none">{t('bize_ulasin')}</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex p-1 sm:p-1.5 xl:p-1.5 2xl:p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all active:scale-95 border border-transparent hover:border-border cursor-pointer flex-shrink-0"
              aria-label={!mounted ? 'Toggle theme' : effectiveTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {!mounted ? (
                <span className="block w-5 h-5" aria-hidden="true" />
              ) : effectiveTheme === 'dark' ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-blue-600" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border flex-shrink-0">
              {[
                { code: 'en', label: 'En', flag: 'gb' },
                { code: 'ar', label: 'AR', flag: 'sa' },
                { code: 'tr', label: 'TR', flag: 'tr' }
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  aria-label={`Switch language to ${l.label}`}
                  aria-pressed={locale === l.code}
                  className={cn(
                    "px-1 sm:px-1.5 py-1 rounded-md text-[9px] 2xl:text-[10px] font-extrabold whitespace-nowrap flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer",
                    locale === l.code 
                      ? "bg-background text-primary shadow-sm ring-1 ring-border/50" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Image 
                    src={l.flag === 'tr' ? 'https://flagcdn.com/w80/tr.png' : `https://flagcdn.com/w40/${l.flag}.png`} 
                    alt=""
                    width={22}
                    height={15}
                    unoptimized
                    className="w-5 h-3 sm:w-5.5 sm:h-3.5 rounded-sm object-cover border border-border/50 shadow-sm"
                  />
                  <span className="hidden">{l.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="xl:hidden p-1 rounded-lg text-muted-foreground transition-all active:scale-95 flex-shrink-0 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
          <div className="xl:hidden border-t bg-background max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="space-y-1 px-4 pb-6 pt-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.isDropdown ? (
                    <div className="my-2">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                        className="flex items-center justify-between w-full px-4 py-3 text-base font-bold text-muted-foreground hover:bg-muted hover:text-primary rounded-xl transition-all cursor-pointer"
                      >
                        <span>{item.name}</span>
                        <ChevronDown 
                          size={18} 
                          className={cn("transition-transform duration-200 text-muted-foreground", activeDropdown === item.name && "rotate-180 text-primary")} 
                        />
                      </button>
                      
                      {activeDropdown === item.name && (
                        <div className="space-y-1 mt-1 pl-4 rtl:pl-0 rtl:pr-4 animate-in fade-in slide-in-from-top-1 duration-150 border-l dark:border-border/30 rtl:border-l-0 rtl:border-r">
                          {item.subItems?.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-primary rounded-xl transition-all"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                            >
                              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                {'customIcon' in sub && sub.customIcon ? (
                                  <Image src={sub.customIcon as string} alt="" width={24} height={24} className="w-full h-full object-contain" />
                                ) : (
                                  <sub.icon size={24} className="text-primary animate-in zoom-in-75 duration-200" />
                                )}
                              </div>
                              <span>{sub.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
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
              
              {/* Standalone Mobile Bize Ulaşın Button */}
              <div className="pt-4 border-t border-border mt-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-black text-sm transition-all duration-300 cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{t('bize_ulasin')}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
    </header>
  );
}
