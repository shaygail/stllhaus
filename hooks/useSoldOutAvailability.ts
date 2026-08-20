import { soldOutKeySet } from "@/lib/menu-availability";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useSoldOutAvailability() {
  const [keys, setKeys] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/menu-availability", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { keys?: string[]; names?: string[] };
      setKeys([...(json.keys ?? []), ...(json.names ?? [])]);
    } catch {
      // Keep the last known list if Railway is briefly unreachable.
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 20_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const soldOutKeys = useMemo(() => soldOutKeySet(keys), [keys]);
  return { soldOutKeys, refresh };
}
