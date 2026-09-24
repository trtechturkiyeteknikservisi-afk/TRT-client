'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Plus, Trash2, Edit3, Check, X, Search, ExternalLink,
  Eye, EyeOff, Upload, Image as ImageIcon, Loader2,
  Smartphone, Laptop, Watch, Zap, TabletIcon as Tablet, Headphones
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';
import { AppleHeadphonesIcon, RobotVacuumIcon } from '@/components/social-icons';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const DEFAULT_ICON_MAP: Record<string, any> = {
  Smartphone,
  Laptop,
  RobotVacuumIcon,
  Watch,
  Tablet,
  AppleHeadphonesIcon,
  Headphones,
  Zap,
};

export default function ServicesPage() {
  const t = useTranslations('Admin');
  const locale = useLocale() as 'ar' | 'en' | 'tr';
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLangTab, setActiveLangTab] = useState<'tr' | 'ar' | 'en'>(['ar', 'en', 'tr'].includes(locale) ? locale : 'tr');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const initialFormState = {
    slug: '',
    title_tr: '',
    title_ar: '',
    title_en: '',
    description_tr: '',
    description_ar: '',
    description_en: '',
    features_tr: '',
    features_ar: '',
    features_en: '',
    icon: 'Smartphone',
    custom_icon: '',
    image: '',
    color: 'bg-primary/10 text-primary border-primary/20',
    link: '',
    sort_order: 1,
    is_active: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchServices = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_BASE}/content/services/admin-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data as any[]);
    } catch (err: any) {
      console.error('Error fetching admin services:', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/trt-secure-panel-2026/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...initialFormState,
      sort_order: services.length + 1
    });
    setShowModal(true);
  };

  const openEditModal = (service: any) => {
    setEditingId(service.id);
    setFormData({
      slug: service.slug || '',
      title_tr: service.title_tr || '',
      title_ar: service.title_ar || '',
      title_en: service.title_en || '',
      description_tr: service.description_tr || '',
      description_ar: service.description_ar || '',
      description_en: service.description_en || '',
      features_tr: service.features_tr || '',
      features_ar: service.features_ar || '',
      features_en: service.features_en || '',
      icon: service.icon || 'Smartphone',
      custom_icon: service.custom_icon || '',
      image: service.image || '',
      color: service.color || 'bg-primary/10 text-primary border-primary/20',
      link: service.link || `/services/${service.slug}`,
      sort_order: service.sort_order ?? 0,
      is_active: service.is_active !== undefined ? service.is_active : true
    });
    setShowModal(true);
  };

  const handleFileUpload = async (file: File, field: 'custom_icon' | 'image') => {
    if (!file) return;
    const token = localStorage.getItem('token');
    const uploadData = new FormData();
    uploadData.append('image', file);

    if (field === 'custom_icon') setUploadingIcon(true);
    else setUploadingCover(true);

    try {
      const res = await axios.post(`${API_BASE}/upload`, uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const url = (res.data as any).url;
      setFormData(prev => ({ ...prev, [field]: url }));
      toast.success(t('service_toast_upload_success'));
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(t('service_toast_upload_error'));
    } finally {
      if (field === 'custom_icon') setUploadingIcon(false);
      else setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_tr || !formData.title_ar || !formData.title_en) {
      toast.error(t('service_toast_title_req'));
      return;
    }
    if (!formData.slug) {
      toast.error(t('service_toast_slug_req'));
      return;
    }

    const token = localStorage.getItem('token');
    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        link: formData.link || `/services/${formData.slug}`
      };

      if (editingId) {
        await axios.put(`${API_BASE}/content/services/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t('service_toast_updated'));
      } else {
        await axios.post(`${API_BASE}/content/services`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t('service_toast_added'));
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      console.error('Error saving service:', err);
      toast.error(err?.response?.data?.message || t('service_toast_error'));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleActive = async (service: any) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE}/content/services/${service.id}`, {
        is_active: !service.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('service_toast_status_changed'));
      fetchServices();
    } catch (err) {
      toast.error(t('service_toast_error'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/content/services/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('service_toast_deleted'));
      setDeleteId(null);
      fetchServices();
    } catch (err) {
      toast.error(t('service_toast_error'));
    } finally {
      setActionLoading(false);
    }
  };

  const getServiceFallbackIcon = (iconName: string) => {
    return DEFAULT_ICON_MAP[iconName] || Layers;
  };

  const filteredServices = services.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.title_tr?.toLowerCase().includes(q) ||
      s.title_ar?.toLowerCase().includes(q) ||
      s.title_en?.toLowerCase().includes(q) ||
      s.slug?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-primary mb-2">
            <div className="w-6 h-1 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('dashboard_overview')}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_services')}</h2>
          <p className="text-xs text-muted-foreground mt-1">{t('service_subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('service_search_placeholder')}
              className="pl-9 rtl:pl-4 rtl:pr-9 pr-4 py-2.5 rounded-lg border bg-card text-xs font-bold w-48 sm:w-64 outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-black uppercase tracking-wider text-xs hover:bg-primary/90 transition-all shadow-lg active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>{t('add_service')}</span>
          </button>
        </div>
      </header>

      {/* Grid of Services */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full mx-auto mb-4" />
          <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">{t('service_loading')}</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed p-8">
          <Layers className="mx-auto text-muted-foreground mb-4 opacity-40" size={48} />
          <h3 className="text-base font-bold text-foreground mb-1">{t('no_services')}</h3>
          <p className="text-xs text-muted-foreground mb-6">{t('service_no_results_desc')}</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-black uppercase"
          >
            <Plus size={14} />
            <span>{t('add_service')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const FallbackIcon = getServiceFallbackIcon(service.icon);
            const currentTitle = locale === 'ar' ? (service.title_ar || service.title_tr) : locale === 'en' ? (service.title_en || service.title_tr) : service.title_tr;
            const currentDesc = locale === 'ar' ? (service.description_ar || service.description_tr) : locale === 'en' ? (service.description_en || service.description_tr) : service.description_tr;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "bg-card rounded-xl border shadow-sm p-6 relative flex flex-col justify-between transition-all hover:shadow-md hover:border-primary/40 group",
                  !service.is_active && "opacity-60 bg-muted/20"
                )}
              >
                <div>
                  {/* Top Bar: Icon + Status + Sort */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center border shadow-xs bg-muted/30 border-border/70 p-2.5 shrink-0 group-hover:scale-105 transition-transform">
                      {service.custom_icon ? (
                        <img src={service.custom_icon} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <FallbackIcon size={28} className="text-primary" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-muted px-2 py-1 rounded-md text-muted-foreground border">
                        #{service.sort_order}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleActive(service)}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-colors border",
                          service.is_active
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                        )}
                        title={service.is_active ? t('service_toggle_deactivate') : t('service_toggle_activate')}
                      >
                        {service.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{service.is_active ? t('service_status_active') : t('service_status_inactive')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Slug */}
                  <div className="mb-3">
                    <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {currentTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-primary font-bold bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                        /{service.slug}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono truncate">
                        {service.link || `/services/${service.slug}`}
                      </span>
                    </div>
                  </div>

                  {/* Multilingual Badges */}
                  <div className="space-y-1 mb-4 p-3 bg-muted/20 rounded-lg border border-border/50 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-muted-foreground">🇹🇷 TR:</span>
                      <span className="font-bold text-foreground truncate max-w-[200px]">{service.title_tr}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]" dir="rtl">
                      <span className="font-bold text-muted-foreground">🇸🇦 AR:</span>
                      <span className="font-bold text-foreground truncate max-w-[200px]">{service.title_ar}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-muted-foreground">🇬🇧 EN:</span>
                      <span className="font-bold text-foreground truncate max-w-[200px]">{service.title_en}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 font-medium">
                    {currentDesc}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                  <a
                    href={service.link || `/services/${service.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                    title={t('service_view')}
                  >
                    <ExternalLink size={15} />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-black uppercase transition-colors"
                    >
                      <Edit3 size={13} />
                      <span>{t('service_edit')}</span>
                    </button>
                    <button
                      onClick={() => setDeleteId(service.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                      title={t('service_delete')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Service */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-3xl bg-card rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-foreground">
                      {editingId ? t('edit_service') : t('add_service')}
                    </h3>
                    <p className="text-xs text-muted-foreground">{t('service_modal_subtitle')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                {/* General Config: Slug, Order, Active */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-xl border border-border/50">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 rtl:mr-1 rtl:ml-0">
                      {t('service_slug')} *
                    </label>
                    <input
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      placeholder="phone, laptop, robot..."
                      className="w-full px-3 py-2 rounded-lg border bg-background font-mono font-bold text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 rtl:mr-1 rtl:ml-0">
                      {t('service_sort')}
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3 py-2 rounded-lg border bg-background font-bold text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 rtl:mr-1 rtl:ml-0">
                      {t('service_active')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className={cn(
                        "w-full py-2 px-3 rounded-lg text-xs font-black uppercase border flex items-center justify-center gap-2 transition-colors",
                        formData.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {formData.is_active ? <Check size={14} /> : <X size={14} />}
                      <span>{formData.is_active ? t('service_active_badge') : t('service_inactive_badge')}</span>
                    </button>
                  </div>
                </div>

                {/* Clean Image / Icon Upload Area */}
                <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-foreground block">
                        {t('service_icon_upload_title')}
                      </label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {t('service_icon_upload_desc')}
                      </p>
                    </div>
                    {formData.custom_icon && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, custom_icon: '' }))}
                        className="text-[11px] font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        <span>{t('service_remove_icon')}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    {/* Icon Preview */}
                    <div className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-card shadow-inner shrink-0 group overflow-hidden">
                      {uploadingIcon ? (
                        <Loader2 className="w-7 h-7 text-primary animate-spin" />
                      ) : formData.custom_icon ? (
                        <img
                          src={formData.custom_icon}
                          alt="Icon preview"
                          className="w-14 h-14 object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Upload Button & URL field */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                          <Upload size={14} />
                          <span>{uploadingIcon ? t('service_uploading') : t('service_upload_btn')}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                            className="hidden"
                            disabled={uploadingIcon}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'custom_icon');
                            }}
                          />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold block">
                          {t('service_or_url')}
                        </span>
                        <input
                          value={formData.custom_icon}
                          onChange={(e) => setFormData(prev => ({ ...prev, custom_icon: e.target.value }))}
                          placeholder="https://... أو /icons/service.svg"
                          className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover / Hero Image (Optional) */}
                <div className="space-y-2 p-4 bg-muted/10 rounded-xl border border-border/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      {t('service_image')} (URL / رفع صورة)
                    </label>
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="text-[10px] text-red-500 hover:underline"
                      >
                        {t('service_remove_icon')}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-2 rounded-lg border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground px-3 py-2 rounded-lg text-xs font-bold shrink-0 border">
                      <Upload size={14} />
                      <span>{uploadingCover ? t('service_uploading') : 'رفع ملف'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingCover}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'image');
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Multilingual Tabs */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                      {t('service_content_langs_label')}
                    </span>
                    <div className="flex gap-1">
                      {(['tr', 'ar', 'en'] as const).map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setActiveLangTab(lang)}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-black uppercase transition-all",
                            activeLangTab === lang
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {lang === 'tr' ? '🇹🇷 Türkçe' : lang === 'ar' ? '🇸🇦 العربية' : '🇬🇧 English'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Turkish Fields */}
                  {activeLangTab === 'tr' && (
                    <div className="space-y-4 p-4 bg-muted/10 rounded-xl border border-border/50">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          {t('service_title_field')} (TR) *
                        </label>
                        <input
                          required
                          value={formData.title_tr}
                          onChange={(e) => setFormData(prev => ({ ...prev, title_tr: e.target.value }))}
                          placeholder="Örn: Telefon Tamiri"
                          className="w-full px-3 py-2 rounded-lg border bg-background font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          {t('service_desc_field')} (TR)
                        </label>
                        <textarea
                          rows={2}
                          value={formData.description_tr}
                          onChange={(e) => setFormData(prev => ({ ...prev, description_tr: e.target.value }))}
                          placeholder="Ekran, batarya ve sıvı teması tamiri..."
                          className="w-full px-3 py-2 rounded-lg border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          {t('service_features_field')} (TR)
                        </label>
                        <textarea
                          rows={4}
                          value={formData.features_tr}
                          onChange={(e) => setFormData(prev => ({ ...prev, features_tr: e.target.value }))}
                          placeholder="Ekran Değişimi&#10;Batarya Değişimi&#10;Anakart Onarımı"
                          className="w-full px-3 py-2 rounded-lg border bg-background font-mono text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}

                  {/* Arabic Fields */}
                  {activeLangTab === 'ar' && (
                    <div className="space-y-4 p-4 bg-muted/10 rounded-xl border border-border/50" dir="rtl">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground mr-1">
                          {t('service_title_field')} (العربية) *
                        </label>
                        <input
                          required
                          value={formData.title_ar}
                          onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                          placeholder="مثال: صيانة الهواتف الذكية"
                          className="w-full px-3 py-2 rounded-lg border bg-background font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground mr-1">
                          {t('service_desc_field')} (العربية)
                        </label>
                        <textarea
                          rows={2}
                          value={formData.description_ar}
                          onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                          placeholder="تبديل الشاشات الأصلية، صيانة البطاريات، ومعالجة أضرار السوائل..."
                          className="w-full px-3 py-2 rounded-lg border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground mr-1">
                          {t('service_features_field')} (العربية)
                        </label>
                        <textarea
                          rows={4}
                          value={formData.features_ar}
                          onChange={(e) => setFormData(prev => ({ ...prev, features_ar: e.target.value }))}
                          placeholder="تبديل الشاشة&#10;تغيير البطارية&#10;إصلاح اللوحة الأم"
                          className="w-full px-3 py-2 rounded-lg border bg-background font-mono text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}

                  {/* English Fields */}
                  {activeLangTab === 'en' && (
                    <div className="space-y-4 p-4 bg-muted/10 rounded-xl border border-border/50">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          {t('service_title_field')} (EN) *
                        </label>
                        <input
                          required
                          value={formData.title_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                          placeholder="e.g. Phone Repair"
                          className="w-full px-3 py-2 rounded-lg border bg-background font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          {t('service_desc_field')} (EN)
                        </label>
                        <textarea
                          rows={2}
                          value={formData.description_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                          placeholder="Screen, battery and liquid damage repair..."
                          className="w-full px-3 py-2 rounded-lg border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          {t('service_features_field')} (EN)
                        </label>
                        <textarea
                          rows={4}
                          value={formData.features_en}
                          onChange={(e) => setFormData(prev => ({ ...prev, features_en: e.target.value }))}
                          placeholder="Screen Replacement&#10;Battery Replacement&#10;Motherboard Repair"
                          className="w-full px-3 py-2 rounded-lg border bg-background font-mono text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-lg border text-xs font-black uppercase hover:bg-muted"
                  >
                    {t('service_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || uploadingIcon || uploadingCover}
                    className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-black uppercase hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading ? t('service_saving') : editingId ? t('service_save_btn') : t('service_add_btn')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card rounded-2xl border p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">
                {t('delete_service_confirm')}
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                {t('service_delete_desc')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="px-5 py-2 rounded-lg border text-xs font-black uppercase hover:bg-muted"
                >
                  {t('service_cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-red-500 text-white text-xs font-black uppercase hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? t('service_deleting') : t('service_confirm_delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
