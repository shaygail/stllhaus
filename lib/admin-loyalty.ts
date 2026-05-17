import { getLoyaltyTier, type LoyaltyTier } from "@/lib/loyalty";
import { getEarnedRewardByType, parseRewardHistory } from "@/lib/reward-history";

export type AdminLoyaltyMember = {
  id: string;
  email: string | null;
  name: string;
  points: number;
  tier: LoyaltyTier;
  totalPurchases: number;
  totalSpent: number;
  earnedRewardsTotal: number;
  pendingTenPercent: boolean;
  pendingFreeDrink: boolean;
  lastAwardedAt: string | null;
  signedUpAt: string | null;
};

export type AdminLoyaltySummary = {
  registeredUsersScanned: number;
  membersReturned: number;
  withAnyLoyaltyActivity: number;
  totalPoints: number;
  totalSpent: number;
  tierCounts: { bronze: number; silver: number; gold: number };
  pendingTenPercent: number;
  pendingFreeDrink: number;
  hitCap: boolean;
  warning?: string;
};

export function loyaltyMemberFromAuthUser(user: {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}): AdminLoyaltyMember {
  const meta = user.user_metadata ?? {};
  const email = user.email?.trim() || null;
  const points = Math.max(0, Number(meta.loyalty_points ?? 0) || 0);
  const totalPurchases = Math.max(0, Math.floor(Number(meta.loyalty_total_purchases ?? 0) || 0));
  const totalSpent = Math.max(0, Number(meta.loyalty_total_spent ?? 0) || 0);
  const rewards = parseRewardHistory(meta.reward_history);
  const tierRaw = String(meta.loyalty_tier ?? "").toLowerCase();
  const tier: LoyaltyTier =
    tierRaw === "gold" || tierRaw === "silver" || tierRaw === "bronze"
      ? tierRaw
      : getLoyaltyTier(points);
  const name =
    String(meta.full_name ?? "").trim() ||
    (email?.includes("@") ? email.split("@")[0] : "Member");

  return {
    id: user.id,
    email,
    name,
    points,
    tier,
    totalPurchases,
    totalSpent,
    earnedRewardsTotal: rewards.length,
    pendingTenPercent: Boolean(getEarnedRewardByType(rewards, "ten_percent_off")),
    pendingFreeDrink: Boolean(getEarnedRewardByType(rewards, "free_drink")),
    lastAwardedAt:
      typeof meta.loyalty_last_awarded_at === "string" ? meta.loyalty_last_awarded_at : null,
    signedUpAt: user.created_at ?? null,
  };
}

export function hasLoyaltyActivity(member: AdminLoyaltyMember): boolean {
  return (
    member.points > 0 ||
    member.totalPurchases > 0 ||
    member.totalSpent > 0 ||
    member.earnedRewardsTotal > 0
  );
}

export function buildLoyaltySummary(
  members: AdminLoyaltyMember[],
  registeredUsersScanned: number,
  hitCap: boolean
): AdminLoyaltySummary {
  const withActivity = members.filter(hasLoyaltyActivity);
  const tierCounts = { bronze: 0, silver: 0, gold: 0 };
  let pendingTenPercent = 0;
  let pendingFreeDrink = 0;

  for (const m of withActivity) {
    tierCounts[m.tier] += 1;
    if (m.pendingTenPercent) pendingTenPercent += 1;
    if (m.pendingFreeDrink) pendingFreeDrink += 1;
  }

  return {
    registeredUsersScanned,
    membersReturned: members.length,
    withAnyLoyaltyActivity: withActivity.length,
    totalPoints: withActivity.reduce((s, m) => s + m.points, 0),
    totalSpent: withActivity.reduce((s, m) => s + m.totalSpent, 0),
    tierCounts,
    pendingTenPercent,
    pendingFreeDrink,
    hitCap,
    ...(hitCap
      ? {
          warning:
            "User list cap reached — counts may be incomplete. Use Supabase Dashboard for a full export.",
        }
      : {}),
  };
}

export function sortLoyaltyMembers(members: AdminLoyaltyMember[]): AdminLoyaltyMember[] {
  return [...members].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.totalPurchases !== a.totalPurchases) return b.totalPurchases - a.totalPurchases;
    return (b.email ?? "").localeCompare(a.email ?? "");
  });
}
