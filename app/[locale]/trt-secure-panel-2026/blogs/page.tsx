'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BookOpen, Trash2, Search, Upload, Plus, Languages, User, Calendar, Edit3
} from 'lucide-react';
import { useTranslations, useLocale, useFormatter } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export default function BlogsPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const format = useFormatter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [blogForm, setBlogForm] = useState({ 
    title_en: '', title_tr: '', title_ar: '',
    content_en: '', content_tr: '', content_ar: '',
    image: '', author: 'Admin', date: ''
  });
  const router = useRouter();

  const showToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

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
        router.push('/trt-secure-panel-2026/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    // Format ISO date to YYYY-MM-DD for input
    let formattedDate = '';
    if (item.date) {
      try {
        formattedDate = new Date(item.date).toISOString().split('T')[0];
      } catch (e) {
        console.error('Error formatting date', e);
      }
    }
    setBlogForm({
      title_en: item.title_en || '', title_tr: item.title_tr || '', title_ar: item.title_ar || '',
      content_en: item.content_en || '', content_tr: item.content_tr || '', content_ar: item.content_ar || '',
      image: item.image || '', author: item.author || 'Admin',
      date: formattedDate
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setBlogForm({ 
      title_en: '', title_tr: '', title_ar: '',
      content_en: '', content_tr: '', content_ar: '',
      image: '', author: 'Admin', date: '' 
    });
  };

  const createBlog = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate that at least one language version is completely filled (both Title and Content)
    const hasEn = blogForm.title_en.trim() && blogForm.content_en.trim();
    const hasTr = blogForm.title_tr.trim() && blogForm.content_tr.trim();
    const hasAr = blogForm.title_ar.trim() && blogForm.content_ar.trim();

    if (!hasEn && !hasTr && !hasAr) {
      showToast('error', 'Please fill out Title and Content for at least one language version (English, Turkish, or Arabic).');
      return;
    }

    // Determine the fallback content (first filled language version)
    const fallback = {
      title: blogForm.title_en.trim() || blogForm.title_tr.trim() || blogForm.title_ar.trim(),
      content: blogForm.content_en.trim() || blogForm.content_tr.trim() || blogForm.content_ar.trim()
    };

    // Populate empty language versions with the fallback content
    const finalizedForm: any = {
      ...blogForm,
      title_en: blogForm.title_en.trim() || fallback.title,
      content_en: blogForm.content_en.trim() || fallback.content,
      title_tr: blogForm.title_tr.trim() || fallback.title,
      content_tr: blogForm.content_tr.trim() || fallback.content,
      title_ar: blogForm.title_ar.trim() || fallback.title,
      content_ar: blogForm.content_ar.trim() || fallback.content,
    };

    // If date is not specified, omit it so backend defaults to NOW (for create) or keeps old date (for update)
    if (!blogForm.date.trim()) {
      delete finalizedForm.date;
    }

    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/blogs/${editingId}`, finalizedForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('success', 'Blog post updated successfully!');
      } else {
        await axios.post(`${API_BASE}/blogs`, finalizedForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('success', 'Blog post published successfully!');
      }
      cancelEdit();
      fetchData();
    } catch (err) {
      console.error('Error saving blog', err);
      showToast('error', editingId ? 'Failed to update blog post.' : 'Failed to publish blog post.');
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
      showToast('success', 'Blog post deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting blog', err);
      showToast('error', 'Failed to delete blog post.');
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
      showToast('success', 'Image uploaded successfully!');
    } catch (err) {
      console.error('Error uploading image', err);
      showToast('error', 'Failed to upload image.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 relative">

      <header>
        <div className="flex items-center space-x-2 text-primary mb-2">
          <div className="w-6 h-1 bg-primary rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('dashboard_overview')}</span>
        </div>
        <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_blogs')}</h2>
      </header>

      <div className="bg-card border rounded-lg p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                <Plus size={20} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">{t('publish_blog')}</h3>
        </div>
        
        <form onSubmit={createBlog} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Featured Image</label>
              <div className="flex gap-4">
                <label className="flex-grow flex items-center justify-center px-4 py-2.5 rounded-md border-2 border-dashed border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all text-[10px] font-black uppercase tracking-widest text-primary gap-2">
                  <Upload size={14} />
                  <span>{actionLoading ? 'Uploading...' : 'Upload Image'}</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
                <input
                  value={blogForm.image}
                  onChange={(e) => setBlogForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="Or Image URL..."
                  className="w-full flex-[1.5] px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Author</label>
              <input
                value={blogForm.author}
                onChange={(e) => setBlogForm(p => ({ ...p, author: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Publish Date (Optional)</label>
              <input
                type="date"
                value={blogForm.date}
                onChange={(e) => setBlogForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* English */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-lg border border-dashed border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇺🇸</span>
                <h4 className="font-black text-xs uppercase tracking-wider">English Version</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                <input
                  value={blogForm.title_en}
                  onChange={(e) => setBlogForm(p => ({ ...p, title_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content</label>
                <textarea
                  value={blogForm.content_en}
                  onChange={(e) => setBlogForm(p => ({ ...p, content_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-32"
                />
              </div>
            </div>

            {/* Turkish */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-lg border border-dashed border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇹🇷</span>
                <h4 className="font-black text-xs uppercase tracking-wider">Türkçe Versiyon</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Başlık</label>
                <input
                  value={blogForm.title_tr}
                  onChange={(e) => setBlogForm(p => ({ ...p, title_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">İçerik</label>
                <textarea
                  value={blogForm.content_tr}
                  onChange={(e) => setBlogForm(p => ({ ...p, content_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-32"
                />
              </div>
            </div>

            {/* Arabic */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-lg border border-dashed border-primary/20" dir="rtl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇸🇦</span>
                <h4 className="font-black text-xs uppercase tracking-wider">النسخة العربية</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">العنوان</label>
                <input
                  value={blogForm.title_ar}
                  onChange={(e) => setBlogForm(p => ({ ...p, title_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">المحتوى</label>
                <textarea
                  value={blogForm.content_ar}
                  onChange={(e) => setBlogForm(p => ({ ...p, content_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-32"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-grow px-6 py-4 rounded-md bg-primary text-primary-foreground font-black text-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest cursor-pointer"
              >
                {actionLoading ? t('loading') : (editingId ? 'Update Blog' : t('publish_blog'))}
              </button>
              {editingId && (
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-4 rounded-md bg-muted text-foreground font-black text-sm hover:bg-muted/80 transition-all active:scale-[0.98] uppercase tracking-widest cursor-pointer"
                >
                    Cancel Edit
                </button>
              )}
          </div>
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
                className="bg-card rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all group border-muted/50"
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
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{format.dateTime(new Date(item.date), { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => startEdit(item)}
                                    disabled={actionLoading}
                                    className="p-2.5 rounded-md bg-blue-500/5 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                                    title="Edit Blog"
                                >
                                    <Edit3 size={16} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => deleteBlog(item.id)}
                                    disabled={actionLoading}
                                    className="p-2.5 rounded-md bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                                    title="Delete Blog"
                                >
                                    <Trash2 size={16} strokeWidth={2.5} />
                                </button>
                            </div>
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
