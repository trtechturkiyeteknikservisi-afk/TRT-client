'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { 
  MessageSquare, BookOpen, Star, HelpCircle, 
  Image as ImageIcon, LogOut, User as UserIcon, 
  Search, Settings, Sun, Moon, BarChart3, ShieldCheck, Images,
  Menu, X
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const t = useTranslations('Admin');
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/admin/login');
    } else if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const rawMenuItems = [
    { id: 'analytics', href: '/admin/analytics', name: t('menu_analytics') || 'Analytics', icon: BarChart3, permission: 'VIEW_ANALYTICS' },
    { id: 'contacts', href: '/admin/contacts', name: t('menu_contacts'), icon: MessageSquare, permission: 'MANAGE_CONTACTS' },
    { id: 'blogs', href: '/admin/blogs', name: t('menu_blogs'), icon: BookOpen, permission: 'MANAGE_BLOGS' },
    { id: 'reviews', href: '/admin/reviews', name: t('menu_reviews'), icon: Star, permission: 'MANAGE_REVIEWS' },
    { id: 'faqs', href: '/admin/faqs', name: t('menu_faqs'), icon: HelpCircle, permission: 'MANAGE_FAQS' },
    { id: 'portfolio', href: '/admin/portfolio', name: t('menu_portfolio'), icon: ImageIcon, permission: 'MANAGE_PORTFOLIO' },
    { id: 'banners', href: '/admin/banners', name: t('menu_banners') || 'Banners', icon: Images, permission: 'MANAGE_BANNERS' },
    { id: 'verification', href: '/admin/verification', name: t('menu_verification') || 'Official Requests', icon: ShieldCheck, permission: 'MANAGE_VERIFICATIONS' },
    { id: 'policy-terms', href: '/admin/policy-terms', name: t('menu_policy') || 'Policy & Terms', icon: BookOpen, permission: 'MANAGE_SETTINGS' },
    { id: 'settings', href: '/admin/settings', name: t('menu_settings'), icon: Settings, permission: 'MANAGE_SETTINGS' },
  ];

  const canManageUsers = user?.role === 'admin' || user?.permissions?.includes('*') || user?.permissions?.includes('MANAGE_USERS');
  
  const menuItems = rawMenuItems.filter(item => {
    if (user?.role === 'admin' || user?.permissions?.includes('*')) return true;
    return user?.permissions?.includes(item.permission);
  });

  if (canManageUsers) {
    const employeesItem = { id: 'employees', href: '/admin/employees', name: t('menu_employees') || 'Employees', icon: UserIcon, permission: 'MANAGE_USERS' };
    // Add employees item after analytics (index 1) if not already exists in filtered list
    if (!menuItems.find(m => m.id === 'employees')) {
      menuItems.splice(1, 0, employeesItem as any);
    }
  }

  // Helper to determine if a menu item is active
  const isActive = (href: string) => pathname === href;

  if (!mounted) return null;

  if (pathname.includes('/login')) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen bg-background flex flex-col lg:flex-row font-almarai overflow-hidden">
      {/* Background Effects removed for debugging blur issue */}

      {/* Mobile Header */}
      <header className="lg:hidden h-16 bg-card border-b border-border/50 flex items-center justify-between px-6 z-40 sticky top-0">
        <Link href="/admin/analytics" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-sm">T</span>
          </div>
          <h1 className="text-lg font-black tracking-tighter text-foreground uppercase">{t('title')}</h1>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Backdrop for Mobile */}
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[40] lg:hidden"
        />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 h-screen w-72 lg:w-64 bg-card border-r border-border/50 flex flex-col shadow-2xl lg:shadow-xl z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        locale === 'ar' ? "right-0" : "left-0",
        isSidebarOpen 
          ? "translate-x-0" 
          : (locale === 'ar' ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0")
      )}>
        <div className="p-6 border-b border-border/30">
          <div className="flex items-center justify-between lg:block">
            <Link href="/admin/analytics" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-6 transition-all duration-500">
                <span className="text-primary-foreground font-black text-xl">T</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tighter text-foreground leading-none uppercase">{t('title')}</h1>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary mt-1">{t('subtitle')}</p>
              </div>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg bg-muted/50 text-muted-foreground"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center bg-muted/30 rounded-xl p-1 border border-border/50 overflow-hidden">
            {[
              { code: 'en', flag: 'gb' },
              { code: 'ar', flag: 'sa' },
              { code: 'tr', flag: 'tr' }
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => handleLocaleChange(l.code)}
                className={cn(
                  "flex-1 px-2 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase whitespace-nowrap flex items-center justify-center gap-1.5",
                  locale === l.code 
                    ? "bg-card text-primary shadow-sm ring-1 ring-border/50" 
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <img 
                  src={`https://flagcdn.com/w40/${l.flag}.png`} 
                  alt={l.code}
                  className="w-3.5 h-3.5 rounded-full object-cover border border-border/50 shadow-sm"
                />
                <span>{l.code}</span>
              </button>
            ))}
          </div>
        </div>
        
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto scrollbar-hide">
          <div className="px-3 pb-3 text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
            Navigation
          </div>
          {menuItems.map((item) => {
             const active = isActive(item.href);
             return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all duration-300 relative group overflow-hidden",
                  active 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon size={18} strokeWidth={active ? 3 : 2.5} className={cn("transition-transform duration-300 group-hover:scale-110", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                  <span className="tracking-tight uppercase">{item.name}</span>
                </div>
                {active && (
                  <motion.div 
                    layoutId="active-nav-dot"
                    className="w-1.5 h-1.5 rounded-full bg-primary-foreground shadow-sm relative z-10" 
                  />
                )}
                {!active && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                )}
              </Link>
             );
          })}

          <div className="pt-4 mt-4 border-t border-border/10">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[11px] text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all duration-300 uppercase tracking-widest group shadow-sm border border-primary/10"
            >
              <LogOut className={cn("w-4 h-4 transition-transform group-hover:-translate-x-1", locale === 'ar' ? 'rotate-180 group-hover:translate-x-1' : '')} />
              <span>{t('back_to_site')}</span>
            </Link>
          </div>
        </nav>

        <div className="p-5 border-t border-border/30 bg-muted/5 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-background shadow-sm border border-border/50">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 group hover:rotate-6 transition-transform">
              <UserIcon size={16} strokeWidth={2.5} />
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-xs font-black truncate uppercase tracking-tight">{user?.username || t('admin_fallback')}</p>
              <p className="text-[9px] font-bold text-primary uppercase tracking-[0.1em]">
                {user?.role === 'admin' ? t('admin_role') : (t('employee_role') || 'Staff')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
             <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center p-2.5 rounded-xl bg-background border border-border/50 hover:border-primary hover:bg-primary/5 transition-all text-foreground active:scale-95"
              title={t('toggle_theme')}
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-primary" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2.5 rounded-xl bg-red-500/5 text-red-500 border border-transparent hover:border-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
              title={t('sign_out')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
}
