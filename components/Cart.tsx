"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { getStripe } from "@/lib/stripe-client";

const pickupOptions = [
  "ASAP (15-20 min)",
  "In 30 minutes",
  "In 1 hour",
  "Later today",
];

export function Cart() {
  const { cart, removeItem, updateQuantity, total, clearCart } = useCart();
  const [pickupTime, setPickupTime] = useState(pickupOptions[0]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!cart.length) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, pickupTime, notes }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { sessionId } = await response.json();
      const stripe = await getStripe();

      if (!stripe) throw new Error("Stripe failed to load");

      // @ts-expect-error - redirectToCheckout is available but not typed in newer versions
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw new Error(error.message);
    } catch (error) {
      console.error(error);
      alert("Checkout failed. Please verify Stripe keys and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="border-b border-stll-charcoal/10 py-10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-3">Your Order</p>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-stll-charcoal leading-none mb-4">
          Cart is empty
        </h2>
        <p className="text-sm text-stll-muted mb-8">Add a drink from the menu to begin your order.</p>
        <Link
          href="/gallery"
          className="inline-block px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white text-center cursor-pointer"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">

      {/* Order header */}
      <div className="border-b border-stll-charcoal/10 pb-6">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-2">Your Order</p>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-stll-charcoal leading-none">
          Cart
        </h2>
      </div>

      {/* Cart items */}
      <ul className="flex flex-col divide-y divide-stll-charcoal/10">
        {cart.map((item) => (
          <li key={item.id} className="flex items-start justify-between py-5 gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stll-charcoal tracking-wide uppercase leading-snug">
                {item.name}
              </p>
              {item.description && (
                <p className="mt-1 text-[11px] text-stll-muted/80 tracking-widest">{item.description}</p>
              )}
              <p className="mt-1 text-[11px] text-stll-muted/80 tracking-widest">
                ${item.price.toFixed(2)} each
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="h-7 w-7 border border-stll-charcoal/25 text-stll-charcoal flex items-center justify-center hover:bg-stll-charcoal hover:text-white transition-colors"
                aria-label={`Decrease quantity of ${item.name}`}
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-medium text-stll-charcoal">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="h-7 w-7 border border-stll-charcoal/25 text-stll-charcoal flex items-center justify-center hover:bg-stll-charcoal hover:text-white transition-colors"
                aria-label={`Increase quantity of ${item.name}`}
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="text-[10px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal transition-colors ml-2"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Pickup time + notes */}
      <div className="border-t border-stll-charcoal/10 pt-8 mt-2 flex flex-col gap-5">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Pickup Time</p>
          <select
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full sm:w-auto border border-stll-charcoal/25 bg-transparent px-4 py-2 text-[11px] tracking-[0.2em] uppercase text-stll-charcoal focus:outline-none focus:border-stll-charcoal"
          >
            {pickupOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Order Notes (optional)</p>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any preferences? Less sweet?"
            className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal resize-none"
          />
        </div>
      </div>

      {/* Total + actions */}
      <div className="border-t border-stll-charcoal/10 pt-6 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-lg font-black uppercase tracking-tight text-stll-charcoal">
          Total: ${total.toFixed(2)}
        </p>
        <div className="flex gap-3">
          <button
            onClick={clearCart}
            className="px-6 py-3 text-[11px] tracking-[0.3em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal hover:text-white transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Loading..." : "Pay with Stripe"}
          </button>
        </div>
      </div>
    </div>
  );
}