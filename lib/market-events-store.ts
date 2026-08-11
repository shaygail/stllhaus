import { createBusinessLogsAdminClient } from "@/lib/business-logs";
import { UPCOMING_EVENTS } from "@/data/events";
import {
  inputToRowPayload,
  isEventUpcoming,
  rowToMarketEvent,
  type MarketEvent,
  type MarketEventInput,
  type MarketEventRow,
} from "@/lib/market-events";

let cache: { events: MarketEvent[]; fetchedAt: number } | null = null;
const CACHE_MS = 15_000;

function mapRows(rows: MarketEventRow[]): MarketEvent[] {
  return rows.map(rowToMarketEvent);
}

export async function loadAllMarketEvents(): Promise<MarketEventRow[]> {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("market_events")
    .select("*")
    .order("start_date", { ascending: true });

  if (error || !data) return [];
  return data as MarketEventRow[];
}

export async function loadPublishedUpcomingEvents(): Promise<MarketEvent[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache.events;
  }

  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    cache = { events: UPCOMING_EVENTS, fetchedAt: Date.now() };
    return UPCOMING_EVENTS;
  }

  const rows = await loadAllMarketEvents();
  const upcoming = rows.filter((row) => row.published && isEventUpcoming(row));
  const events = upcoming.length > 0 ? mapRows(upcoming) : [];

  cache = { events, fetchedAt: Date.now() };
  return events;
}

export function invalidateMarketEventsCache() {
  cache = null;
}

export async function saveMarketEvent(input: MarketEventInput): Promise<MarketEventRow> {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    throw new Error("missing_supabase_config");
  }

  const payload = inputToRowPayload(input);
  const now = new Date().toISOString();

  if (input.id) {
    const { data, error } = await supabase
      .from("market_events")
      .update({ ...payload, updated_at: now })
      .eq("id", input.id)
      .select("*")
      .single();

    if (error) throw error;
    invalidateMarketEventsCache();
    return data as MarketEventRow;
  }

  const { data, error } = await supabase
    .from("market_events")
    .insert({ ...payload, updated_at: now })
    .select("*")
    .single();

  if (error) throw error;
  invalidateMarketEventsCache();
  return data as MarketEventRow;
}

export async function deleteMarketEvent(id: string): Promise<void> {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    throw new Error("missing_supabase_config");
  }

  const { error } = await supabase.from("market_events").delete().eq("id", id);
  if (error) throw error;
  invalidateMarketEventsCache();
}
