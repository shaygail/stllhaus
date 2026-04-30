import { NextResponse } from "next/server";
import { createBusinessLogsAdminClient } from "@/lib/business-logs";

type MenuPriceRow = {
  name: string;
  price: number;
  is_hidden: boolean;
  is_sold_out: boolean;
};

type PublicMenuPrice = {
  name: string;
  price: number;
};

function normalizeRows(raw: unknown): PublicMenuPrice[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const asRecord = row as Record<string, unknown>;
      const name = asRecord.name;
      const price = asRecord.price;
      const isHidden = asRecord.is_hidden === true || asRecord.isHidden === true;
      const isSoldOut = asRecord.is_sold_out === true || asRecord.isSoldOut === true;
      if (typeof name !== "string" || typeof price !== "number") return null;
      if (isHidden || isSoldOut) return null;
      return { name, price };
    })
    .filter((row): row is PublicMenuPrice => Boolean(row));
}

/** Same JSON the iOS POS loads (`STLLHausPOS` website mirror). Keeps web + app base prices aligned. */
const DEFAULT_MENU_SYNC_JSON_URL =
  "https://raw.githubusercontent.com/shaygail/stllhaus-pos/master/menu-sync.json";

async function tryGithubMenuSyncJson(): Promise<PublicMenuPrice[] | null> {
  const url = process.env.MENU_SYNC_JSON_URL?.trim() || DEFAULT_MENU_SYNC_JSON_URL;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    const rows = normalizeRows(json);
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

async function tryRailwayMenuPrices(): Promise<PublicMenuPrice[] | null> {
  const backendEnv = process.env.BACKEND_URL?.trim();
  const posUrl = process.env.POS_API_URL?.trim();
  const derivedFromPos = posUrl ? posUrl.replace(/\/orders\/?$/, "") : "";
  const backendBase = backendEnv || derivedFromPos;
  if (!backendBase) return null;

  const paths = ["/menu", "/menu-items", "/menu_items", "/api/menu-items", "/api/menu_items", "/api/menu"];
  for (const path of paths) {
    const url = `${backendBase.replace(/\/$/, "")}${path}`;
    try {
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      if (!res.ok) continue;
      const json = (await res.json()) as unknown;

      // Accept either array payload or wrapped payload.
      const direct = normalizeRows(json);
      if (direct.length > 0) return direct;

      if (json && typeof json === "object") {
        const wrapped = json as Record<string, unknown>;
        const nested = normalizeRows(wrapped.items ?? wrapped.data ?? wrapped.results);
        if (nested.length > 0) return nested;
      }
    } catch {
      // try next path
    }
  }
  return null;
}

export async function GET() {
  // 1) GitHub `menu-sync.json` — same file as the POS app (single source of truth for base $).
  const githubItems = await tryGithubMenuSyncJson();
  if (githubItems && githubItems.length > 0) {
    return NextResponse.json({ items: githubItems, source: "github-menu-sync" });
  }

  const railwayItems = await tryRailwayMenuPrices();
  if (railwayItems && railwayItems.length > 0) {
    return NextResponse.json({ items: railwayItems, source: "railway" });
  }

  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "missing_supabase_config" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("menu_items")
    .select("name,price,is_hidden,is_sold_out")
    .eq("is_hidden", false)
    .eq("is_sold_out", false);

  if (error) {
    return NextResponse.json({ error: "menu_prices_unavailable" }, { status: 500 });
  }

  const items = ((data ?? []) as MenuPriceRow[]).map((row) => ({
    name: row.name,
    price: row.price,
  }));

  return NextResponse.json({ items, source: "supabase" });
}
