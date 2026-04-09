'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const data = response.data as any;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card p-8 md:p-12 rounded-[2.5rem] border shadow-2xl shadow-primary/5 relative group">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-transform duration-500">
              <Lock className="text-primary-foreground" size={40} />
            </div>

            <div className="mt-8 text-center space-y-2 mb-10">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Admin Portal</h2>
              <p className="text-muted-foreground font-medium">Please sign in to manage TRT platform</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-red-500 bg-red-500/10 p-4 rounded-xl text-sm font-bold border border-red-500/20"
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-5 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 active:scale-95 disabled:opacity-50 group"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <LogIn size={22} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>
      </motion.div>
    </main>
  );
}
