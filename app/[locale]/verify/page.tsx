'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
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
    FileCheck
} from 'lucide-react';

const VerificationPage = () => {
    const t = useTranslations('Verification');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        phone: '',
        email: '',
        agreedToTerms: false
    });

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
            // Using the base URL from env if needed, or relative if on same domain
            const response = await axios.post('http://localhost:5000/api/verify/submit', formData);
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
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white" dir="rtl">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-[#111] border border-red-900/30 rounded-3xl p-10 text-center shadow-2xl"
                >
                    <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">{t('success_title')}</h1>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        {t('success_desc')}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4 sm:p-8" dir="rtl">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-red-900/10 blur-[100px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-2xl w-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                <div className="p-8 sm:p-12">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/20">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-gray-400 text-lg max-w-lg">
                            {t('subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div className="relative group">
                            <label className="absolute right-4 -top-2.5 px-2 bg-[#0a0a0a] text-xs font-medium text-red-500 z-10">
                                {t('form_name')}
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl focus-within:border-red-600/50 transition-all duration-300 group-hover:border-white/20">
                                <User className="mr-4 w-5 h-5 text-gray-500" />
                                <input 
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-none text-white p-5 pr-2 focus:ring-0 placeholder:text-gray-600 text-lg"
                                    placeholder="محمد أحمد علي"
                                />
                            </div>
                        </div>

                        {/* Two column fields for numbers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* WhatsApp Field */}
                            <div className="relative group">
                                <label className="absolute right-4 -top-2.5 px-2 bg-[#0a0a0a] text-xs font-medium text-red-500 z-10">
                                    {t('form_whatsapp')}
                                </label>
                                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl focus-within:border-red-600/50 transition-all duration-300">
                                    <MessageCircle className="mr-4 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="tel"
                                        name="whatsapp"
                                        required
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-none text-white p-5 pr-2 focus:ring-0 text-lg"
                                        placeholder="05xxxxxxx"
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div className="relative group">
                                <label className="absolute right-4 -top-2.5 px-2 bg-[#0a0a0a] text-xs font-medium text-red-500 z-10">
                                    {t('form_phone')}
                                </label>
                                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl focus-within:border-red-600/50 transition-all duration-300">
                                    <Phone className="mr-4 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-none text-white p-5 pr-2 focus:ring-0 text-lg"
                                        placeholder="05xxxxxxx"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="relative group">
                            <label className="absolute right-4 -top-2.5 px-2 bg-[#0a0a0a] text-xs font-medium text-red-500 z-10">
                                {t('form_email')}
                            </label>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl focus-within:border-red-600/50 transition-all duration-300">
                                <Mail className="mr-4 w-5 h-5 text-gray-500" />
                                <input 
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-none text-white p-5 pr-2 focus:ring-0 text-lg"
                                    placeholder="example@gmail.com"
                                />
                            </div>
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-start bg-red-600/5 p-4 rounded-2xl border border-red-600/10">
                            <input 
                                id="terms"
                                type="checkbox"
                                name="agreedToTerms"
                                required
                                checked={formData.agreedToTerms}
                                onChange={handleChange}
                                className="mt-1 h-5 w-5 rounded border-gray-700 bg-gray-900 text-red-600 focus:ring-red-600 focus:ring-offset-gray-900"
                            />
                            <label htmlFor="terms" className="mr-3 text-sm text-gray-400 leading-normal select-none">
                                {t('form_terms')}
                            </label>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center space-x-2 text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20"
                            >
                                <AlertCircle className="w-5 h-5 ml-2" />
                                <span className="text-sm">{t('error_desc')}</span>
                            </motion.div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="group relative w-full bg-gradient-to-r from-red-600 to-red-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold text-xl py-5 rounded-2xl transition-all duration-300 shadow-lg shadow-red-600/30 overflow-hidden"
                        >
                            <div className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <div className="flex items-center justify-center">
                                {loading ? (
                                    <Loader2 className="w-7 h-7 animate-spin" />
                                ) : (
                                    <>
                                        <FileCheck className="ml-3 w-6 h-6" />
                                        <span>{t('form_submit')}</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                         {/* Trust labels can go here */}
                         <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
                            <div className="w-2 h-2 bg-green-500 rounded-full ml-2" />
                            بوابة معتمدة
                         </div>
                         <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
                            <div className="w-2 h-2 bg-red-500 rounded-full ml-2" />
                            نظام مشفر بالكامل
                         </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerificationPage;
