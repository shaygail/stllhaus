import { cookies } from "next/headers";
import Link from "next/link";
import {
  removeFromCartAction,
  updateQuantityAction,
  placeOrderAction,
  clearCartAction,
} from "@/app/actions/cart";
import type { CartItem } from "@/components/CartContext";

export const metadata = {
  title: "Checkout - STLL HAUS",
};

const pickupOptions = [
  "ASAP (15-20 min)",
  "In 30 minutes",
  "In 1 hour",
  "Later today",
];

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  stripe_not_configured: "Card payments are not yet configured. Please choose Cash or Bank Transfer.",
  stripe_failed: "Payment failed. Please try again or choose a different method.",
  missing_app_url: "Server misconfiguration. Please contact support.",
};

export default async function CheckoutPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  let cart: CartItem[] = [];
  try {
    const val = cookieStore.get("stll-cart")?.value;
    if (val) cart = JSON.parse(decodeURIComponent(val));
  } catch {}

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-2xl space-y-8 px-8 sm:px-12 mx-auto pt-28 pb-16">
      {error && errorMessages[error] && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessages[error]}
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
          {/* Order items */}
          <div className="rounded-2xl border border-stll-light bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-stll-charcoal">Your order</h2>
            <ul className="mt-6 space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="flex flex-col gap-3 rounded-xl border border-stll-light p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-stll-charcoal">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-stll-muted mt-0.5">{item.description}</p>
                    )}
                    <p className="mt-1 text-base font-medium text-stll-charcoal">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Decrease */}
                    <form action={updateQuantityAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="delta" value="-1" />
                      <button type="submit" className="h-8 w-8 rounded-full bg-stll-light text-stll-charcoal text-lg font-medium">−</button>
                    </form>
                    <span className="w-6 text-center font-medium text-stll-charcoal">{item.quantity}</span>
                    {/* Increase */}
                    <form action={updateQuantityAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="delta" value="1" />
                      <button type="submit" className="h-8 w-8 rounded-full bg-stll-light text-stll-charcoal text-lg font-medium">+</button>
                    </form>
                    {/* Remove */}
                    <form action={removeFromCartAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="ml-1 text-xs text-stll-muted">remove</button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pickup + pay */}
          <form action={placeOrderAction} className="rounded-2xl border border-stll-light bg-white p-6 sm:p-8 space-y-5">
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

            {/* Payment method */}
            <div>
              <label className="block text-sm font-semibold text-stll-charcoal mb-3">Payment method</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
                  { value: "cash", label: "Cash at Pickup", icon: "💵" },
                ].map(({ value, label, icon }, index) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 rounded-xl border border-stll-light px-4 py-3 cursor-pointer has-checked:border-stll-charcoal has-checked:bg-stll-charcoal/5 transition-colors"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      defaultChecked={index === 0}
                      className="accent-stll-charcoal"
                    />
                    <span className="text-sm">{icon}</span>
                    <span className="text-sm font-medium text-stll-charcoal">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-lg font-medium text-stll-charcoal">Total: ${total.toFixed(2)}</p>
              <div className="flex gap-3">
                <button
                  type="submit"
                  formAction={clearCartAction}
                  className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/20 text-stll-muted"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-[11px] tracking-[0.3em] uppercase bg-stll-charcoal text-white"
                >
                  Place Order
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

