import { createBusinessLogsAdminClient } from "@/lib/business-logs";
import {
  computeOrderingStatus,
  defaultOrderingSettings,
  mergeOrderingSettings,
  type OrderingSettings,
  type OrderingStatus,
} from "@/lib/ordering-settings";

const ROW_ID = 1;

let cache: { settings: OrderingSettings; fetchedAt: number } | null = null;
const CACHE_MS = 15_000;

export async function loadOrderingSettings(): Promise<OrderingSettings> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache.settings;
  }

  const base = defaultOrderingSettings();
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    cache = { settings: base, fetchedAt: Date.now() };
    return base;
  }

  const { data, error } = await supabase
    .from("ordering_settings")
    .select("settings")
    .eq("id", ROW_ID)
    .maybeSingle();

  if (error || !data?.settings) {
    cache = { settings: base, fetchedAt: Date.now() };
    return base;
  }

  const merged = mergeOrderingSettings(data.settings);
  cache = { settings: merged, fetchedAt: Date.now() };
  return merged;
}

export async function saveOrderingSettings(settings: OrderingSettings): Promise<void> {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    throw new Error("missing_supabase_config");
  }

  const { error } = await supabase.from("ordering_settings").upsert(
    {
      id: ROW_ID,
      settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;
  cache = { settings, fetchedAt: Date.now() };
}

export async function getOrderingStatus(): Promise<OrderingStatus & { settings: OrderingSettings }> {
  const settings = await loadOrderingSettings();
  const status = computeOrderingStatus(settings);
  return { ...status, settings };
}

export function invalidateOrderingSettingsCache() {
  cache = null;
}
