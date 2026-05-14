'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Save, CheckCircle, Globe2, Languages
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';
import { FileUp, Eye, Trash2, FileText } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PolicyTermsPage() {
  const t = useTranslations('Admin');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activePolicy, setActivePolicy] = useState('privacy');
  const [activeLang, setActiveLang] = useState('tr');
  const [settingsData, setSettingsData] = useState<Record<string, string>>({});
  
  const router = useRouter();

  const policyTypes = [
    { id: 'privacy', label: t('policy_privacy') || 'Privacy Policy' },
    { id: 'terms', label: t('policy_terms') || 'Terms of Service' },
    { id: 'kvkk', label: t('policy_kvkk') || 'KVKK Disclosure' },
    { id: 'warranty', label: t('policy_warranty') || 'Warranty Conditions' },
    { id: 'shipping', label: t('policy_shipping') || 'Shipping & Delivery' },
  ];

  const languages = [
    { id: 'tr', label: 'Türkçe', icon: '🇹🇷' },
    { id: 'en', label: 'English', icon: '🇺🇸' },
    { id: 'ar', label: 'العربية', icon: '🇸🇦' }
  ];

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get<Record<string, string>>(`${API_BASE}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettingsData(response.data || {});
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
      await axios.put(`${API_BASE}/settings`, settingsData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(t('saved') || 'Settings updated successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error updating settings', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, lang: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const key = `${activePolicy}_pdf_${lang}`;
    setUploading(key);
    
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post<{ path: string }>(`${API_BASE}/verify/upload-doc`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const filePath = response.data.path;
      setSettingsData(prev => ({ ...prev, [key]: filePath }));
      setMessage(t('upload_success') || 'File uploaded successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error uploading file', err);
      setMessage(t('upload_error') || 'Error uploading file');
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(null);
    }
  };

  const updatePolicyContent = (lang: string, value: string) => {
    const key = activePolicy === 'terms' ? `policy_${lang}` : `${activePolicy}_${lang}`;
    setSettingsData(prev => ({ ...prev, [key]: value }));
  };

  const getPolicyContent = (lang: string) => {
    const key = activePolicy === 'terms' ? `policy_${lang}` : `${activePolicy}_${lang}`;
    return settingsData[key] || '';
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
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
               <div className="flex items-center space-x-2 text-primary mb-2">
                 <div className="w-6 h-1 bg-primary rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{t('legal_config') || 'Legal Configuration'}</span>
               </div>
               <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_policy') || 'Legal Policies'}</h2>
           </div>
           
           <button
             onClick={handleUpdate}
             disabled={actionLoading}
             className="flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
           >
              <Save size={18} />
              <span className="uppercase tracking-widest">{actionLoading ? t('loading') : t('save')}</span>
           </button>
      </header>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 text-emerald-600 p-4 rounded-xl border border-emerald-500/20 font-bold flex items-center space-x-3 text-sm">
           <CheckCircle size={16} />
           <span>{message}</span>
        </motion.div>
      )}

      <div className="bg-card border rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-black/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
            <ShieldCheck size={200} />
        </div>

        {/* Policy Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b">
          {policyTypes.map((policy) => (
            <button
              key={policy.id}
              onClick={() => setActivePolicy(policy.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border",
                activePolicy === policy.id 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border-transparent"
              )}
            >
              {policy.label}
            </button>
          ))}
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-muted/30 p-1.5 rounded-2xl border w-fit">
            {languages.map((lang) => (
                <button
                    key={lang.id}
                    onClick={() => setActiveLang(lang.id)}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        activeLang === lang.id
                            ? "bg-card text-foreground shadow-xl border border-border/50"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <span className="text-lg">{lang.icon}</span>
                    <span>{lang.label}</span>
                </button>
            ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
            <motion.div
                key={`${activePolicy}-${activeLang}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
            >
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Languages size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                                {policyTypes.find(p => p.id === activePolicy)?.label}
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                {languages.find(l => l.id === activeLang)?.label} Content
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2.5 rounded-2xl border border-border/50 min-w-[200px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">PDF:</span>
                            
                            {settingsData[`${activePolicy}_pdf_${activeLang}`] ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                        <FileText size={14} />
                                        <span className="text-[10px] font-bold">Document Uploaded</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a 
                                            href={`${API_BASE.replace('/api', '')}/${settingsData[`${activePolicy}_pdf_${activeLang}`]}`}
                                            target="_blank"
                                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                            title="View File"
                                        >
                                            <Eye size={16} />
                                        </a>
                                        <button 
                                            onClick={() => setSettingsData(prev => ({ ...prev, [`${activePolicy}_pdf_${activeLang}`]: '' }))}
                                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                                            title="Delete File"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-muted-foreground/50 italic">No file uploaded</span>
                            )}
                        </div>

                        <label className={cn(
                            "cursor-pointer flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all",
                            uploading === `${activePolicy}_pdf_${activeLang}` 
                                ? "bg-muted text-muted-foreground cursor-wait" 
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                        )}>
                            {uploading === `${activePolicy}_pdf_${activeLang}` ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <FileUp size={16} />
                                    <span>{settingsData[`${activePolicy}_pdf_${activeLang}`] ? 'Change File' : 'Upload PDF'}</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                accept=".pdf" 
                                className="hidden" 
                                onChange={(e) => handleFileUpload(e, activeLang)}
                                disabled={!!uploading}
                            />
                        </label>
                    </div>
                </div>

                <div className="relative group">
                    <textarea
                        value={getPolicyContent(activeLang)}
                        onChange={(e) => updatePolicyContent(activeLang, e.target.value)}
                        placeholder={t('policy_placeholder') || "Edit policy content..."}
                        className="w-full px-6 py-5 rounded-3xl border bg-background/50 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 font-bold text-sm min-h-[450px] leading-relaxed transition-all resize-none"
                    />
                    <div className="absolute bottom-4 right-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                            Auto-saving local state...
                        </span>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
