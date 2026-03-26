"use client";

import { useEffect } from "react";
import { useCart } from "./CartContext";

export default function SuccessHandler() {
  const { cart, clearCart } = useCart();
  // Loyalty program is disabled

  useEffect(() => {
    if (cart.length > 0) {
      // Clear cart after successful purchase
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
