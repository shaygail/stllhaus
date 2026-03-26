"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CartItem } from "@/components/CartContext";

const pickupOptions = [
  "ASAP (15-20 min)",
  "In 30 minutes",
  "In 1 hour",
  "Later today",
];


export default function CheckoutForm() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofError, setProofError] = useState("");
  const proofInputRef = useRef<HTMLInputElement>(null);

  const BANK_DETAILS = {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "Your Bank Name",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "STLL HAUS",
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "0000 0000",
    reference: "STLL ORDER",
  };

  useEffect(() => {
    try {
      const val = window.localStorage.getItem("stll-cart");
      if (val) setCart(JSON.parse(val));
    } catch {}
  }, []);


  // Update quantity for a cart item
  const updateQuantity = (id: string, quantity: number) => {
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCart(newCart);
    window.localStorage.setItem("stll-cart", JSON.stringify(newCart));
  };

  // Remove a cart item
  const removeItem = (id: string) => {
    const newCart = cart.filter((item) => item.id !== id);
    setCart(newCart);
    window.localStorage.setItem("stll-cart", JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setProofError("");
    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("customerName") as string;
    const pickupTime = formData.get("pickupTime") as string;
    const notes = formData.get("notes") as string;
    // Use state for paymentMethod
    if (paymentMethod === "bank_transfer" && !proofFile) {
      setProofError("Please upload proof of payment for bank transfer.");
      setIsLoading(false);
      if (proofInputRef.current) proofInputRef.current.focus();
      return;
    }
    try {
      const form = new FormData();
      form.append("customerName", customerName);
      form.append("pickupTime", pickupTime);
      form.append("notes", notes);
      form.append("paymentMethod", paymentMethod);
      form.append("items", JSON.stringify(cart));
      if (paymentMethod === "bank_transfer" && proofFile) {
        form.append("proof", proofFile);
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Order failed");
      window.localStorage.removeItem("stll-cart");
      router.push("/success?method=" + paymentMethod);
    } catch {
      setError("Order failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 px-8 sm:px-12 mx-auto pt-28 pb-16">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <section>
        <h1 className="text-5xl font-bold text-stll-charcoal">Checkout</h1>
        <div className="mt-2 h-1 w-16 bg-stll-charcoal/20 rounded-full" />
        <p className="mt-4 text-lg text-stll-muted">Order your calm moment.</p>
      </section>

      {cart.length === 0 ? (
        <div className="rounded-2xl border border-stll-light bg-white p-8">
          <h2 className="text-2xl font-bold text-stll-charcoal">Your cart is calm and empty</h2>
          <p className="mt-3 text-base text-stll-muted">Add a drink from the menu to begin your order.</p>
          <Link
            href="/gallery"
            className="mt-6 inline-block px-6 py-3 text-[11px] tracking-[0.3em] uppercase bg-stll-charcoal text-white"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-stll-light bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-stll-charcoal">Your order</h2>
            <ul className="mt-6 space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="flex flex-col gap-3 rounded-xl border border-stll-light p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-stll-charcoal">
                      {item.quantity > 1 && <span className="mr-2">{item.quantity} ×</span>}
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-stll-muted mt-0.5">{item.description}</p>
                    )}
                    <p className="mt-1 text-base font-medium text-stll-charcoal">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="h-8 w-8 rounded-full bg-stll-light text-stll-charcoal text-lg font-medium"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-medium text-stll-charcoal">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="h-8 w-8 rounded-full bg-stll-light text-stll-charcoal text-lg font-medium"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      aria-label="Remove item"
                      className="ml-2 px-2 py-1 text-xs text-red-500 border border-red-200 rounded"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleOrder} className="rounded-2xl border border-stll-light bg-white p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stll-charcoal mb-2">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                name="customerName"
                type="text"
                required
                placeholder="Enter your name"
                className="w-full border border-stll-light bg-white px-4 py-3 text-sm text-stll-charcoal placeholder:text-stll-muted rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stll-charcoal mb-2">Pickup time</label>
              <select
                name="pickupTime"
                defaultValue={pickupOptions[0]}
                className="w-full border border-stll-light bg-white px-4 py-3 text-sm font-medium text-stll-charcoal rounded-xl"
              >
                {pickupOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stll-charcoal mb-2">Order notes (optional)</label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Any preference? Less sweet?"
                className="w-full border border-stll-light bg-white px-4 py-3 text-sm text-stll-charcoal placeholder:text-stll-muted rounded-xl resize-none"
              />
            </div>


            <div>
              <label className="block text-sm font-semibold text-stll-charcoal mb-3">Payment method</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
                  { value: "cash", label: "Cash at Pickup", icon: "💵" },
                ].map(({ value, label, icon }) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 rounded-xl border border-stll-light px-4 py-3 cursor-pointer has-checked:border-stll-charcoal has-checked:bg-stll-charcoal/5 transition-colors"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                      className="accent-stll-charcoal"
                    />
                    <span className="text-sm">{icon}</span>
                    <span className="text-sm font-medium text-stll-charcoal">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {paymentMethod === "bank_transfer" && (
              <div className="mt-6 border border-stll-light rounded-xl p-4 bg-stll-sage/10">
                <p className="text-xs tracking-[0.2em] uppercase text-stll-muted mb-3">Bank Transfer Details</p>
                <dl className="space-y-1 text-sm mb-3">
                  <div className="flex justify-between">
                    <dt className="text-stll-muted">Bank</dt>
                    <dd className="font-medium text-stll-charcoal">{BANK_DETAILS.bankName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stll-muted">Account Name</dt>
                    <dd className="font-medium text-stll-charcoal">{BANK_DETAILS.accountName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stll-muted">Account Number</dt>
                    <dd className="font-medium text-stll-charcoal">{BANK_DETAILS.accountNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stll-muted">Reference</dt>
                    <dd className="font-medium text-stll-charcoal">{BANK_DETAILS.reference}</dd>
                  </div>
                </dl>
                <p className="text-xs text-stll-muted mb-2">Please use <span className="font-semibold">your name</span> as the payment reference.</p>
                <label className="block text-xs text-stll-muted font-medium mb-1" htmlFor="proof-upload">Upload proof of payment <span className="text-red-500">*</span>:</label>
                <input
                  id="proof-upload"
                  name="proof-upload"
                  type="file"
                  accept="image/*"
                  ref={proofInputRef}
                  onChange={e => setProofFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                  className="block w-full text-xs text-stll-charcoal border border-stll-light rounded px-3 py-2 bg-white mb-1"
                  required
                />
                {proofError && <span className="text-xs text-red-500 mt-1 block">{proofError}</span>}
                <span className="text-[10px] text-stll-muted/70">This helps us verify your payment faster.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-lg font-medium text-stll-charcoal">Total: ${total.toFixed(2)}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setCart([]); window.localStorage.removeItem("stll-cart"); }}
                  className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/20 text-stll-muted"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 text-[11px] tracking-[0.3em] uppercase bg-stll-charcoal text-white"
                >
                  {isLoading ? "Placing..." : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}