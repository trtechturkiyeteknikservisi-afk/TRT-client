'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Trash2, Upload, Plus, Image as ImageIcon, Languages, Film, PlayCircle, Edit3, Check, X, AlertTriangle
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
  
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  
  const [points, setPoints] = useState({
    tr1: '', tr2: '', tr3: '',
    en1: '', en2: '', en3: '',
    ar1: '', ar2: '', ar3: ''
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const startEdit = (item: any) => {
    setEditingId(item.id);
    
    // Parse description for points and details
    const parseDesc = (desc: string) => {
      let p1 = '', p2 = '', p3 = '', d = desc || '';
      if (desc && desc.includes('---')) {
        const parts = desc.split('---');
        const lines = parts[0].split('\n').map(l => l.trim().replace(/^[-*✓]\s*/, '')).filter(Boolean);
        p1 = lines[0] || '';
        p2 = lines[1] || '';
        p3 = lines[2] || '';
        d = parts[1].trim();
      } else if (desc && desc.includes('\n')) {
        const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 1) {
          p1 = lines[0].replace(/^[-*✓]\s*/, '');
          p2 = lines[1].replace(/^[-*✓]\s*/, '');
          p3 = lines[2] || '';
          d = lines.slice(3).join('\n');
        }
      }
      return { p1, p2, p3, d };
    };

    const tr = parseDesc(item.description_tr);
    const en = parseDesc(item.description_en);
    const ar = parseDesc(item.description_ar);

    setUploadForm({
      title_en: item.title_en || '',
      title_tr: item.title_tr || '',
      title_ar: item.title_ar || '',
      description_en: en.d,
      description_tr: tr.d,
      description_ar: ar.d,
      type: item.type || 'image',
      url: item.url || ''
    });

    setPoints({
      tr1: tr.p1, tr2: tr.p2, tr3: tr.p3,
      en1: en.p1, en2: en.p2, en3: en.p3,
      ar1: ar.p1, ar2: ar.p2, ar3: ar.p3
    });

    setBeforeFile(null);
    setAfterFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setUploadForm({
      title_en: '', title_tr: '', title_ar: '',
      description_en: '', description_tr: '', description_ar: '',
      type: 'image', url: ''
    });
    setPoints({
      tr1: '', tr2: '', tr3: '',
      en1: '', en2: '', en3: '',
      ar1: '', ar2: '', ar3: ''
    });
    setBeforeFile(null);
    setAfterFile(null);
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
      let finalBeforeUrl = '';
      let finalAfterUrl = '';
      
      // Parse existing url if edit
      if (editingId && uploadForm.url) {
        if (uploadForm.url.includes('|')) {
          const parts = uploadForm.url.split('|');
          finalBeforeUrl = parts[0].trim();
          finalAfterUrl = parts[1].trim();
        } else {
          finalAfterUrl = uploadForm.url.trim();
        }
      }

      // 1. Upload before file if selected
      if (beforeFile) {
        const formData = new FormData();
        formData.append('image', beforeFile);
        const uploadRes = await axios.post(`${API_BASE}/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        finalBeforeUrl = (uploadRes.data as any).url;
      }

      // 2. Upload after file if selected
      if (afterFile) {
        const formData = new FormData();
        formData.append('image', afterFile);
        const uploadRes = await axios.post(`${API_BASE}/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        finalAfterUrl = (uploadRes.data as any).url;
      }

      // Combine URL
      let finalUrl = '';
      if (uploadForm.type === 'video') {
        finalUrl = finalAfterUrl;
      } else {
        if (finalBeforeUrl && finalAfterUrl) {
          finalUrl = `${finalBeforeUrl} | ${finalAfterUrl}`;
        } else if (finalAfterUrl) {
          finalUrl = finalAfterUrl;
        } else if (finalBeforeUrl) {
          finalUrl = finalBeforeUrl;
        }
      }

      if (!finalUrl) {
        toast.error('Please upload at least one image or provide a URL');
        setActionLoading(false);
        return;
      }

      // Combine description and checklist points
      const combineDesc = (desc: string, p1: string, p2: string, p3: string) => {
        if (!p1 && !p2 && !p3) return desc;
        const pts = [p1, p2, p3].filter(Boolean).map(p => `- ${p}`).join('\n');
        return `${pts}\n---\n${desc}`;
      };

      const description_tr = combineDesc(uploadForm.description_tr, points.tr1, points.tr2, points.tr3);
      const description_en = combineDesc(uploadForm.description_en, points.en1, points.en2, points.en3);
      const description_ar = combineDesc(uploadForm.description_ar, points.ar1, points.ar2, points.ar3);

      const payload = {
        title_en: uploadForm.title_en,
        title_tr: uploadForm.title_tr,
        title_ar: uploadForm.title_ar,
        description_en,
        description_tr,
        description_ar,
        type: uploadForm.type,
        url: finalUrl
      };

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
        cancelEdit();
        toast.success('Work added successfully to portfolio!');
      }
      fetchData();
    } catch (err) {
      console.error('Error saving portfolio item', err);
      toast.error('Failed to save work.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/content/portfolio/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Portfolio item deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting portfolio item', err);
      toast.error('Failed to delete portfolio item.');
    } finally {
      setActionLoading(false);
      setDeleteId(null);
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
                        <option value="image">Image (Before & After)</option>
                        <option value="video">Video</option>
                    </select>
               </div>
               
               {uploadForm.type === 'image' ? (
                 <>
                   <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-red-500 ml-1 mb-1 block">Before Image (صورة قبل)</label>
                        <label className={cn(
                            "flex items-center justify-center px-4 py-2.5 rounded-md border-2 border-dashed transition-all text-[10px] font-black uppercase tracking-widest gap-2 cursor-pointer",
                            beforeFile 
                              ? "border-green-500/30 bg-green-500/5 text-green-600 hover:bg-green-500/10" 
                              : "border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10"
                        )}>
                            {beforeFile ? <Check size={14} /> : <Upload size={14} />}
                            <span className="truncate max-w-[180px]">{beforeFile ? beforeFile.name : "Choose Before Image"}</span>
                            <input type="file" className="hidden" onChange={(e) => setBeforeFile(e.target.files?.[0] || null)} />
                        </label>
                   </div>
                   <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-green-600 ml-1 mb-1 block">After Image (صورة بعد)</label>
                        <label className={cn(
                            "flex items-center justify-center px-4 py-2.5 rounded-md border-2 border-dashed transition-all text-[10px] font-black uppercase tracking-widest gap-2 cursor-pointer",
                            afterFile 
                              ? "border-green-500/30 bg-green-500/5 text-green-600 hover:bg-green-500/10" 
                              : "border-green-500/20 bg-green-500/5 text-green-600 hover:bg-green-500/10"
                        )}>
                            {afterFile ? <Check size={14} /> : <Upload size={14} />}
                            <span className="truncate max-w-[180px]">{afterFile ? afterFile.name : "Choose After Image"}</span>
                            <input type="file" className="hidden" onChange={(e) => setAfterFile(e.target.files?.[0] || null)} />
                        </label>
                   </div>
                 </>
               ) : (
                 <div className="space-y-1 col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Video File</label>
                      <label className={cn(
                          "flex items-center justify-center px-4 py-2.5 rounded-md border-2 border-dashed transition-all text-[10px] font-black uppercase tracking-widest gap-2 cursor-pointer",
                          afterFile 
                            ? "border-green-500/30 bg-green-500/5 text-green-600 hover:bg-green-500/10" 
                            : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                      )}>
                          {afterFile ? <Check size={14} /> : <Upload size={14} />}
                          <span className="truncate max-w-[360px]">{afterFile ? afterFile.name : "Choose Video File"}</span>
                          <input type="file" className="hidden" onChange={(e) => setAfterFile(e.target.files?.[0] || null)} />
                      </label>
                 </div>
               )}
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
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Checklist Points</label>
                <div className="space-y-2">
                  <input
                    value={points.en1}
                    onChange={(e) => setPoints(p => ({ ...p, en1: e.target.value }))}
                    placeholder="Point 1 (e.g. Original OLED Screen)"
                    className="w-full px-4 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                  <input
                    value={points.en2}
                    onChange={(e) => setPoints(p => ({ ...p, en2: e.target.value }))}
                    placeholder="Point 2 (e.g. 45-Minute Delivery)"
                    className="w-full px-4 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                  <input
                    value={points.en3}
                    onChange={(e) => setPoints(p => ({ ...p, en3: e.target.value }))}
                    placeholder="Point 3 (e.g. Face ID Tested)"
                    className="w-full px-4 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description Details</label>
                <textarea
                  value={uploadForm.description_en}
                  onChange={(e) => setUploadForm(p => ({ ...p, description_en: e.target.value }))}
                  placeholder="Detailed description showing in modal..."
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
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Özellik Listesi</label>
                <div className="space-y-2">
                  <input
                    value={points.tr1}
                    onChange={(e) => setPoints(p => ({ ...p, tr1: e.target.value }))}
                    placeholder="1. Özellik (Örn: Orijinal OLED Ekran)"
                    className="w-full px-4 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                  <input
                    value={points.tr2}
                    onChange={(e) => setPoints(p => ({ ...p, tr2: e.target.value }))}
                    placeholder="2. Özellik (Örn: 45 Dakikada Teslim)"
                    className="w-full px-4 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                  <input
                    value={points.tr3}
                    onChange={(e) => setPoints(p => ({ ...p, tr3: e.target.value }))}
                    placeholder="3. Özellik (Örn: Face ID Test Edildi)"
                    className="w-full px-4 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Detaylı Açıklama</label>
                <textarea
                  value={uploadForm.description_tr}
                  onChange={(e) => setUploadForm(p => ({ ...p, description_tr: e.target.value }))}
                  placeholder="Detaylar tıklandığında görünecek açıklama..."
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
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">نقاط التحقق</label>
                <div className="space-y-2">
                  <input
                    value={points.ar1}
                    onChange={(e) => setPoints(p => ({ ...p, ar1: e.target.value }))}
                    placeholder="النقطة 1 (مثال: شاشة OLED أصلية)"
                    className="w-full px-4 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                  <input
                    value={points.ar2}
                    onChange={(e) => setPoints(p => ({ ...p, ar2: e.target.value }))}
                    placeholder="النقطة 2 (مثال: تسليم خلال 45 دقيقة)"
                    className="w-full px-4 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                  <input
                    value={points.ar3}
                    onChange={(e) => setPoints(p => ({ ...p, ar3: e.target.value }))}
                    placeholder="النقطة 3 (مثال: تم فحص بصمة الوجه)"
                    className="w-full px-4 py-2 rounded-md border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-1">الوصف التفصيلي</label>
                <textarea
                  value={uploadForm.description_ar}
                  onChange={(e) => setUploadForm(p => ({ ...p, description_ar: e.target.value }))}
                  placeholder="الوصف التفصيلي الذي يظهر في النافذة المنبثقة..."
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
                            src={(item.url && item.url.includes('|') ? item.url.split('|')[1].trim() : item.url).startsWith('http') ? (item.url && item.url.includes('|') ? item.url.split('|')[1].trim() : item.url) : (() => {
                                const activeUrl = item.url && item.url.includes('|') ? item.url.split('|')[1].trim() : item.url;
                                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                let normalizedApiUrl = API_URL;
                                if (!API_URL.startsWith('http') && !API_URL.startsWith('/')) {
                                    const cleanUrl = API_URL.startsWith('.') ? API_URL.substring(1) : API_URL;
                                    normalizedApiUrl = `https://${cleanUrl}`;
                                }
                                const SERVER_URL = normalizedApiUrl.replace(/\/api\/?$/, '');
                                if (activeUrl.startsWith('.')) return `https://${activeUrl.substring(1)}`;
                                return `${SERVER_URL}${activeUrl.startsWith('/') ? activeUrl : `/${activeUrl}`}`;
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
                            onClick={() => setDeleteId(item.id)}
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

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-6"
          >
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Delete Confirmation</h3>
            </div>
            
            <p className="text-muted-foreground text-sm font-semibold leading-relaxed">
              Are you sure you want to permanently delete this portfolio item? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-md bg-muted text-foreground font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-md bg-red-500 text-white font-black text-xs uppercase tracking-widest hover:bg-red-500/90 transition-all shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {actionLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
