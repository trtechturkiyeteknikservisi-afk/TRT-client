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
    ArrowLeft,
    X,
    ChevronLeft,
    Download,
    Eye,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from '@/i18n/routing';

const VerificationPage = () => {
    const t = useTranslations('Verification');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState<{show: boolean, type: 'kvkk' | 'terms' | null}>({show: false, type: null});
    const [policyContent, setPolicyContent] = useState({ kvkk: '', terms: '' });
    const [policyPdfs, setPolicyPdfs] = useState({ kvkk: '', terms: '' });

    const tContact = useTranslations('Contact');
    const tPolicies = useTranslations('Policies');
    
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/settings?t=${Date.now()}`);
                const data = response.data as any;
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                
                // Robust SERVER_URL construction
                let normalizedApiUrl = API_URL;
                if (!API_URL.startsWith('http') && !API_URL.startsWith('/')) {
                    const cleanUrl = API_URL.startsWith('.') ? API_URL.substring(1) : API_URL;
                    normalizedApiUrl = `https://${cleanUrl}`;
                }
                const SERVER_URL = normalizedApiUrl.replace('/api', '');

                const getFullUrl = (path: string) => {
                    if (!path) return '';
                    if (path.startsWith('http')) return path;
                    if (path.startsWith('.')) return `https://${path.substring(1)}`;
                    return `${SERVER_URL}${path.startsWith('/') ? path : `/${path}`}`;
                };

                setPolicyContent({
                    kvkk: data[`kvkk_${locale}`] || data[`kvkk_en`] || '',
                    terms: data[`policy_${locale}`] || data[`policy_en`] || ''
                });
                setPolicyPdfs({
                    kvkk: getFullUrl(data[`kvkk_pdf_${locale}`] || data[`kvkk_pdf_en`] || ''),
                    terms: getFullUrl(data[`terms_pdf_${locale}`] || data[`terms_pdf_en`] || '')
                });
            } catch (err) {
                console.error('Error fetching policies:', err);
            }
        };
        fetchPolicies();
    }, [locale]);

    const handleLocaleChange = (newLocale: 'ar' | 'en' | 'tr') => {
        router.replace(pathname, { locale: newLocale });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation: At least one of (email, whatsapp, phone) must be filled
        if (!formData.email && !formData.whatsapp && !formData.phone) {
            setError(locale === 'ar' ? 'يرجى ملء وسيلة تواصل واحدة على الأقل (واتساب، هاتف، أو بريد إلكتروني).' : locale === 'tr' ? 'Lütfen en az bir iletişim kanalı doldurun (WhatsApp, Telefon veya E-posta).' : 'Please fill in at least one contact method (WhatsApp, Phone, or Email).');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${apiUrl}/verify/submit`, {
                ...formData,
                agreedToTerms: true // Both checkboxes are required in UI anyway
            });
            if (response.status === 201) {
                setSuccess(true);
            }
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(t('error_desc'));
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
                        <button 
                            onClick={() => router.push('/')}
                            className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                        >
                            {locale === 'ar' ? 'العودة للرئيسية' : locale === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}
                        </button>
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
                className="relative z-10 max-w-lg w-full bg-[#070707]/95 backdrop-blur-3xl border border-white/5 rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] ring-1 ring-white/5"
            >
                <div className="p-6 sm:p-10 pt-10">
                    {/* Language Switcher */}
                    <div className="flex items-center justify-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md mb-8 w-fit mx-auto">
                        {[
                            { code: 'ar', flag: 'sa' },
                            { code: 'tr', flag: 'tr' },
                            { code: 'en', flag: 'gb' }
                        ].map((l) => (
                            <button 
                                key={l.code}
                                onClick={() => handleLocaleChange(l.code as any)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", 
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
                    <div className="flex flex-col items-center text-center mb-8">
                        <motion.div 
                            initial={{ rotate: -10, scale: 0.8 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center mb-4 shadow-2xl shadow-red-600/20"
                        >
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tighter uppercase leading-[1.1]">
                            {t('title')}
                        </h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.1em] max-w-xs">
                            {t('subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2">
                                {t('form_name')}
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/5 rounded-xl focus-within:border-red-600/50 transition-all duration-300">
                                <div className="p-3.5 text-gray-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-none text-white p-3.5 pr-1 focus:ring-0 outline-none placeholder:text-gray-700 text-sm font-bold"
                                    placeholder={tContact('name_placeholder')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* WhatsApp Field */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2">
                                    {t('form_whatsapp')}
                                </label>
                                <div className="flex items-center bg-white/5 border border-white/5 rounded-xl focus-within:border-red-600/50 transition-all duration-300">
                                    <div className="p-3.5 text-gray-600">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="tel"
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-none text-white p-3.5 pr-1 focus:ring-0 outline-none text-sm font-bold"
                                        placeholder="05xxxx"
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2">
                                    {t('form_phone')}
                                </label>
                                <div className="flex items-center bg-white/5 border border-white/5 rounded-xl focus-within:border-red-600/50 transition-all duration-300">
                                    <div className="p-3.5 text-gray-600">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-none text-white p-3.5 pr-1 focus:ring-0 outline-none text-sm font-bold"
                                        placeholder="05xxxx"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2">
                                {t('form_email')}
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/5 rounded-xl focus-within:border-red-600/50 transition-all duration-300">
                                <div className="p-3.5 text-gray-600">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-none text-white p-3.5 pr-1 focus:ring-0 outline-none text-sm font-bold"
                                    placeholder="example@gmail.com"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold px-2">
                                {t('delivery_note')}
                            </p>
                        </div>

                        {/* KVKK Checkbox */}
                        <div className="flex items-start gap-3 py-0.5 px-1 group">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="kvkk-checkbox"
                                    required
                                    checked={kvkkAccepted}
                                    onChange={(e) => setKvkkAccepted(e.target.checked)}
                                    className="peer h-4 w-4 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-600 cursor-pointer transition-all"
                                />
                                <CheckCircle2 className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity w-3 h-3 text-white left-0.5" />
                            </div>
                            <label htmlFor="kvkk-checkbox" className="text-[10px] font-bold text-gray-400 leading-tight cursor-pointer select-none">
                                <button 
                                    type="button"
                                    onClick={() => setShowPolicyModal({show: true, type: 'kvkk'})}
                                    className="text-red-500 hover:underline decoration-red-500/30 underline-offset-4 text-left"
                                >
                                    {t('kvkk_accept').split('KVKK Aydınlatma Metni')[0]}
                                    <span className="underline decoration-red-500/50">KVKK Aydınlatma Metni</span>
                                    {t('kvkk_accept').split('KVKK Aydınlatma Metni')[1]}
                                </button>
                            </label>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3 py-0.5 px-1">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="terms-checkbox"
                                    required
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="peer h-4 w-4 rounded border-white/10 bg-white/5 text-red-600 focus:ring-red-600 cursor-pointer transition-all"
                                />
                                <CheckCircle2 className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity w-3 h-3 text-white left-0.5" />
                            </div>
                            <label htmlFor="terms-checkbox" className="text-[10px] font-bold text-gray-400 leading-tight cursor-pointer select-none">
                                <button 
                                    type="button"
                                    onClick={() => setShowPolicyModal({show: true, type: 'terms'})}
                                    className="text-red-500 hover:underline decoration-red-500/30 underline-offset-4 text-left"
                                >
                                    {t('terms_accept').split('Servis Şartları')[0]}
                                    <span className="underline decoration-red-500/50">Servis Şartları</span>
                                    {t('terms_accept').split('Servis Şartları')[1]}
                                </button>
                            </label>
                        </div>

                        {/* Combined Privacy Info Box */}
                        <div className="flex items-start gap-3 p-4 bg-red-600/5 rounded-2xl border border-red-600/10">
                            <div className="w-5 h-5 rounded-full bg-red-600/20 flex items-center justify-center shrink-0 mt-0.5">
                                <AlertCircle className="w-3 h-3 text-red-500" />
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                {t('privacy_note_combined')}
                            </p>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10"
                            >
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-tight">{error}</span>
                            </motion.div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button 
                                type="button"
                                onClick={() => router.back()}
                                className="p-4 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10 transition-all active:scale-95"
                            >
                                <ChevronLeft className={cn("w-5 h-5", locale === 'ar' && "rotate-180")} />
                            </button>
                            <button 
                                type="submit"
                                disabled={loading || !kvkkAccepted || !termsAccepted}
                                className="grow group relative bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs py-4 rounded-xl transition-all duration-300 shadow-2xl shadow-red-600/20 overflow-hidden active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <FileCheck className="w-5 h-5" />
                                            <span className="uppercase tracking-widest">{t('form_submit')}</span>
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Policy Modal */}
                <AnimatePresence>
                    {showPolicyModal.show && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowPolicyModal({show: false, type: null})}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                                className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                            >
                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <h3 className="text-lg font-black uppercase tracking-tight text-white">
                                            {showPolicyModal.type === 'kvkk' ? tPolicies('kvkk') : tPolicies('terms')}
                                        </h3>
                                    </div>
                                    <button 
                                        onClick={() => setShowPolicyModal({show: false, type: null})}
                                        className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-500"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6 md:p-10 overflow-y-auto flex-1">
                                    {showPolicyModal.type && policyPdfs[showPolicyModal.type] ? (
                                        <div className="flex flex-col items-center justify-center space-y-8 py-10">
                                            <div className="w-20 h-20 rounded-3xl bg-red-600/5 flex items-center justify-center text-red-600 border border-red-600/10 shadow-2xl shadow-red-600/5">
                                                <FileText size={40} />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h4 className="text-xl font-black text-white uppercase tracking-tight italic">
                                                    {showPolicyModal.type === 'kvkk' ? tPolicies('kvkk') : tPolicies('terms')}
                                                </h4>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest opacity-60">
                                                    {locale === 'ar' ? 'اختر كيف ترغب في استعراض الوثيقة' : locale === 'tr' ? 'Belgeyi nasıl görüntülemek istersiniz?' : 'How would you like to view the document?'}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                                                <a 
                                                    href={policyPdfs[showPolicyModal.type]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-red-600/30 hover:bg-red-600/5 transition-all group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-red-600 transition-colors">
                                                        <Eye size={24} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors">
                                                        {tPolicies('view')}
                                                    </span>
                                                </a>
                                                <a 
                                                    href={policyPdfs[showPolicyModal.type]}
                                                    download
                                                    className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-red-600/30 hover:bg-red-600/5 transition-all group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-red-600 transition-colors">
                                                        <Download size={24} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors">
                                                        {tPolicies('download')}
                                                    </span>
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            className="whitespace-pre-wrap leading-relaxed font-bold text-gray-400 text-sm"
                                            dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                        >
                                            {(showPolicyModal.type === 'kvkk' ? policyContent.kvkk : policyContent.terms) || tPolicies('updated_soon')}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 md:p-6 border-t border-white/5 bg-white/5 flex justify-end gap-4">
                                    <button 
                                        onClick={() => { 
                                            if(showPolicyModal.type === 'kvkk') setKvkkAccepted(true);
                                            else setTermsAccepted(true);
                                            setShowPolicyModal({show: false, type: null}); 
                                        }}
                                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-600/20"
                                    >
                                        {tContact('close')}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
export default VerificationPage;
