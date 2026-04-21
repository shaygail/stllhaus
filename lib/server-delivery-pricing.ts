import {
  deliveryFeeForTier,
  deliveryTierCustomerLabel,
  isDeliveryTier,
  type DeliveryTier,
} from "@/lib/delivery";
import {
  drivingDistanceMetersForDelivery,
  normalizeOrsApiKey,
} from "@/lib/openrouteservice-distance";

export type ResolvedDelivery = {
  tier: DeliveryTier;
  fee: number;
  source?: "manual" | "routing";
  /** Driving distance (km) when source is routing. */
  km?: number;
};

function getOrsApiKey(): string | null {
  const raw =
    process.env.OPENROUTESERVICE_API_KEY?.trim() ||
    process.env.OPEN_ROUTE_SERVICE_API_KEY?.trim() ||
    "";
  if (!raw) return null;
  return normalizeOrsApiKey(raw);
}

/** True when OpenRouteService key and a shop origin are set (see `lib/openrouteservice-distance.ts`). */
export function isDrivingDistanceConfigured(): boolean {
  const key = getOrsApiKey();
  if (!key) return false;
  const hasLonLat =
    Boolean(process.env.DELIVERY_ORIGIN_LON?.trim()) &&
    Boolean(process.env.DELIVERY_ORIGIN_LAT?.trim());
  const hasCoords = Boolean(process.env.DELIVERY_ORIGIN_COORDS?.trim());
  const hasOriginText = Boolean(process.env.DELIVERY_DISTANCE_ORIGIN?.trim());
  return hasLonLat || hasCoords || hasOriginText;
}

function tierFromDrivingKm(km: number): DeliveryTier {
  const bellMax = Number(process.env.DELIVERY_BELL_BLOCK_MAX_KM ?? "2");
  const withinMax = Number(process.env.DELIVERY_WITHIN_MAX_KM ?? "7");
  const bell = Number.isFinite(bellMax) && bellMax > 0 ? bellMax : 2;
  const within = Number.isFinite(withinMax) && withinMax > bell ? withinMax : 7;
  if (km <= bell) return "bell_block";
  if (km <= within) return "within_7km";
  return "over_7km";
}

export async function resolveDeliveryPricing(
  deliveryAddress: string,
  manualTierRaw: string
): Promise<
  | { ok: true; resolved: ResolvedDelivery }
  | { ok: false; code: string; message: string }
> {
  if (isDrivingDistanceConfigured()) {
    const key = getOrsApiKey()!;
    const dist = await drivingDistanceMetersForDelivery(deliveryAddress, key);
    if (dist.ok) {
      const km = dist.meters / 1000;
      const tier = tierFromDrivingKm(km);
      const fee = deliveryFeeForTier(tier);
      return {
        ok: true,
        resolved: { tier, fee, source: "routing", km },
      };
    }
  }

  if (!isDeliveryTier(manualTierRaw)) {
    return {
      ok: false,
      code: "invalid_delivery_tier",
      message: "Please choose a delivery distance option.",
    };
  }
  return {
    ok: true,
    resolved: {
      tier: manualTierRaw,
      fee: deliveryFeeForTier(manualTierRaw),
      source: "manual",
    },
  };
}

export function formatDeliveryEmailDetail(address: string, resolved: ResolvedDelivery): string {
  return [`Address: ${address}`, `Delivery area: ${deliveryTierCustomerLabel(resolved.tier)}`].join("\n\n");
}
