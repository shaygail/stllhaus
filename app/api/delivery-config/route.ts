import { isDrivingDistanceConfigured } from "@/lib/server-delivery-pricing";
import { NextResponse } from "next/server";

/** Public: whether checkout uses OpenRouteService driving distance for delivery fees (no secrets exposed). */
export async function GET() {
  const enabled = isDrivingDistanceConfigured();
  return NextResponse.json({
    autoDistancePricing: enabled,
    /** @deprecated use autoDistancePricing */
    mapsPricing: enabled,
  });
}
