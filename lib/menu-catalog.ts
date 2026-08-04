/**
 * Canonical Regular/Large drink prices — keep in sync with POS / Supabase `menu_items`
 * and Railway menu API. Used by `app/gallery/page.tsx` for display.
 */

export type DrinkPrices = { regular: number; large: number };

export function formatDrinkPriceUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function drinkSizes(p: DrinkPrices): { label: string; price: string }[] {
  return [
    { label: "G", price: formatDrinkPriceUsd(p.regular) },
    { label: "V", price: formatDrinkPriceUsd(p.large) },
  ];
}

/** Gallery item name → backend/POS base-price lookup names (regular only). */
export const BACKEND_NAME_ALIASES: Record<string, string[]> = {
  "OG Matcha Latte": ["Matcha Latte"],
  "Classic Matcha": ["Matcha Latte"],
  "Hojicha Latte": ["OG Hojicha Latte"],
  "Hojicha Strawberry Latte": ["Strawberry Hojicha Latte", "Strawberry Hojicha"],
  "Mango Sea Salt Matcha": ["Mango Seasalt Matcha"],
  "Ube Cream Coldbrew Latte": ["Ube Cream Cold Brew"],
  "Black Pearl Cold Brew Latte": ["Black Pearl Cold Brew"],
  "Sea Salt Cold Brew": ["Seasalt Cold Brew"],
  "OG Cold Brew": ["Cold Brew"],
  "Clover Coconut Cloud": ["Clover Cloud"],
  "Ube Espresso Latte": ["Ube Espresso Latte"],
  "Ube Latte": ["Twilight Cream"],
  "Sea Salt Americano": ["Seasalt Americano"],
};

/**
 * Regular/Large pairs aligned with POS `menu-sync.json` and gallery rules:
 * - Matcha, cold brew, cream, cloud: large = regular + $2
 * - Most coffee: large = regular + $1
 * - Ube Espresso Latte, Spanish Latte, Ube Spanish Latte, Batirol Latte: large = regular + $2 (see `app/gallery/page.tsx`)
 */
export const MENU_DRINKS = {
  matcha: {
    earlGrey: { regular: 9, large: 11 },
    /** Same +$2 large rule as POS drink customizer. */
    ogMatcha: { regular: 8.5, large: 10.5 },
    strawberryMatcha: { regular: 11.5, large: 13.5 },
    strawberryCloudMatcha: { regular: 11, large: 13 },
    ubeCreamMatcha: { regular: 10, large: 12 },
    mangoMatcha: { regular: 10, large: 12 },
    mangoSeaSaltMatcha: { regular: 11.5, large: 13.5 },
  },
  hojicha: {
    latte: { regular: 8.5, large: 10.5 },
    strawberryLatte: { regular: 10, large: 12 },
  },
  coldBrew: {
    og: { regular: 9, large: 11 },
    ubeCream: { regular: 10, large: 12 },
    brownSugar: { regular: 9, large: 11 },
    blackPearl: { regular: 10, large: 12 },
    seaSalt: { regular: 10, large: 12 },
    spanishLatteColdBrew: { regular: 9, large: 11 },
  },
  coffee: {
    flatWhite: { regular: 6.5, large: 7.5 },
    icedLatte: { regular: 7.5, large: 8.5 },
    americano: { regular: 6, large: 7 },
    longBlack: { regular: 6, large: 7 },
    ubeEspressoLatte: { regular: 9.5, large: 11.5 },
    ubeSpanishLatte: { regular: 11, large: 13 },
    spanishLatte: { regular: 10, large: 12 },
    biscoffLatte: { regular: 9.5, large: 10.5 },
    batirolLatte: { regular: 9.5, large: 11.5 },
    blackPearlLatte: { regular: 9.5, large: 10.5 },
    seaSaltAmericano: { regular: 9, large: 11 },
  },
  cream: {
    ubeLatte: { regular: 8.5, large: 10.5 },
    strawberry: { regular: 10, large: 12 },
    batirol: { regular: 11, large: 13 },
    ubeCreamBatirol: { regular: 11, large: 13 },
  },
  cloud: {
    blackPearlCoconut: { regular: 9, large: 11 },
    cloverCoconut: { regular: 9, large: 11 },
    twilightCoconut: { regular: 9, large: 11 },
    batirolCloud: { regular: 9, large: 11 },
  },
} as const;

