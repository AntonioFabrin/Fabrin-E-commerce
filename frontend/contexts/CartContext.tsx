'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AUTH_CHANGED_EVENT, getToken } from '../hooks/useAuth';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  seller_id: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const GUEST_STORAGE_KEY = '@FabrinMarket:cart:guest';
const LEGACY_STORAGE_KEY = '@FabrinMarket:cart';

const getCartStorageKey = () => {
  const token = getToken();

  if (!token) {
    return GUEST_STORAGE_KEY;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.id ? `@FabrinMarket:cart:user:${payload.id}` : GUEST_STORAGE_KEY;
  } catch {
    return GUEST_STORAGE_KEY;
  }
};

const readCartItems = (key: string): CartItem[] => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);

    if (key === GUEST_STORAGE_KEY) {
      const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyStored) {
        localStorage.setItem(GUEST_STORAGE_KEY, legacyStored);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return JSON.parse(legacyStored);
      }
    }
  } catch { /* silencia */ }

  return [];
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageKey, setStorageKey] = useState(GUEST_STORAGE_KEY);

  // Carrega do localStorage apenas no cliente e troca de carrinho ao trocar usuario.
  useEffect(() => {
    const loadCartForCurrentUser = () => {
      const nextStorageKey = getCartStorageKey();
      setStorageKey(nextStorageKey);
      setItems(readCartItems(nextStorageKey));
      setHydrated(true);
    };

    loadCartForCurrentUser();
    window.addEventListener(AUTH_CHANGED_EVENT, loadCartForCurrentUser);
    window.addEventListener('storage', loadCartForCurrentUser);
    window.addEventListener('focus', loadCartForCurrentUser);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, loadCartForCurrentUser);
      window.removeEventListener('storage', loadCartForCurrentUser);
      window.removeEventListener('focus', loadCartForCurrentUser);
    };
  }, []);

  // Persiste no localStorage toda vez que o carrinho muda
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch { /* silencia */ }
  }, [items, hydrated, storageKey]);

  const addItem = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        // Já está no carrinho — aumenta quantidade (respeitando o estoque)
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== productId));
      return;
    }
    setItems(prev =>
      prev.map(i => i.id === productId ? { ...i, quantity } : i)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback((productId: number) => items.some(i => i.id === productId), [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, totalItems, totalPrice,
      addItem, removeItem, updateQuantity, clearCart, isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro do CartProvider');
  return ctx;
}
