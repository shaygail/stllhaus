export type RewardType = "ten_percent_off" | "free_drink";
export type RewardStatus = "earned" | "redeemed" | "expired";

export type RewardHistoryEntry = {
  id: string;
  rewardType: RewardType;
  status: RewardStatus;
  source: "milestone" | "gold_retention";
  orderId?: string;
  orderCountAtAward: number;
  pointsAtAward: number;
  awardedAt: string;
  redeemedAt?: string;
  note?: string;
};

const MAX_REWARD_ENTRIES = 50;

export function parseRewardHistory(raw: unknown): RewardHistoryEntry[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((i): i is Record<string, unknown> => i !== null && typeof i === "object")
    .filter(
      (i) =>
        typeof i.id === "string" &&
        (i.rewardType === "ten_percent_off" || i.rewardType === "free_drink") &&
        (i.status === "earned" || i.status === "redeemed" || i.status === "expired") &&
        (i.source === "milestone" || i.source === "gold_retention") &&
        typeof i.orderCountAtAward === "number" &&
        typeof i.pointsAtAward === "number" &&
        typeof i.awardedAt === "string"
    )
    .map((i) => ({
      id: i.id as string,
      rewardType: i.rewardType as RewardType,
      status: i.status as RewardStatus,
      source: i.source as "milestone" | "gold_retention",
      orderId: typeof i.orderId === "string" ? i.orderId : undefined,
      orderCountAtAward: i.orderCountAtAward as number,
      pointsAtAward: i.pointsAtAward as number,
      awardedAt: i.awardedAt as string,
      redeemedAt: typeof i.redeemedAt === "string" ? i.redeemedAt : undefined,
      note: typeof i.note === "string" ? i.note : undefined,
    }));
}

export function mergeRewardHistory(
  previous: RewardHistoryEntry[],
  entries: RewardHistoryEntry[]
): RewardHistoryEntry[] {
  if (entries.length === 0) return previous.slice(0, MAX_REWARD_ENTRIES);

  const byId = new Map<string, RewardHistoryEntry>();
  for (const entry of previous) byId.set(entry.id, entry);
  for (const entry of entries) byId.set(entry.id, entry);

  return Array.from(byId.values())
    .sort((a, b) => +new Date(b.awardedAt) - +new Date(a.awardedAt))
    .slice(0, MAX_REWARD_ENTRIES);
}

/** Unredeemed rewards the member can apply at checkout. */
export function getEarnedRewards(history: RewardHistoryEntry[]): RewardHistoryEntry[] {
  return history
    .filter((r) => r.status === "earned")
    .sort((a, b) => +new Date(a.awardedAt) - +new Date(b.awardedAt));
}

/** Oldest earned reward of a type (FIFO). */
export function getEarnedRewardByType(
  history: RewardHistoryEntry[],
  rewardType: RewardType
): RewardHistoryEntry | undefined {
  return getEarnedRewards(history).find((r) => r.rewardType === rewardType);
}

export function markRewardsRedeemed(
  history: RewardHistoryEntry[],
  rewardIds: string[],
  redeemedAt: string,
  redeemOrderId?: string
): RewardHistoryEntry[] {
  if (rewardIds.length === 0) return history;
  const idSet = new Set(rewardIds);
  return history.map((entry) =>
    idSet.has(entry.id) && entry.status === "earned"
      ? {
          ...entry,
          status: "redeemed" as const,
          redeemedAt,
          orderId: redeemOrderId ?? entry.orderId,
        }
      : entry
  );
}
