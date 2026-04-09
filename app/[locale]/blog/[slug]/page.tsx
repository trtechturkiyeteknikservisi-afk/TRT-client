'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Calendar, User, Clock, ChevronLeft, Share2, Tag, Quote, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = useLocale();
  const t = useTranslations('Blog');
  
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/${slug}?locale=${locale}`);
        setBlog(response.data);
      } catch (error) {
        console.error('Error fetching blog post', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug, locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-black mb-4">404</h1>
          <p className="text-muted-foreground mb-8">Post not found</p>
          <Link href="/blog" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold">
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Header */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${blog.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 pb-16 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-primary mb-6"
          >
            <span className="px-4 py-1 bg-primary/20 backdrop-blur-md rounded-full border border-primary/20">
              {blog.category || 'Technical Info'}
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-8 tracking-tighter text-foreground uppercase leading-[1.1]"
          >
            {blog.title}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest"
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span>{new Date(blog.date).toLocaleDateString(locale)}</span>
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
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl relative">
          {/* Back Button */}
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors mb-12 uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            <span>{t('title') || 'Back to Blog'}</span>
          </Link>

          <article className="prose prose-lg prose-invert max-w-none">
            <div className="space-y-8 text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                {blog.content.split('\n').map((paragraph: string, idx: number) => (
                    paragraph.trim() ? (
                        <p key={idx} className="mb-6 first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                            {paragraph}
                        </p>
                    ) : <br key={idx} />
                ))}
            </div>

            {/* Quote Block Placeholder */}
            <div className="my-16 p-10 bg-muted/30 border-l-8 border-primary rounded-3xl relative overflow-hidden">
                <Quote size={80} className="absolute -top-4 -right-4 text-primary/5 -rotate-12" />
                <p className="text-2xl font-black italic text-foreground tracking-tight leading-snug">
                    "Professional repair isn't just about fixing the hardware; it's about restoring the digital heartbeat of your daily life."
                </p>
            </div>
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
                <button className="flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-all font-bold text-sm uppercase tracking-widest">
                    <Share2 size={16} className="text-primary" />
                    Share
                </button>
                <Link href="/#contact" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Repair Now
                </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
