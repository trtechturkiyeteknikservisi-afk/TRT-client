'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import { Calendar, User, ArrowRight, Search, Tag, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLocale, useTranslations, useFormatter } from 'next-intl';

const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

const mockBlogs = [
  {
    id: 1,
    title: 'How to Extend Your Phone Battery Life',
    content: 'Battery life is one of the most important aspects of any smartphone. Here are some tips to make it last longer...',
    image: 'https://images.unsplash.com/photo-1512428559083-a401a3389575?q=80&w=2070&auto=format&fit=crop',
    author: 'Admin',
    date: '2024-03-28',
    slug: 'phone-battery-life-tips',
    category: 'Phone Repair'
  },
  {
    id: 2,
    title: 'Maintenance Tips for Your Robot Vacuum',
    content: 'To keep your robot vacuum running smoothly for years, regular maintenance is key. Learn what to check and clean...',
    image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=2070&auto=format&fit=crop',
    author: 'Admin',
    date: '2024-03-25',
    slug: 'robot-vacuum-maintenance',
    category: 'Robot Vacuum'
  },
  {
    id: 3,
    title: 'Common Laptop Overheating Issues',
    content: 'Is your laptop getting too hot? It might be time for a professional cleaning or thermal paste replacement...',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2070&auto=format&fit=crop',
    author: 'Admin',
    date: '2024-03-20',
    slug: 'laptop-overheating-solutions',
    category: 'Laptop Repair'
  }
];

const BATCH_SIZE = 10;

export default function BlogPage() {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const format = useFormatter();
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchBlogs = async (pageToFetch: number, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/blogs?locale=${locale}&page=${pageToFetch}&limit=${BATCH_SIZE}`);
      
      const resData = response.data as any;
      
      if (resData && Array.isArray(resData.blogs)) {
        if (isInitial) {
          setBlogs(resData.blogs);
        } else {
          setBlogs((prev) => [...prev, ...resData.blogs]);
        }
        setHasMore(Boolean(resData.hasMore));
        setPage(pageToFetch);
      } else if (Array.isArray(resData)) {
        if (isInitial) {
          setBlogs(resData.slice(0, BATCH_SIZE));
          setHasMore(resData.length > BATCH_SIZE);
        }
      }
    } catch (error) {
      console.error('Error fetching blogs', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1, true);
  }, [locale]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchBlogs(page + 1, false);
    }
  }, [page, hasMore, loadingMore, locale]);

  // Infinite Scroll via IntersectionObserver
  useEffect(() => {
    if (loading || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMore();
      }
    }, { threshold: 0.1 });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, loadingMore, loadMore]);

  return (
    <main className="min-h-screen bg-background">
      
      <section className="pt-8 md:pt-12 pb-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex p-3 bg-primary/10 rounded-xl text-primary mb-6"
            >
              <Newspaper size={32} />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-foreground uppercase">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              {t('desc')}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border/50">
              <p className="text-muted-foreground font-bold">{t('no_blogs')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog, index) => (
                  <Link
                    key={`${blog.id}-${index}`}
                    href={`/blog/${blog.slug}`}
                    className="block h-full cursor-pointer group"
                  >
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (index % 10) * 0.05 }}
                      className="bg-card rounded-xl border border-border/50 overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col h-full"
                    >
                      <div className="relative w-full aspect-video overflow-hidden">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-10 flex flex-col flex-grow">
                        <div className="flex items-center space-x-4 text-xs font-bold text-muted-foreground/60 mb-6 uppercase tracking-widest">
                          <div className="flex items-center space-x-2">
                            <Calendar size={14} className="text-primary" />
                            <span>{format.dateTime(new Date(blog.date), { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User size={14} className="text-primary" />
                            <span>{blog.author}</span>
                          </div>
                        </div>
                        <h2 className="text-2xl font-black mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-tight tracking-tight">
                          {blog.title}
                        </h2>
                        <p className="text-muted-foreground mb-8 line-clamp-3 leading-relaxed font-medium flex-grow">
                          {stripHtml(blog.content)}
                        </p>
                        <div
                          className="inline-flex items-center text-primary font-black uppercase tracking-widest group/btn group-hover:gap-4 transition-all"
                        >
                          <span>{t('read_more')}</span>
                          <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>

              {/* Sentinel Element for Infinite Scroll */}
              <div ref={sentinelRef} className="h-10 w-full" />

              {/* Load More Button / Loading State */}
              {hasMore && (
                <div className="mt-12 text-center flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                        <span>{t('loading_more') || 'Loading...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('load_more') || 'Load More'}</span>
                        <ArrowRight size={18} className="rotate-90" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

    </main>
  );
}
