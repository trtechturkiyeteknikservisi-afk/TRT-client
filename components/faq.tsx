'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface FaqItem {
  id: number | string;
  question: string;
  answer: string;
}

const INITIAL_VISIBLE_COUNT = 6;

const mockFaqs: FaqItem[] = [
  { id: 1, question: 'How long does a typical phone repair take?', answer: 'Most phone repairs like screen or battery replacement are completed within 30-60 minutes while you wait.' },
  { id: 2, question: 'Do you use original replacement parts?', answer: 'Yes, we use original and high-quality parts for all repairs to ensure your device functions perfectly.' },
  { id: 3, question: 'Is there a warranty on your repair services?', answer: 'We provide a 6-month warranty on most repairs and parts replaced. Terms may vary based on the specific service.' },
  { id: 4, question: 'Can you fix water-damaged devices?', answer: 'We specialize in water damage restoration. Success depends on the severity, but we have a high recovery rate.' },
  { id: 5, question: 'Do you repair laptops and robot vacuums as well?', answer: 'Yes, our certified technicians repair laptops, smartwatches, robot vacuums, and tablets of all major brands.' },
  { id: 6, question: 'Is my personal data safe during the repair?', answer: 'Your privacy is our priority. We follow strict data confidentiality protocols and do not access your files.' },
  { id: 7, question: 'Do you offer pickup and delivery repair services?', answer: 'Yes, we provide courier and doorstep pickup options depending on your location for maximum convenience.' },
  { id: 8, question: 'What payment methods do you accept?', answer: 'We accept cash, all major credit/debit cards, bank wire transfers, and installment options.' }
];

export function FAQ() {
  const t = useTranslations('FAQ');
  const locale = useLocale();
  const [faqs, setFaqs] = useState<FaqItem[]>(mockFaqs);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${API_URL}/content/faqs?locale=${locale}`);
        const data = response.data as FaqItem[];
        if (data && data.length > 0) {
          setFaqs(data);
        }
      } catch (error) {
        console.warn('Error fetching FAQs', error);
      }
    };
    fetchFaqs();
  }, [locale]);

  const visibleFaqs = showAll ? faqs : faqs.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMoreFaqs = faqs.length > INITIAL_VISIBLE_COUNT;

  return (
    <section id="faqs" className="py-12 md:py-32 bg-background relative overflow-hidden">
      {/* Visual Accent Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Centered Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20"
          >
            <span>{t('help_center')}</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-[0.9]"
          >
            {t('title').split(' ').map((word, i) => (
              <span key={i} className={cn(i === 2 && "text-primary italic block sm:inline")}> {word} </span>
            ))}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto"
          >
            {t('desc')}
          </motion.p>
          
          <div className="flex justify-center pt-4">
            <div className="w-24 h-1.5 bg-primary rounded-full" />
          </div>
        </div>

        {/* 2-Column FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {visibleFaqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
              viewport={{ once: true }}
              className={cn(
                "group rounded-xl border transition-all duration-500 overflow-hidden",
                openIndex === index 
                  ? "bg-card border-primary/50 shadow-lg shadow-primary/10" 
                  : "bg-muted/30 border-primary/10 dark:border-border/50 hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              <button
                className="w-full flex items-center justify-between p-8 text-left cursor-pointer"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className={cn(
                  "font-black text-lg md:text-xl transition-colors duration-300 pr-4",
                  openIndex === index ? "text-primary" : "text-foreground"
                )}>
                  {faq.question}
                </span>
                <div className={cn(
                  "min-w-10 min-h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                  openIndex === index 
                    ? "bg-primary text-primary-foreground rotate-180 scale-110" 
                    : "bg-background text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <ChevronDown size={22} strokeWidth={3} />
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  >
                    <div className="px-8 pb-8 pt-0">
                      <div className="h-px w-full bg-border/50 mb-6" />
                      <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Show More / Show Less Button */}
        {hasMoreFaqs && (
          <div className="flex justify-center mt-12 md:mt-16">
            <button
              onClick={() => {
                if (showAll) {
                  setShowAll(false);
                  if (openIndex !== null && openIndex >= INITIAL_VISIBLE_COUNT) {
                    setOpenIndex(null);
                  }
                  const faqElem = document.getElementById('faqs');
                  if (faqElem) {
                    faqElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                } else {
                  setShowAll(true);
                }
              }}
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-card hover:bg-muted/80 text-foreground border border-border hover:border-primary/50 shadow-sm hover:shadow-lg hover:shadow-primary/5 font-black text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95"
            >
              <span>
                {showAll ? t('show_less') : t('show_more')}
              </span>
              <div className={cn(
                "w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                showAll ? "rotate-180" : ""
              )}>
                <ChevronDown size={18} strokeWidth={2.5} />
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
