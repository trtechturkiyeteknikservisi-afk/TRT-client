'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, User, Clock, ChevronLeft, Share2, Tag, Quote, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations, useFormatter } from 'next-intl';


export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = useLocale();
  const t = useTranslations('Blog');
  const format = useFormatter();
  
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/blogs/${slug}?locale=${locale}`);
        if (response.data) {
          setBlog(response.data);
        } else {
          throw new Error("No data returned");
        }
      } catch (error) {
        console.error('Error fetching blog post from API', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug, locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-black mb-4">404</h1>
          <p className="text-muted-foreground mb-8">Post not found</p>
          <Link href="/blog" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      
      {/* Article Header */}
      <section className="pt-20 pb-12 bg-muted/20 border-b border-border/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-primary mb-6"
          >
            <span className="px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              {blog.category || 'Technical Info'}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black mb-8 tracking-tight text-foreground uppercase leading-[1.2]"
          >
            {blog.title}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest"
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span>{format.dateTime(new Date(blog.date), { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-primary" />
              <span>{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span>5 Min Read</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl relative">
          {/* Back Button */}
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors mb-10 uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            <span>{t('title') || 'Back to Blog'}</span>
          </Link>

          {/* Featured Cover Image */}
          {blog.image && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl border border-border shadow-xl mb-12 bg-muted/10"
            >
              <img src={blog.image} className="w-full h-full object-cover" alt={blog.title} />
            </motion.div>
          )}

          <article className="max-w-none">
            <div 
              className="blog-content" 
              dangerouslySetInnerHTML={{ __html: blog.content }} 
            />
          </article>

          {/* Sidebar-like interactions */}
          <div className="mt-20 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <User size={24} />
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Written By</p>
                  <p className="font-bold text-foreground">{blog.author}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
                <Link href="/#contact" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">
                    Repair Now
                </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
