'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Ticket, 
  Package, 
  MapPin, 
  Search, 
  Wrench, 
  CheckCircle2, 
  Truck,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function RepairProcess() {
  const t = useTranslations('RepairProcess');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const steps = [
    { icon: MessageSquare, title: t('step1_title'), desc: t('step1_desc') },
    { icon: Ticket, title: t('step2_title'), desc: t('step2_desc') },
    { icon: Package, title: t('step3_title'), desc: t('step3_desc') },
    { icon: MapPin, title: t('step4_title'), desc: t('step4_desc') },
    { icon: Search, title: t('step5_title'), desc: t('step5_desc') },
    { icon: Wrench, title: t('step6_title'), desc: t('step6_desc') },
    { icon: CheckCircle2, title: t('step7_title'), desc: t('step7_desc') },
    { icon: Truck, title: t('step8_title'), desc: t('step8_desc') },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <section className="py-32 relative overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t('title')}
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase mb-6 leading-tight">
              {t('subtitle')}
            </h2>
            <p className="text-lg text-muted-foreground font-semibold">
              {t('intro')}
            </p>
          </motion.div>
        </div>

        {/* Interactive Interactive Process UI */}
        <div className="max-w-6xl mx-auto">
          
          {/* Top Timeline Navigation */}
          <div className="relative mb-16">
            {/* The line connecting the steps */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-muted rounded-full overflow-hidden">
                <motion.div 
                   className="h-full bg-primary origin-left"
                   initial={{ scaleX: 0 }}
                   animate={{ scaleX: (activeStep + 1) / steps.length }}
                   style={{ transformOrigin: isRTL ? 'right' : 'left' }}
                   transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>

            <div className="flex justify-between relative z-10 w-full">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isPast = index < activeStep;
                return (
                  <button
                    key={index}
                    onClick={() => {
                        setActiveStep(index);
                        setIsPlaying(false);
                    }}
                    className={cn(
                      "group relative flex flex-col items-center gap-3 transition-all duration-300",
                      isActive ? "scale-110" : "scale-100 opacity-70 hover:opacity-100"
                    )}
                  >
                     <div className={cn(
                         "w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                         isActive ? "bg-primary border-primary text-primary-foreground shadow-[0_0_20px_rgba(220,38,38,0.4)]" : 
                         isPast ? "bg-primary/20 border-primary/50 text-foreground" : "bg-card border-border text-muted-foreground group-hover:border-primary/50"
                     )}>
                        <step.icon size={20} className={cn("md:w-6 md:h-6", isActive && "animate-pulse")} />
                     </div>
                     {/* Tooltip for desktop hover */}
                     <span className="hidden md:block absolute -bottom-8 opacity-0 group-hover:opacity-100 text-xs font-bold text-foreground text-center w-24 transition-opacity">
                         {step.title}
                     </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center mb-8">
              <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                  {isPlaying ? (
                      <><Pause size={14} /> {t('pause_autoplay')}</>
                  ) : (
                      <><Play size={14} /> {t('resume_autoplay')}</>
                  )}
              </button>
          </div>

          {/* Active Step Presentation */}
          <div className="relative bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden min-h-[400px] flex items-center">
             {/* Large background number */}
             <div className={cn(
                 "absolute top-1/2 -translate-y-1/2 text-[20rem] font-black text-foreground/5 select-none pointer-events-none",
                 isRTL ? "left-8" : "right-8"
             )}>
                 {activeStep + 1}
             </div>

             <div className="w-full">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-8 md:p-16"
                    >
                        {/* Text Content */}
                        <div className="space-y-6">
                            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-black uppercase text-sm tracking-widest">
                                {t('process_title').split(' ')[0]} {activeStep + 1} / 8
                            </span>
                            <h3 className="text-3xl md:text-5xl font-black text-foreground leading-tight tracking-tight uppercase">
                                {steps[activeStep].title}
                            </h3>
                            <p className="text-lg text-muted-foreground font-semibold leading-relaxed">
                                {steps[activeStep].desc}
                            </p>
                        </div>

                        {/* Visual Asset (Icon / Image representation) */}
                        <div className="relative flex justify-center items-center h-full">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-[80px] rounded-full" />
                            <motion.div 
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-card to-background border border-border flex items-center justify-center shadow-2xl"
                            >
                                <div className="absolute inset-2 rounded-full border border-primary/20 border-dashed animate-[spin_10s_linear_infinite]" />
                                {React.createElement(steps[activeStep].icon, { 
                                    size: 80, 
                                    strokeWidth: 1.5,
                                    className: "text-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                                })}
                            </motion.div>
                        </div>
                    </motion.div>
                 </AnimatePresence>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
