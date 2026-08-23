/**
 * Canonical Regular/Large drink prices — keep in sync with Main POS `menu-sync.json`
 * (regular = catalog unit price; large = regular + $2, same as the POS customizer).
 * Used by `app/gallery/page.tsx` for display.
 */

export type DrinkPrices = { regular: number; large: number };

const plus2 = (regular: number): DrinkPrices => ({ regular, large: regular + 2 });

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
  "Strawberry Hojicha": ["Hojicha Strawberry Latte", "Strawberry Hojicha Latte"],
  "Mango Sea Salt Matcha": ["Mango Seasalt Matcha"],
  "Ube Cream Coldbrew Latte": ["Ube Cream Cold Brew"],
  "Black Pearl Cold Brew Latte": ["Black Pearl Cold Brew"],
  "Sea Salt Cold Brew": ["Seasalt Cold Brew"],
  "OG Cold Brew": ["Cold Brew"],
  "Clover Coconut Cloud": ["Clover Cloud"],
  "Ube Espresso Latte": ["Ube Espresso Latte"],
  "Ube Latte": ["Twilight Cream"],
  "Sea Salt Americano": ["Seasalt Americano"],
  "Latte": ["Iced Latte"],
  "Ube Batirol Cream": ["Ube Cream Batirol"],
  "Seasalt Cream Matcha": ["Sea Salt Cream Matcha"],
};

/**
 * Regular/Large pairs aligned with Main POS `menu-sync.json`.
 * Large is always regular + $2.
 */
export const MENU_DRINKS = {
  matcha: {
    earlGrey: plus2(9),
    ogMatcha: plus2(8.5),
    strawberryMatcha: plus2(11.5),
    strawberryCloudMatcha: plus2(11),
    ubeCreamMatcha: plus2(10),
    mangoMatcha: plus2(11.5),
    mangoSeaSaltMatcha: plus2(12),
    biscoffMatcha: plus2(11),
    seasaltCreamMatcha: plus2(11),
  },
  hojicha: {
    latte: plus2(8.5),
    strawberryLatte: plus2(10),
  },
  coldBrew: {
    og: plus2(8),
    ubeCream: plus2(10),
    brownSugar: plus2(9),
    blackPearl: plus2(10),
    seaSalt: plus2(11),
    spanishLatteColdBrew: plus2(8),
  },
  coffee: {
    mocha: plus2(8),
    americano: plus2(6),
    flatWhite: plus2(6.5),
    longBlack: plus2(6),
    latte: plus2(8.5),
    seaSaltAmericano: plus2(9),
    ubeSpanishLatte: plus2(8.5),
    ubeEspressoLatte: plus2(9),
    spanishLatte: plus2(10),
    biscoffLatte: plus2(8.5),
    whiteMocha: plus2(6.5),
    batirolLatte: plus2(11),
    blackPearlLatte: plus2(9),
    jasmineLatte: plus2(8.5),
  },
  cream: {
    ubeLatte: plus2(8.5),
    strawberry: plus2(11),
    batirol: plus2(11),
    ubeBatirolCream: plus2(9.5),
  },
  cloud: {
    blackPearlCoconut: plus2(9),
    cloverCoconut: plus2(9),
    twilightCoconut: plus2(9),
  },
} as const;

