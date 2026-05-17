"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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

function readCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as unknown;
      if (Array.isArray(parsed)) return parsed as CartItem[];
    }
  } catch {
    /* ignore */
  }
  return [];
}

function persistToStorage(items: CartItem[]) {
  try {
    if (items.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    /* ignore */
  }
  try {
    if (items.length === 0) {
      document.cookie = "stll-cart=; path=/; max-age=0; samesite=lax";
    } else {
      document.cookie = `stll-cart=${encodeURIComponent(JSON.stringify(items))}; path=/; max-age=86400; samesite=lax`;
    }
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return readCartFromStorage();
  });

  const loadCart = useCallback(() => {
    setCart(readCartFromStorage());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        setCart(readCartFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadCart();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadCart]);

  useEffect(() => {
    window.addEventListener("focus", loadCart);
    return () => window.removeEventListener("focus", loadCart);
  }, [loadCart]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      const next = existing
        ? prev.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        : [...prev, { ...item, quantity: 1 }];
      persistToStorage(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.id !== id);
      persistToStorage(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((prev) => {
          const next = prev.filter((item) => item.id !== id);
          persistToStorage(next);
          return next;
        });
        return;
      }
      setCart((prev) => {
        const next = prev.map((item) => (item.id === id ? { ...item, quantity } : item));
        persistToStorage(next);
        return next;
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
    persistToStorage([]);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart]
  );

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const value: CartContextValue = useMemo(
    () => ({
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      cartCount,
      total,
    }),
    [cart, addItem, removeItem, updateQuantity, clearCart, cartCount, total]
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
