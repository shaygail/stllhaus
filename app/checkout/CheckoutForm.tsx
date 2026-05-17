"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { OrderingStatusBanner } from "@/components/OrderingStatusBanner";
import { useOrderingStatus } from "@/hooks/useOrderingStatus";
import {
  cartUnitsEligibleForDelivery,
  DELIVERY_SERVICE_AREA_NOTE,
  deliveryFeeForTier,
  deliveryLineItemName,
  MIN_CART_UNITS_FOR_DELIVERY,
  type DeliveryTier,
} from "@/lib/delivery";
import { isPickupLocationId, pickupLocationOptionsForForm } from "@/lib/pickup-locations";
import { createClient } from "@/lib/supabase/client";
import {
  LoyaltyRewardsCheckout,
  LoyaltyRewardsSignInPrompt,
} from "@/components/LoyaltyRewardsCheckout";
import {
  computeLoyaltyCheckoutPricing,
  type LoyaltyRewardChoice,
} from "@/lib/loyalty-checkout";
import {
  getEarnedRewardByType,
  parseRewardHistory,
  type RewardHistoryEntry,
} from "@/lib/reward-history";

const PICKUP_MAX_DAYS_AHEAD = 14;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** `YYYY-MM-DD` for `<input type="date" />` (local timezone). */
function toDateOnly(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Default date + clock ~45 minutes ahead, rounded to 5-minute steps. */
function defaultPickupDateAndClock(): { date: string; clock: string } {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 45, 0, 0);
  const m = d.getMinutes();
  d.setMinutes(Math.ceil(m / 5) * 5, 0, 0);
  return {
    date: toDateOnly(d),
    clock: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
}

type DeliveryAddrFields = {
  unit: string;
  street: string;
  suburb: string;
  city: string;
  postcode: string;
};

/** One line sent to the server as `deliveryAddress` (structured fields + NZ). */
function deliveryGeocodeLine(a: DeliveryAddrFields): string {
  const parts = [
    a.unit.trim(),
    a.street.trim(),
    a.suburb.trim(),
    a.city.trim(),
    a.postcode.trim(),
  ].filter(Boolean);
  if (parts.length === 0) return "";
  return `${parts.join(", ")}, New Zealand`;
}

/** Multi-line label for emails / success page. */
function deliveryDisplayAddress(a: DeliveryAddrFields): string {
  const lines: string[] = [];
  if (a.unit.trim()) lines.push(a.unit.trim());
  if (a.street.trim()) lines.push(a.street.trim());
  const line2 = [a.suburb.trim(), a.city.trim(), a.postcode.trim()].filter(Boolean).join(", ");
  if (line2) lines.push(line2);
  return lines.join("\n");
}

export default function CheckoutForm() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, clearCart, cartCount } = useCart();
  const { data: orderingStatus } = useOrderingStatus();
  const canPlaceOrder =
    !orderingStatus ||
    orderingStatus.status === "open" ||
    orderingStatus.isPreOrderOnly;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const initialPickupSchedule = useMemo(() => defaultPickupDateAndClock(), []);
  const [pickupDate, setPickupDate] = useState(initialPickupSchedule.date);
  const [pickupClock, setPickupClock] = useState(initialPickupSchedule.clock);
  const [deliveryTier, setDeliveryTier] = useState<DeliveryTier>("bell_block");
  const [deliveryUnit, setDeliveryUnit] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliverySuburb, setDeliverySuburb] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("New Plymouth");
  const [deliveryPostcode, setDeliveryPostcode] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofError, setProofError] = useState("");
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [loyaltyAuthChecked, setLoyaltyAuthChecked] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [tenPercentReward, setTenPercentReward] = useState<RewardHistoryEntry | null>(null);
  const [freeDrinkReward, setFreeDrinkReward] = useState<RewardHistoryEntry | null>(null);
  const [tenPercentChoice, setTenPercentChoice] = useState<LoyaltyRewardChoice>("keep");
  const [freeDrinkChoice, setFreeDrinkChoice] = useState<LoyaltyRewardChoice>("keep");

  const deliveryAddrFields = (): DeliveryAddrFields => ({
    unit: deliveryUnit,
    street: deliveryStreet,
    suburb: deliverySuburb,
    city: deliveryCity,
    postcode: deliveryPostcode,
  });

  const clearDeliveryAddressFields = useCallback(() => {
    setDeliveryUnit("");
    setDeliveryStreet("");
    setDeliverySuburb("");
    setDeliveryCity("New Plymouth");
    setDeliveryPostcode("");
    setDeliveryInstructions("");
  }, []);

  useEffect(() => {
    if (!cartUnitsEligibleForDelivery(cartCount)) {
      setFulfillment("pickup");
      clearDeliveryAddressFields();
    }
  }, [cartCount, clearDeliveryAddressFields]);

  useEffect(() => {
    if (fulfillment === "pickup") {
      clearDeliveryAddressFields();
    }
  }, [fulfillment, clearDeliveryAddressFields]);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setIsSignedIn(!!user);
      if (user) {
        const history = parseRewardHistory(user.user_metadata?.reward_history);
        setTenPercentReward(getEarnedRewardByType(history, "ten_percent_off") ?? null);
        setFreeDrinkReward(getEarnedRewardByType(history, "free_drink") ?? null);
      }
      setLoyaltyAuthChecked(true);
    });
  }, []);

  const preOrderMinDate = useMemo(() => {
    if (!orderingStatus?.isPreOrderOnly || !orderingStatus.nextOpenAt) return toDateOnly(new Date());
    const [datePart] = orderingStatus.nextOpenAt.split("T");
    return datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : toDateOnly(new Date());
  }, [orderingStatus?.isPreOrderOnly, orderingStatus?.nextOpenAt]);

  useEffect(() => {
    if (!orderingStatus?.isPreOrderOnly || !orderingStatus.nextOpenAt) return;
    const [datePart, timePart] = orderingStatus.nextOpenAt.split("T");
    if (datePart) setPickupDate(datePart);
    if (timePart) setPickupClock(timePart.slice(0, 5));
  }, [orderingStatus?.isPreOrderOnly, orderingStatus?.nextOpenAt]);

  const deliveryEligible = cartUnitsEligibleForDelivery(cartCount);
  const appliedDeliveryFee =
    fulfillment === "delivery" && deliveryEligible ? deliveryFeeForTier(deliveryTier) : 0;

  const useTenPercentReward = tenPercentChoice === "use" && !!tenPercentReward;
  const useFreeDrinkReward =
    freeDrinkChoice === "use" && !!freeDrinkReward && cart.length > 0;

  const loyaltyPricing = useMemo(
    () =>
      computeLoyaltyCheckoutPricing({
        cart: cart.map(({ name, price, quantity, description }) => ({
          name,
          price,
          quantity,
          description,
        })),
        deliveryFee: appliedDeliveryFee,
        useTenPercent: useTenPercentReward,
        useFreeDrink: useFreeDrinkReward,
      }),
    [cart, appliedDeliveryFee, useTenPercentReward, useFreeDrinkReward]
  );

  const orderTotal = loyaltyPricing.orderTotal;

  const BANK_DETAILS = {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME ?? "ANZ",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "STLL HAUS",
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "0000 0000",
    reference: "STLL ORDER",
  };

  const handleOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setProofError("");
    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("customerName") as string;
    const pickupLocation = String(formData.get("pickupLocation") ?? "").trim();
    const notes = formData.get("notes") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const contactInstagram = formData.get("contactInstagram") as string;
    const contactEmail = formData.get("contactEmail") as string;
    let trimmedDeliveryAddress = "";
    if (!contactPhone || contactPhone.trim() === "") {
      setError("Phone number is required for order updates.");
      setIsLoading(false);
      return;
    }
    if (!contactEmail || contactEmail.trim() === "") {
      setError("Email is required for order confirmation and updates.");
      setIsLoading(false);
      return;
    }
    const dateStr = pickupDate.trim();
    const clockStr = pickupClock.trim();
    if (!dateStr || !clockStr) {
      setError("Please choose both a date and a time for pickup or delivery.");
      setIsLoading(false);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      setError("Please choose a valid date.");
      setIsLoading(false);
      return;
    }
    const clockParts = clockStr.split(":");
    if (clockParts.length < 2) {
      setError("Please choose a valid time.");
      setIsLoading(false);
      return;
    }
    const h = parseInt(clockParts[0] ?? "", 10);
    const mi = parseInt(clockParts[1] ?? "", 10);
    if (!Number.isFinite(h) || !Number.isFinite(mi) || h < 0 || h > 23 || mi < 0 || mi > 59) {
      setError("Please choose a valid time.");
      setIsLoading(false);
      return;
    }
    const pickupTimeTrimmed = `${dateStr}T${pad2(h)}:${pad2(mi)}`;
    const slotMs = Date.parse(pickupTimeTrimmed);
    if (Number.isNaN(slotMs)) {
      setError("That date and time could not be read. Please pick again.");
      setIsLoading(false);
      return;
    }
    const nowMs = Date.now();
    if (slotMs < nowMs - 90_000) {
      setError("Choose a time at least a few minutes from now.");
      setIsLoading(false);
      return;
    }
    if (orderingStatus && !canPlaceOrder) {
      setError(orderingStatus.message);
      setIsLoading(false);
      return;
    }
    if (orderingStatus?.isPreOrderOnly && orderingStatus.nextOpenAt) {
      const minMs = Date.parse(orderingStatus.nextOpenAt);
      if (!Number.isNaN(minMs) && slotMs < minMs - 60_000) {
        setError(
          `Pre-orders must be for ${orderingStatus.opensAtLabel ?? "when we open"} or later.`
        );
        setIsLoading(false);
        return;
      }
    }
    if (slotMs > nowMs + PICKUP_MAX_DAYS_AHEAD * 86400000) {
      setError(`Please choose a time within the next ${PICKUP_MAX_DAYS_AHEAD} days.`);
      setIsLoading(false);
      return;
    }
    if (fulfillment === "pickup") {
      if (!isPickupLocationId(pickupLocation)) {
        setError("Please choose where you will pick up your order.");
        setIsLoading(false);
        return;
      }
    } else {
      if (!deliveryEligible) {
        setError("Delivery needs at least 4 items in your cart.");
        setIsLoading(false);
        return;
      }
      const routingLine = deliveryGeocodeLine(deliveryAddrFields()).trim();
      if (!deliveryStreet.trim() || !deliverySuburb.trim() || !deliveryCity.trim()) {
        setError("Please fill in street, suburb, and city for delivery.");
        setIsLoading(false);
        return;
      }
      if (routingLine.length < 12) {
        setError("Please add more detail to your delivery address.");
        setIsLoading(false);
        return;
      }
      trimmedDeliveryAddress = routingLine;
    }

    if (paymentMethod === "bank_transfer" && !proofFile) {
      setProofError("Please upload proof of payment for bank transfer.");
      setIsLoading(false);
      if (proofInputRef.current) proofInputRef.current.focus();
      return;
    }

    let notesForOrder = (notes as string) || "";
    if (fulfillment === "delivery" && deliveryInstructions.trim()) {
      const dLine = `Delivery instructions: ${deliveryInstructions.trim()}`;
      notesForOrder = notesForOrder ? `${notesForOrder}\n\n${dLine}` : dLine;
    }

    const cartLines = cart.map(({ name, quantity, price, description }) => ({
      name,
      quantity,
      price,
      description: description?.trim() || "",
    }));
    const checkoutItems = [...cartLines, ...loyaltyPricing.discountLines];

    if (loyaltyPricing.loyaltyDiscount > 0) {
      const loyaltyNote = [
        useTenPercentReward && "10% off milestone reward applied",
        useFreeDrinkReward && "Free drink milestone reward applied",
      ]
        .filter(Boolean)
        .join("; ");
      notesForOrder = notesForOrder ? `${notesForOrder}\n\n${loyaltyNote}` : loyaltyNote;
    }

    try {
      const form = new FormData();
      form.append("customerName", customerName);
      form.append("pickupTime", pickupTimeTrimmed);
      form.append("fulfillment", fulfillment);
      if (fulfillment === "pickup") {
        form.append("pickupLocation", pickupLocation);
      }
      if (fulfillment === "delivery") {
        form.append("deliveryAddress", trimmedDeliveryAddress);
        form.append("deliveryTier", deliveryTier);
      }
      form.append("notes", notesForOrder);
      form.append("contactPhone", contactPhone);
      form.append("contactInstagram", contactInstagram);
      form.append("contactEmail", contactEmail);
      form.append("paymentMethod", paymentMethod);
      form.append("items", JSON.stringify(checkoutItems));
      if (paymentMethod === "bank_transfer" && proofFile) {
        form.append("proof", proofFile);
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        if (res.status === 400 && errBody.error === "invalid_pickup_location") {
          setError("Please choose a valid pickup location.");
          setIsLoading(false);
          return;
        }
        if (res.status === 400 && errBody.error === "delivery_cart_minimum") {
          setError("Delivery is only available when you have at least 4 items in your cart.");
          setIsLoading(false);
          return;
        }
        if (res.status === 400 && errBody.error === "invalid_delivery_address") {
          setError("Please enter a valid delivery address.");
          setIsLoading(false);
          return;
        }
        if (res.status === 400 && errBody.error === "invalid_pickup_time") {
          setError(
            typeof errBody.detail === "string" && errBody.detail.trim()
              ? errBody.detail.trim()
              : "Please choose a valid pickup or delivery date and time."
          );
          setIsLoading(false);
          return;
        }
        if (res.status === 403 && errBody.error === "ordering_closed") {
          setError(
            typeof errBody.detail === "string" && errBody.detail.trim()
              ? errBody.detail.trim()
              : "We are not accepting orders right now."
          );
          setIsLoading(false);
          return;
        }
        if (res.status === 400 && errBody.error === "invalid_delivery_tier") {
          setError("Please choose a delivery distance option.");
          setIsLoading(false);
          return;
        }
        if (res.status === 400 && errBody.error === "delivery_distance_failed") {
          setError(
            typeof errBody.detail === "string" && errBody.detail.trim()
              ? errBody.detail.trim()
              : "We could not confirm driving distance. Check the address or try pickup."
          );
          setIsLoading(false);
          return;
        }
        if (res.status === 400 && errBody.error === "delivery_out_of_range") {
          setError(
            typeof errBody.detail === "string" && errBody.detail.trim()
              ? errBody.detail.trim()
              : "That address is outside our delivery range."
          );
          setIsLoading(false);
          return;
        }
        const rawDetail = typeof errBody.detail === "string" ? errBody.detail.trim() : "";
        const detailShort =
          rawDetail.length > 180 ? `${rawDetail.slice(0, 180)}…` : rawDetail;
        const hint = detailShort ? ` (${detailShort})` : "";
        setError(
          res.status === 500
            ? `Order could not be completed.${hint || " Check the terminal or Resend logs."}`
            : `Something went wrong (${res.status}).${hint}`
        );
        setIsLoading(false);
        return;
      }
      const data = (await res.json()) as { orderId?: string };
      try {
        const snapshotItems = [...checkoutItems];
        if (fulfillment === "delivery" && deliveryEligible) {
          snapshotItems.push({
            name: deliveryLineItemName(deliveryTier),
            quantity: 1,
            price: appliedDeliveryFee,
            description: "",
          });
        }
        const displayForSnap = deliveryDisplayAddress(deliveryAddrFields()).trim();
        const snapDeliveryAddr =
          fulfillment === "delivery"
            ? deliveryInstructions.trim()
              ? `${displayForSnap}\n\nDelivery instructions: ${deliveryInstructions.trim()}`
              : displayForSnap
            : undefined;
        const snapshot = {
          customerEmail: contactEmail.trim(),
          customerName: (customerName as string).trim(),
          contactPhone: contactPhone.trim(),
          contactInstagram: (contactInstagram as string)?.trim() || "",
          items: snapshotItems,
          total: orderTotal,
          pickupTime: pickupTimeTrimmed,
          fulfillment: fulfillment === "delivery" ? ("delivery" as const) : ("pickup" as const),
          pickupLocationId:
            fulfillment === "pickup" && isPickupLocationId(pickupLocation) ? pickupLocation : undefined,
          deliveryAddress: snapDeliveryAddr,
          deliveryTier: fulfillment === "delivery" ? deliveryTier : undefined,
          paymentMethod,
          orderId: data.orderId,
          notes: notesForOrder,
          loyaltyRedemptions:
            useTenPercentReward || useFreeDrinkReward
              ? {
                  ...(useTenPercentReward && tenPercentReward
                    ? { tenPercentRewardId: tenPercentReward.id }
                    : {}),
                  ...(useFreeDrinkReward && freeDrinkReward
                    ? { freeDrinkRewardId: freeDrinkReward.id }
                    : {}),
                }
              : undefined,
        };
        sessionStorage.setItem("stll-last-order", JSON.stringify(snapshot));
      } catch {
        /* ignore */
      }
      clearCart();
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
            href="/menu"
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
        <OrderingStatusBanner status={orderingStatus} className="mb-8" />

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
          {!deliveryEligible && (
            <p className="text-[10px] text-stll-muted mt-6 tracking-wide leading-relaxed max-w-xl">
              Delivery unlocks when your cart has at least {MIN_CART_UNITS_FOR_DELIVERY} items (you have {cartCount}).
            </p>
          )}
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
                placeholder="Email (for order confirmation and updates)"
                required
                className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
              />
            </div>
            <p className="text-[10px] text-stll-muted/70 mt-1">
              Phone number and email are required. We&apos;ll email your order confirmation right away.
            </p>
          </div>

          {/* Pickup vs delivery */}
          {deliveryEligible && (
            <fieldset className="min-w-0 border-0 p-0 m-0">
              <legend className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-3">
                Pickup or delivery
              </legend>
              <div className="flex flex-col sm:flex-row gap-3">
                {(
                  [
                    { value: "pickup" as const, label: "Pickup" },
                    { value: "delivery" as const, label: "Delivery" },
                  ] as const
                ).map(({ value, label }) => (
                  <label key={value} className="cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="fulfillmentChoice"
                      checked={fulfillment === value}
                      onChange={() => setFulfillment(value)}
                      className="sr-only peer"
                    />
                    <span className="block border border-stll-charcoal/25 px-4 py-3 text-center text-[11px] tracking-[0.2em] uppercase text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Pickup / delivery time */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-1">
              {fulfillment === "delivery" ? "Delivery time" : "Pickup time"}
            </p>
            <p className="text-[10px] text-stll-muted/80 mb-3 leading-relaxed">
              {orderingStatus?.isPreOrderOnly
                ? `Pre-order: choose pickup or delivery at or after we open (${orderingStatus.opensAtLabel ?? "see hours above"}).`
                : "Choose a date and a time separately (your device's local timezone)."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <div>
                <label
                  htmlFor="checkout-pickup-date"
                  className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5"
                >
                  Date
                </label>
                <input
                  id="checkout-pickup-date"
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={orderingStatus?.isPreOrderOnly ? preOrderMinDate : toDateOnly(new Date())}
                  max={toDateOnly(new Date(Date.now() + PICKUP_MAX_DAYS_AHEAD * 86400000))}
                  className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.08em] text-stll-charcoal focus:outline-none focus:border-stll-charcoal"
                />
              </div>
              <div>
                <label
                  htmlFor="checkout-pickup-clock"
                  className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5"
                >
                  Time
                </label>
                <input
                  id="checkout-pickup-clock"
                  type="time"
                  required
                  value={pickupClock}
                  onChange={(e) => setPickupClock(e.target.value)}
                  step={60}
                  className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.08em] text-stll-charcoal focus:outline-none focus:border-stll-charcoal"
                />
              </div>
            </div>
          </div>

          {/* Pickup location */}
          {fulfillment === "pickup" && (
            <fieldset className="min-w-0 border-0 p-0 m-0">
              <legend className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-3">
                Pickup location <span className="text-red-400">*</span>
              </legend>
              <div className="flex flex-col gap-3">
                {pickupLocationOptionsForForm().map((opt, index) => (
                  <label key={opt.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="pickupLocation"
                      value={opt.id}
                      required
                      defaultChecked={index === 0}
                      className="sr-only peer"
                    />
                    <span className="block border border-stll-charcoal/25 px-4 py-3 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      <span className="block text-[11px] tracking-[0.12em] leading-snug">{opt.title}</span>
                      {opt.detail && (
                        <span className="mt-2 block text-[11px] leading-relaxed opacity-90">
                          {opt.detail}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Delivery address & fee */}
          {fulfillment === "delivery" && deliveryEligible && (
            <div className="flex flex-col gap-4 border border-stll-charcoal/10 p-5">
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted">Delivery address</p>
              <p className="text-[11px] text-stll-muted leading-relaxed">{DELIVERY_SERVICE_AREA_NOTE}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5">
                    Unit / flat / building <span className="text-stll-muted/60 font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="address-line2"
                    value={deliveryUnit}
                    onChange={(e) => {
                      setDeliveryUnit(e.target.value);
                    }}
                    placeholder="e.g. Unit 3, Shop 2"
                    className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5">
                    Street number &amp; name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="street-address"
                    value={deliveryStreet}
                    onChange={(e) => {
                      setDeliveryStreet(e.target.value);
                    }}
                    placeholder="e.g. 52 Wills Road"
                    className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5">
                    Suburb <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={deliverySuburb}
                    onChange={(e) => {
                      setDeliverySuburb(e.target.value);
                    }}
                    placeholder="e.g. Bell Block"
                    className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5">
                    City / town <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="address-level1"
                    value={deliveryCity}
                    onChange={(e) => {
                      setDeliveryCity(e.target.value);
                    }}
                    placeholder="New Plymouth"
                    className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
                  />
                </div>
                <div className="sm:col-span-2 sm:max-w-[12rem]">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5">
                    Postcode <span className="text-stll-muted/60 font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={deliveryPostcode}
                    onChange={(e) => {
                      setDeliveryPostcode(e.target.value);
                    }}
                    placeholder="4310"
                    className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5">
                    Delivery instructions <span className="text-stll-muted/60 font-normal normal-case">(optional)</span>
                  </label>
                  <p className="text-[10px] text-stll-muted/80 mb-1.5 leading-relaxed">
                    Gate codes, where to leave the order, etc. These are added to your order notes for the driver.
                  </p>
                  <textarea
                    rows={2}
                    value={deliveryInstructions}
                    onChange={(e) => {
                      setDeliveryInstructions(e.target.value);
                    }}
                    placeholder="e.g. Ring the side bell. Leave by the back door."
                    className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal resize-none"
                  />
                </div>
              </div>
              <fieldset className="min-w-0 border-0 p-0 m-0">
                <legend className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-3">
                  Delivery area <span className="text-red-400">*</span>
                </legend>
                <p className="text-[10px] text-stll-muted/80 mb-3 leading-relaxed">
                  Choose the option that matches your address. Delivery is free around Bell Block; $4 for Waitara and
                  through to the New Plymouth CBD; $6 further from the CBD (for example Westown or Taranaki Base
                  Hospital).
                </p>
                <div className="flex flex-col gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryTierChoice"
                      checked={deliveryTier === "bell_block"}
                      onChange={() => setDeliveryTier("bell_block")}
                      className="sr-only peer"
                    />
                    <span className="block border border-stll-charcoal/25 px-4 py-3 text-[11px] tracking-[0.08em] text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      Around Bell Block - <span className="font-semibold">Free</span> delivery
                    </span>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryTierChoice"
                      checked={deliveryTier === "within_7km"}
                      onChange={() => setDeliveryTier("within_7km")}
                      className="sr-only peer"
                    />
                    <span className="block border border-stll-charcoal/25 px-4 py-3 text-[11px] tracking-[0.08em] text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      Waitara &amp; New Plymouth CBD - <span className="font-semibold">$4.00</span> delivery
                    </span>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryTierChoice"
                      checked={deliveryTier === "over_7km"}
                      onChange={() => setDeliveryTier("over_7km")}
                      className="sr-only peer"
                    />
                    <span className="block border border-stll-charcoal/25 px-4 py-3 text-[11px] tracking-[0.08em] text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      Further from the CBD (e.g. Westown, Taranaki Base) -{" "}
                      <span className="font-semibold">$6.00</span> delivery
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>
          )}

          {loyaltyAuthChecked &&
            (tenPercentReward || freeDrinkReward ? (
              <LoyaltyRewardsCheckout
                tenPercentReward={tenPercentReward}
                freeDrinkReward={freeDrinkReward}
                tenPercentChoice={tenPercentChoice}
                freeDrinkChoice={freeDrinkChoice}
                onTenPercentChoiceChange={setTenPercentChoice}
                onFreeDrinkChoiceChange={setFreeDrinkChoice}
                freeDrinkBlocked={cart.length === 0}
                loyaltyDiscountPreview={loyaltyPricing.loyaltyDiscount}
              />
            ) : !isSignedIn ? (
              <LoyaltyRewardsSignInPrompt />
            ) : null)}

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
                {
                  value: "cash",
                  label:
                    fulfillment === "delivery" ? "CASH / EFTPOS on delivery" : "CASH / EFTPOS at pickup",
                },
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
            <p className="mt-3 text-[11px] text-stll-muted leading-relaxed max-w-xl">
              Note: Paywave (tap to pay) has a surcharge — we&apos;ll confirm the amount when you{" "}
              {fulfillment === "delivery" ? "receive your order" : "pick up"}.
            </p>
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

          {/* Total + actions */}
          <div className="border-t border-stll-charcoal/10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-lg font-black uppercase tracking-tight text-stll-charcoal space-y-1">
              <p className="text-[11px] font-normal tracking-[0.15em] text-stll-muted">
                Subtotal: ${loyaltyPricing.cartSubtotal.toFixed(2)}
              </p>
              {loyaltyPricing.loyaltyDiscount > 0 && (
                <p className="text-[11px] font-normal tracking-[0.15em] text-stll-muted">
                  Loyalty rewards: −${loyaltyPricing.loyaltyDiscount.toFixed(2)}
                </p>
              )}
              {fulfillment === "delivery" && deliveryEligible && appliedDeliveryFee > 0 && (
                <p className="text-[11px] font-normal tracking-[0.15em] text-stll-muted">
                  Delivery: ${appliedDeliveryFee.toFixed(2)}
                </p>
              )}
              <p>Total: ${orderTotal.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => clearCart()}
                className="px-6 py-3 text-[11px] tracking-[0.3em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isLoading || !canPlaceOrder}
                className="px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading
                  ? "Placing..."
                  : orderingStatus?.isPreOrderOnly
                    ? "Place pre-order"
                    : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}