import { createClient } from "@/lib/supabase/server";
import { parseOrderHistory } from "@/lib/order-history";
import { parseRewardHistory } from "@/lib/reward-history";
import {
  getLoyaltyTier,
  getNextTierTarget,
  getPurchaseRewardsStatus,
  getTierBenefits,
  type LoyaltyTier,
} from "@/lib/loyalty";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "./SignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const email = user.email ?? "your account";
  const metadata = user.user_metadata ?? {};
  const displayName =
    String(metadata.full_name ?? "").trim() ||
    (email.includes("@") ? email.split("@")[0] : email);
  const orders = parseOrderHistory(metadata.order_history);
  const rewards = parseRewardHistory(metadata.reward_history);
  const totalPoints = Number(metadata.loyalty_points ?? 0) || 0;
  const totalPurchases = Number(metadata.loyalty_total_purchases ?? 0) || 0;
  const totalSpent = Number(metadata.loyalty_total_spent ?? 0) || 0;
  const tierFromMetadata = String(metadata.loyalty_tier ?? "").toLowerCase();
  const tier =
    tierFromMetadata === "gold" ||
    tierFromMetadata === "silver" ||
    tierFromMetadata === "bronze"
      ? (tierFromMetadata as LoyaltyTier)
      : getLoyaltyTier(totalPoints);
  const nextTarget = getNextTierTarget(totalPoints);
  const pointsToNext = nextTarget ? Math.max(0, nextTarget - totalPoints) : 0;
  const benefits = getTierBenefits(tier);
  const rewardStatus = getPurchaseRewardsStatus(totalPurchases);

  return (
    <div className="min-h-[70vh] px-6 sm:px-12 lg:px-20 py-24 max-w-2xl mx-auto">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Account</p>
      <h1 className="text-3xl font-black uppercase tracking-tight text-stll-charcoal mb-2">
        Welcome back{displayName ? `, ${displayName}` : ""}
      </h1>
      <p className="text-sm text-stll-muted mb-10">{email}</p>

      <section className="border border-stll-charcoal/15 p-6 mb-8 bg-white/60">
        <h2 className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-3">Loyalty</h2>
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-stll-charcoal leading-none">{totalPoints}</p>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mt-1">Total points</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold uppercase tracking-tight text-stll-charcoal">{tier}</p>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mt-1">Current tier</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-stll-charcoal/10 pt-4">
            <div>
              <p className="text-xl font-semibold text-stll-charcoal">{totalPurchases}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted">Purchases</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-stll-charcoal">${totalSpent.toFixed(2)}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted">Total spend</p>
            </div>
          </div>

          {nextTarget ? (
            <p className="text-sm text-stll-charcoal">
              {pointsToNext} points until <span className="font-semibold">{nextTarget === 250 ? "Silver" : "Gold"}</span>.
            </p>
          ) : (
            <p className="text-sm text-stll-charcoal">You&apos;re at the top tier. Thank you for being a loyal regular.</p>
          )}

          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Benefits</p>
            <ul className="space-y-1">
              {benefits.map((benefit) => (
                <li key={benefit} className="text-sm text-stll-charcoal">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-stll-charcoal/10 pt-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Order Rewards</p>
            <p className="text-sm text-stll-charcoal mb-1">
              5th order: <span className="font-semibold">10% off</span> · 10th order:{" "}
              <span className="font-semibold">Free drink</span>
            </p>
            {rewardStatus.tenPercentAvailable && (
              <p className="text-sm text-stll-charcoal">You can claim your <span className="font-semibold">10% off</span> now.</p>
            )}
            {rewardStatus.freeDrinkAvailable && (
              <p className="text-sm text-stll-charcoal">You can claim your <span className="font-semibold">free drink</span> now.</p>
            )}
            {!rewardStatus.tenPercentAvailable && !rewardStatus.freeDrinkAvailable && (
              <p className="text-sm text-stll-charcoal">
                Next: {rewardStatus.ordersUntilTenPercent} order
                {rewardStatus.ordersUntilTenPercent === 1 ? "" : "s"} until 10% off, then{" "}
                {rewardStatus.ordersUntilFreeDrink} order
                {rewardStatus.ordersUntilFreeDrink === 1 ? "" : "s"} until free drink.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="border border-stll-charcoal/15 p-6 mb-8 bg-white/60">
        <h2 className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-4">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-stll-muted leading-relaxed">
            No orders linked yet. Place an order while signed in — it will show up here with your points.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-stll-charcoal/10">
            {orders.map((order) => (
              <li key={order.id} className="py-4 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-stll-charcoal">
                    ${order.total.toFixed(2)}
                  </p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted">
                    {new Date(order.placedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                {order.summary && (
                  <p className="text-xs text-stll-muted mt-2 leading-relaxed">{order.summary}</p>
                )}
                {(order.pickupTime || order.paymentMethod) && (
                  <p className="text-[10px] text-stll-muted/80 mt-2 tracking-wide">
                    {[order.pickupTime, order.paymentMethod].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-stll-charcoal/15 p-6 mb-8 bg-white/60">
        <h2 className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-4">Reward history</h2>
        {rewards.length === 0 ? (
          <p className="text-sm text-stll-muted leading-relaxed">
            No rewards recorded yet. Once you hit milestones, earned and redeemed rewards will appear here.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-stll-charcoal/10">
            {rewards.map((reward) => {
              const rewardLabel = reward.rewardType === "free_drink" ? "Free drink" : "10% off";
              const sourceLabel = reward.source === "gold_retention" ? "Gold retention" : "Order milestone";
              return (
                <li key={reward.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-stll-charcoal">{rewardLabel}</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted">
                      {new Date(reward.awardedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <p className="text-xs text-stll-muted mt-1 leading-relaxed">
                    Status: <span className="uppercase">{reward.status}</span> · {sourceLabel} · Awarded at order #
                    {reward.orderCountAtAward}
                  </p>
                  {reward.redeemedAt && (
                    <p className="text-[10px] text-stll-muted/80 mt-2 tracking-wide">
                      Redeemed:{" "}
                      {new Date(reward.redeemedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-4">
        <SignOutButton />
        <Link
          href="/menu"
          className="inline-flex items-center text-[11px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal border border-transparent hover:border-stll-charcoal/20 px-4 py-2"
        >
          Browse menu
        </Link>
      </div>
    </div>
  );
}
