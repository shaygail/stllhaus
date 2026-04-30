import {
  BACKEND_NAME_ALIASES,
  MENU_BACKEND_EXTRA_BASE,
  MENU_DRINK_ROWS,
  collectFlatBackendPriceRows,
} from "@/lib/menu-catalog";
import { NextResponse } from "next/server";

/** JSON snapshot of gallery/POS drink prices — import into Railway POS or Supabase `menu_items`. */
export async function GET() {
  return NextResponse.json({
    drinks: MENU_DRINK_ROWS,
    backendExtraBase: MENU_BACKEND_EXTRA_BASE,
    aliases: BACKEND_NAME_ALIASES,
    flatPrices: collectFlatBackendPriceRows(),
  });
}
