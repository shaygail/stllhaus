export const POINTS_PER_DOLLAR = 10;

export type LoyaltyTier = "bronze" | "silver" | "gold";

export function getLoyaltyTier(points: number): LoyaltyTier {
  if (points >= 500) return "gold";
  if (points >= 250) return "silver";
  return "bronze";
}

export function getNextTierTarget(points: number): number | null {
  if (points >= 500) return null;
  if (points >= 250) return 500;
  return 250;
}

export function getTierBenefits(tier: LoyaltyTier): string[] {
  if (tier === "gold") {
    return [
      "20% member discount on drinks",
      "Free drink every 5 purchases",
      "Early access to seasonal menu drops",
    ];
  }
  if (tier === "silver") {
    return [
      "10% member discount on drinks",
      "Member-only offers and promos",
      "Faster path to gold rewards",
    ];
  }
  return [
    "Earn 10 points per $1 spent",
    "Track progress toward Silver and Gold",
    "Member-only loyalty dashboard",
  ];
}
