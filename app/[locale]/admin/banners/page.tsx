'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Images, Trash2, Search, Upload, Plus, Edit2, Play, Pause, ExternalLink
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PREDEFINED_LINKS = [
  { label: 'Smartphones Repair', value: '/services/phone' },
  { label: 'Laptops Repair', value: '/services/laptop' },
  { label: 'Tablets Repair', value: '/services/tablet' },
  { label: 'Robot Vacuums', value: '/services/robot' },
  { label: 'Luxury Watch', value: '/services/watch' },
  { label: 'Portfolio', value: '/portfolio' },
  { label: 'Blog', value: '/blog' },
  { label: 'Contact', value: '/contact' },
];

export default function BannersPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState({ 
    title_en: '', title_tr: '', title_ar: '',
    description_en: '', description_tr: '', description_ar: '',
    cta_en: '', cta_tr: '', cta_ar: '',
    link: PREDEFINED_LINKS[0].value, 
    image: '', 
    active: true 
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE}/banners/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data as any[]);
    } catch (err: any) {
      console.error('Error fetching banners', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveBanner = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bannerForm.image) {
      alert('Please upload an image first');
      return;
    }
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/banners/${editingId}`, bannerForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE}/banners`, bannerForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setBannerForm({ 
        title_en: '', title_tr: '', title_ar: '',
        description_en: '', description_tr: '', description_ar: '',
        cta_en: '', cta_tr: '', cta_ar: '',
        link: PREDEFINED_LINKS[0].value, 
        image: '', 
        active: true 
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Error saving banner', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (banner: any) => {
    setBannerForm({
        title_en: banner.title_en || '', title_tr: banner.title_tr || '', title_ar: banner.title_ar || '',
        description_en: banner.description_en || '', description_tr: banner.description_tr || '', description_ar: banner.description_ar || '',
        cta_en: banner.cta_en || '', cta_tr: banner.cta_tr || '', cta_ar: banner.cta_ar || '',
        link: banner.link || PREDEFINED_LINKS[0].value, 
        image: banner.image || '', 
        active: banner.active
    });
    setEditingId(banner.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (banner: any) => {
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.put(`${API_BASE}/banners/${banner.id}`, { active: !banner.active }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error updating banner', err);
    } finally {
      setActionLoading(false);
    }
  }

  const deleteBanner = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/banners/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error('Error deleting banner', err);
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

    setUploadLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setBannerForm(prev => ({ ...prev, image: (res.data as any).url }));
    } catch (err) {
      console.error('Error uploading image', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadLoading(false);
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
        <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_banners') || 'Banners'}</h2>
      </header>

      <div className="bg-card border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                {editingId ? <Edit2 size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">{editingId ? 'Edit Banner' : (t('add_banner') || 'Create New Banner')}</h3>
        </div>
        
        <form onSubmit={saveBanner} className="space-y-8">
          {/* Multi-language inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* English */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-dashed border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇺🇸</span>
                <h4 className="font-black text-sm uppercase tracking-wider">English Version</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                <input
                  value={bannerForm.title_en}
                  onChange={(e) => setBannerForm(p => ({ ...p, title_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                <textarea
                  value={bannerForm.description_en}
                  onChange={(e) => setBannerForm(p => ({ ...p, description_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm h-20"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Button Text</label>
                <input
                  value={bannerForm.cta_en}
                  onChange={(e) => setBannerForm(p => ({ ...p, cta_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  required
                />
              </div>
            </div>

            {/* Turkish */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-dashed border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇹🇷</span>
                <h4 className="font-black text-sm uppercase tracking-wider">Türkçe Versiyon</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Başlık</label>
                <input
                  value={bannerForm.title_tr}
                  onChange={(e) => setBannerForm(p => ({ ...p, title_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Açıklama</label>
                <textarea
                  value={bannerForm.description_tr}
                  onChange={(e) => setBannerForm(p => ({ ...p, description_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm h-20"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Buton Metni</label>
                <input
                  value={bannerForm.cta_tr}
                  onChange={(e) => setBannerForm(p => ({ ...p, cta_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  required
                />
              </div>
            </div>

            {/* Arabic */}
            <div className="space-y-4 p-5 bg-muted/20 rounded-2xl border border-dashed border-primary/20" dir="rtl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🇸🇦</span>
                <h4 className="font-black text-sm uppercase tracking-wider">المحتوى العربي</h4>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">العنوان</label>
                <input
                  value={bannerForm.title_ar}
                  onChange={(e) => setBannerForm(p => ({ ...p, title_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">الوصف</label>
                <textarea
                  value={bannerForm.description_ar}
                  onChange={(e) => setBannerForm(p => ({ ...p, description_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm h-20"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">نص الزر</label>
                <input
                  value={bannerForm.cta_ar}
                  onChange={(e) => setBannerForm(p => ({ ...p, cta_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Link Selection */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Button Action (Link)</label>
                <select
                  value={bannerForm.link}
                  onChange={(e) => setBannerForm(p => ({ ...p, link: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                >
                  {PREDEFINED_LINKS.map(link => (
                    <option key={link.value} value={link.value}>{link.label} ({link.value})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
               <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Banner Background Image</label>
               <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadLoading}
                      className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    {uploadLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                      </div>
                    )}
                  </div>
                  {bannerForm.image && (
                    <div className="h-12 w-20 rounded-lg overflow-hidden border-2 border-primary/20">
                      <img src={bannerForm.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="flex gap-4">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setBannerForm({
                    title_en: '', title_tr: '', title_ar: '',
                    description_en: '', description_tr: '', description_ar: '',
                    cta_en: '', cta_tr: '', cta_ar: '',
                    link: PREDEFINED_LINKS[0].value, 
                    image: '', 
                    active: true 
                  });
                }}
                className="w-1/3 px-6 py-4 rounded-xl bg-muted text-muted-foreground font-black text-sm hover:bg-muted/80 transition-all uppercase tracking-widest border border-dashed"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={actionLoading || !bannerForm.image}
              className={cn("px-6 py-4 rounded-xl text-primary-foreground font-black text-sm shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale uppercase tracking-widest", editingId ? "w-2/3 bg-blue-600" : "w-full bg-primary")}
            >
              {actionLoading ? t('loading') : (editingId ? 'Update Banner' : (t('add_banner') || 'Save and Add Banner'))}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
             <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" /></div>
        ) : data.length === 0 ? (
          <div className="py-20 bg-card border rounded-2xl flex flex-col items-center justify-center text-muted-foreground border-dashed">
            <Images size={64} className="mb-4 opacity-20" />
            <p className="font-bold text-xl">{t('no_records')}</p>
          </div>
        ) : (
          data.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all group",
                  !item.active && "opacity-60 grayscale-[0.5]"
                )}
              >
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 aspect-video md:aspect-auto relative bg-muted overflow-hidden">
                        <img 
                          src={item.image} 
                          alt="Banner" 
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000"
                          onError={(e) => {
                             (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found';
                          }}
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-full border border-white/20">
                                {item.link}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">English</span>
                                <h4 className="font-bold text-foreground line-clamp-1">{item.title_en}</h4>
                                <p className="text-muted-foreground text-xs line-clamp-2">{item.description_en}</p>
                            </div>
                            <div className="space-y-1 border-x border-muted/20 px-6">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Türkçe</span>
                                <h4 className="font-bold text-foreground line-clamp-1">{item.title_tr}</h4>
                                <p className="text-muted-foreground text-xs line-clamp-2">{item.description_tr}</p>
                            </div>
                            <div className="space-y-1" dir="rtl">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">العربية</span>
                                <h4 className="font-bold text-foreground line-clamp-1">{item.title_ar}</h4>
                                <p className="text-muted-foreground text-xs line-clamp-2">{item.description_ar}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t mt-8">
                            <div className="flex items-center gap-4">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-2",
                                    item.active ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"
                                )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", item.active ? "bg-green-500 animate-pulse" : "bg-muted-foreground")} />
                                    {item.active ? (t('status_active') || 'Active') : (t('status_inactive') || 'Inactive')}
                                </span>
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    CTA: {item.cta_en} | {item.cta_tr} | {item.cta_ar}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    disabled={actionLoading}
                                    className="p-3 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-90"
                                >
                                    <Edit2 size={18} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={() => toggleActive(item)}
                                    disabled={actionLoading}
                                    className={cn(
                                        "p-3 rounded-xl transition-all shadow-sm active:scale-90",
                                        item.active 
                                            ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white" 
                                            : "bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white"
                                    )}
                                >
                                    {item.active ? <Pause size={18} strokeWidth={2.5} /> : <Play size={18} strokeWidth={2.5} />}
                                </button>
                                <button
                                    onClick={() => deleteBanner(item.id)}
                                    disabled={actionLoading}
                                    className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                                >
                                    <Trash2 size={18} strokeWidth={2.5} />
                                </button>
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
