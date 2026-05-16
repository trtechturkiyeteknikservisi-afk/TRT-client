'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function LocationMap() {
  const t = useTranslations('Map');
  const t_contact = useTranslations('Contact');

  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3047.8824147775!2d29.06041!3d40.1947622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ca3f006ec62c09%3A0xf2ce41e488674b1e!2sTR%20TECH!5e0!3m2!1sar!2seg!4v1715675672584!5m2!1sar!2seg";
  const directionsUrl = "https://maps.app.goo.gl/9kUMHWGGjDsoswFz9";

  return (
    <section className="py-12 md:py-24 relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            
            {/* Content Side */}
            <div className="lg:col-span-2 space-y-8 text-center lg:text-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img src="/location.webp" alt="Location" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  </div>
                  <span>{t('title')}</span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground leading-tight uppercase">
                  {t('title').split(' ').map((word, i) => (
                    <span key={i} className={i === 1 ? "text-primary italic opacity-90 block" : "block"}>
                      {word}
                    </span>
                  ))}
                </h2>

                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                  {t('desc')}
                </p>

                <div className="p-6 rounded-xl bg-card border border-border/50 shadow-xl shadow-primary/5 space-y-4">
                  <div className="flex items-start gap-4 text-start">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                      <img src="/location.webp" alt="Location" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">
                        {t_contact('address')}
                      </p>
                      <p className="font-bold text-foreground">
                        {t_contact('location_value')}
                      </p>
                    </div>
                  </div>

                  <motion.a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group"
                  >
                    <Navigation size={18} className="group-hover:rotate-12 transition-transform" />
                    {t('get_directions')}
                  </motion.a>
                </div>
              </motion.div>
            </div>

            {/* Map Side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-3 h-[400px] md:h-[500px] relative rounded-xl overflow-hidden border-8 border-card shadow-lg group"
            >
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              />
              
              {/* Overlay Gradient for premium look */}
              <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-xl" />
              
              <div className="absolute bottom-6 right-6 p-4 rounded-xl bg-background/80 backdrop-blur-md border border-border/50 shadow-xl hidden md:flex items-center gap-3 animate-fade-in pointer-events-none">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-tight">{t_contact('location_detected')}</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
