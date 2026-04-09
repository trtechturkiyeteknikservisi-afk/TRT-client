'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Star, Trash2, CheckCircle, Clock, Search
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ReviewsPage() {
  const t = useTranslations('Admin');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE}/content/reviews/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data as any[]);
    } catch (err: any) {
      console.error('Error fetching reviews', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id: number) => {
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.put(`${API_BASE}/content/reviews/${id}`, { approved: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error approving review', err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/content/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting review', err);
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
        <h2 className="text-3xl font-black tracking-tight uppercase">{t('menu_reviews')}</h2>
      </header>

      <div>
        {loading ? (
             <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={cn(i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20")} />
                      ))}
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider",
                      item.approved ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                    )}>
                      {item.approved ? t('approved') : t('pending_approval')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black tracking-tight uppercase truncate">{item.customerName}</h4>
                    <p className="text-muted-foreground font-bold text-[11px] line-clamp-3 leading-relaxed italic">
                      "{item.comment}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 mt-4 border-t">
                  {!item.approved && (
                    <button
                      onClick={() => approveReview(item.id)}
                      disabled={actionLoading}
                      className="flex-grow flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-[10px] hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle size={14} />
                      <span>{t('approve')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => deleteItem(item.id)}
                    disabled={actionLoading}
                    className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
