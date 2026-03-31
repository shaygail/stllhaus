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
    bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "ANZ",
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

  const updateQuantity = (id: string, quantity: number) => {
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCart(newCart);
    window.localStorage.setItem("stll-cart", JSON.stringify(newCart));
  };

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
    const contactPhone = formData.get("contactPhone") as string;
    const contactInstagram = formData.get("contactInstagram") as string;
    const contactEmail = formData.get("contactEmail") as string;
    if (!contactPhone || contactPhone.trim() === "") {
      setError("Phone number is required for order updates.");
      setIsLoading(false);
      return;
    }
    if (!contactEmail || contactEmail.trim() === "") {
      setError("Email is required for receipts and updates.");
      setIsLoading(false);
      return;
    }

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
      form.append("contactPhone", contactPhone);
      form.append("contactInstagram", contactInstagram);
      form.append("contactEmail", contactEmail);
      form.append("paymentMethod", paymentMethod);
      form.append("items", JSON.stringify(cart));
      if (formData.get("sendReceipt") === "on") {
        form.append("sendReceipt", "on");
      }
      if (paymentMethod === "bank_transfer" && proofFile) {
        form.append("proof", proofFile);
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Order failed");
      const data = (await res.json()) as { orderId?: string };
      try {
        const snapshot = {
          customerEmail: contactEmail.trim(),
          customerName: (customerName as string).trim(),
          items: cart.map(({ name, quantity, price }) => ({ name, quantity, price })),
          total,
          pickupTime,
          paymentMethod,
          orderId: data.orderId,
          notes: (notes as string) || "",
        };
        sessionStorage.setItem("stll-last-order", JSON.stringify(snapshot));
      } catch {
        /* ignore */
      }
      window.localStorage.removeItem("stll-cart");
      router.push("/success?method=" + paymentMethod);
    } catch {
      setError("Order failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen">
        <div className="pt-32 pb-16 px-6 sm:px-12 lg:px-20 border-b border-stll-charcoal/10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-4">Stll Haus</p>
          <h1 className="text-[4rem] sm:text-[6rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
            Checkout
          </h1>
        </div>
        <div className="px-6 sm:px-12 lg:px-20 pt-16 pb-24">
          <p className="text-sm text-stll-muted mb-8">Your cart is empty. Add a drink from the menu to begin.</p>
          <Link
            href="/gallery"
            className="inline-block px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* Page header */}
      <div className="pt-32 pb-16 px-6 sm:px-12 lg:px-20 border-b border-stll-charcoal/10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-4">Stll Haus</p>
        <h1 className="text-[4rem] sm:text-[6rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          Checkout
        </h1>
      </div>

      <div className="px-6 sm:px-12 lg:px-20 pt-16 pb-24 max-w-3xl">

        {error && (
          <p className="text-xs text-red-500 tracking-[0.2em] uppercase mb-8">{error}</p>
        )}

        {/* Order summary */}
        <section className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-6">Your Order</p>
          <ul className="flex flex-col divide-y divide-stll-charcoal/10">
            {cart.map((item) => (
              <li key={item.id} className="flex items-start justify-between py-5 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stll-charcoal tracking-wide uppercase leading-snug">
                    {item.quantity > 1 && <span className="mr-2">{item.quantity} ×</span>}
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-[11px] text-stll-muted/80 tracking-widest">{item.description}</p>
                  )}
                  <p className="mt-1 text-[11px] text-stll-muted/80 tracking-widest">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-7 w-7 border border-stll-charcoal/25 text-stll-charcoal flex items-center justify-center hover:bg-stll-charcoal hover:text-white transition-colors disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-medium text-stll-charcoal">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-7 w-7 border border-stll-charcoal/25 text-stll-charcoal flex items-center justify-center hover:bg-stll-charcoal hover:text-white transition-colors"
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
        </section>

        {/* Form */}
        <form onSubmit={handleOrder} className="flex flex-col gap-10">

          {/* Name */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">
              Your Name <span className="text-red-400">*</span>
            </p>
            <input
              name="customerName"
              type="text"
              required
              placeholder="Enter your name"
              className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
            />
          </div>

          {/* Contact for updates */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">
              Phone Number <span className="text-red-400">*</span> or Instagram (for order updates)
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <input
                name="contactPhone"
                type="tel"
                pattern="[0-9+()\-\s]*"
                placeholder="Phone (e.g. 021 123 4567)"
                required
                className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
              />
              <input
                name="contactInstagram"
                type="text"
                placeholder="Instagram (e.g. @yourhandle)"
                className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                name="contactEmail"
                type="email"
                placeholder="Email (for receipts and updates)"
                required
                className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
              />
            </div>
            <p className="text-[10px] text-stll-muted/70 mt-1">Phone number and email are required for order updates and receipts.</p>
          </div>

          {/* Pickup time */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Pickup Time</p>
            <select
              name="pickupTime"
              defaultValue={pickupOptions[0]}
              className="w-full sm:w-auto border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.2em] uppercase text-stll-charcoal focus:outline-none focus:border-stll-charcoal"
            >
              {pickupOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Order Notes (optional)</p>
            <textarea
              name="notes"
              rows={3}
              placeholder="Any preferences? Less sweet?"
              className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal resize-none"
            />
          </div>

          {/* Payment method */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-4">Payment Method</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "cash", label: "Cash at Pickup" },
              ].map(({ value, label }) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="sr-only peer"
                  />
                  <span className="block px-6 py-3 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Bank transfer details */}
          {paymentMethod === "bank_transfer" && (
            <div className="border border-stll-charcoal/10 p-6 flex flex-col gap-4">
              <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted">Bank Transfer Details</p>
              <dl className="flex flex-col gap-2">
                {[
                  { label: "Bank", value: BANK_DETAILS.bankName },
                  { label: "Account Name", value: BANK_DETAILS.accountName },
                  { label: "Account Number", value: BANK_DETAILS.accountNumber },
                  { label: "Reference", value: BANK_DETAILS.reference },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b border-stll-charcoal/10 pb-2">
                    <dt className="text-[11px] tracking-[0.15em] uppercase text-stll-muted">{label}</dt>
                    <dd className="text-[11px] tracking-[0.15em] uppercase font-semibold text-stll-charcoal">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[11px] text-stll-muted">Please use <span className="font-semibold text-stll-charcoal">your name</span> as the payment reference.</p>

              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">
                  Upload Proof of Payment <span className="text-red-400">*</span>
                </p>
                <input
                  id="proof-upload"
                  name="proof-upload"
                  type="file"
                  accept="image/*"
                  ref={proofInputRef}
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-[11px] text-stll-charcoal border border-stll-charcoal/25 px-4 py-3 bg-transparent"
                  required
                />
                {proofError && (
                  <p className="text-[10px] text-red-500 tracking-[0.15em] uppercase mt-2">{proofError}</p>
                )}
                <p className="text-[10px] text-stll-muted/70 mt-1">This helps us verify your payment faster.</p>
              </div>
            </div>
          )}

          {/* Email receipt */}
          <div className="border border-stll-charcoal/10 p-5 flex items-start gap-3">
            <input
              type="checkbox"
              name="sendReceipt"
              id="sendReceipt"
              defaultChecked
              className="mt-0.5 h-4 w-4 shrink-0 border-stll-charcoal/40 accent-stll-charcoal"
            />
            <label htmlFor="sendReceipt" className="cursor-pointer">
              <span className="block text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-1">Email receipt</span>
              <span className="text-[11px] tracking-[0.1em] text-stll-charcoal leading-relaxed">
                Send me an email receipt with this order&apos;s details.
              </span>
            </label>
          </div>

          {/* Total + actions */}
          <div className="border-t border-stll-charcoal/10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-lg font-black uppercase tracking-tight text-stll-charcoal">
              Total: ${total.toFixed(2)}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setCart([]); window.localStorage.removeItem("stll-cart"); }}
                className="px-6 py-3 text-[11px] tracking-[0.3em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}