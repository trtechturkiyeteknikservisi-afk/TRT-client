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
import { useRouter } from '@/i18n/routing';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/verify';

const VerificationAdmin = () => {
    const router = useRouter();
    const t = useTranslations('VerificationAdmin');
    const tHeader = useTranslations('Admin');
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        VERIFICATION_EMAIL_SUBJECT: '',
        VERIFICATION_EMAIL_BODY: '',
        OFFICIAL_DOCUMENT_PATH: '',
        VERIFICATION_WHATSAPP_MESSAGE: '',
        VERIFICATION_WHATSAPP_DOCUMENT_PATH: ''
    });
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads(currentPage);
        fetchSettings();
    }, [currentPage]);

    const fetchLeads = async (page: number) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/trt-secure-panel-2026/login');
            return;
        }
        try {
            const res = await axios.get(`${API_BASE}?page=${page}&limit=10`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            const { data, totalPages } = res.data as any;
            setLeads(data);
            setTotalPages(totalPages);
        } catch (err: any) {
            console.error('Error fetching leads:', err);
            if (err?.response?.status === 401) {
                localStorage.removeItem('token');
                router.push('/trt-secure-panel-2026/login');
            }
        } finally {
            setLoading(false);
        }
    };
    const fetchSettings = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE}/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const settingsObj: any = {};
            (res.data as any[]).forEach((s: any) => {
                settingsObj[s.key] = s.value;
            });
            setSettings(prev => ({ ...prev, ...settingsObj }));
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            if (err?.response?.status === 401) {
                localStorage.removeItem('token');
                router.push('/trt-secure-panel-2026/login');
            }
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetKey: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(targetKey);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE}/upload-doc`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            
            const filePath = (res.data as any).path;
            setSettings(prev => ({ ...prev, [targetKey]: filePath }));
            alert(t('upload_success'));
        } catch (err) {
            alert(t('upload_error'));
        } finally {
            setUploading(null);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleWhatsAppAction = (lead: any) => {
        const phone = lead.whatsapp || lead.phone;
        if (!phone) return;
        
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.substring(2);
        
        let message = settings.VERIFICATION_WHATSAPP_MESSAGE || "";
        message = message.replace(/{name}/g, lead.name);
        
        let pdfUrl = settings.VERIFICATION_WHATSAPP_DOCUMENT_PATH;
        if (pdfUrl && !pdfUrl.startsWith('http')) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const SERVER_URL = API_URL.replace(/\/api\/?$/, '');
            pdfUrl = `${SERVER_URL}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;
        }
        
        const finalMessage = pdfUrl ? `${message}\n\n${t('official_doc') || 'Document'}: ${pdfUrl}` : message;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`, '_blank');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto p-4 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <FileText className="w-8 h-8" />
                        </div>
                        {tHeader('menu_verification')}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-2 text-lg">{t('desc')}</p>
                </div>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center justify-center gap-2 bg-foreground text-background font-black px-8 py-4 rounded-lg transition-all active:scale-95 shadow-xl hover:opacity-90"
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
                        className="bg-card border border-border/50 rounded-md overflow-hidden shadow-2xl"
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
                                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <AtSign size={16} /> Email Automation
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-primary mb-2 block">{t('email_subject')}</label>
                                            <input 
                                                type="text"
                                                value={settings.VERIFICATION_EMAIL_SUBJECT}
                                                onChange={(e) => setSettings({...settings, VERIFICATION_EMAIL_SUBJECT: e.target.value})}
                                                className="w-full bg-muted/30 border border-border/50 rounded-lg px-6 py-4 outline-none focus:border-primary font-bold text-foreground transition-all"
                                                placeholder={t('email_subject_placeholder')}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-primary mb-2 block">{t('email_body')}</label>
                                            <textarea 
                                                rows={6}
                                                value={settings.VERIFICATION_EMAIL_BODY}
                                                onChange={(e) => setSettings({...settings, VERIFICATION_EMAIL_BODY: e.target.value})}
                                                className="w-full bg-muted/30 border border-border/50 rounded-lg px-6 py-4 outline-none focus:border-primary font-bold text-sm text-foreground leading-relaxed transition-all"
                                                placeholder={t('placeholder_hint')}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-primary block mb-2">{t('document_label')}</label>
                                            <div className="relative group">
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                    onChange={(e) => handleFileUpload(e, 'OFFICIAL_DOCUMENT_PATH')}
                                                    disabled={!!uploading}
                                                />
                                                <div className="border-3 border-dashed border-border rounded-lg p-8 text-center bg-muted/5 group-hover:bg-muted/10 transition-all">
                                                    {uploading === 'OFFICIAL_DOCUMENT_PATH' ? (
                                                        <Loader2 className="mx-auto animate-spin text-primary" size={32} />
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Upload className="mx-auto text-muted-foreground group-hover:text-primary transition-all" size={32} />
                                                            <p className="font-black uppercase text-[10px] tracking-widest text-foreground">{settings.OFFICIAL_DOCUMENT_PATH ? 'Change Document' : t('upload_hint')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {settings.OFFICIAL_DOCUMENT_PATH && (
                                                <div className="mt-4 p-3 bg-primary/10 rounded-md inline-flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-primary" />
                                                    <p className="text-[10px] text-primary font-bold break-all max-w-[250px]">{settings.OFFICIAL_DOCUMENT_PATH}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
                                        <MessageCircle size={16} /> WhatsApp Automation
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-green-600 mb-2 block">{t('whatsapp_message')}</label>
                                            <textarea 
                                                rows={6}
                                                value={settings.VERIFICATION_WHATSAPP_MESSAGE}
                                                onChange={(e) => setSettings({...settings, VERIFICATION_WHATSAPP_MESSAGE: e.target.value})}
                                                className="w-full bg-muted/30 border border-border/50 rounded-lg px-6 py-4 outline-none focus:border-green-500 font-bold text-sm text-foreground leading-relaxed transition-all"
                                                placeholder={t('whatsapp_message_placeholder')}
                                            />
                                            <p className="text-[10px] text-muted-foreground mt-1 italic">{t('placeholder_hint')}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-green-600 block mb-2">{t('whatsapp_document_label')}</label>
                                            <div className="relative group">
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                    onChange={(e) => handleFileUpload(e, 'VERIFICATION_WHATSAPP_DOCUMENT_PATH')}
                                                    disabled={!!uploading}
                                                />
                                                <div className="border-3 border-dashed border-border rounded-lg p-8 text-center bg-muted/5 group-hover:bg-muted/10 transition-all">
                                                    {uploading === 'VERIFICATION_WHATSAPP_DOCUMENT_PATH' ? (
                                                        <Loader2 className="mx-auto animate-spin text-green-500" size={32} />
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <Upload className="mx-auto text-muted-foreground group-hover:text-green-500 transition-all" size={32} />
                                                            <p className="font-black uppercase text-[10px] tracking-widest text-foreground">{settings.VERIFICATION_WHATSAPP_DOCUMENT_PATH ? 'Change Document' : t('upload_hint')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {settings.VERIFICATION_WHATSAPP_DOCUMENT_PATH && (
                                                <div className="mt-4 p-3 bg-green-500/10 rounded-md inline-flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-green-600" />
                                                    <p className="text-[10px] text-green-600 font-bold break-all max-w-[250px]">{settings.VERIFICATION_WHATSAPP_DOCUMENT_PATH}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border/30 flex justify-end">
                                <button 
                                    onClick={handleSaveSettings}
                                    disabled={loading}
                                    className="flex items-center gap-3 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm px-12 py-5 rounded-lg shadow-[0_10px_30px_rgba(var(--primary),0.3)] hover:scale-105 transition-all outline-none"
                                >
                                    <Save size={20} />
                                    {t('save_config')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-card border border-border/50 rounded-md shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border/30">
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('table_info')}</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Contact Channels</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">{t('table_status')}</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">{t('table_date')}</th>
                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{t('table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground font-bold">
                                        {t('no_leads')}
                                    </td>
                                </tr>
                            ) : leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-muted/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground text-sm leading-tight">{lead.name}</span>
                                                <div className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" 
                                                     onClick={() => copyToClipboard(lead.email, `mail-${lead.id}`)}>
                                                    <span className="text-[10px] font-medium">{lead.email || 'No email'}</span>
                                                    {lead.email && (copiedId === `mail-${lead.id}` ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-100" />)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            {lead.whatsapp && (
                                                <div className="flex items-center gap-1.5 bg-green-500/5 px-3 py-1.5 rounded-lg border border-green-500/10 group/wa">
                                                    <span className="text-[10px] font-bold text-foreground tracking-tight">{lead.whatsapp}</span>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => copyToClipboard(lead.whatsapp, `wa-${lead.id}`)} className="text-muted-foreground hover:text-green-500 p-0.5">
                                                            {copiedId === `wa-${lead.id}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                        </button>
                                                        <button onClick={() => handleWhatsAppAction(lead)} className="hover:scale-110 transition-transform p-0.5">
                                                            <img src="/whats.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {lead.phone && (
                                                <div className="flex items-center gap-1.5 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10 group/ph">
                                                    <span className="text-[10px] font-bold text-foreground tracking-tight">{lead.phone}</span>
                                                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:scale-110 transition-transform p-0.5">
                                                        <Phone size={14} fill="currentColor" fillOpacity={0.1} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            lead.status === 'sent' 
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                        }`}>
                                            {lead.status === 'sent' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                            {lead.status === 'sent' ? t('status_sent') : t('status_pending')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-foreground">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[9px] font-medium text-muted-foreground">
                                                {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(lead.id)}
                                            className="w-8 h-8 rounded-lg bg-destructive/5 text-destructive flex items-center justify-center ml-auto hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-90"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-muted/20 border-t border-border/30 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {t('page')} {currentPage} / {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || loading}
                                className="px-3 py-1.5 rounded-lg bg-card border border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all disabled:opacity-30"
                            >
                                {t('prev')}
                            </button>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || loading}
                                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30 shadow-md shadow-primary/10"
                            >
                                {t('next')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationAdmin;
