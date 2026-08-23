import { fetchSoldOutFromPos, soldOutKeySet } from "@/lib/menu-availability";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await fetchSoldOutFromPos();
    return NextResponse.json(
      {
        names: payload.names,
        keys: [...soldOutKeySet(payload.keys, payload.names)],
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { names: [], keys: [], error: "sold_out_unavailable" },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
