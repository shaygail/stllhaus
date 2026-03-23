"use client";

import { useLoyalty } from "@/components/LoyaltyContext";

export function LoyaltyCardDisplay() {
  const { card, getPointsUntilNextTier, getTierBenefits } = useLoyalty();

  if (!card) {
    return (
      <div className="border-t border-stll-charcoal/10 pt-10">
        <p className="text-sm text-stll-muted/60">
          Sign in or make your first purchase to activate your loyalty card.
        </p>
      </div>
    );
  }

  const pointsUntilNextTier = getPointsUntilNextTier();
  const benefits = getTierBenefits();

  const progressPercent =
    card.tier === "bronze"
      ? ((250 - pointsUntilNextTier) / 250) * 100
      : card.tier === "silver"
      ? ((250 - pointsUntilNextTier) / 250) * 100
      : 100;

  return (
    <div className="space-y-12">
      {/* Card */}
      <div className="bg-stll-charcoal text-white p-8 sm:p-10">
        <div className="flex items-start justify-between mb-12">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/40 mb-2">STLL HAUS</p>
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/40">Loyalty Card</p>
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">{card.tier}</p>
        </div>

        <div>
          <p className="text-2xl sm:text-3xl font-black uppercase tracking-tight">{card.name}</p>
          <p className="text-[10px] tracking-[0.2em] text-white/35 mt-1">{card.customerId}</p>
        </div>

        <div className="mt-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-1">Points</p>
            <p className="text-4xl font-black">{card.totalPoints}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-1">Member Since</p>
            <p className="text-xs text-white/60">{new Date(card.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {pointsUntilNextTier > 0 && (
          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40">
                {pointsUntilNextTier} pts to {card.tier === "bronze" ? "Silver" : "Gold"}
              </p>
            </div>
            <div className="h-px bg-white/15">
              <div
                className="h-px bg-white transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-stll-charcoal/10">
        {[
          { label: "Total Spent", value: `$${card.totalSpent.toFixed(2)}` },
          { label: "Purchases", value: card.totalPurchases },
          { label: "Tier", value: card.tier.charAt(0).toUpperCase() + card.tier.slice(1) },
        ].map(({ label, value }) => (
          <div key={label} className="pt-6 pr-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted/50 mb-1">{label}</p>
            <p className="text-sm text-stll-charcoal font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="border-t border-stll-charcoal/10 pt-10">
        <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold mb-6">
          {card.tier} Benefits
        </h2>
        <ul className="space-y-3">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-4">
              <span className="text-[10px] text-stll-muted/40 pt-0.5">—</span>
              <span className="text-sm text-stll-muted leading-relaxed">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {card.lastPurchase && (
        <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted/40">
          Last purchase: {new Date(card.lastPurchase).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
