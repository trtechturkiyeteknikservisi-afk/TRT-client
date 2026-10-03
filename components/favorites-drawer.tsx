'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from './store-context';
import { useLocale } from 'next-intl';

export function FavoritesDrawer() {
  const { 
    favorites, 
    isFavoritesOpen, 
    setIsFavoritesOpen, 
    toggleFavorite 
  } = useStore();

  const locale = useLocale();

  return (
    <AnimatePresence>
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFavoritesOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-[#0F0F12] border-l border-zinc-800 text-white h-full flex flex-col shadow-2xl z-10"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#141418]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                  <Heart size={18} className="fill-rose-500" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight">
                    {locale === 'ar' ? 'المفضلة' : locale === 'en' ? 'My Wishlist' : 'Favorilerim'}
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-bold">
                    {favorites.length} {locale === 'ar' ? 'عنصر محفوظ' : 'kayıtlı ürün'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFavoritesOpen(false)}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {favorites.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                    <Heart size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-300">
                      {locale === 'ar' ? 'قائمة المفضلة فارغة' : 'Favori listeniz boş'}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                      {locale === 'ar'
                        ? 'انقر على رمز القلب في أي منتج لحفظه في قائمتك لاحقاً'
                        : 'Beğendiğiniz ürünlerin üzerindeki kalp simgesine basarak buraya ekleyebilirsiniz.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-400">
                    {locale === 'ar'
                      ? 'يمكنك نقل المنتجات المحفوظة مباشرة إلى السلة من صفحات المنتجات.'
                      : 'Kaydedilen ürünlerinizi katalogdan görüntüleyip dilediğiniz zaman sepete ekleyebilirsiniz.'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
