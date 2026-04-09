export const POINTS_PER_DOLLAR = 10;
const TEN_PERCENT_MILESTONE = 5;
const FREE_DRINK_MILESTONE = 10;
const REWARD_CYCLE = 10;

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
      "10% off on every 5th order",
      "Free drink on every 10th order",
      "Early access to seasonal menu drops",
    ];
  }
  if (tier === "silver") {
    return [
      "10% member discount on drinks",
      "10% off on every 5th order",
      "Free drink on every 10th order",
      "Member-only offers and promos",
      "Faster path to Gold rewards",
    ];
  }
  return [
    "Earn 10 points per $1 spent",
    "10% off on every 5th order",
    "Free drink on every 10th order",
    "Track progress toward Silver and Gold",
    "Member-only loyalty dashboard",
  ];
}

export type PurchaseRewardsStatus = {
  currentCycleOrder: number;
  tenPercentAvailable: boolean;
  freeDrinkAvailable: boolean;
  ordersUntilTenPercent: number;
  ordersUntilFreeDrink: number;
};

export function getPurchaseRewardsStatus(totalPurchases: number): PurchaseRewardsStatus {
  const safe = Math.max(0, Math.floor(totalPurchases));
  const currentCycleOrder = safe === 0 ? 0 : ((safe - 1) % REWARD_CYCLE) + 1;

  const tenPercentAvailable = safe > 0 && currentCycleOrder === TEN_PERCENT_MILESTONE;
  const freeDrinkAvailable = safe > 0 && currentCycleOrder === FREE_DRINK_MILESTONE;

  const ordersUntilTenPercent = tenPercentAvailable
    ? 0
    : TEN_PERCENT_MILESTONE - (safe % REWARD_CYCLE) <= 0
      ? TEN_PERCENT_MILESTONE - (safe % REWARD_CYCLE) + REWARD_CYCLE
      : TEN_PERCENT_MILESTONE - (safe % REWARD_CYCLE);

  const ordersUntilFreeDrink = freeDrinkAvailable
    ? 0
    : FREE_DRINK_MILESTONE - (safe % REWARD_CYCLE) <= 0
      ? FREE_DRINK_MILESTONE - (safe % REWARD_CYCLE) + REWARD_CYCLE
      : FREE_DRINK_MILESTONE - (safe % REWARD_CYCLE);

  return {
    currentCycleOrder,
    tenPercentAvailable,
    freeDrinkAvailable,
    ordersUntilTenPercent,
    ordersUntilFreeDrink,
  };
}
