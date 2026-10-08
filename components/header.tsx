'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useTheme } from 'next-themes';
import { Sun, Moon, X, Menu, ChevronDown, Smartphone, Laptop, Watch, TabletIcon as Tablet, Gavel, Lock, ShieldCheck, FileText, Truck, Wrench, Layers, ShoppingBag } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { AppleHeadphonesIcon, RobotVacuumIcon } from './social-icons';
import { useStore } from './store-context';
import { getLocalizedUrl, getLocalizedPath } from '@/lib/localized-routes';

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

  const defaultServices = [
    { name: t('phone_repair'), href: getLocalizedPath('/services/phone', locale), internal: '/services/phone', icon: Smartphone },
    { name: t('laptop_repair'), href: getLocalizedPath('/services/laptop', locale), internal: '/services/laptop', icon: Laptop },
    { name: t('robot_repair'), href: getLocalizedPath('/services/robot', locale), internal: '/services/robot', icon: RobotVacuumIcon },
    { name: t('watch_repair'), href: getLocalizedPath('/services/watch', locale), internal: '/services/watch', icon: Watch },
    { name: t('tablet_repair'), href: getLocalizedPath('/services/tablet', locale), internal: '/services/tablet', icon: Tablet },
    { name: t('headphones_repair'), href: getLocalizedPath('/services/kulaklik', locale), internal: '/services/kulaklik', icon: AppleHeadphonesIcon },
    { name: t('pricing'), href: getLocalizedPath('/urunler', locale), internal: '/urunler', icon: Wrench },
  ];

  const [services, setServices] = useState<any[]>(defaultServices);

  useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${API_URL}/content/services?locale=${locale}`);
        if (isMounted && Array.isArray(res.data)) {
          const serviceIconMap: Record<string, any> = {
            Smartphone,
            Laptop,
            RobotVacuumIcon,
            Watch,
            Tablet,
            AppleHeadphonesIcon,
            Wrench
          };

          const activeList = res.data.map((item: any) => ({
            name: item.title,
            href: item.link || getLocalizedPath(`/services/${item.slug}`, locale),
            internal: `/services/${item.slug}`,
            icon: serviceIconMap[item.icon] || Layers,
            customIcon: item.custom_icon || undefined
          }));

          // Append pricing at the end of the services dropdown
          activeList.push({
            name: t('pricing'),
            href: getLocalizedPath('/urunler', locale),
            internal: '/urunler',
            icon: Wrench,
            customIcon: undefined
          });

          setServices(activeList);
        }
      } catch (err) {
        // Fallback to defaultServices on error
      }
    };
    fetchServices();
    return () => { isMounted = false; };
  }, [locale, t]);

  const { cartCount, setIsCartOpen } = useStore();

  const legalPolicies = [
    { name: tFooter('kvkk'), href: getLocalizedPath('/policies/kvkk', locale), internal: '/policies/kvkk', icon: Gavel },
    { name: tFooter('privacy_policy'), href: getLocalizedPath('/privacy', locale), internal: '/privacy', icon: Lock },
    { name: tFooter('service_terms'), href: getLocalizedPath('/terms', locale), internal: '/terms', icon: FileText },
    { name: tFooter('warranty_terms'), href: getLocalizedPath('/policies/warranty', locale), internal: '/policies/warranty', icon: ShieldCheck },
    { name: tFooter('shipping_terms'), href: getLocalizedPath('/policies/shipping', locale), internal: '/policies/shipping', icon: Truck },
    { name: tFooter('official_doc'), href: getLocalizedPath('/policies/custom', locale), internal: '/policies/custom', icon: ShieldCheck },
  ];

  interface NavItem {
    name: string;
    href: string;
    internal?: string;
    isDropdown?: boolean;
    subItems?: any[];
    soon?: boolean;
  }

  const navigation: NavItem[] = [
    { name: t('home'), href: '/', internal: '/' },
    { name: t('about_us'), href: getLocalizedPath('/about-us', locale), internal: '/about-us' },
    { 
      name: t('services'), 
      href: '#services', 
      isDropdown: true,
      subItems: services
    },
    { name: t('pricing'), href: getLocalizedPath('/urunler', locale), internal: '/urunler' },
    { name: t('works'), href: getLocalizedPath('/our-works', locale), internal: '/our-works' },
    { name: t('blog'), href: getLocalizedPath('/blog', locale), internal: '/blog' },
    { name: t('merchants'), href: '#', soon: true },
    { name: t('track_shipment'), href: '#', soon: true },
    { 
      name: t('policy'), 
      href: getLocalizedPath('/policies', locale),
      internal: '/policies',
      isDropdown: true,
      subItems: legalPolicies
    },
  ];

  const handleLanguageChange = (newLocale: string) => {
    const targetUrl = getLocalizedUrl(pathname, newLocale);
    window.location.href = targetUrl;
  };

  const isLinkActive = (item: typeof navigation[0]) => {
    let decodedPath = pathname;
    try {
      decodedPath = decodeURIComponent(pathname);
    } catch (e) {}

    if (item.isDropdown) {
      return item.subItems?.some(sub => {
        const subHref = sub.href;
        const subInternal = sub.internal;
        return decodedPath === subHref || 
               decodedPath.startsWith(subHref + '/') ||
               (subInternal && (decodedPath === subInternal || decodedPath.startsWith(subInternal + '/')));
      }) ?? false;
    }
    if (item.href === '/' || item.href === `/${locale}`) {
      return decodedPath === '/' || decodedPath === `/${locale}`;
    }
    if (item.href.startsWith('#')) {
      return false;
    }
    return decodedPath === item.href || 
           decodedPath.startsWith(item.href + '/') ||
           (item.internal ? (decodedPath === item.internal || decodedPath.startsWith(item.internal + '/')) : false);
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="w-full mx-auto px-4 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-[1440px]">
        <div className="flex min-h-[4rem] items-center justify-between gap-1 sm:gap-2 py-1.5 md:py-0">
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex flex-col items-center group py-0.5">
              <Image 
                src="/day-logo.png" 
                alt={t('company_name')}
                width={120}
                height={40}
                priority
                className="h-8 md:h-9 2xl:h-10 w-auto min-w-[85px] xl:min-w-[95px] 2xl:min-w-[110px] object-contain transition-all group-hover:scale-105 dark:hidden block"
              />
              <Image 
                src="/night-logo.png" 
                alt={t('company_name')}
                width={120}
                height={40}
                className="h-8 md:h-9 2xl:h-10 w-auto min-w-[85px] xl:min-w-[95px] 2xl:min-w-[110px] object-contain transition-all group-hover:scale-105 hidden dark:block"
              />
              <span className="block text-[7px] md:text-[7.5px] 2xl:text-[8px] font-black uppercase tracking-[0.06em] 2xl:tracking-[0.1em] text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 -mt-0.5 rounded shadow-sm shadow-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent whitespace-nowrap">
                {t('cargo_service')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center justify-center gap-x-1.5 xl:gap-x-2 2xl:gap-x-2.5 py-1 flex-1 min-w-0 mx-1 2xl:mx-3">
            {navigation.map((item) => (
              item.isDropdown ? (
                <div 
                  key={item.name} 
                  className="relative group shrink-0"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 text-[9px] xl:text-[9.5px] 2xl:text-[10.5px] font-extrabold uppercase tracking-tight 2xl:tracking-normal transition-all active:scale-95 whitespace-nowrap relative pb-1",
                      isLinkActive(item) 
                        ? "text-primary dark:text-white" 
                        : "text-muted-foreground hover:text-primary dark:hover:text-white"
                    )}
                  >
                    <span>{item.name}</span>
                    <ChevronDown size={12} className={cn("transition-transform duration-200 shrink-0", activeDropdown === item.name && "rotate-180")} />
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
                                  <img src={sub.customIcon as string} alt="" className="w-6 h-6 object-contain group-hover/item:brightness-0 group-hover/item:invert" />
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
                    "items-center gap-1 text-[9px] xl:text-[9.5px] 2xl:text-[10.5px] font-extrabold uppercase tracking-tight 2xl:tracking-normal transition-all relative group whitespace-nowrap pb-1 flex shrink-0",
                    isLinkActive(item) 
                      ? "text-primary dark:text-white" 
                      : "text-muted-foreground hover:text-primary dark:hover:text-white"
                  )}
                >
                  <span>{item.name}</span>
                  {item.soon && (
                    <span className="inline-flex items-center text-[7px] 2xl:text-[7.5px] bg-[#E11D48]/15 text-[#E11D48] px-1 py-0.2 rounded-[3px] font-black uppercase tracking-tight animate-pulse border border-[#E11D48]/35 shrink-0 leading-none">
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


          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Bize Ulaşın / Contact Button (Restored to match original header) */}
            <Link
              href="/contact"
              className={cn(
                "hidden lg:flex items-center justify-center gap-1.5 px-2 py-1 xl:px-2.5 xl:py-1.5 2xl:px-3 2xl:py-2 border border-border rounded-lg bg-card hover:bg-muted text-foreground transition-all duration-300 active:scale-95 text-[9px] xl:text-[9.5px] 2xl:text-[10.5px] font-black uppercase tracking-normal cursor-pointer whitespace-nowrap shrink-0",
                pathname === '/contact' && "border-primary text-primary"
              )}
            >
              <span className="relative flex items-center h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="leading-none">{t('bize_ulasin')}</span>
            </Link>

            {/* Sepetim / Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              title={t('sepetim') || "Sepetim"}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer flex-shrink-0"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E11D48] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

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
            <div className="space-y-3 px-4 pb-6 pt-4">
              {/* Mobile Cart Button if has items */}
              {cartCount > 0 && (
                <div className="pb-2 border-b border-border/50">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] text-xs font-black cursor-pointer"
                  >
                    <ShoppingBag size={15} />
                    <span>{t('sepetim')} ({cartCount})</span>
                  </button>
                </div>
              )}

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
                                  <img src={sub.customIcon as string} alt="" className="w-full h-full object-contain" />
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
                        <span className="text-[10px] bg-[#E11D48]/20 text-[#E11D48] px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter border border-[#E11D48]/40">
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
                  href={getLocalizedPath('/contact', locale)}
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
