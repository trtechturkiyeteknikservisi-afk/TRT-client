'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string | number;
  title: string;
  brand?: string;
  category?: string;
  item_type?: 'cihaz' | 'yedek_parca' | 'aksesuar';
  price: number;
  image: string;
  quality?: string;
  specs?: string;
  badge?: string;
  quantity: number;
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string | number, quality?: string) => void;
  updateQuantity: (id: string | number, quality: string | undefined, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  favorites: (string | number)[];
  toggleFavorite: (id: string | number, title?: string) => void;
  isFavorite: (id: string | number) => boolean;
  isFavoritesOpen: boolean;
  setIsFavoritesOpen: (open: boolean) => void;

  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'trt_store_cart_v1';
const FAV_STORAGE_KEY = 'trt_store_favs_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<(string | number)[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedFavs = localStorage.getItem(FAV_STORAGE_KEY);
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error('Failed to load store data from localStorage', e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites, mounted]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity || 1;
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (ci) => ci.id === item.id && (ci.quality || '') === (item.quality || '')
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += qty;
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
    toast.success(`${item.title} sepete eklendi!`, {
      icon: '🛒',
      duration: 2500,
      style: {
        background: '#18181b',
        color: '#fff',
        border: '1px solid #27272a',
        fontWeight: 'bold',
        fontSize: '13px'
      }
    });
  };

  const removeFromCart = (id: string | number, quality?: string) => {
    setCart((prev) =>
      prev.filter((ci) => !(ci.id === id && (ci.quality || '') === (quality || '')))
    );
  };

  const updateQuantity = (id: string | number, quality: string | undefined, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.id === id && (ci.quality || '') === (quality || '')) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (id: string | number, title?: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        toast('Favorilerden çıkarıldı', { icon: '🤍', duration: 1500 });
        return prev.filter((favId) => favId !== id);
      } else {
        toast.success(title ? `${title} favorilere eklendi` : 'Favorilere eklendi!', {
          icon: '❤️',
          duration: 2000,
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a',
            fontWeight: 'bold',
            fontSize: '13px'
          }
        });
        return [...prev, id];
      }
    });
  };

  const isFavorite = (id: string | number) => {
    return favorites.includes(id);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        favorites,
        toggleFavorite,
        isFavorite,
        isFavoritesOpen,
        setIsFavoritesOpen,
        isOrderModalOpen,
        setIsOrderModalOpen
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
