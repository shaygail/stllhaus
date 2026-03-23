"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartContextValue = {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "stll-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let loaded: CartItem[] = [];

    // Primary: cookie written by the server action (works even if localStorage is unavailable)
    try {
      const match = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("stll-cart="));
      if (match) {
        const val = decodeURIComponent(match.trim().substring("stll-cart=".length));
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.length > 0) loaded = parsed;
      }
    } catch {}

    // Fallback: localStorage (for items added in previous sessions before cookie approach)
    if (!loaded.length) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) loaded = parsed;
        }
      } catch {}
    }

    setCart(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      } catch {}
      // Also keep the cookie in sync so server action reads the latest state
      try {
        document.cookie = `stll-cart=${encodeURIComponent(JSON.stringify(cart))}; path=/; max-age=86400; samesite=lax`;
      } catch {}
    }
  }, [cart, isLoaded]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart],
  );

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const value: CartContextValue = useMemo(
    () => ({ cart, addItem, removeItem, updateQuantity, clearCart, cartCount, total }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, cartCount, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}