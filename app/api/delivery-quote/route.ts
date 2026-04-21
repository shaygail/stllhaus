import { isDrivingDistanceConfigured, resolveDeliveryPricing } from "@/lib/server-delivery-pricing";
import { NextRequest, NextResponse } from "next/server";

/**
 * Preview delivery fee from OpenRouteService driving distance.
 * When not configured, returns `{ mode: "manual" }` so the client can show manual bands.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { address?: string };
    const address = String(body.address ?? "").trim();
    if (address.length < 8 || address.length > 2000) {
      return NextResponse.json({ error: "invalid_address" }, { status: 400 });
    }
    if (!isDrivingDistanceConfigured()) {
      return NextResponse.json({ mode: "manual" as const });
    }
    const priced = await resolveDeliveryPricing(address, "within_7km");
    if (!priced.ok) {
      return NextResponse.json(
        { error: priced.code, detail: priced.message },
        { status: 400 }
      );
    }
    const { resolved } = priced;
    if (resolved.source !== "routing") {
      return NextResponse.json({ mode: "manual" as const });
    }
    return NextResponse.json({
      mode: "routing" as const,
      distanceKm: resolved.km,
      fee: resolved.fee,
      tier: resolved.tier,
    });
  } catch (err) {
    console.error("[delivery-quote]", err);
    return NextResponse.json(
      {
        error: "quote_failed",
        detail: err instanceof Error ? err.message : "Could not run delivery quote.",
      },
      { status: 500 }
    );
  }
}
