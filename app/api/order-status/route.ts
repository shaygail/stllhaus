import { fetchPreorderStatus } from "@/lib/pos-preorder";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Public kitchen status for the thank-you page. Does not return customer notes. */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("preorderId") ?? "";
  const preorderId = Number.parseInt(raw, 10);
  if (!Number.isFinite(preorderId) || preorderId < 1) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const row = await fetchPreorderStatus(preorderId);
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const status = row.status === "ready" || row.status === "done" || row.status === "pending" ? row.status : "pending";
  return NextResponse.json({
    status,
    pickupTime: row.pickupTime ?? null,
  });
}
