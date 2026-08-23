/** Minimum total units in cart (sum of line quantities) to offer delivery. */
export const MIN_CART_UNITS_FOR_DELIVERY = 4;

/** Around Bell Block (internal id: `bell_block`). */
export const DELIVERY_FEE_BELL_BLOCK = 0;
/** Waitara and New Plymouth CBD, outside the free Bell Block area (internal id: `within_7km`). */
export const DELIVERY_FEE_LOCAL_CBD_ZONE = 4;
/** Further from the CBD, e.g. Westown, Taranaki Base Hospital (internal id: `over_7km`). */
export const DELIVERY_FEE_EXTENDED_FROM_CBD = 7;

/** @deprecated use DELIVERY_FEE_LOCAL_CBD_ZONE */
export const DELIVERY_FEE_WITHIN_7KM = DELIVERY_FEE_LOCAL_CBD_ZONE;
/** @deprecated use DELIVERY_FEE_EXTENDED_FROM_CBD */
export const DELIVERY_FEE_OVER_7KM = DELIVERY_FEE_EXTENDED_FROM_CBD;

export const DELIVERY_TIERS = ["bell_block", "within_7km", "over_7km"] as const;
export type DeliveryTier = (typeof DELIVERY_TIERS)[number];

export function isDeliveryTier(v: string): v is DeliveryTier {
  return (DELIVERY_TIERS as readonly string[]).includes(v);
}

export function deliveryFeeForTier(tier: DeliveryTier): number {
  if (tier === "bell_block") return DELIVERY_FEE_BELL_BLOCK;
  if (tier === "within_7km") return DELIVERY_FEE_LOCAL_CBD_ZONE;
  return DELIVERY_FEE_EXTENDED_FROM_CBD;
}

export function deliveryLineItemName(tier: DeliveryTier): string {
  if (tier === "bell_block") return "Delivery (around Bell Block, complimentary)";
  if (tier === "within_7km") return "Delivery (Waitara & New Plymouth CBD)";
  return "Delivery (further from CBD, e.g. Westown, Taranaki Base)";
}

export function deliveryTierCustomerLabel(tier: DeliveryTier): string {
  if (tier === "bell_block") return "Around Bell Block (free)";
  if (tier === "within_7km") return "Waitara & New Plymouth CBD ($4)";
  return "Further from the CBD, e.g. Westown or Taranaki Base ($7)";
}

/** Shown on checkout. */
export const DELIVERY_SERVICE_AREA_NOTE =
  "Free delivery around Bell Block. $4 for Waitara and through to the New Plymouth CBD. $7 for addresses further from the CBD (such as Westown or Taranaki Base Hospital). Outside our delivery area, please choose pickup.";

export function cartUnitsEligibleForDelivery(units: number): boolean {
  return units >= MIN_CART_UNITS_FOR_DELIVERY;
}
