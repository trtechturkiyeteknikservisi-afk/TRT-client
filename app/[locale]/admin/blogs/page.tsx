'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BookOpen, Trash2, Search, Upload, Plus, Languages, User, Calendar
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BlogsPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [blogForm, setBlogForm] = useState({ 
    title_en: '', title_tr: '', title_ar: '',
    content_en: '', content_tr: '', content_ar: '',
    image: '', author: 'Admin'
  });
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE}/blogs/admin-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data as any[]);
    } catch (err: any) {
      console.error('Error fetching blogs', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const createBlog = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.post(`${API_BASE}/blogs`, blogForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogForm({ 
        title_en: '', title_tr: '', title_ar: '',
        content_en: '', content_tr: '', content_ar: '',
        image: '', author: 'Admin' 
      });
      fetchData();
    } catch (err) {
      console.error('Error creating blog', err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteBlog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error('Error deleting blog', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    setActionLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setBlogForm(prev => ({ ...prev, image: (res.data as any).url }));
    } catch (err) {
      console.error('Error uploading image', err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center space-x-2 text-primary mb-2">
          <div className="w-6 h-1 bg-primary rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('dashboard_overview')}</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_blogs')}</h2>
      </header>

      <div className="bg-card border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Plus size={20} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">{t('publish_blog')}</h3>
        </div>
        
        <form onSubmit={createBlog} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Featured Image</label>
              <div className="flex gap-4">
                <label className="flex-grow flex items-center justify-center px-4 py-2.5 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all text-[10px] font-black uppercase tracking-widest text-primary gap-2">
                  <Upload size={14} />
                  <span>{actionLoading ? 'Uploading...' : 'Upload Image'}</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
                <input
                  value={blogForm.image}
                  onChange={(e) => setBlogForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="Or Image URL..."
                  className="w-full flex-[2] px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Author</label>
              <input
                value={blogForm.author}
                onChange={(e) => setBlogForm(p => ({ ...p, author: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* English */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-dashed border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇺🇸</span>
                <h4 className="font-black text-xs uppercase tracking-wider">English Version</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                <input
                  value={blogForm.title_en}
                  onChange={(e) => setBlogForm(p => ({ ...p, title_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content</label>
                <textarea
                  value={blogForm.content_en}
                  onChange={(e) => setBlogForm(p => ({ ...p, content_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-32"
                  required
                />
              </div>
            </div>

            {/* Turkish */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-dashed border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇹🇷</span>
                <h4 className="font-black text-xs uppercase tracking-wider">Türkçe Versiyon</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Başlık</label>
                <input
                  value={blogForm.title_tr}
                  onChange={(e) => setBlogForm(p => ({ ...p, title_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">İçerik</label>
                <textarea
                  value={blogForm.content_tr}
                  onChange={(e) => setBlogForm(p => ({ ...p, content_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-32"
                  required
                />
              </div>
            </div>

            {/* Arabic */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-dashed border-primary/20" dir="rtl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇸🇦</span>
                <h4 className="font-black text-xs uppercase tracking-wider">النسخة العربية</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">العنوان</label>
                <input
                  value={blogForm.title_ar}
                  onChange={(e) => setBlogForm(p => ({ ...p, title_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">المحتوى</label>
                <textarea
                  value={blogForm.content_ar}
                  onChange={(e) => setBlogForm(p => ({ ...p, content_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-32"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full px-6 py-4 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest"
          >
            {actionLoading ? t('loading') : t('publish_blog')}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {loading ? (
             <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" /></div>
        ) : (
          data.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all group border-muted/50"
              >
                <div className="flex flex-col md:flex-row h-full">
                    {item.image && (
                        <div className="md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden">
                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title_en} />
                        </div>
                    )}
                    <div className="flex-grow p-6 flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <User size={14} className="text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.author}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={14} className="text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{new Date(item.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteBlog(item.id)}
                                disabled={actionLoading}
                                className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">🇺🇸 EN</span>
                                <h4 className="font-bold text-xs truncate">{item.title_en}</h4>
                                <p className="text-muted-foreground text-[10px] line-clamp-2">{item.content_en}</p>
                            </div>
                            <div className="space-y-1 border-x border-muted/20 px-6">
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">🇹🇷 TR</span>
                                <h4 className="font-bold text-xs truncate">{item.title_tr}</h4>
                                <p className="text-muted-foreground text-[10px] line-clamp-2">{item.content_tr}</p>
                            </div>
                            <div className="space-y-1" dir="rtl">
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest block">🇸🇦 AR</span>
                                <h4 className="font-bold text-xs truncate">{item.title_ar}</h4>
                                <p className="text-muted-foreground text-[10px] line-clamp-2">{item.content_ar}</p>
                            </div>
                        </div>
                    </div>
                </div>
              </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
