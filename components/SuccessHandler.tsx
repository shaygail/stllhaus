"use client";

import { useEffect } from "react";
import { useCart } from "./CartContext";
import { useLoyalty } from "./LoyaltyContext";

export default function SuccessHandler() {
  const { cart, clearCart } = useCart();
  const { addPoints, card } = useLoyalty();

  useEffect(() => {
    if (card && cart.length > 0) {
      // Calculate total
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Award loyalty points
      addPoints(Math.floor(total * 10), total); // 10 points per dollar

      // Clear cart after successful purchase
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
