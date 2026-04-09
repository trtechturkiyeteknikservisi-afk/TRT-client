'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Settings, Save, User as UserIcon, Phone, MessageCircle, Lock, CheckCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SettingsPage() {
  const t = useTranslations('Admin');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const [settingsForm, setSettingsForm] = useState({
    whatsapp: '',
    support_email: '',
    support_phone: '',
    news_bar_ar: '',
    news_bar_en: '',
    news_bar_tr: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const settingsResponse = await axios.get(`${API_BASE}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      setUser(parsedUser);
      
      const data = settingsResponse.data as any;
      setSettingsForm((prev) => ({
        ...prev,
        whatsapp: data.whatsapp || '',
        support_email: data.support_email || '',
        support_phone: data.support_phone || '',
        news_bar_ar: data.news_bar_ar || '',
        news_bar_en: data.news_bar_en || '',
        news_bar_tr: data.news_bar_tr || '',
        username: parsedUser?.username || ''
      }));
    } catch (err: any) {
      console.error('Error fetching settings', err);
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
      // Update WhatsApp and General Settings
      await axios.put(`${API_BASE}/settings`, { 
        whatsapp: settingsForm.whatsapp,
        support_email: settingsForm.support_email,
        support_phone: settingsForm.support_phone,
        news_bar_ar: settingsForm.news_bar_ar,
        news_bar_en: settingsForm.news_bar_en,
        news_bar_tr: settingsForm.news_bar_tr
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update Account Settings if needed
      const accountPayload: any = { username: settingsForm.username };
      if (settingsForm.password) {
        if (settingsForm.password !== settingsForm.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        accountPayload.password = settingsForm.password;
      }
      
      await axios.put(`${API_BASE}/users/${user.id}`, accountPayload, {
         headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(t('saved'));
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating settings', err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="flex items-center justify-between">
           <div>
               <div className="flex items-center space-x-2 text-primary mb-2">
                 <div className="w-6 h-1 bg-primary rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{t('dashboard_overview')}</span>
               </div>
               <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_settings')}</h2>
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

      <div className="grid grid-cols-1 gap-6">
          <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
               <div className="flex items-center space-x-3 border-b pb-4">
                    <div className="w-10 h-10 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center">
                        <MessageCircle size={20} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight uppercase">{t('support_contact')}</h3>
               </div>

               <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('whatsapp_label')}</label>
                          <div className="relative">
                              <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                              <input
                                value={settingsForm.whatsapp}
                                onChange={(e) => setSettingsForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                                placeholder="e.g., 905302094094"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                              />
                          </div>
                      </div>

                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('support_phone_label')}</label>
                          <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                              <input
                                value={settingsForm.support_phone}
                                onChange={(e) => setSettingsForm((prev) => ({ ...prev, support_phone: e.target.value }))}
                                placeholder="e.g., +90 530 209 40 94"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                              />
                          </div>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('support_email_label')}</label>
                          <div className="relative">
                              <Save className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                              <input
                                value={settingsForm.support_email}
                                onChange={(e) => setSettingsForm((prev) => ({ ...prev, support_email: e.target.value }))}
                                placeholder="e.g., support@trt-service.com"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                              />
                          </div>
                      </div>
                  </div>

                  {/* News Bar Management */}
                  <div className="pt-6 border-t space-y-6">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-primary">
                              <Settings size={16} />
                              <h4 className="text-xs font-black uppercase tracking-widest">{t('news_bar_management')}</h4>
                          </div>
                      </div>

                      {['ar', 'en', 'tr'].map((lang) => (
                          <div key={lang} className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
                              <div className="flex items-center justify-between mb-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                      {t('news_items_label')} ({lang.toUpperCase()})
                                  </label>
                                  <button
                                      type="button"
                                      onClick={() => {
                                          const key = `news_bar_${lang}` as keyof typeof settingsForm;
                                          const current = String(settingsForm[key] || '');
                                          setSettingsForm(prev => ({ 
                                              ...prev, 
                                              [key]: current ? current + '\nNew Item' : 'New Item' 
                                          }));
                                      }}
                                      className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                                  >
                                      {t('add_news')}
                                  </button>
                              </div>
                              
                              <div className="space-y-2">
                                  {(String(settingsForm[`news_bar_${lang}` as keyof typeof settingsForm] || '')).split('\n').filter(i => i.trim() || i === '').map((item, idx, arr) => (
                                      <div key={idx} className="flex items-center gap-2">
                                          <div className="flex-1 relative">
                                              <input
                                                  value={item}
                                                  onChange={(e) => {
                                                      const key = `news_bar_${lang}` as keyof typeof settingsForm;
                                                      const newArr = [...arr];
                                                      newArr[idx] = e.target.value;
                                                      setSettingsForm(prev => ({ ...prev, [key]: newArr.join('\n') }));
                                                  }}
                                                  placeholder={t('news_placeholder')}
                                                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                                                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                              />
                                          </div>
                                          <button
                                              type="button"
                                              onClick={() => {
                                                  const key = `news_bar_${lang}` as keyof typeof settingsForm;
                                                  const newArr = arr.filter((_, i) => i !== idx);
                                                  setSettingsForm(prev => ({ ...prev, [key]: newArr.join('\n') }));
                                              }}
                                              className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                          >
                                              <Save size={14} className="rotate-45" /> {/* Use as close icon */}
                                          </button>
                                      </div>
                                  ))}
                                  {(String(settingsForm[`news_bar_${lang}` as keyof typeof settingsForm] || '')).split('\n').filter(i => i.trim()).length === 0 && (
                                      <p className="text-[10px] text-muted-foreground italic text-center py-2">{t('no_news_items')}</p>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
               </div>
          </div>

          <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
               <div className="flex items-center space-x-3 border-b pb-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <Lock size={20} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight uppercase">{t('account_settings')}</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('username_label')}</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                                value={settingsForm.username}
                                onChange={(e) => setSettingsForm((prev) => ({ ...prev, username: e.target.value }))}
                                placeholder="Username"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('new_password')}</label>
                        <input
                            type="password"
                            value={settingsForm.password}
                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, password: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('confirm_password')}</label>
                        <input
                            type="password"
                            value={settingsForm.confirmPassword}
                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        />
                    </div>
               </div>
          </div>
      </div>
    </div>
  );
}
