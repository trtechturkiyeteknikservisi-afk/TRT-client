'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart3, MessageSquare, BookOpen, Star, HelpCircle, 
  Image as ImageIcon, Clock, CheckCircle, TrendingUp
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AnalyticsPage() {
  const t = useTranslations('Admin');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStats = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE}/analytics/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching analytics', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  const statCards = [
    { label: t('menu_contacts'), value: stats?.totals?.contacts || 0, icon: MessageSquare, pending: stats?.pending?.contacts },
    { label: t('menu_blogs'), value: stats?.totals?.blogs || 0, icon: BookOpen },
    { label: t('menu_reviews'), value: stats?.totals?.reviews || 0, icon: Star, pending: stats?.pending?.reviews },
    { label: t('menu_faqs'), value: stats?.totals?.faqs || 0, icon: HelpCircle },
    { label: t('menu_portfolio'), value: stats?.totals?.portfolio || 0, icon: ImageIcon },
  ];

  return (
    <div className="space-y-12 pb-12">
      <header className="relative">
        <div className="flex items-center gap-3 text-primary mb-3">
          <div className="w-12 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/20" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em]">{t('dashboard_overview')}</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-foreground leading-[1]">{t('menu_analytics') || 'Analytics'}</h2>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="bg-card/50 backdrop-blur-xl p-8 rounded-[2rem] border-2 border-border/50 shadow-xl shadow-black/5 hover:border-primary hover:shadow-primary/5 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[3rem] -z-10 transition-colors group-hover:bg-primary/10" />
            
            <div className="flex items-center justify-between mb-8">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-muted text-foreground ring-1 ring-border/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <card.icon size={24} strokeWidth={2.5} />
               </div>
               {card.pending !== undefined && card.pending > 0 && (
                  <span className="text-[10px] font-black text-primary-foreground bg-primary px-3 py-1 rounded-full shadow-lg shadow-primary/20 animate-pulse">
                    +{card.pending}
                  </span>
               )}
            </div>

            <div className="space-y-1">
               <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">{card.label}</p>
               <h3 className="text-4xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card/50 backdrop-blur-xl p-10 rounded-[2.5rem] border-2 border-border/50 shadow-xl shadow-black/5 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-10" />
              
              <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight uppercase">Visitor Traffic</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Real-time engagement data</p>
                  </div>
                  <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                      <button className="px-5 py-2.5 bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest">7 Days</button>
                      <button className="px-5 py-2.5 hover:bg-background rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-all">30 Days</button>
                  </div>
              </div>
              
              <div className="h-64 flex items-end justify-between px-4 pt-10 border-b-2 border-border/30">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <div key={i} className="w-full mx-2 group relative flex flex-col justify-end">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 1, ease: "easeOut" }}
                            className="w-full max-w-[40px] mx-auto bg-muted rounded-t-2xl group-hover:bg-primary transition-all duration-500 cursor-pointer shadow-lg shadow-black/5"
                          />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-xl shadow-primary/20 scale-50 group-hover:scale-100">
                            {h * 123}
                          </div>
                      </div>
                  ))}
              </div>
              <div className="flex justify-between px-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 pt-4">
                  <span className="w-full text-center">Mon</span>
                  <span className="w-full text-center">Tue</span>
                  <span className="w-full text-center">Wed</span>
                  <span className="w-full text-center">Thu</span>
                  <span className="w-full text-center">Fri</span>
                  <span className="w-full text-center">Sat</span>
                  <span className="w-full text-center">Sun</span>
              </div>
          </div>

          <div className="bg-card/50 backdrop-blur-xl p-10 rounded-[2.5rem] border-2 border-border/50 shadow-xl shadow-black/5 flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden">
              <div className="absolute bottom-0 inset-x-0 h-1 bg-primary" />
              
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-[12px] border-muted flex items-center justify-center relative overflow-hidden">
                    <div 
                      className="absolute inset-0 border-[12px] border-primary border-t-transparent border-l-transparent -rotate-45"
                      style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 50%)' }}
                    />
                    <span className="text-4xl font-black tracking-tighter text-foreground">84%</span>
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30 rotate-12 transition-transform hover:rotate-0">
                  <TrendingUp size={24} strokeWidth={3} />
                </div>
              </div>

              <div className="space-y-2">
                  <h4 className="font-black uppercase tracking-[0.3em] text-sm text-foreground">Efficiency Rate</h4>
                  <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Based on last 100 reviews</p>
              </div>
              
              <button className="w-full py-5 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 group flex items-center justify-center gap-3">
                View Reports
                <CheckCircle size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </button>
          </div>
      </div>
    </div>
  );
}
