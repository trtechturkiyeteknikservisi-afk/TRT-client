'use client';

import React, { useState, useEffect } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Link } from '@/i18n/routing';
import { Calendar, User, ArrowRight, Search, Tag, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useLocale, useTranslations } from 'next-intl';

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

export default function BlogPage() {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const [blogs, setBlogs] = useState(mockBlogs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs?locale=${locale}`);
        const data = response.data as any[];
        if (data.length > 0) {
          setBlogs(data);
        }
      } catch (error) {
        console.error('Error fetching blogs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [locale]);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary mb-6"
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

          {!loading && blogs.length === 0 && (
            <div className="text-center py-20 bg-card rounded-[2.5rem] border border-border/50">
              <p className="text-muted-foreground font-bold">{t('no_blogs')}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-[2.5rem] border border-border/50 overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col h-full"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-5 py-2 bg-background/80 backdrop-blur-md text-foreground text-xs font-black rounded-xl uppercase tracking-widest border border-border/50">
                      {blog.category || t('category')}
                    </span>
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-grow">
                  <div className="flex items-center space-x-4 text-xs font-bold text-muted-foreground/60 mb-6 uppercase tracking-widest">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-primary" />
                      <span>{new Date(blog.date).toLocaleDateString(locale)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User size={14} className="text-primary" />
                      <span>{blog.author}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black mb-4 line-clamp-2 hover:text-primary transition-colors cursor-pointer leading-tight tracking-tight">
                    {blog.title}
                  </h2>
                  <p className="text-muted-foreground mb-8 line-clamp-3 leading-relaxed font-medium flex-grow">
                    {blog.content}
                  </p>
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center text-primary font-black uppercase tracking-widest group/btn hover:gap-4 transition-all"
                  >
                    <span>{t('read_more')}</span>
                    <ArrowRight size={20} className="ml-2" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
