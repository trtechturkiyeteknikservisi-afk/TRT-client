'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Trash2, Upload, Plus, Image as ImageIcon, Languages, Film, PlayCircle, Edit3
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PortfolioPage() {
  const t = useTranslations('Admin');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ 
    title_en: '', title_tr: '', title_ar: '',
    description_en: '', description_tr: '', description_ar: '',
    type: 'image', url: '' 
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const router = useRouter();

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setUploadForm({
      title_en: item.title_en || '',
      title_tr: item.title_tr || '',
      title_ar: item.title_ar || '',
      description_en: item.description_en || '',
      description_tr: item.description_tr || '',
      description_ar: item.description_ar || '',
      type: item.type || 'image',
      url: item.url || ''
    });
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUploadForm({
      title_en: '',
      title_tr: '',
      title_ar: '',
      description_en: '',
      description_tr: '',
      description_ar: '',
      type: 'image',
      url: ''
    });
    setSelectedFile(null);
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE}/content/portfolio/admin-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data as any[]);
    } catch (err: any) {
      console.error('Error fetching portfolio', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/trt-secure-panel-2026/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      let finalUrl = uploadForm.url;

      // 1. Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadRes = await axios.post(`${API_BASE}/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        finalUrl = (uploadRes.data as any).url;
      }

      if (!finalUrl) {
        toast.error('Please provide a file or a direct URL');
        setActionLoading(false);
        return;
      }

      // 2. Prepare JSON data
      const payload = {
        title_en: uploadForm.title_en,
        title_tr: uploadForm.title_tr,
        title_ar: uploadForm.title_ar,
        description_en: uploadForm.description_en,
        description_tr: uploadForm.description_tr,
        description_ar: uploadForm.description_ar,
        type: uploadForm.type,
        url: finalUrl
      };

      // 3. Save/Update portfolio item
      if (editingId) {
        await axios.put(`${API_BASE}/content/portfolio/${editingId}`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Work updated successfully!');
        cancelEdit();
      } else {
        await axios.post(`${API_BASE}/content/portfolio`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUploadForm({ 
          title_en: '', title_tr: '', title_ar: '',
          description_en: '', description_tr: '', description_ar: '',
          type: 'image', url: '' 
        });
        setSelectedFile(null);
        toast.success('Work added successfully to portfolio!');
      }
      fetchData();
    } catch (err) {
      console.error('Error uploading to portfolio', err);
      toast.error('Failed to save work. Please check the console for details.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this work?')) return;
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/content/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Portfolio item deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting portfolio item', err);
      toast.error('Failed to delete portfolio item.');
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
        <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_portfolio')}</h2>
      </header>

      <div className="bg-card border rounded-lg p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                {editingId ? <Edit3 size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">{editingId ? 'Edit Portfolio Item' : t('save_work')}</h3>
        </div>
        
        <form onSubmit={handleCreate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Media Type</label>
                    <select
                        value={uploadForm.type}
                        onChange={(e) => setUploadForm((prev) => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                    >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                    </select>
               </div>
               
               <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">File Upload</label>
                    <label className="flex items-center justify-center px-4 py-2.5 rounded-md border-2 border-dashed border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all text-[10px] font-black uppercase tracking-widest text-primary gap-2">
                        <Upload size={14} />
                        <span>{selectedFile ? selectedFile.name : "Choose File"}</span>
                        <input type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    </label>
               </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Or Direct URL</label>
                    <input
                        value={uploadForm.url}
                        onChange={(e) => setUploadForm((prev) => ({ ...prev, url: e.target.value }))}
                        placeholder="https://..."
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
                  value={uploadForm.title_en}
                  onChange={(e) => setUploadForm(p => ({ ...p, title_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                <textarea
                  value={uploadForm.description_en}
                  onChange={(e) => setUploadForm(p => ({ ...p, description_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-24"
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
                  value={uploadForm.title_tr}
                  onChange={(e) => setUploadForm(p => ({ ...p, title_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Açıklama</label>
                <textarea
                  value={uploadForm.description_tr}
                  onChange={(e) => setUploadForm(p => ({ ...p, description_tr: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-24"
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
                  value={uploadForm.title_ar}
                  onChange={(e) => setUploadForm(p => ({ ...p, title_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">الوصف</label>
                <textarea
                  value={uploadForm.description_ar}
                  onChange={(e) => setUploadForm(p => ({ ...p, description_ar: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs h-24"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-grow px-6 py-4 rounded-md bg-primary text-primary-foreground font-black text-sm shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest cursor-pointer"
              >
                {actionLoading ? t('loading') : (editingId ? 'Update Work' : t('save_work'))}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full py-20 flex justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" /></div>
        ) : (
          data.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col border-muted/50"
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                    {item.type === 'image' ? (
                        <img 
                            src={item.url.startsWith('http') ? item.url : (() => {
                                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                let normalizedApiUrl = API_URL;
                                if (!API_URL.startsWith('http') && !API_URL.startsWith('/')) {
                                    const cleanUrl = API_URL.startsWith('.') ? API_URL.substring(1) : API_URL;
                                    normalizedApiUrl = `https://${cleanUrl}`;
                                }
                                const SERVER_URL = normalizedApiUrl.replace(/\/api\/?$/, '');
                                if (item.url.startsWith('.')) return `https://${item.url.substring(1)}`;
                                return `${SERVER_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`;
                            })()} 
                            alt={item.title_en} 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white gap-3">
                             <PlayCircle size={48} className="text-primary" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Video Content</span>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[8px] font-black uppercase rounded border border-white/10">
                            {item.type}
                        </span>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                            onClick={() => startEdit(item)}
                            disabled={actionLoading}
                            className="p-2.5 rounded-md bg-blue-600 text-white shadow-xl active:scale-90 cursor-pointer"
                            title="Edit Work"
                        >
                            <Edit3 size={16} />
                        </button>
                        <button
                            onClick={() => deleteItem(item.id)}
                            disabled={actionLoading}
                            className="p-2.5 rounded-md bg-red-500 text-white shadow-xl active:scale-90 cursor-pointer"
                            title="Delete Work"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4 divide-y divide-muted/20">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">🇺🇸 EN</span>
                            <h4 className="font-bold text-xs truncate">{item.title_en}</h4>
                            <p className="text-muted-foreground text-[10px] line-clamp-1 italic">{item.description_en}</p>
                        </div>
                        <div className="space-y-1 pt-4">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">🇹🇷 TR</span>
                            <h4 className="font-bold text-xs truncate">{item.title_tr}</h4>
                            <p className="text-muted-foreground text-[10px] line-clamp-1 italic">{item.description_tr}</p>
                        </div>
                        <div className="space-y-1 pt-4" dir="rtl">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest block">🇸🇦 AR</span>
                            <h4 className="font-bold text-xs truncate">{item.title_ar}</h4>
                            <p className="text-muted-foreground text-[10px] line-clamp-1 italic">{item.description_ar}</p>
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
