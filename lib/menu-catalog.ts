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
  "Ube Cream Coldbrew Latte": ["Ube Cream Cold Brew"],
  "Black Pearl Cold Brew Latte": ["Black Pearl Cold Brew"],
  "OG Cold Brew": ["Cold Brew"],
  "Clover Coconut Cloud": ["Clover Cloud"],
};

/**
 * Regular/Large pairs aligned with POS `menu-sync.json` and gallery rules:
 * - Matcha, cold brew, cream, cloud: large = regular + $2
 * - Most coffee: large = regular + $1
 * - Spanish Latte, Ube Spanish Latte, Batirol Latte: large = regular + $2 (see `app/gallery/page.tsx`)
 */
export const MENU_DRINKS = {
  matcha: {
    earlGrey: { regular: 9, large: 11 },
    /** Same +$2 large rule as POS drink customizer. */
    ogMatcha: { regular: 7.5, large: 9.5 },
    strawberryMatcha: { regular: 11, large: 13 },
    strawberryCloudMatcha: { regular: 12, large: 14 },
    ubeCreamMatcha: { regular: 9, large: 11 },
    mangoMatcha: { regular: 10, large: 12 },
    mangoSeaSaltMatcha: { regular: 11, large: 13 },
  },
  coldBrew: {
    og: { regular: 9, large: 11 },
    ubeCream: { regular: 9, large: 11 },
    brownSugar: { regular: 9, large: 11 },
    blackPearl: { regular: 9, large: 11 },
    spanishLatteColdBrew: { regular: 9, large: 11 },
  },
  coffee: {
    flatWhite: { regular: 6.5, large: 7.5 },
    icedLatte: { regular: 7.5, large: 8.5 },
    americano: { regular: 6.5, large: 7.5 },
    longBlack: { regular: 6.5, large: 7.5 },
    caramelLatte: { regular: 8.5, large: 9.5 },
    mocha: { regular: 6.5, large: 7.5 },
    ubeSpanishLatte: { regular: 9.5, large: 11.5 },
    spanishLatte: { regular: 8.5, large: 10.5 },
    biscoffLatte: { regular: 9, large: 10 },
    whiteMocha: { regular: 6.5, large: 7.5 },
    batirolLatte: { regular: 8.5, large: 10.5 },
    blackPearlLatte: { regular: 8.5, large: 9.5 },
  },
  cream: {
    twilight: { regular: 8.5, large: 10.5 },
    strawberry: { regular: 8.5, large: 10.5 },
    batirol: { regular: 9, large: 11 },
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
  { name: "OG Cold Brew", prices: MENU_DRINKS.coldBrew.og },
  { name: "Ube Cream Coldbrew Latte", prices: MENU_DRINKS.coldBrew.ubeCream },
  { name: "Brown Sugar Cold Brew", prices: MENU_DRINKS.coldBrew.brownSugar },
  { name: "Black Pearl Cold Brew Latte", prices: MENU_DRINKS.coldBrew.blackPearl },
  { name: "Spanish Latte Cold Brew", prices: MENU_DRINKS.coldBrew.spanishLatteColdBrew },
  { name: "Flat White", prices: MENU_DRINKS.coffee.flatWhite },
  { name: "Iced Latte", prices: MENU_DRINKS.coffee.icedLatte },
  { name: "Americano", prices: MENU_DRINKS.coffee.americano },
  { name: "Long Black", prices: MENU_DRINKS.coffee.longBlack },
  { name: "Caramel Latte", prices: MENU_DRINKS.coffee.caramelLatte },
  { name: "Mocha", prices: MENU_DRINKS.coffee.mocha },
  { name: "Ube Spanish Latte", prices: MENU_DRINKS.coffee.ubeSpanishLatte },
  { name: "Spanish Latte", prices: MENU_DRINKS.coffee.spanishLatte },
  { name: "Biscoff Latte", prices: MENU_DRINKS.coffee.biscoffLatte },
  { name: "White Mocha", prices: MENU_DRINKS.coffee.whiteMocha },
  { name: "Batirol Latte", prices: MENU_DRINKS.coffee.batirolLatte },
  { name: "Black Pearl Latte", prices: MENU_DRINKS.coffee.blackPearlLatte },
  { name: "Twilight Cream", prices: MENU_DRINKS.cream.twilight },
  { name: "Strawberry Cream", prices: MENU_DRINKS.cream.strawberry },
  { name: "Batirol Cream", prices: MENU_DRINKS.cream.batirol },
  { name: "Black Pearl Coconut Cloud", prices: MENU_DRINKS.cloud.blackPearlCoconut },
  { name: "Clover Coconut Cloud", prices: MENU_DRINKS.cloud.cloverCoconut },
  { name: "Twilight Coconut Cloud", prices: MENU_DRINKS.cloud.twilightCoconut },
  { name: "Batirol Cloud", prices: MENU_DRINKS.cloud.batirolCloud },
  { name: "SIP & BITE", prices: { regular: 16.5, large: 16.5 } },
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
