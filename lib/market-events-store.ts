import { createBusinessLogsAdminClient } from "@/lib/business-logs";
import { UPCOMING_EVENTS } from "@/data/events";
import {
  inputToRowPayload,
  isEventPast,
  isEventUpcoming,
  rowToMarketEvent,
  type MarketEvent,
  type MarketEventInput,
  type MarketEventRow,
} from "@/lib/market-events";

let upcomingCache: { events: MarketEvent[]; fetchedAt: number } | null = null;
let pastCache: { events: MarketEvent[]; fetchedAt: number } | null = null;
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
  if (upcomingCache && Date.now() - upcomingCache.fetchedAt < CACHE_MS) {
    return upcomingCache.events;
  }

  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    const now = new Date();
    const upcoming = UPCOMING_EVENTS.filter((event) => {
      const endOrStart = event.endDate ?? event.startDate;
      return new Date(endOrStart) >= now;
    });
    upcomingCache = { events: upcoming, fetchedAt: Date.now() };
    return upcoming;
  }

  const rows = await loadAllMarketEvents();
  const upcoming = rows.filter((row) => row.published && isEventUpcoming(row));
  const events = mapRows(upcoming);

  upcomingCache = { events, fetchedAt: Date.now() };
  return events;
}

export async function loadPublishedPastEvents(): Promise<MarketEvent[]> {
  if (pastCache && Date.now() - pastCache.fetchedAt < CACHE_MS) {
    return pastCache.events;
  }

  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    const now = new Date();
    const past = UPCOMING_EVENTS.filter((event) => {
      const endOrStart = event.endDate ?? event.startDate;
      return new Date(endOrStart) < now;
    }).reverse();
    pastCache = { events: past, fetchedAt: Date.now() };
    return past;
  }

  const rows = await loadAllMarketEvents();
  const past = rows
    .filter((row) => row.published && isEventPast(row))
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  const events = mapRows(past);

  pastCache = { events, fetchedAt: Date.now() };
  return events;
}

export function invalidateMarketEventsCache() {
  upcomingCache = null;
  pastCache = null;
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
