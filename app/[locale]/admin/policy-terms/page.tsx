'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Save, CheckCircle, Globe2
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PolicyTermsPage() {
  const t = useTranslations('Admin');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [policies, setPolicies] = useState({
    policy_en: '',
    policy_tr: '',
    policy_ar: ''
  });
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolicies({
        policy_en: response.data.policy_en || '',
        policy_tr: response.data.policy_tr || '',
        policy_ar: response.data.policy_ar || ''
      });
    } catch (err: any) {
      console.error('Error fetching policies', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.put(`${API_BASE}/settings`, policies, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(t('saved') || 'Policy & Terms updated successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating policies', err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sections = [
    { id: 'en', label: t('content_en') || 'English Content', icon: '🇺🇸' },
    { id: 'tr', label: t('content_tr') || 'Türkçe İçerik', icon: '🇹🇷' },
    { id: 'ar', label: t('content_ar') || 'المحتوى العربي', icon: '🇸🇦' }
  ];

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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
           <div>
               <div className="flex items-center space-x-2 text-primary mb-2">
                 <div className="w-6 h-1 bg-primary rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{t('legal_config') || 'Legal Configuration'}</span>
               </div>
               <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_policy') || 'Policy & Terms'}</h2>
           </div>
           
           <button
             onClick={handleUpdate}
             disabled={actionLoading}
             className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
           >
              <Save size={18} />
              <span>{actionLoading ? t('loading') : t('save')}</span>
           </button>
      </header>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 text-emerald-600 p-4 rounded-xl border border-emerald-500/20 font-bold flex items-center space-x-3 text-sm">
           <CheckCircle size={16} />
           <span>{message}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-10">
          {sections.map((sec) => (
              <motion.div key={sec.id} className="space-y-4 pt-4 border-t first:border-0 first:pt-0">
                   <div className="flex items-center space-x-3 px-1">
                       <span className="text-2xl">{sec.icon}</span>
                       <h3 className="text-lg font-black tracking-tight uppercase">{sec.label}</h3>
                   </div>
                   
                   <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 block">{t('menu_policy') || 'Policy & Terms'}</label>
                        <textarea
                            value={policies[`policy_${sec.id}` as keyof typeof policies]}
                            onChange={(e) => setPolicies((prev) => ({ ...prev, [`policy_${sec.id}`]: e.target.value }))}
                            placeholder={t('policy_placeholder') || "Edit Policy & Terms content..."}
                            className="w-full px-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm min-h-[250px] leading-relaxed"
                        />
                   </div>
              </motion.div>
          ))}
      </div>
    </div>
  );
}
