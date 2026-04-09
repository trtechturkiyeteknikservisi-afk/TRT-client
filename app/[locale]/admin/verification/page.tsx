'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { 
    FileText, 
    FileCheck,
    Trash2, 
    CheckCircle, 
    Clock, 
    AtSign, 
    Phone, 
    MessageCircle, 
    Settings, 
    Save, 
    Upload,
    X,
    Loader2,
    Copy,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api/verify';

const VerificationAdmin = () => {
    const t = useTranslations('VerificationAdmin');
    const tHeader = useTranslations('Admin');
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        VERIFICATION_EMAIL_SUBJECT: '',
        VERIFICATION_EMAIL_BODY: '',
        OFFICIAL_DOCUMENT_PATH: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchLeads();
        fetchSettings();
    }, []);

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(API_BASE, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setLeads(res.data as any[]);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const settingsObj: any = {};
            (res.data as any[]).forEach((s: any) => {
                settingsObj[s.key] = s.value;
            });
            setSettings(prev => ({ ...prev, ...settingsObj }));
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('delete_confirm'))) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(leads.filter(l => l.id !== id));
        } catch (err) {
            alert(t('delete_error'));
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const promises = Object.entries(settings).map(([key, value]) => 
                axios.post(`${API_BASE}/settings`, { key, value }, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );
            await Promise.all(promises);
            setShowSettings(false);
            alert(t('save_success'));
        } catch (err) {
            alert(t('save_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/verify/upload-doc', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            
            const filePath = (res.data as any).path;
            setSettings({ ...settings, OFFICIAL_DOCUMENT_PATH: filePath });
            alert(t('upload_success'));
        } catch (err) {
            alert(t('upload_error'));
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto p-4 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <FileCheck className="w-8 h-8" />
                        </div>
                        {tHeader('menu_verification')}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-2 text-lg">{t('desc')}</p>
                </div>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center justify-center gap-2 bg-foreground text-background font-black px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-xl hover:opacity-90"
                >
                    <Settings size={20} className={showSettings ? "animate-spin" : ""} />
                    {t('configure')}
                </button>
            </div>

            <AnimatePresence>
                {showSettings && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 sm:p-12 space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-black tracking-tighter text-foreground">{t('settings_title')}</h2>
                                <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-primary mb-2 block">{t('email_subject')}</label>
                                        <input 
                                            type="text"
                                            value={settings.VERIFICATION_EMAIL_SUBJECT}
                                            onChange={(e) => setSettings({...settings, VERIFICATION_EMAIL_SUBJECT: e.target.value})}
                                            className="w-full bg-muted/30 border border-border/50 rounded-2xl px-6 py-4 outline-none focus:border-primary font-bold text-foreground transition-all"
                                            placeholder={t('email_subject_placeholder')}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-primary mb-2 block">{t('email_body')}</label>
                                        <textarea 
                                            rows={8}
                                            value={settings.VERIFICATION_EMAIL_BODY}
                                            onChange={(e) => setSettings({...settings, VERIFICATION_EMAIL_BODY: e.target.value})}
                                            className="w-full bg-muted/30 border border-border/50 rounded-2xl px-6 py-4 outline-none focus:border-primary font-bold text-sm text-foreground leading-relaxed transition-all"
                                            placeholder={t('placeholder_hint')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-xs font-black uppercase tracking-widest text-primary block">{t('document_label')}</label>
                                    <div className="border-3 border-dashed border-border rounded-3xl p-12 text-center bg-muted/5 hover:bg-muted/10 transition-all relative group overflow-hidden">
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                        {uploading ? (
                                            <Loader2 className="mx-auto animate-spin text-primary" size={48} />
                                        ) : (
                                            <div className="space-y-4">
                                                <Upload className="mx-auto text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" size={48} />
                                                <div className="space-y-1">
                                                    <p className="font-black uppercase text-xs tracking-widest text-foreground">{t('upload_hint')}</p>
                                                    <p className="text-xs text-muted-foreground">Max size: 10MB (PDF, JPG, PNG)</p>
                                                </div>
                                            </div>
                                        )}
                                        {settings.OFFICIAL_DOCUMENT_PATH && (
                                            <div className="mt-6 p-4 bg-primary/10 rounded-xl inline-flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-primary" />
                                                <p className="text-[10px] text-primary font-bold break-all max-w-[250px]">{settings.OFFICIAL_DOCUMENT_PATH}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-4 p-6 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
                                        <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
                                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                            {t('note_doc')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border/30 flex justify-end">
                                <button 
                                    onClick={handleSaveSettings}
                                    disabled={loading}
                                    className="flex items-center gap-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm px-12 py-5 rounded-2xl shadow-[0_10px_30px_rgba(var(--primary),0.3)] hover:scale-105 transition-all outline-none"
                                >
                                    <Save size={20} />
                                    {t('save_config')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border/30">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">{t('table_info')}</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Contact Details</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">{t('table_status')}</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">{t('table_date')}</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">{t('table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-primary" size={48} />
                                            <p className="text-muted-foreground font-bold animate-pulse">Fetching leads...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="space-y-2">
                                            <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto text-muted-foreground">
                                                <FileText size={40} />
                                            </div>
                                            <p className="font-bold text-muted-foreground text-xl capitalize">{t('no_leads')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-muted/10 transition-all group border-b border-border/5 last:border-0">
                                    <td className="px-6 py-4 font-cairo">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground uppercase tracking-tight text-sm leading-none">{lead.name}</span>
                                                <div className="flex items-center gap-1.5 mt-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer group/mail" 
                                                     onClick={() => copyToClipboard(lead.email, `mail-${lead.id}`)}>
                                                    <AtSign size={12} className="group-hover/mail:scale-110" />
                                                    <span className="text-xs font-bold">{lead.email}</span>
                                                    {copiedId === `mail-${lead.id}` ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="opacity-0 group-hover/mail:opacity-100" />}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2 w-fit bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50 group/wa hover:border-green-500/50 transition-all">
                                                <div className="bg-green-500/10 p-1.5 rounded-lg text-green-500">
                                                    <MessageCircle size={14} strokeWidth={3} />
                                                </div>
                                                <span className="font-black text-foreground tracking-widest text-xs">{lead.whatsapp}</span>
                                                <div className="flex items-center gap-0.5">
                                                    <button onClick={() => copyToClipboard(lead.whatsapp, `wa-${lead.id}`)} className="text-muted-foreground hover:text-green-500 transition-all p-1">
                                                        {copiedId === `wa-${lead.id}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </button>
                                                    <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" className="text-muted-foreground hover:text-green-500 p-1">
                                                        <MessageCircle size={12} />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-fit bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50 group/ph hover:border-blue-500/50 transition-all">
                                                <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-500">
                                                    <Phone size={14} strokeWidth={3} />
                                                </div>
                                                <span className="font-black text-foreground tracking-widest text-xs">{lead.phone}</span>
                                                <div className="flex items-center gap-0.5">
                                                    <button onClick={() => copyToClipboard(lead.phone, `ph-${lead.id}`)} className="text-muted-foreground hover:text-blue-500 transition-all p-1">
                                                        {copiedId === `ph-${lead.id}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </button>
                                                    <a href={`tel:${lead.phone}`} className="text-muted-foreground hover:text-blue-500 p-1">
                                                        <Phone size={12} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center font-cairo">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                                lead.status === 'sent' 
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                            }`}>
                                                {lead.status === 'sent' ? <CheckCircle size={10} strokeWidth={3} /> : <Clock size={10} strokeWidth={3} />}
                                                {lead.status === 'sent' ? t('status_sent') : t('status_pending')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-foreground/50">
                                        <span className="text-xs font-black tracking-tighter block">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase opacity-50">
                                            {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(lead.id)}
                                            className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500 flex items-center justify-center ml-auto hover:bg-red-500 hover:text-white border border-transparent hover:border-red-600 transition-all active:scale-90 shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VerificationAdmin;
