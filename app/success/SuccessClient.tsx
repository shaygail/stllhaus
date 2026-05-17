"use client";

import { createClient } from "@/lib/supabase/client";
import { mergeOrderHistory, parseOrderHistory, type OrderHistoryEntry } from "@/lib/order-history";
import {
  markRewardsRedeemed,
  mergeRewardHistory,
  parseRewardHistory,
  type RewardHistoryEntry,
} from "@/lib/reward-history";
import { POINTS_PER_DOLLAR, getLoyaltyTier } from "@/lib/loyalty";
import type { DeliveryTier } from "@/lib/delivery";
import { isPickupLocationId, pickupLocationForEmail } from "@/lib/pickup-locations";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function formatOrderSlot(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

type LastOrder = {
  customerEmail: string;
  customerName: string;
  contactPhone?: string;
  contactInstagram?: string;
  items: Array<{ name: string; quantity: number; price: number; description?: string }>;
  total: number;
  pickupTime: string;
  /** Set for orders placed after pickup-location checkout shipped. */
  pickupLocationId?: string;
  fulfillment?: "pickup" | "delivery";
  deliveryAddress?: string;
  deliveryTier?: DeliveryTier;
  paymentMethod: string;
  orderId?: string;
  notes?: string;
  loyaltyRedemptions?: {
    tenPercentRewardId?: string;
    freeDrinkRewardId?: string;
  };
};

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const method = searchParams.get("method");
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [awardedPoints, setAwardedPoints] = useState<number | null>(null);
  const [awardedRewards, setAwardedRewards] = useState<RewardHistoryEntry[]>([]);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [receiptStatus, setReceiptStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [receiptError, setReceiptError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("stll-last-order");
      if (raw) {
        const parsed = JSON.parse(raw) as LastOrder;
        if (parsed?.customerEmail) {
          setLastOrder(parsed);
          setReceiptEmail(parsed.customerEmail);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!lastOrder) return;

    const awardLoyaltyPoints = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const orderFingerprint =
        lastOrder.orderId ??
        `${lastOrder.total}-${lastOrder.pickupTime}-${lastOrder.pickupLocationId ?? ""}-${lastOrder.fulfillment ?? "pickup"}-${lastOrder.deliveryAddress ?? ""}-${lastOrder.items
          .map((item) => `${item.name}:${item.quantity}`)
          .join("|")}`;
      const sessionKey = `stll-loyalty-awarded:${orderFingerprint}`;

      if (sessionStorage.getItem(sessionKey) === "1") return;

      const pointsEarned = Math.max(0, Math.floor(lastOrder.total * POINTS_PER_DOLLAR));

      const metadata = user.user_metadata ?? {};
      const currentPoints = Number(metadata.loyalty_points ?? 0) || 0;
      const currentPurchases = Number(metadata.loyalty_total_purchases ?? 0) || 0;
      const currentSpent = Number(metadata.loyalty_total_spent ?? 0) || 0;

      const nextPoints = currentPoints + pointsEarned;
      const nextSpent = currentSpent + lastOrder.total;
      const nextPurchases = currentPurchases + 1;
      const nextTier = getLoyaltyTier(nextPoints);

      const prevName = String(metadata.full_name ?? "").trim();
      const checkoutName = String(lastOrder.customerName ?? "").trim();
      const fullName = prevName || checkoutName;

      const summary = lastOrder.items
        .map((item) => `${item.quantity}× ${item.name}`)
        .slice(0, 5)
        .join(", ");

      const loc =
        lastOrder.fulfillment === "delivery"
          ? { title: "Delivery", detail: lastOrder.deliveryAddress }
          : lastOrder.pickupLocationId && isPickupLocationId(lastOrder.pickupLocationId)
            ? pickupLocationForEmail(lastOrder.pickupLocationId)
            : null;
      const entry: OrderHistoryEntry = {
        id: orderFingerprint,
        placedAt: new Date().toISOString(),
        total: lastOrder.total,
        summary,
        pickupTime: lastOrder.pickupTime,
        pickupLocationLabel: loc?.title,
        paymentMethod: lastOrder.paymentMethod,
      };

      const nextHistory = mergeOrderHistory(parseOrderHistory(metadata.order_history), entry);
      let existingRewardHistory = parseRewardHistory(metadata.reward_history);
      const rewardsAwardedNow: RewardHistoryEntry[] = [];
      const nowIso = new Date().toISOString();

      const redeemIds = [
        lastOrder.loyaltyRedemptions?.tenPercentRewardId,
        lastOrder.loyaltyRedemptions?.freeDrinkRewardId,
      ].filter((id): id is string => typeof id === "string" && id.length > 0);
      if (redeemIds.length > 0) {
        existingRewardHistory = markRewardsRedeemed(
          existingRewardHistory,
          redeemIds,
          nowIso,
          orderFingerprint
        );
      }

      if (nextPurchases % 5 === 0) {
        rewardsAwardedNow.push({
          id: `${orderFingerprint}:milestone-5`,
          rewardType: "ten_percent_off",
          status: "earned",
          source: "milestone",
          orderId: orderFingerprint,
          orderCountAtAward: nextPurchases,
          pointsAtAward: nextPoints,
          awardedAt: nowIso,
          note: "5th order reward",
        });
      }

      if (nextPurchases % 10 === 0) {
        rewardsAwardedNow.push({
          id: `${orderFingerprint}:milestone-10`,
          rewardType: "free_drink",
          status: "earned",
          source: "milestone",
          orderId: orderFingerprint,
          orderCountAtAward: nextPurchases,
          pointsAtAward: nextPoints,
          awardedAt: nowIso,
          note: "10th order reward",
        });
      }

      const nextData: Record<string, unknown> = {
        ...metadata,
        full_name: fullName || metadata.full_name,
        order_history: nextHistory,
        reward_history: mergeRewardHistory(existingRewardHistory, rewardsAwardedNow),
        loyalty_total_purchases: nextPurchases,
        loyalty_total_spent: Number(nextSpent.toFixed(2)),
      };

      if (pointsEarned > 0) {
        nextData.loyalty_points = nextPoints;
        nextData.loyalty_tier = nextTier;
        nextData.loyalty_last_awarded_order = orderFingerprint;
        nextData.loyalty_last_awarded_at = new Date().toISOString();
      }

      const { error } = await supabase.auth.updateUser({
        data: nextData,
      });

      if (!error) {
        sessionStorage.setItem(sessionKey, "1");
        if (pointsEarned > 0) setAwardedPoints(pointsEarned);
        if (rewardsAwardedNow.length > 0) setAwardedRewards(rewardsAwardedNow);
      }
    };

    void awardLoyaltyPoints();
  }, [lastOrder]);

  const handleResendReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastOrder || !receiptEmail.trim()) return;
    setReceiptStatus("loading");
    setReceiptError("");
    try {
      const res = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: receiptEmail.trim(),
          customerName: lastOrder.customerName,
          contactPhone: lastOrder.contactPhone,
          contactInstagram: lastOrder.contactInstagram,
          items: lastOrder.items,
          total: lastOrder.total,
          pickupTime: lastOrder.pickupTime,
          pickupLocationId: lastOrder.pickupLocationId,
          fulfillment: lastOrder.fulfillment,
          deliveryAddress: lastOrder.deliveryAddress,
          paymentMethod: lastOrder.paymentMethod,
          orderId: lastOrder.orderId,
          notes: lastOrder.notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Could not send confirmation");
      }
      setReceiptStatus("sent");
    } catch (err) {
      setReceiptStatus("error");
      setReceiptError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const paymentLabel =
    method === "cash"
      ? lastOrder?.fulfillment === "delivery"
        ? "CASH / EFTPOS on delivery"
        : "CASH / EFTPOS at pickup"
      : method === "bank_transfer"
        ? "Bank transfer"
        : null;

  const resolvedPickupLocation =
    lastOrder?.fulfillment === "delivery"
      ? lastOrder.deliveryAddress
        ? { title: "Delivery", detail: `Address:\n${lastOrder.deliveryAddress}` }
        : { title: "Delivery", detail: undefined }
      : lastOrder?.pickupLocationId && isPickupLocationId(lastOrder.pickupLocationId)
        ? pickupLocationForEmail(lastOrder.pickupLocationId)
        : null;

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <div className="pt-32 pb-16 px-6 sm:px-12 lg:px-20 border-b border-stll-charcoal/10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-4">Stll Haus</p>
        <h1 className="text-[4rem] sm:text-[6rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          Thank you for your order
        </h1>
      </div>

      <div className="px-6 sm:px-12 lg:px-20 pt-16 pb-24 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-stll-charcoal tracking-tight mb-4">
          Your order has been received
        </h2>
        <p className="text-sm text-stll-charcoal/90 leading-relaxed mb-6 max-w-xl">
          A confirmation email with your order details was sent to your inbox. We&apos;ll email you again when your
          order is ready for pickup or heading out for delivery.
        </p>
        {paymentLabel && (
          <p className="text-[11px] tracking-[0.2em] uppercase text-stll-muted mb-8">{paymentLabel}</p>
        )}

        {resolvedPickupLocation && lastOrder && (
          <div className="mb-10 border border-stll-charcoal/10 p-5 max-w-xl">
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">
              {lastOrder.fulfillment === "delivery" ? "Delivery" : "Pickup"}
            </p>
            <p className="text-sm text-stll-charcoal font-medium leading-snug">{resolvedPickupLocation.title}</p>
            <p className="text-xs text-stll-muted mt-2 leading-relaxed">
              <span className="text-stll-charcoal/90">When: </span>
              {formatOrderSlot(lastOrder.pickupTime)}
            </p>
            {resolvedPickupLocation.detail && (
              <p className="text-xs text-stll-muted mt-3 leading-relaxed border-t border-stll-charcoal/10 pt-3 whitespace-pre-line">
                {resolvedPickupLocation.detail}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-10 xl:gap-16">
          <div className="min-w-0 flex-1 lg:max-w-xl">
            <p className="text-sm text-stll-charcoal/90 mb-2 leading-relaxed">
              We&apos;ll have it ready soon.
            </p>
            <p className="text-sm text-stll-muted mb-12 leading-relaxed">
              Check your email for the order confirmation. We&apos;ll notify you when it&apos;s ready.
            </p>
            {awardedPoints !== null && (
              <p className="text-sm text-stll-charcoal mb-8 leading-relaxed">
                Loyalty updated: <span className="font-semibold">+{awardedPoints} points</span> added to your account.
              </p>
            )}
            {awardedRewards.length > 0 && (
              <div className="mb-8">
                {awardedRewards.map((reward) => (
                  <p key={reward.id} className="text-sm text-stll-charcoal leading-relaxed">
                    Reward earned:{" "}
                    <span className="font-semibold">
                      {reward.rewardType === "free_drink" ? "Free drink" : "10% off"}
                    </span>{" "}
                    added to your account history.
                  </p>
                ))}
              </div>
            )}

            {lastOrder && (
              <section className="mb-12 border border-stll-charcoal/10 p-6 sm:p-8">
                <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-3">Confirmation email</p>
                <p className="text-[11px] tracking-widest text-stll-charcoal mb-6 leading-relaxed">
                  Didn&apos;t get it? Resend your order confirmation to any address below.
                </p>
                {receiptStatus === "sent" ? (
                  <p className="text-sm text-stll-charcoal">Confirmation sent. Check your inbox.</p>
                ) : (
                  <form onSubmit={handleResendReceipt} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1 min-w-0">
                      <label htmlFor="receipt-email" className="block text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">
                        Email
                      </label>
                      <input
                        id="receipt-email"
                        type="email"
                        value={receiptEmail}
                        onChange={(e) => setReceiptEmail(e.target.value)}
                        required
                        className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-widest text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
                        placeholder="you@email.com"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={receiptStatus === "loading"}
                      className="shrink-0 px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {receiptStatus === "loading" ? "Sending…" : "Resend confirmation"}
                    </button>
                  </form>
                )}
                {receiptError && <p className="text-xs text-red-600 mt-3">{receiptError}</p>}
              </section>
            )}

            <Link
              href="/"
              className="inline-block px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white text-center cursor-pointer"
            >
              Back Home
            </Link>
          </div>

          <aside className="shrink-0 w-full lg:w-auto lg:max-w-[min(100%,420px)] pt-2 border-t border-stll-charcoal/10 lg:border-t-0 lg:pt-0">
            <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-8 text-center pt-8 lg:pt-0">
              Enjoyed your visit? Let us know!
            </p>
            <div className="flex flex-row flex-wrap justify-center gap-8 sm:gap-10 lg:gap-6">
              <div className="flex flex-col items-center gap-3 w-[120px]">
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://g.page/r/CSCrKOGMTz7VEBM/review"
                  alt="Google Review QR Code"
                  width={120}
                  height={120}
                  className="border border-stll-charcoal/10"
                />
                <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted text-center">Google Review</p>
              </div>

              <div className="flex flex-col items-center gap-3 w-[120px]">
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://www.facebook.com/stllhausco/reviews"
                  alt="Facebook Review QR Code"
                  width={120}
                  height={120}
                  className="border border-stll-charcoal/10"
                />
                <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted text-center">Facebook Review</p>
              </div>

              <div className="flex flex-col items-center gap-3 w-[120px]">
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://linktr.ee/stllhausco"
                  alt="Socials QR Code"
                  width={120}
                  height={120}
                  className="border border-stll-charcoal/10"
                />
                <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted text-center">Follow Our Socials</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
