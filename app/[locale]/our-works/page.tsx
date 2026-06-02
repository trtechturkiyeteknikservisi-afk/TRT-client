'use client';

import React from 'react';
import { Portfolio } from "@/components/portfolio";
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

export default function PortfolioPage() {
  const t = useTranslations('Portfolio');

  return (
    <main className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative pt-8 md:pt-12 pb-20 bg-muted/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex p-3 bg-primary/10 rounded-xl text-primary mb-6 animate-in fade-in zoom-in"
          >
            <Briefcase size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase"
          >
            {t('title')}
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            className="h-1.5 bg-primary mx-auto rounded-full mb-8"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium"
          >
            {t('desc')}
          </motion.p>
        </div>
      </section>

      {/* Full Works Gallery */}
      <Portfolio limit={0} showTitle={false} />

    </main>
  );
}
