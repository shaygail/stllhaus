"use client";

import type { LoyaltyRewardChoice } from "@/lib/loyalty-checkout";
import type { RewardHistoryEntry } from "@/lib/reward-history";
import Link from "next/link";

function RewardChoiceGroup({
  id,
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  description: string;
  value: LoyaltyRewardChoice;
  onChange: (next: LoyaltyRewardChoice) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="border border-stll-charcoal/10 p-5" disabled={disabled}>
      <legend className="text-[10px] tracking-[0.25em] uppercase text-stll-muted px-1">{label}</legend>
      <p className="text-[11px] text-stll-charcoal/90 leading-relaxed mt-2 mb-4">{description}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {(
          [
            { choice: "use" as const, text: "Use on this order" },
            { choice: "keep" as const, text: "Save for later" },
          ] as const
        ).map(({ choice, text }) => (
          <label key={choice} className="cursor-pointer flex-1">
            <input
              type="radio"
              name={id}
              checked={value === choice}
              onChange={() => onChange(choice)}
              className="sr-only peer"
            />
            <span className="block px-4 py-3 text-[11px] tracking-[0.12em] text-center border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
              {text}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function LoyaltyRewardsCheckout({
  tenPercentReward,
  freeDrinkReward,
  tenPercentChoice,
  freeDrinkChoice,
  onTenPercentChoiceChange,
  onFreeDrinkChoiceChange,
  freeDrinkBlocked,
  loyaltyDiscountPreview,
}: {
  tenPercentReward: RewardHistoryEntry | null;
  freeDrinkReward: RewardHistoryEntry | null;
  tenPercentChoice: LoyaltyRewardChoice;
  freeDrinkChoice: LoyaltyRewardChoice;
  onTenPercentChoiceChange: (choice: LoyaltyRewardChoice) => void;
  onFreeDrinkChoiceChange: (choice: LoyaltyRewardChoice) => void;
  freeDrinkBlocked?: boolean;
  loyaltyDiscountPreview: number;
}) {
  if (!tenPercentReward && !freeDrinkReward) return null;

  return (
    <section className="border border-stll-charcoal/15 p-6 flex flex-col gap-5 bg-white/40">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-2">Loyalty rewards</p>
        <p className="text-[11px] text-stll-charcoal leading-relaxed">
          You have rewards ready to use. Choose whether to apply each one on this order or keep it for next time.
        </p>
      </div>

      {tenPercentReward && (
        <RewardChoiceGroup
          id="loyalty-ten-percent"
          label="10% off"
          description="Applies to your drink subtotal before delivery."
          value={tenPercentChoice}
          onChange={onTenPercentChoiceChange}
        />
      )}

      {freeDrinkReward && (
        <RewardChoiceGroup
          id="loyalty-free-drink"
          label="Free drink"
          description={
            freeDrinkBlocked
              ? "Add at least one drink to your cart to use this reward."
              : "Covers one drink up to the highest-priced item in your cart."
          }
          value={freeDrinkChoice}
          onChange={onFreeDrinkChoiceChange}
          disabled={freeDrinkBlocked}
        />
      )}

      {loyaltyDiscountPreview > 0 && (
        <p className="text-[11px] tracking-[0.15em] text-stll-charcoal">
          Loyalty savings on this order:{" "}
          <span className="font-semibold">−${loyaltyDiscountPreview.toFixed(2)}</span>
        </p>
      )}
    </section>
  );
}

export function LoyaltyRewardsSignInPrompt() {
  return (
    <section className="border border-stll-charcoal/10 p-5 bg-white/30">
      <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Loyalty rewards</p>
      <p className="text-[11px] text-stll-charcoal leading-relaxed">
        <Link href="/login?next=/checkout" className="underline underline-offset-2 hover:text-stll-muted">
          Sign in
        </Link>{" "}
        to use earned 10% off or free drink rewards at checkout.
      </p>
    </section>
  );
}
