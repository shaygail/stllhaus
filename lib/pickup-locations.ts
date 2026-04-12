export const PICKUP_LOCATION_IDS = ["pinoy_lemon_st", "stll_bell_block"] as const;
export type PickupLocationId = (typeof PICKUP_LOCATION_IDS)[number];

const OPTIONS: Record<PickupLocationId, { title: string; detail?: string }> = {
  pinoy_lemon_st: {
    title: "Pick up at Pinoy Food Shop (Lemon St)",
    detail:
      "Please allow a 30-minute window — we need this time to deliver your order to this location.",
  },
  stll_bell_block: {
    title: "Pick up at STLL HAUS (Bell Block)",
  },
};

export function isPickupLocationId(v: string): v is PickupLocationId {
  return (PICKUP_LOCATION_IDS as readonly string[]).includes(v);
}

export function pickupLocationForEmail(id: string): { title: string; detail?: string } | null {
  if (!isPickupLocationId(id)) return null;
  return OPTIONS[id];
}

export function pickupLocationOptionsForForm(): Array<{
  id: PickupLocationId;
  title: string;
  detail?: string;
}> {
  return PICKUP_LOCATION_IDS.map((id) => ({ id, ...OPTIONS[id] }));
}

/** Short label for email subject / compact UI. */
export function pickupLocationShortLabel(id: PickupLocationId): string {
  return id === "pinoy_lemon_st" ? "Pinoy Food Shop (Lemon St)" : "STLL HAUS (Bell Block)";
}
