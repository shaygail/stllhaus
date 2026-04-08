export type OrderHistoryEntry = {
  id: string;
  placedAt: string;
  total: number;
  summary: string;
  pickupTime?: string;
  paymentMethod?: string;
};

const MAX_ENTRIES = 30;

export function parseOrderHistory(raw: unknown): OrderHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((i): i is Record<string, unknown> => i !== null && typeof i === "object")
    .filter(
      (i) =>
        typeof i.id === "string" &&
        typeof i.placedAt === "string" &&
        typeof i.total === "number"
    )
    .map((i) => ({
      id: i.id as string,
      placedAt: i.placedAt as string,
      total: i.total as number,
      summary: typeof i.summary === "string" ? i.summary : "",
      pickupTime: typeof i.pickupTime === "string" ? i.pickupTime : undefined,
      paymentMethod: typeof i.paymentMethod === "string" ? i.paymentMethod : undefined,
    }));
}

export function mergeOrderHistory(
  previous: OrderHistoryEntry[],
  entry: OrderHistoryEntry
): OrderHistoryEntry[] {
  const withoutDup = previous.filter((o) => o.id !== entry.id);
  return [entry, ...withoutDup].slice(0, MAX_ENTRIES);
}
