'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Settings, Save, User as UserIcon, Phone, MessageCircle, Lock, CheckCircle,
  Megaphone, ShieldCheck, AlertCircle, Sparkles, Sliders, ToggleLeft, ToggleRight,
  Plus, Trash2
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SettingsPage() {
  const t = useTranslations('Admin');
  const locale = useLocale() as 'ar' | 'en' | 'tr';
  const initialLang = (['ar', 'en', 'tr'].includes(locale) ? locale : 'tr') as 'ar' | 'en' | 'tr';
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTrustLang, setActiveTrustLang] = useState<'ar' | 'en' | 'tr'>(initialLang);
  const [activeNewsLang, setActiveNewsLang] = useState<'ar' | 'en' | 'tr'>(initialLang);
  
  const [settingsForm, setSettingsForm] = useState({
    whatsapp: '',
    support_email: '',
    support_phone: '',
    news_bar_enabled: 'true',
    news_bar_speed: '45',
    news_bar_ar: '',
    news_bar_en: '',
    news_bar_tr: '',
    trust_bar_enabled: 'true',
    trust_bar_speed: '45',
    trust_bar_ar: '',
    trust_bar_en: '',
    trust_bar_tr: '',
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
        news_bar_enabled: data.news_bar_enabled !== undefined ? data.news_bar_enabled : 'true',
        news_bar_speed: data.news_bar_speed || '45',
        news_bar_ar: data.news_bar_ar || '',
        news_bar_en: data.news_bar_en || '',
        news_bar_tr: data.news_bar_tr || '',
        trust_bar_enabled: data.trust_bar_enabled !== undefined ? data.trust_bar_enabled : 'true',
        trust_bar_speed: data.trust_bar_speed || '45',
        trust_bar_ar: data.trust_bar_ar || '',
        trust_bar_en: data.trust_bar_en || '',
        trust_bar_tr: data.trust_bar_tr || '',
        username: parsedUser?.username || ''
      }));
    } catch (err: any) {
      console.error('Error fetching settings', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/trt-secure-panel-2026/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      // Update General & Bar Settings
      await axios.put(`${API_BASE}/settings`, { 
        whatsapp: settingsForm.whatsapp,
        support_email: settingsForm.support_email,
        support_phone: settingsForm.support_phone,
        news_bar_enabled: settingsForm.news_bar_enabled,
        news_bar_speed: settingsForm.news_bar_speed,
        news_bar_ar: settingsForm.news_bar_ar,
        news_bar_en: settingsForm.news_bar_en,
        news_bar_tr: settingsForm.news_bar_tr,
        trust_bar_enabled: settingsForm.trust_bar_enabled,
        trust_bar_speed: settingsForm.trust_bar_speed,
        trust_bar_ar: settingsForm.trust_bar_ar,
        trust_bar_en: settingsForm.trust_bar_en,
        trust_bar_tr: settingsForm.trust_bar_tr
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update Account Settings if needed
      const accountPayload: any = { username: settingsForm.username };
      if (settingsForm.password) {
        if (settingsForm.password !== settingsForm.confirmPassword) {
            toast.error('Passwords do not match');
            setActionLoading(false);
            return;
        }
        accountPayload.password = settingsForm.password;
      }
      
      if (user?.id) {
        await axios.put(`${API_BASE}/users/${user.id}`, accountPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });
      }

      toast.success('Settings updated successfully!');
      fetchData();
    } catch (err) {
      console.error('Error updating settings', err);
      toast.error('Failed to update settings.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-primary mb-2">
            <div className="w-6 h-1 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('dashboard_overview')}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_settings')}</h2>
        </div>
        <button
          onClick={() => handleUpdate()}
          disabled={actionLoading}
          className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-black uppercase tracking-wider text-xs hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <Save size={16} />
          <span>{actionLoading ? t('saving') : t('save_all')}</span>
        </button>
      </header>

      <div className="space-y-8">
          {/* General & Support Contact Settings */}
          <div className="bg-card p-6 md:p-8 rounded-xl border shadow-sm space-y-6">
               <div className="flex items-center space-x-3 border-b pb-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                        <Phone size={20} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight uppercase">{t('support_contact')}</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('support_phone_label')}</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                                value={settingsForm.support_phone}
                                onChange={(e) => setSettingsForm((prev) => ({ ...prev, support_phone: e.target.value }))}
                                placeholder="0850 840 15 05"
                                className="w-full pl-12 pr-4 py-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('whatsapp_label')}</label>
                        <div className="relative">
                            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                                value={settingsForm.whatsapp}
                                onChange={(e) => setSettingsForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                                placeholder="905302094094"
                                className="w-full pl-12 pr-4 py-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('support_email_label')}</label>
                        <input
                            value={settingsForm.support_email}
                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, support_email: e.target.value }))}
                            placeholder="info@trtservis.com"
                            className="w-full px-4 py-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        />
                    </div>
               </div>
          </div>

          {/* BAR 1: News Bar Management */}
          <div className="bg-card p-6 md:p-8 rounded-xl border shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                          <Megaphone size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-tight uppercase">
                          {t('news_bar_title')}
                        </h3>
                        <p className="text-xs text-muted-foreground">{t('news_bar_desc')}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      {/* Enable Switch */}
                      <button
                        type="button"
                        onClick={() => setSettingsForm(prev => ({
                          ...prev,
                          news_bar_enabled: prev.news_bar_enabled === 'true' ? 'false' : 'true'
                        }))}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all",
                          settingsForm.news_bar_enabled === 'true' 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {settingsForm.news_bar_enabled === 'true' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        <span>{settingsForm.news_bar_enabled === 'true' ? t('bar_active') : t('bar_inactive')}</span>
                      </button>

                      {/* Speed */}
                      <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border">
                        <Sliders size={14} className="text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase text-muted-foreground">{t('speed_label')}</span>
                        <input
                          type="number"
                          min="15"
                          max="100"
                          value={settingsForm.news_bar_speed}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, news_bar_speed: e.target.value }))}
                          className="w-12 text-center text-xs font-bold bg-background border rounded px-1 py-0.5"
                        />
                      </div>
                  </div>
              </div>

              {/* Language Tabs */}
              <div className="flex gap-2 border-b pb-2">
                {(['tr', 'ar', 'en'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveNewsLang(lang)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                      activeNewsLang === lang
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {lang === 'tr' ? 'Türkçe' : lang === 'ar' ? 'العربية' : 'English'}
                  </button>
                ))}
              </div>

              {/* Dynamic Line Items Editor */}
              {(() => {
                const lang = activeNewsLang;
                const key = `news_bar_${lang}` as keyof typeof settingsForm;
                const lines = String(settingsForm[key] || '').split('\n').filter(i => i.trim() || i === '');

                return (
                  <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                        {t('news_items_label')} ({lang.toUpperCase()})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = String(settingsForm[key] || '');
                          const newItem = t('new_news_title');
                          setSettingsForm(prev => ({ 
                            ...prev, 
                            [key]: current ? current + '\n' + newItem : newItem 
                          }));
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        <Plus size={13} />
                        <span>{t('add_news')}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {lines.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex-1">
                            <input
                              value={item}
                              onChange={(e) => {
                                const newArr = [...lines];
                                newArr[idx] = e.target.value;
                                setSettingsForm(prev => ({ ...prev, [key]: newArr.join('\n') }));
                              }}
                              placeholder={t('news_placeholder')}
                              className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                              dir={lang === 'ar' ? 'rtl' : 'ltr'}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newArr = lines.filter((_, i) => i !== idx);
                              setSettingsForm(prev => ({ ...prev, [key]: newArr.join('\n') }));
                            }}
                            className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title={t('delete_btn')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                      {lines.filter(i => i.trim()).length === 0 && (
                        <p className="text-xs text-muted-foreground italic text-center py-4">{t('no_news_items')}</p>
                      )}
                    </div>
                  </div>
                );
              })()}
          </div>

          {/* BAR 2: Top Trust Bar Management */}
          <div className="bg-card p-6 md:p-8 rounded-xl border-2 border-primary/30 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                          <ShieldCheck size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black tracking-tight uppercase">
                            {t('trust_bar_title')}
                          </h3>
                          <span className="text-[9px] bg-primary/20 text-primary font-black px-2 py-0.5 rounded-full uppercase">
                            {t('trust_bar_badge')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('trust_bar_desc')}
                        </p>
                      </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                      {/* Enable Switch */}
                      <button
                        type="button"
                        onClick={() => setSettingsForm(prev => ({
                          ...prev,
                          trust_bar_enabled: prev.trust_bar_enabled === 'true' ? 'false' : 'true'
                        }))}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer",
                          settingsForm.trust_bar_enabled === 'true' 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {settingsForm.trust_bar_enabled === 'true' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        <span>{settingsForm.trust_bar_enabled === 'true' ? t('bar_active') : t('bar_inactive')}</span>
                      </button>

                      {/* Speed */}
                      <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-lg border">
                        <Sliders size={14} className="text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase text-muted-foreground">{t('speed_label')}</span>
                        <input
                          type="number"
                          min="15"
                          max="100"
                          value={settingsForm.trust_bar_speed}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, trust_bar_speed: e.target.value }))}
                          className="w-12 text-center text-xs font-bold bg-background border rounded px-1 py-0.5"
                        />
                      </div>
                  </div>
              </div>

              {/* Language Tabs */}
              <div className="flex gap-2 border-b pb-2">
                {(['tr', 'ar', 'en'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveTrustLang(lang)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                      activeTrustLang === lang
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {lang === 'tr' ? 'Türkçe' : lang === 'ar' ? 'العربية' : 'English'}
                  </button>
                ))}
              </div>

              {/* Dynamic Items Editor */}
              {(() => {
                const lang = activeTrustLang;
                const key = `trust_bar_${lang}` as keyof typeof settingsForm;
                const rawValue = String(settingsForm[key] || '');
                const lines = rawValue ? rawValue.split('\n').filter(i => i.trim() || i === '') : [];

                return (
                  <div className="space-y-4 p-5 bg-muted/20 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                          {t('trust_items_label')} ({lang.toUpperCase()})
                        </label>
                        <p className="text-[10px] text-muted-foreground">
                          {t('warning_hint')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {lines.length === 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const defaultTemplate = lang === 'ar'
                                ? '[!] تنبيه: مركز صيانة خاص مستقل\nمنذ عام 2002 في خدمتكم\nخبرة تتجاوز 25 عاماً\nفريق فني متخصص ومعتمد\nلا ندفع أية رسوم إلا بعد الاستلام\nخدمة كورييه وتوصيل سريع\n[!] فحص الأعطال مجدول بدقة'
                                : lang === 'en'
                                ? '[!] PRIVATE TECHNICAL SERVICE WARNING\nSERVING YOU SINCE 2002\n25+ YEARS OF EXPERT EXPERIENCE\nSPECIALIZED & CERTIFIED TECHNICAL TEAM\nPAY ONLY UPON INSPECTION AND DELIVERY\nFREE MOTORIZED COURIER SERVICE\n[!] CHARGEABLE ACCURATE FAULT DETECTION'
                                : '[!] ÖZEL TEKNİK SERVİS UYARISI\n2002\'DEN BERİ HİZMETİNİZDEYİZ\n25 YILLIK UZMAN TECRÜBE\nUZMAN VE SERTİFİKALI KADRO\nCİHAZ TESLİMİNDE GÜVENLİ ÖDEME\nÜCRETSİZ MOTORLU KURYE HİZMETİ\n[!] ARIZA TESPİTİ ÜCRETE TABİDİR';
                              
                              setSettingsForm(prev => ({ ...prev, [key]: defaultTemplate }));
                            }}
                            className="text-[10px] font-bold bg-muted px-2.5 py-1 rounded-md text-foreground hover:bg-muted/80 border"
                          >
                            {t('fill_defaults')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const current = String(settingsForm[key] || '');
                            const newItem = t('new_trust_item');
                            setSettingsForm(prev => ({ 
                              ...prev, 
                              [key]: current ? current + '\n' + newItem : newItem 
                            }));
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          <Plus size={13} />
                          <span>{t('add_trust_item')}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {lines.map((item, idx) => {
                        const isWarning = item.startsWith('[!]') || item.startsWith('[warning]');
                        const cleanText = item.replace(/^(\[!\]|\[warning\])\s*/i, '');

                        return (
                          <div key={idx} className="flex items-center gap-2 bg-background p-2 rounded-lg border">
                            <button
                              type="button"
                              onClick={() => {
                                const newArr = [...lines];
                                if (isWarning) {
                                  newArr[idx] = cleanText;
                                } else {
                                  newArr[idx] = `[!] ${cleanText}`;
                                }
                                setSettingsForm(prev => ({ ...prev, [key]: newArr.join('\n') }));
                              }}
                              className={cn(
                                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors shrink-0",
                                isWarning
                                  ? "bg-red-500 text-white"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                              title={isWarning ? t('normal_badge') : t('warning_red')}
                            >
                              <AlertCircle size={12} />
                              <span>{isWarning ? t('warning_red') : t('normal_badge')}</span>
                            </button>

                            <input
                              value={cleanText}
                              onChange={(e) => {
                                const newArr = [...lines];
                                newArr[idx] = isWarning ? `[!] ${e.target.value}` : e.target.value;
                                setSettingsForm(prev => ({ ...prev, [key]: newArr.join('\n') }));
                              }}
                              placeholder={t('trust_item_placeholder')}
                              className="flex-1 px-3 py-1.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                              dir={lang === 'ar' ? 'rtl' : 'ltr'}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const newArr = lines.filter((_, i) => i !== idx);
                                setSettingsForm(prev => ({ ...prev, [key]: newArr.join('\n') }));
                              }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                              title={t('delete_btn')}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      })}

                      {lines.length === 0 && (
                        <div className="text-center py-6 border border-dashed rounded-lg">
                          <p className="text-xs text-muted-foreground italic mb-2">
                            {t('default_trust_template_hint')}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              const defaultTemplate = lang === 'ar'
                                ? '[!] تنبيه: مركز صيانة خاص مستقل\nمنذ عام 2002 في خدمتكم\nخبرة تتجاوز 25 عاماً\nفريق فني متخصص ومعتمد\nلا ندفع أية رسوم إلا بعد الاستلام\nخدمة كورييه وتوصيل سريع\n[!] فحص الأعطال مجدول بدقة'
                                : lang === 'en'
                                ? '[!] PRIVATE TECHNICAL SERVICE WARNING\nSERVING YOU SINCE 2002\n25+ YEARS OF EXPERT EXPERIENCE\nSPECIALIZED & CERTIFIED TECHNICAL TEAM\nPAY ONLY UPON INSPECTION AND DELIVERY\nFREE MOTORIZED COURIER SERVICE\n[!] CHARGEABLE ACCURATE FAULT DETECTION'
                                : '[!] ÖZEL TEKNİK SERVİS UYARISI\n2002\'DEN BERİ HİZMETİNİZDEYİZ\n25 YILLIK UZMAN TECRÜBE\nUZMAN VE SERTİFİKALI KADRO\nCİHAZ TESLİMİNDE GÜVENLİ ÖDEME\nÜCRETSİZ MOTORLU KURYE HİZMETİ\n[!] ARIZA TESPİTİ ÜCRETE TABİDİR';
                              
                              setSettingsForm(prev => ({ ...prev, [key]: defaultTemplate }));
                            }}
                            className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20"
                          >
                            {t('default_trust_template_btn')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
          </div>

          {/* Account Settings */}
          <div className="bg-card p-6 md:p-8 rounded-xl border shadow-sm space-y-6">
               <div className="flex items-center space-x-3 border-b pb-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
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
                                className="w-full pl-12 pr-4 py-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
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
                            className="w-full px-4 py-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">{t('confirm_password')}</label>
                        <input
                            type="password"
                            value={settingsForm.confirmPassword}
                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        />
                    </div>
               </div>
          </div>
      </div>
    </div>
  );
}
