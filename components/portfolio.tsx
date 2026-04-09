'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ZoomIn, X } from 'lucide-react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const mockWorks = [
  { id: 1, title: 'iPhone 13 Screen Replacement', type: 'image', url: 'https://images.unsplash.com/photo-1596742572447-5790553ef448?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, title: 'MacBook Pro Battery Upgrade', type: 'image', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, title: 'Robot Vacuum Deep Cleaning', type: 'image', url: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?q=80&w=2070&auto=format&fit=crop' },
  { id: 4, title: 'Vintage Watch Restoration', type: 'image', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070&auto=format&fit=crop' },
  { id: 5, title: 'Samsung S22 Ultra Repair', type: 'image', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop' },
  { id: 6, title: 'Laptop Hinge Fix', type: 'image', url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=2070&auto=format&fit=crop' }
];

interface PortfolioProps {
  limit?: number;
  showTitle?: boolean;
}

export function Portfolio({ limit = 6, showTitle = true }: PortfolioProps) {
  const t = useTranslations('Portfolio');
  const [works, setWorks] = useState(mockWorks);
  const [selectedWork, setSelectedWork] = useState<any>(null);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${API_URL}/content/portfolio`);
        const data = response.data as any[];
        if (data.length > 0) {
          setWorks(data);
        }
      } catch (error) {
        console.error('Error fetching portfolio', error);
      }
    };
    fetchWorks();
  }, []);

  const displayedWorks = limit > 0 ? works.slice(0, limit) : works;

  return (
    <section id="works" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{t('title')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('desc')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedWorks.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl aspect-video bg-muted"
              onClick={() => setSelectedWork(work)}
            >
              {work.type === 'video' ? (
                <video src={work.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <img
                  src={work.url}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                <div className="p-3 bg-primary text-primary-foreground rounded-full">
                  {work.type === 'video' ? <Play size={24} /> : <ZoomIn size={24} />}
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-semibold">{work.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {limit > 0 && works.length > limit && (
          <div className="mt-16 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20"
            >
              {t('view_more')}
            </Link>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedWork && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setSelectedWork(null)}
          >
            <X size={32} />
          </button>
          <div className="max-w-5xl w-full max-h-[80vh] overflow-hidden rounded-2xl">
            {selectedWork.type === 'video' ? (
              <video src={selectedWork.url} className="w-full h-full object-contain" controls autoPlay />
            ) : (
              <img
                src={selectedWork.url}
                alt={selectedWork.title}
                className="w-full h-full object-contain"
              />
            )}
            <div className="p-6 bg-card text-card-foreground">
              <h3 className="text-2xl font-bold mb-2">{selectedWork.title}</h3>
              <p className="text-muted-foreground">{selectedWork.description || t('no_description')}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
