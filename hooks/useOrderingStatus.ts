"use client";

import type { OrderingStatus } from "@/lib/ordering-settings";
import { useCallback, useEffect, useState } from "react";

export type OrderingStatusResponse = OrderingStatus & {
  settings?: {
    orderingEnabled: boolean;
    blockOrdersWhenClosed: boolean;
    preOrderWhenClosed: boolean;
    openTime: string;
    closeTime: string;
    closedDays: number[];
    timezone: string;
  };
};

export function useOrderingStatus() {
  const [data, setData] = useState<OrderingStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ordering-status", { cache: "no-store" });
      if (!res.ok) {
        setError(true);
        return;
      }
      const json = (await res.json()) as OrderingStatusResponse;
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { data, loading, error, refresh };
}
