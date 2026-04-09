'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Clock, CheckCircle, 
  Search, Phone, Mail, MapPin, Tablet, Eye, X, User, MessageSquare, Copy, Check, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, 
  Calendar, Hash, ExternalLink
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const ITEMS_PER_PAGE = 8;

export default function ContactsPage() {
  const t = useTranslations('Admin');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const router = useRouter();
  
  // Filtering & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data as any[]);
    } catch (err: any) {
      console.error('Error fetching dashboard data', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.patch(`${API_BASE}/contacts/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error updating status', err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting item', err);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered and Paginated Data
  const filteredData = useMemo(() => {
    let result = data;
    if (statusFilter !== 'all') {
        result = result.filter(item => item.status === statusFilter);
    }
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(item => 
            item.name?.toLowerCase().includes(q) || 
            item.phone?.includes(q) || 
            item.city?.toLowerCase().includes(q) ||
            item.address?.toLowerCase().includes(q)
        );
    }
    return result;
  }, [data, statusFilter, searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div className="flex items-center space-x-2 text-primary mb-2">
            <div className="w-6 h-1 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('dashboard_overview')}</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_contacts')}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('admin_fallback') === 'Admin' ? 'Search orders...' : 'بحث في الطلبات...'}
                    className="pl-10 pr-4 py-2.5 rounded-xl border bg-card text-xs font-bold w-full sm:w-64 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                    "p-2.5 rounded-xl border transition-all shadow-sm",
                    showFilters ? "bg-primary text-white border-primary" : "bg-card hover:bg-muted"
                )}
            >
                <SlidersHorizontal size={18} />
            </button>
        </div>
      </header>

      <AnimatePresence>
        {showFilters && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
            >
                <div className="bg-card p-4 rounded-2xl border shadow-sm flex flex-wrap gap-3">
                    <button 
                        onClick={() => setStatusFilter('all')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            statusFilter === 'all' ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-muted/50 hover:bg-muted"
                        )}
                    >
                        {t('admin_fallback') === 'Admin' ? 'All' : 'الكل'}
                    </button>
                    <button 
                        onClick={() => setStatusFilter('pending')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            statusFilter === 'pending' ? "bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/20" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20"
                        )}
                    >
                        {t('status_pending') || 'Not Contacted'}
                    </button>
                    <button 
                        onClick={() => setStatusFilter('contacted')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            statusFilter === 'contacted' ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20" : "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                        )}
                    >
                        {t('status_contacted') || 'Contacted'}
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead className="bg-muted/50 border-b">
                    <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('full_name')}</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('table_phone') || 'Phone'}</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('city') || 'City'}</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('service_type') || 'Service'}</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('table_status') || 'Status'}</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('table_snippet') || 'Message'}</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{t('table_actions') || 'Actions'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y text-xs font-bold transition-all">
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="py-20 text-center">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full mx-auto" />
                            </td>
                        </tr>
                    ) : paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-20 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2 opacity-40">
                                     <Filter size={32} />
                                     <span className="text-[10px] font-black uppercase tracking-widest">{t('no_records')}</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((item) => (
                            <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                                            <User size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-foreground">{item.name}</span>
                                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium font-mono">#{item.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-black text-muted-foreground font-mono text-xs">{item.phone}</span>
                                        <button 
                                            onClick={() => copyToClipboard(item.phone, item.id)}
                                            className={cn(
                                                "p-1.5 rounded-md transition-all shadow-sm",
                                                copiedId === item.id ? "bg-emerald-500 text-white" : "bg-background border hover:bg-primary/10 hover:text-primary"
                                            )}
                                        >
                                            {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize text-muted-foreground">
                                    {item.city}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2.5 py-1 rounded-full bg-muted/60 text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground border">
                                        {item.serviceType || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                <button 
                                    disabled={actionLoading}
                                    onClick={() => updateStatus(item.id, item.status === 'pending' ? 'contacted' : 'pending')}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border block w-full text-center min-w-[130px] shadow-sm",
                                        item.status === 'pending' 
                                            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500 hover:text-white" 
                                            : "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500 hover:text-white"
                                    )}
                                >
                                    {item.status === 'pending' ? (t('status_pending') || 'Not Contacted') : (t('status_contacted') || 'Contacted')}
                                </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div 
                                        onClick={() => setSelectedMessage(item)}
                                        className="max-w-[120px] text-[11px] font-medium text-muted-foreground line-clamp-1 cursor-pointer hover:text-primary transition-colors underline decoration-dotted decoration-muted-foreground/30 hover:decoration-primary"
                                    >
                                        {item.message || "---"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button 
                                            onClick={() => setSelectedMessage(item)}
                                            className="p-2.5 rounded-xl bg-background border hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            disabled={actionLoading}
                                            onClick={() => deleteItem(item.id)}
                                            className="p-2.5 rounded-xl bg-background border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm active:scale-95"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        <div className="bg-muted/20 border-t px-6 py-4 flex items-center justify-between">
             <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    {filteredData.length} records found
                 </p>
             </div>
             <div className="flex items-center space-x-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2 rounded-xl border bg-card hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  >
                      <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center px-4 font-black text-xs text-muted-foreground">
                       {currentPage} / <span className="text-foreground">{totalPages || 1}</span>
                  </div>
                  <button 
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-2 rounded-xl border bg-card hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                  >
                      <ChevronRight size={16} />
                  </button>
             </div>
        </div>
      </div>

      {/* REFINED Balanced Modal */}
      <AnimatePresence>
        {selectedMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedMessage(null)}
                    className="absolute inset-0 bg-background/80 backdrop-blur-xl" 
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    className="relative w-full max-w-xl bg-card rounded-[2rem] border shadow-2xl overflow-hidden flex flex-col ring-1 ring-primary/5"
                >
                    {/* Compact Modal Header */}
                    <div className="p-6 border-b bg-muted/40">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                                <Hash size={12} strokeWidth={3} />
                                <span className="text-[10px] font-black tracking-widest uppercase">#{selectedMessage.id}</span>
                            </div>
                            <button 
                                onClick={() => setSelectedMessage(null)}
                                className="p-2 rounded-xl bg-background border hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-90"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-lg shrink-0 border-4 border-background">
                                <User size={28} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-2xl font-black tracking-tighter text-foreground">{selectedMessage.name}</h3>
                                <div className="flex items-center space-x-2 text-muted-foreground font-black text-[9px] uppercase tracking-widest">
                                    <MapPin size={10} className="text-primary"/><span>{selectedMessage.city}</span>
                                    <span className="opacity-20 border-l h-2 mx-1" />
                                    <Tablet size={10} className="text-primary"/><span>{selectedMessage.serviceType || 'General'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balanced Content Area */}
                    <div className="p-6 space-y-6 flex-grow overflow-y-auto max-h-[50vh] custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-1.5 text-primary">
                                    <Phone size={12} strokeWidth={3} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Phone</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50 flex items-center justify-between hover:bg-muted/50 transition-all">
                                    <p className="text-lg font-black font-mono tracking-tighter">{selectedMessage.phone}</p>
                                    <div className="flex space-x-1">
                                        <button 
                                            onClick={() => copyToClipboard(selectedMessage.phone, selectedMessage.id)}
                                            className="p-2 rounded-lg bg-background border hover:bg-primary hover:text-white transition-all shadow-sm"
                                        >
                                            {copiedId === selectedMessage.id ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                        <a href={`tel:${selectedMessage.phone}`} className="p-2 rounded-lg bg-primary text-white shadow-sm active:scale-90">
                                            <Phone size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-1.5 text-primary">
                                    <Mail size={12} strokeWidth={3} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50 flex items-center justify-between overflow-hidden">
                                    <p className="text-xs font-black truncate text-foreground pr-4 font-mono">{selectedMessage.email || 'N/A'}</p>
                                    {selectedMessage.email && (
                                        <a href={`mailto:${selectedMessage.email}`} className="p-2 rounded-lg bg-background border hover:bg-muted transition-all active:scale-90 shrink-0">
                                            <Mail size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                     <div className="flex items-center space-x-1.5 text-primary">
                                         <MapPin size={12} strokeWidth={3} />
                                         <span className="text-[9px] font-black uppercase tracking-widest">Address Details</span>
                                     </div>
                                     <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50">
                                         <p className="text-xs font-bold text-foreground/80">{selectedMessage.address || "No address provided."}</p>
                                     </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-1.5 text-primary">
                                                <MessageSquare size={12} strokeWidth={3} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Requirement Details</span>
                                            </div>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50">{new Date(selectedMessage.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-background border border-muted/70 relative shadow-inner ring-1 ring-primary/5">
                                            <p className="text-sm font-bold leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
                                                {selectedMessage.message || "No specific instructions provided."}
                                            </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    {/* Proportional Action Footer */}
                    <div className="p-6 border-t bg-muted/10 grid grid-cols-1 sm:grid-cols-6 gap-3">
                        <button 
                            disabled={actionLoading}
                            onClick={() => {
                            updateStatus(selectedMessage.id, selectedMessage.status === 'pending' ? 'contacted' : 'pending');
                            setSelectedMessage(null);
                            }}
                            className={cn(
                            "sm:col-span-4 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-2",
                            selectedMessage.status === 'pending' 
                                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20" 
                                : "bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-500/20"
                            )}
                        >
                            {selectedMessage.status === 'pending' ? <CheckCircle size={16}/> : <Clock size={16}/>}
                            <span>{selectedMessage.status === 'pending' ? t('mark_contacted') : t('mark_pending')}</span>
                        </button>
                        <button 
                            onClick={() => setSelectedMessage(null)}
                            className="sm:col-span-2 p-4 rounded-2xl bg-background border border-muted font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
                        >
                            {t('admin_fallback') === 'Admin' ? 'Dismiss' : 'إغلاق'}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