/** `{ displayName, prices }[]` for SQL generation and tooling. */
export const MENU_DRINK_ROWS: { name: string; prices: DrinkPrices }[] = [
  { name: "Earl Grey Matcha", prices: MENU_DRINKS.matcha.earlGrey },
  { name: "OG Matcha Latte", prices: MENU_DRINKS.matcha.ogMatcha },
  { name: "Strawberry Matcha", prices: MENU_DRINKS.matcha.strawberryMatcha },
  { name: "Strawberry Cloud Matcha", prices: MENU_DRINKS.matcha.strawberryCloudMatcha },
  { name: "Ube Cream Matcha", prices: MENU_DRINKS.matcha.ubeCreamMatcha },
  { name: "Mango Matcha", prices: MENU_DRINKS.matcha.mangoMatcha },
  { name: "Mango Sea Salt Matcha", prices: MENU_DRINKS.matcha.mangoSeaSaltMatcha },
  { name: "Hojicha Latte", prices: MENU_DRINKS.hojicha.latte },
  { name: "Hojicha Strawberry Latte", prices: MENU_DRINKS.hojicha.strawberryLatte },
  { name: "OG Cold Brew", prices: MENU_DRINKS.coldBrew.og },
  { name: "Ube Cream Coldbrew Latte", prices: MENU_DRINKS.coldBrew.ubeCream },
  { name: "Brown Sugar Cold Brew", prices: MENU_DRINKS.coldBrew.brownSugar },
  { name: "Black Pearl Cold Brew Latte", prices: MENU_DRINKS.coldBrew.blackPearl },
  { name: "Sea Salt Cold Brew", prices: MENU_DRINKS.coldBrew.seaSalt },
  { name: "Spanish Latte Cold Brew", prices: MENU_DRINKS.coldBrew.spanishLatteColdBrew },
  { name: "Flat White", prices: MENU_DRINKS.coffee.flatWhite },
  { name: "Iced Latte", prices: MENU_DRINKS.coffee.icedLatte },
  { name: "Americano", prices: MENU_DRINKS.coffee.americano },
  { name: "Long Black", prices: MENU_DRINKS.coffee.longBlack },
  { name: "Ube Espresso Latte", prices: MENU_DRINKS.coffee.ubeEspressoLatte },
  { name: "Ube Spanish Latte", prices: MENU_DRINKS.coffee.ubeSpanishLatte },
  { name: "Spanish Latte", prices: MENU_DRINKS.coffee.spanishLatte },
  { name: "Biscoff Latte", prices: MENU_DRINKS.coffee.biscoffLatte },
  { name: "Batirol Latte", prices: MENU_DRINKS.coffee.batirolLatte },
  { name: "Black Pearl Latte", prices: MENU_DRINKS.coffee.blackPearlLatte },
  { name: "Sea Salt Americano", prices: MENU_DRINKS.coffee.seaSaltAmericano },
  { name: "Ube Latte", prices: MENU_DRINKS.cream.ubeLatte },
  { name: "Strawberry Cream", prices: MENU_DRINKS.cream.strawberry },
  { name: "Batirol Cream", prices: MENU_DRINKS.cream.batirol },
  { name: "Ube Cream Batirol", prices: MENU_DRINKS.cream.ubeCreamBatirol },
  { name: "Black Pearl Coconut Cloud", prices: MENU_DRINKS.cloud.blackPearlCoconut },
  { name: "Clover Coconut Cloud", prices: MENU_DRINKS.cloud.cloverCoconut },
  { name: "Twilight Coconut Cloud", prices: MENU_DRINKS.cloud.twilightCoconut },
  { name: "Batirol Cloud", prices: MENU_DRINKS.cloud.batirolCloud },
  { name: "SIP & BITE", prices: { regular: 16.5, large: 16.5 } },
  { name: "Pork and Shrimp Siomai (6 pcs)", prices: { regular: 9.5, large: 9.5 } },
  { name: "Pork and Shrimp Siomai (12 pcs)", prices: { regular: 18, large: 18 } },
];

/** POS-only base names that share gallery pricing (no menu card). */
export const MENU_BACKEND_EXTRA_BASE: { name: string; prices: DrinkPrices }[] = [
  { name: "Classic Matcha", prices: MENU_DRINKS.matcha.ogMatcha },
];

const MENU_ROWS_FOR_BACKEND_SYNC = [...MENU_DRINK_ROWS, ...MENU_BACKEND_EXTRA_BASE];

/**
 * Flat rows for POS/DB: each drink regular + `Name (Large)` large price,
 * plus alias rows so `resolveBackendPrice` in the gallery finds Matcha Latte / Cold Brew.
 */
export function collectFlatBackendPriceRows(): { name: string; price: number }[] {
  const rows: { name: string; price: number }[] = [];
  const seen = new Set<string>();

  const add = (name: string, price: number) => {
    const key = `${name.toLowerCase()}\0${price}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ name, price });
  };

  for (const { name, prices } of MENU_ROWS_FOR_BACKEND_SYNC) {
    add(name, prices.regular);
    add(`${name} (Large)`, prices.large);
  }

  for (const [displayName, aliases] of Object.entries(BACKEND_NAME_ALIASES)) {
    const entry = MENU_ROWS_FOR_BACKEND_SYNC.find((r) => r.name === displayName);
    if (!entry) continue;
    for (const alias of aliases) {
      add(alias, entry.prices.regular);
    }
  }

  return rows;
}
