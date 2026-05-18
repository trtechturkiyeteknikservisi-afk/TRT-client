'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useSettings } from './settings-provider';

interface KVKKCheckboxProps {
    accepted: boolean;
    onChange: (accepted: boolean) => void;
}

export function KVKKCheckbox({ accepted, onChange }: KVKKCheckboxProps) {
    const t = useTranslations('Contact');
    const tPolicies = useTranslations('Policies');
    const locale = useLocale();
    const { settings } = useSettings();
    const [showModal, setShowModal] = useState(false);
    
    const key = `kvkk_${locale}`;
    const policyContent = settings[key] || '';

    return (
        <>
            <div className="flex items-start gap-3 py-2 px-1">
                <input 
                    type="checkbox" 
                    id="kvkk-checkbox"
                    required
                    checked={accepted}
                    onChange={(e) => onChange(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-black/10 dark:border-white/10 text-primary focus:ring-primary cursor-pointer transition-all"
                />
                <label 
                    htmlFor="kvkk-checkbox" 
                    className="text-[11px] font-bold text-foreground/60 leading-tight cursor-pointer select-none"
                >
                    <button 
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="text-primary hover:underline underline-offset-2 decoration-primary/30 text-left cursor-pointer"
                    >
                        {t('kvkk_text')}
                    </button>
                </label>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            className="relative w-full max-w-2xl bg-card border rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-8 border-b flex items-center justify-between bg-muted/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">
                                        {tPolicies('privacy')}
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="p-3 hover:bg-foreground/5 rounded-full transition-colors text-muted-foreground cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 md:p-12 overflow-y-auto flex-1">
                                 <div 
                                   className="whitespace-pre-wrap leading-relaxed font-semibold text-foreground/80 text-sm"
                                   dir={locale === 'ar' ? 'rtl' : 'ltr'}
                                 >
                                   {policyContent || tPolicies('updated_soon')}
                                 </div>
                            </div>
                            <div className="p-6 md:p-8 border-t bg-muted/20 flex justify-end gap-4">
                                 <button 
                                   onClick={() => { setShowModal(false); onChange(true); }}
                                   className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 cursor-pointer"
                                 >
                                   {t('close')}
                                 </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