/** `{ displayName, prices }[]` for SQL generation and tooling. */
export const MENU_DRINK_ROWS: { name: string; prices: DrinkPrices }[] = [
  { name: "Earl Grey Matcha", prices: MENU_DRINKS.matcha.earlGrey },
  { name: "OG Matcha Latte", prices: MENU_DRINKS.matcha.ogMatcha },
  { name: "Strawberry Matcha", prices: MENU_DRINKS.matcha.strawberryMatcha },
  { name: "Strawberry Cloud Matcha", prices: MENU_DRINKS.matcha.strawberryCloudMatcha },
  { name: "Ube Cream Matcha", prices: MENU_DRINKS.matcha.ubeCreamMatcha },
  { name: "Mango Sea Salt Matcha", prices: MENU_DRINKS.matcha.mangoSeaSaltMatcha },
  { name: "Mango Matcha", prices: MENU_DRINKS.matcha.mangoMatcha },
  { name: "Biscoff Matcha", prices: MENU_DRINKS.matcha.biscoffMatcha },
  { name: "Seasalt Cream Matcha", prices: MENU_DRINKS.matcha.seasaltCreamMatcha },
  { name: "Hojicha Latte", prices: MENU_DRINKS.hojicha.latte },
  { name: "Strawberry Hojicha", prices: MENU_DRINKS.hojicha.strawberryLatte },
  { name: "OG Cold Brew", prices: MENU_DRINKS.coldBrew.og },
  { name: "Ube Cream Coldbrew Latte", prices: MENU_DRINKS.coldBrew.ubeCream },
  { name: "Brown Sugar Cold Brew", prices: MENU_DRINKS.coldBrew.brownSugar },
  { name: "Black Pearl Cold Brew Latte", prices: MENU_DRINKS.coldBrew.blackPearl },
  { name: "Sea Salt Cold Brew", prices: MENU_DRINKS.coldBrew.seaSalt },
  { name: "Spanish Latte Cold Brew", prices: MENU_DRINKS.coldBrew.spanishLatteColdBrew },
  { name: "Mocha", prices: MENU_DRINKS.coffee.mocha },
  { name: "Americano", prices: MENU_DRINKS.coffee.americano },
  { name: "Flat White", prices: MENU_DRINKS.coffee.flatWhite },
  { name: "Long Black", prices: MENU_DRINKS.coffee.longBlack },
  { name: "Latte", prices: MENU_DRINKS.coffee.latte },
  { name: "Sea Salt Americano", prices: MENU_DRINKS.coffee.seaSaltAmericano },
  { name: "Ube Spanish Latte", prices: MENU_DRINKS.coffee.ubeSpanishLatte },
  { name: "Ube Espresso Latte", prices: MENU_DRINKS.coffee.ubeEspressoLatte },
  { name: "Spanish Latte", prices: MENU_DRINKS.coffee.spanishLatte },
  { name: "Biscoff Latte", prices: MENU_DRINKS.coffee.biscoffLatte },
  { name: "White Mocha", prices: MENU_DRINKS.coffee.whiteMocha },
  { name: "Batirol Latte", prices: MENU_DRINKS.coffee.batirolLatte },
  { name: "Black Pearl Latte", prices: MENU_DRINKS.coffee.blackPearlLatte },
  { name: "Jasmine Latte", prices: MENU_DRINKS.coffee.jasmineLatte },
  { name: "Ube Latte", prices: MENU_DRINKS.cream.ubeLatte },
  { name: "Strawberry Cream", prices: MENU_DRINKS.cream.strawberry },
  { name: "Batirol Cream", prices: MENU_DRINKS.cream.batirol },
  { name: "Ube Batirol Cream", prices: MENU_DRINKS.cream.ubeBatirolCream },
  { name: "Black Pearl Coconut Cloud", prices: MENU_DRINKS.cloud.blackPearlCoconut },
  { name: "Clover Coconut Cloud", prices: MENU_DRINKS.cloud.cloverCoconut },
  { name: "Twilight Coconut Cloud", prices: MENU_DRINKS.cloud.twilightCoconut },
  { name: "SIP & BITE", prices: { regular: 16.5, large: 16.5 } },
  { name: "Pork and Shrimp Siomai (6 pcs)", prices: { regular: 9.5, large: 9.5 } },
  { name: "Pork and Shrimp Siomai (12 pcs)", prices: { regular: 18, large: 18 } },
  { name: "Ube Graham", prices: { regular: 8, large: 8 } },
  { name: "Classic Tiramisu", prices: { regular: 10, large: 10 } },
  { name: "Biscoff Tiramisu", prices: { regular: 12, large: 12 } },
];

/** POS-only base names that share gallery pricing (no menu card). */
export const MENU_BACKEND_EXTRA_BASE: { name: string; prices: DrinkPrices }[] = [
  { name: "Classic Matcha", prices: MENU_DRINKS.matcha.ogMatcha },
  { name: "Hojicha Strawberry Latte", prices: MENU_DRINKS.hojicha.strawberryLatte },
  { name: "Iced Latte", prices: MENU_DRINKS.coffee.latte },
  { name: "Ube Cream Batirol", prices: MENU_DRINKS.cream.ubeBatirolCream },
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
