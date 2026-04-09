'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  HelpCircle, Trash2, Search, Plus, MessageCircle, Languages
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function FaqsPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [faqForm, setFaqForm] = useState({ 
    question_en: '', question_tr: '', question_ar: '',
    answer_en: '', answer_tr: '', answer_ar: '' 
  });
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE}/content/faqs/admin-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data as any[]);
    } catch (err: any) {
      console.error('Error fetching faqs', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE}/content/faqs`, faqForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFaqForm({ 
        question_en: '', question_tr: '', question_ar: '',
        answer_en: '', answer_tr: '', answer_ar: '' 
      });
      fetchData();
    } catch (err) {
      console.error('Error creating faq', err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/content/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting faq', err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center space-x-2 text-primary mb-2">
          <div className="w-6 h-1 bg-primary rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('dashboard_overview')}</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_faqs')}</h2>
      </header>

      <div className="bg-card border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Plus size={20} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">{t('add_faq')}</h3>
        </div>
        
        <form onSubmit={createItem} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* English */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-dashed border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇺🇸</span>
                <h4 className="font-black text-xs uppercase tracking-wider">English FAQ</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Question</label>
                <input
                  value={faqForm.question_en}
                  onChange={(e) => setFaqForm(p => ({ ...p, question_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Answer</label>
                <textarea
                  value={faqForm.answer_en}
                  onChange={(e) => setFaqForm(p => ({ ...p, answer_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-24"
                  required
                />
              </div>
            </div>

            {/* Turkish */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-dashed border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇹🇷</span>
                <h4 className="font-black text-xs uppercase tracking-wider">Türkçe SSS</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Soru</label>
                <input
                  value={faqForm.question_tr}
                  onChange={(e) => setFaqForm(p => ({ ...p, question_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cevap</label>
                <textarea
                  value={faqForm.answer_tr}
                  onChange={(e) => setFaqForm(p => ({ ...p, answer_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-24"
                  required
                />
              </div>
            </div>

            {/* Arabic */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-dashed border-primary/20" dir="rtl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇸🇦</span>
                <h4 className="font-black text-xs uppercase tracking-wider">الأسئلة الشائعة بالعربي</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">السؤال</label>
                <input
                  value={faqForm.question_ar}
                  onChange={(e) => setFaqForm(p => ({ ...p, question_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">الإجابة</label>
                <textarea
                  value={faqForm.answer_ar}
                  onChange={(e) => setFaqForm(p => ({ ...p, answer_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-24"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest"
          >
            {actionLoading ? t('loading') : t('add_faq')}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
             <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" /></div>
        ) : data.length === 0 ? (
          <div className="py-20 bg-card border rounded-2xl flex flex-col items-center justify-center text-muted-foreground border-dashed">
            <HelpCircle size={64} className="mb-4 opacity-20" />
            <p className="font-bold text-xl">{t('no_records')}</p>
          </div>
        ) : (
          data.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border shadow-sm flex flex-col p-6 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                  <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/5 text-primary">
                          <Languages size={24} strokeWidth={2.5} />
                      </div>
                      <button
                          onClick={() => deleteItem(item.id)}
                          disabled={actionLoading}
                          className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                          <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">English</span>
                          <h4 className="font-bold text-sm text-foreground">{item.question_en}</h4>
                          <p className="text-muted-foreground text-[11px] line-clamp-3">{item.answer_en}</p>
                      </div>
                      <div className="space-y-1 border-x border-muted/20 px-6">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Türkçe</span>
                          <h4 className="font-bold text-sm text-foreground">{item.question_tr}</h4>
                          <p className="text-muted-foreground text-[11px] line-clamp-3">{item.answer_tr}</p>
                      </div>
                      <div className="space-y-1" dir="rtl">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest block">العربية</span>
                          <h4 className="font-bold text-sm text-foreground">{item.question_ar}</h4>
                          <p className="text-muted-foreground text-[11px] line-clamp-3">{item.answer_ar}</p>
                      </div>
                  </div>
              </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
