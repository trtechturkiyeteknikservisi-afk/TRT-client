'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import axios from 'axios';
import { 
    ShieldCheck, 
    Mail, 
    Phone, 
    MessageCircle, 
    User, 
    CheckCircle2, 
    AlertCircle,
    Loader2,
    FileCheck,
    ArrowRight,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from '@/i18n/routing';

const VerificationPage = () => {
    const t = useTranslations('Verification');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [step, setStep] = useState(1); // 1: Terms, 2: Form
    const [loading, setLoading] = useState(false);
    const [fetchingTerms, setFetchingTerms] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [termsContent, setTermsContent] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        phone: '',
        email: '',
        agreedToTerms: true // Always true since they agree in step 1
    });

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/settings`);
                const key = `policy_${locale}`;
                setTermsContent((response.data as any)[key] || '');
            } catch (err) {
                console.error('Error fetching terms:', err);
            } finally {
                setFetchingTerms(false);
            }
        };
        fetchTerms();
    }, [locale]);

    const handleLocaleChange = (newLocale: 'ar' | 'en' | 'tr') => {
        router.replace(pathname, { locale: newLocale });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${apiUrl}/verify/submit`, formData);
            if (response.status === 201) {
                setSuccess(true);
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-[#0a0a0a] border border-red-900/30 rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/10">
                            <CheckCircle2 className="w-12 h-12 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-black mb-4 tracking-tighter uppercase leading-tight">{t('success_title')}</h1>
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            {t('success_desc')}
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            {/* Dark Premium Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/5 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 max-w-xl w-full bg-[#070707]/95 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/5"
            >
                {/* Custom Language Switcher for External Users */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-md z-50">
                    {[
                        { code: 'ar', flag: 'sa' },
                        { code: 'tr', flag: 'tr' },
                        { code: 'en', flag: 'gb' }
                    ].map((l) => (
                        <button 
                            key={l.code}
                            onClick={() => handleLocaleChange(l.code as any)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", 
                                locale === l.code ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <img 
                                src={`https://flagcdn.com/w40/${l.flag}.png`} 
                                alt={l.code}
                                className="w-4 h-3 rounded-sm object-cover opacity-80"
                            />
                            <span>{l.code}</span>
                        </button>
                    ))}
                </div>

                <div className="p-8 sm:p-14 pt-20">
                    <div className="flex flex-col items-center text-center mb-12">
                        <motion.div 
                            initial={{ rotate: -10, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-red-600/20"
                        >
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter uppercase leading-[0.9]">
                            {t('title')}
                        </h1>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em]">
                            {t('subtitle')}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="terms"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-6">
                                    <p className="text-white text-lg font-bold leading-relaxed text-center px-4">
                                        {t('terms_step_title')}
                                    </p>
                                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-red-600/20 scrollbar-track-transparent text-gray-400 text-sm leading-relaxed">
                                        <h3 className="text-red-500 text-xs font-black uppercase tracking-widest mb-4 inline-block border-b border-red-500/20 pb-1">
                                            {t('terms_content_title')}
                                        </h3>
                                        
                                        {fetchingTerms ? (
                                            <div className="flex items-center justify-center py-10 opacity-30">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            </div>
                                        ) : (
                                            <div 
                                                className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-gray-400"
                                                dangerouslySetInnerHTML={{ __html: termsContent || t('error_desc') }} 
                                            />
                                        )}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setStep(2)}
                                    disabled={fetchingTerms || !termsContent}
                                    className="group relative w-full bg-white text-black font-black text-sm uppercase py-5 rounded-2xl transition-all duration-300 hover:bg-red-600 hover:text-white shadow-xl shadow-white/5 overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center gap-2 relative z-10">
                                        <span>{t('terms_step_button')}</span>
                                        <ArrowRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", locale === 'ar' && "rotate-180 group-hover:-translate-x-1")} />
                                    </div>
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form 
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handleSubmit} 
                                className="space-y-6"
                            >
                                {/* Name Field */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center px-2">
                                        <label className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">
                                            {t('form_name')}
                                        </label>
                                    </div>
                                    <div className="flex items-center bg-white/5 border border-white/5 rounded-2xl focus-within:border-red-600/50 transition-all duration-300">
                                        <div className="p-4 text-gray-600">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input 
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-transparent border-none text-white p-4 pr-1 focus:ring-0 outline-none placeholder:text-gray-700 text-base font-bold"
                                            placeholder="..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* WhatsApp Field */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center px-2">
                                            <label className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">
                                                {t('form_whatsapp')}
                                            </label>
                                        </div>
                                        <div className="flex items-center bg-white/5 border border-white/5 rounded-2xl focus-within:border-red-600/50 transition-all duration-300">
                                            <div className="p-4 text-gray-600">
                                                <MessageCircle className="w-5 h-5" />
                                            </div>
                                            <input 
                                                type="tel"
                                                name="whatsapp"
                                                required
                                                value={formData.whatsapp}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-none text-white p-4 pr-1 focus:ring-0 outline-none text-base font-bold"
                                                placeholder="05xxxx"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center px-2">
                                            <label className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">
                                                {t('form_phone')}
                                            </label>
                                        </div>
                                        <div className="flex items-center bg-white/5 border border-white/5 rounded-2xl focus-within:border-red-600/50 transition-all duration-300">
                                            <div className="p-4 text-gray-600">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <input 
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-none text-white p-4 pr-1 focus:ring-0 outline-none text-base font-bold"
                                                placeholder="05xxxx"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center px-2">
                                        <label className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">
                                            {t('form_email')}
                                        </label>
                                    </div>
                                    <div className="flex items-center bg-white/5 border border-white/5 rounded-2xl focus-within:border-red-600/50 transition-all duration-300">
                                        <div className="p-4 text-gray-600">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input 
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-transparent border-none text-white p-4 pr-1 focus:ring-0 outline-none text-base font-bold"
                                            placeholder="example@gmail.com"
                                        />
                                    </div>
                                </div>

                                {/* Privacy Info */}
                                <div className="flex items-start gap-4 p-5 bg-red-600/5 rounded-3xl border border-red-600/10">
                                    <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                                    </div>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed">
                                        {t('privacy_note')}
                                    </p>
                                </div>

                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3 text-red-500 bg-red-500/5 p-4 rounded-2xl border border-red-500/10"
                                    >
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-tight">{t('error_desc')}</span>
                                    </motion.div>
                                )}

                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="p-5 rounded-2xl bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10 transition-all"
                                    >
                                        <ArrowRight className={cn("w-6 h-6", locale !== 'ar' && "rotate-180")} />
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="grow group relative bg-gradient-to-r from-red-600 to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-5 rounded-2xl transition-all duration-300 shadow-2xl shadow-red-600/20 overflow-hidden"
                                    >
                                        <div className="flex items-center justify-center gap-3 relative z-10">
                                            {loading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <FileCheck className="w-6 h-6" />
                                                    <span className="uppercase tracking-widest">{t('form_submit')}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none" />
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default VerificationPage;
