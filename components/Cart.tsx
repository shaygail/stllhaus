"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

export function Cart() {
  const router = useRouter();
  const { cart, removeItem, updateQuantity, total, clearCart } = useCart();

  const goToCheckout = () => {
    router.push("/checkout");
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
          href="/menu"
          className="inline-block px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white text-center cursor-pointer"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="border-b border-stll-charcoal/10 pb-6 mb-0">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-2">Your Order</p>
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-stll-charcoal leading-none">
          Cart
        </h2>
      </div>

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
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="h-7 w-7 border border-stll-charcoal/25 text-stll-charcoal text-sm flex items-center justify-center hover:bg-stll-charcoal hover:text-white transition-colors"
                aria-label={`Decrease quantity of ${item.name}`}
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-medium text-stll-charcoal">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="h-7 w-7 border border-stll-charcoal/25 text-stll-charcoal text-sm flex items-center justify-center hover:bg-stll-charcoal hover:text-white transition-colors"
                aria-label={`Increase quantity of ${item.name}`}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-[10px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal transition-colors ml-2"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="border-t border-stll-charcoal/10 pt-6 mt-2 text-[11px] text-stll-muted leading-relaxed">
        Pickup time, location, and payment are confirmed on the next step.
      </p>

      <div className="border-t border-stll-charcoal/10 pt-6 mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-lg font-black uppercase tracking-tight text-stll-charcoal">
          Total: ${total.toFixed(2)}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={clearCart}
            className="px-6 py-3 text-[11px] tracking-[0.3em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal hover:text-white transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={goToCheckout}
            className="px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white cursor-pointer"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
