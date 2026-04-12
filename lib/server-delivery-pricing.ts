import {
  deliveryFeeForTier,
  deliveryTierCustomerLabel,
  isDeliveryTier,
  type DeliveryTier,
} from "@/lib/delivery";

export type ResolvedDelivery = { tier: DeliveryTier; fee: number };

export async function resolveDeliveryPricing(
  _deliveryAddress: string,
  manualTierRaw: string
): Promise<
  | { ok: true; resolved: ResolvedDelivery }
  | { ok: false; code: string; message: string }
> {
  if (!isDeliveryTier(manualTierRaw)) {
    return {
      ok: false,
      code: "invalid_delivery_tier",
      message: "Please choose a delivery distance option.",
    };
  }
  return {
    ok: true,
    resolved: { tier: manualTierRaw, fee: deliveryFeeForTier(manualTierRaw) },
  };
}

export function formatDeliveryEmailDetail(address: string, resolved: ResolvedDelivery): string {
  return [`Address: ${address}`, `Delivery area: ${deliveryTierCustomerLabel(resolved.tier)}`].join("\n\n");
}
