"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useCart } from "@/components/CartContext";
import { useLoyalty } from "@/components/LoyaltyContext";
import { getStripe } from "@/lib/stripe-client";

const pickupOptions = [
  "ASAP (15-20 min)",
  "In 30 minutes",
  "In 1 hour",
  "Later today",
];

export function Cart() {
  const { cart, removeItem, updateQuantity, total, clearCart } = useCart();
  const { card, pointsPerDollar } = useLoyalty();
  const [pickupTime, setPickupTime] = useState(pickupOptions[0]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pointsEarned = Math.floor(total * pointsPerDollar);

  const handleCheckout = async () => {
    if (!cart.length) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, pickupTime, notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionId } = await response.json();
      const stripe = await getStripe();

      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      // @ts-expect-error - redirectToCheckout is available but not typed in newer versions
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please verify Stripe keys and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <Card>
        <h2 className="text-2xl font-bold text-stll-charcoal">Your cart is calm and empty</h2>
        <p className="mt-3 text-base text-stll-muted">Add a drink from the menu to begin your order.</p>
        <Button href="/gallery" className="mt-6">
          Browse Menu
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-stll-charcoal">Your order</h2>
        <ul className="mt-6 space-y-4">
          {cart.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 rounded-xl bg-white border border-stll-light p-5 sm:flex-row sm:items-center sm:justify-between transition-all duration-300 hover:shadow-sm"
            >
              <div>
                <p className="font-semibold text-stll-charcoal">{item.name}</p>
                <p className="mt-1 text-base text-stll-accent font-medium">${item.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-8 w-8 rounded-full bg-stll-light transition-all duration-300 hover:bg-stll-accent hover:text-white text-stll-charcoal"
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  −
                </button>
                <span className="w-8 text-center font-medium text-stll-charcoal">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-8 w-8 rounded-full bg-stll-light transition-all duration-300 hover:bg-stll-accent hover:text-white text-stll-charcoal"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-2 text-xs text-stll-muted font-medium transition-colors hover:text-stll-accent"
                >
                  remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <label className="block text-sm font-semibold text-stll-charcoal">Pickup time</label>
        <select
          value={pickupTime}
          onChange={(event) => setPickupTime(event.target.value)}
          className="mt-3 w-full rounded-xl border border-stll-light bg-linear-to-br from-white to-stll-cream/20 px-4 py-3 text-sm font-medium text-stll-charcoal transition-all duration-300 hover:border-stll-accent/50 focus:border-stll-accent focus:ring-2 focus:ring-stll-accent/20 focus:outline-none"
        >
          {pickupOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-semibold text-stll-charcoal">Order notes (optional)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Any preference? Less sweet?"
          className="mt-3 w-full rounded-xl border border-stll-light bg-linear-to-br from-white to-stll-cream/20 px-4 py-3 text-sm text-stll-charcoal placeholder:text-stll-muted transition-all duration-300 hover:border-stll-accent/50 focus:border-stll-accent focus:ring-2 focus:ring-stll-accent/20 focus:outline-none resize-none"
        />

        {card && (
          <div className="mt-5 rounded-xl bg-stll-sage/10 p-3">
            <p className="text-xs font-medium text-stll-sage">
              ⭐ You&apos;ll earn {pointsEarned} loyalty points on this order
            </p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <p className="text-lg font-medium text-stll-charcoal">Total: ${total.toFixed(2)}</p>
          <div className="flex gap-2">
            <Button onClick={clearCart} className="bg-stll-light">
              Clear
            </Button>
            <Button onClick={handleCheckout} disabled={isLoading}>
              {isLoading ? "Loading..." : "Pay with Stripe"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}