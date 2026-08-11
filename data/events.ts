import type { MarketEvent } from "@/lib/market-events";

/** Static fallback when Supabase is not configured. Production uses the database. */
export const UPCOMING_EVENTS: MarketEvent[] = [
  {
    id: "stratford-market-2026-08-15",
    name: "Stratford Market",
    dateLabel: "Saturday 15 August",
    startDate: "2026-08-15T08:00:00+12:00",
    endDate: "2026-08-15T13:00:00+12:00",
    location: "Stratford, Taranaki",
    description:
      "Find us at the Stratford Market with handcrafted matcha, cold brew, and ube drinks — made fresh for your slow moment.",
    image: "/ube.jpg",
    imageAlt: "STLL HAUS ube matcha drink, New Plymouth",
    published: true,
  },
];

export type { MarketEvent };
