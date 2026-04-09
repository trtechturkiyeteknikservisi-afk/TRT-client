'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Plus, Edit, Trash2, CheckCircle2, XCircle, 
  ShieldAlert, Shield, ShieldCheck, UserPlus, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PERMISSIONS = [
  { id: 'VIEW_ANALYTICS', label: 'View Analytics' },
  { id: 'MANAGE_CONTACTS', label: 'Manage Contacts' },
  { id: 'MANAGE_BLOGS', label: 'Manage Blogs' },
  { id: 'MANAGE_REVIEWS', label: 'Manage Reviews' },
  { id: 'MANAGE_FAQS', label: 'Manage FAQs' },
  { id: 'MANAGE_PORTFOLIO', label: 'Manage Portfolio' },
  { id: 'MANAGE_BANNERS', label: 'Manage Banners' },
  { id: 'MANAGE_VERIFICATIONS', label: 'Manage Verifications' },
  { id: 'MANAGE_SETTINGS', label: 'Manage Settings' },
  { id: 'MANAGE_USERS', label: 'Manage Employees' },
];

export default function EmployeesPage() {
  const t = useTranslations('Admin');
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    permissions: [] as string[]
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        username: user.username,
        password: '', // Don't populate password on edit
        permissions: user.permissions || []
      });
    } else {
      setEditingId(null);
      setFormData({
        username: '',
        password: '',
        permissions: []
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permId);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const url = editingId ? `/api/users/${editingId}` : '/api/users';
      const method = editingId ? 'PUT' : 'POST';
      
      const body: any = {
        username: formData.username,
        permissions: formData.permissions
      };
      
      if (formData.password) {
         body.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      await fetchUsers();
      setIsModalOpen(false);
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number, role: string) => {
    if (role === 'admin') {
      alert('Cannot delete main admin account');
      return;
    }
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchUsers();
    } catch (error) {
      console.error(error);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <Shield className="text-primary" />
            {t('menu_employees')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('manage_staff_desc')}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <UserPlus size={18} />
          {t('add_employee')}
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">{t('loading')}</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4 font-bold">{t('username')}</th>
                <th className="p-4 font-bold">{t('table_role')}</th>
                <th className="p-4 font-bold">{t('permissions')}</th>
                <th className="p-4 font-bold text-right">{t('table_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-base flex items-center gap-2">
                       {user.username}
                       {user.role === 'admin' && <ShieldCheck size={16} className="text-primary" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.role === 'admin' || user.permissions?.includes('*') ? (
                      <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-md">{t('all_access')}</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {user.permissions?.length > 0 ? user.permissions.map((p: string) => (
                           <span key={p} className="text-[10px] bg-muted/50 border border-border px-1.5 py-0.5 rounded text-muted-foreground">{t(`perm_${p.toLowerCase()}` as any)}</span>
                        )) : (
                          <span className="text-xs text-muted-foreground">{t('no_access')}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(user.id, user.role)}
                          className="p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-2xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/10">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                   {editingId ? <Edit size={20} className="text-primary"/> : <UserPlus size={20} className="text-primary"/>}
                   {editingId ? t('edit_employee') : t('add_employee')}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <XCircle size={24} className="text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                {formError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold flex items-center gap-2">
                    <ShieldAlert size={18} />
                    {formError}
                  </div>
                )}

                <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('username')}</label>
                       <input
                         type="text"
                         required
                         value={formData.username}
                         onChange={e => setFormData({...formData, username: e.target.value})}
                         className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-bold"
                         placeholder="ahmed_staff"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                         {t('password')} {editingId && <span className="opacity-50 text-[10px] lowercase"></span>}
                       </label>
                       <div className="relative">
                         <input
                           type="text"
                           required={!editingId}
                           value={formData.password}
                           onChange={e => setFormData({...formData, password: e.target.value})}
                           className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-primary transition-colors text-sm"
                           placeholder="***"
                         />
                         <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                       <label className="text-sm font-black uppercase tracking-wider">{t('permissions')}</label>
                       <button
                         type="button"
                         onClick={() => {
                           if (formData.permissions.length === PERMISSIONS.length) {
                              setFormData({ ...formData, permissions: [] });
                           } else {
                              setFormData({ ...formData, permissions: PERMISSIONS.map(p => p.id) });
                           }
                         }}
                         className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                       >
                         {formData.permissions.length === PERMISSIONS.length ? t('deselect_all') : t('select_all')}
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PERMISSIONS.map(perm => {
                        const isSelected = formData.permissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handleTogglePermission(perm.id)}
                            className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all ${isSelected ? 'bg-primary/10 border-primary shadow-sm shadow-primary/10' : 'bg-muted/20 border-border/50 hover:border-border'}`}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 bg-background'}`}>
                               {isSelected && <CheckCircle2 size={14} />}
                            </div>
                            <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{t(`perm_${perm.id.toLowerCase()}` as any)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  form="employee-form"
                  type="submit"
                  disabled={formLoading}
                  className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {formLoading ? t('loading') : t('save_employee')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
