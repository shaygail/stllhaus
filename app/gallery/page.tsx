"use client";

import { useCart } from "@/components/CartContext";
import {
  BACKEND_NAME_ALIASES,
  drinkSizes,
  MENU_DRINKS,
} from "@/lib/menu-catalog";
import { OrderingStatusBanner } from "@/components/OrderingStatusBanner";
import { useOrderingStatus } from "@/hooks/useOrderingStatus";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Size = { label: string; price: string };

type MenuItemData = {
  name: string;
  description: string;
  image: string;
  sizes: Size[];
  /** Optional per-temperature size/price overrides. */
  sizesByTemperature?: Record<string, Size[]>;
  /** When set, replaces the section default. Use `[]` to hide milk choice for this drink. */
  milkOptionsOverride?: string[];
  /** When set, shows temperature choices for this drink. */
  temperatureOptionsOverride?: string[];
  /** When true, hides syrup and cold foam add-ons (e.g. OG Matcha: milk, temp, matcha strength only). */
  hideAddOns?: boolean;
  /** When true with hideAddOns, syrups stay off but cream / cold foam add-ons are still offered. */
  coldFoamsAddOnOnly?: boolean;
  /** When true, show espresso shot options (1 shot included, double +$0.50, 3 shots +$1). */
  coffeeShots?: boolean;
};

type BackendMenuItem = {
  name: string;
  price: number;
};

const SIZE_LABELS: Record<string, string> = { G: "Regular", V: "Large" };
const MILK_SURCHARGE = 1;
const PREMIUM_MILKS = new Set(["Almond", "Soy"]);
const LARGE_SIZE_UPCHARGE = 2;
/** Espresso coffee series: regular/large gap is $1 (matcha, cold brew, etc. use {@link LARGE_SIZE_UPCHARGE}). */
const COFFEE_LARGE_UPCHARGE = 1;
const ENABLE_BACKEND_MENU_SYNC = process.env.NEXT_PUBLIC_ENABLE_MENU_PRICE_SYNC === "true";

const SYRUPS = [
  "Ube",
  "Earl Grey",
  "Strawberry",
  "Brown Sugar",
  "Agave",
  "Maple Syrup",
] as const;

/** Extra syrup add-on per pump/flavor (Brown Sugar: no charge). */
const SYRUP_SURCHARGE_USD: Record<string, number> = {
  Ube: 1,
  "Earl Grey": 0.5,
  Strawberry: 1,
  Agave: 1,
  "Maple Syrup": 1,
};

function syrupSurchargeUsd(name: string): number {
  return SYRUP_SURCHARGE_USD[name] ?? 0;
}

function formatSyrupPriceLabel(amount: number): string {
  if (amount <= 0) return "";
  if (amount === 0.5) return " +$0.50";
  if (amount === 1) return " +$1";
  if (amount === 2) return " +$2";
  return ` +$${amount.toFixed(2)}`;
}

/** Cream / cold foam add-ons (Matcha, Cold Brew, Coffee Series, Coconut Cloud). */
const COLD_FOAMS = [
  "Sea Salt",
  "Maple Cream",
  "Matcha Cream",
  "Strawberry Cream",
  "Ube Cream",
  "Vanilla Sweet Cream",
  "Black Pearl",
] as const;

const COLD_FOAM_SURCHARGE_USD: Record<string, number> = {
  "Sea Salt": 1,
  "Maple Cream": 1,
  "Matcha Cream": 2,
  "Strawberry Cream": 2,
  "Ube Cream": 2,
  "Vanilla Sweet Cream": 1,
  "Black Pearl": 1,
};

function coldFoamSurchargeUsd(name: string): number {
  return COLD_FOAM_SURCHARGE_USD[name] ?? 0;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function getDairyCreamBaseNote(itemName: string): string | null {
  const name = itemName.toLowerCase();
  if (name.includes("twilight cream") && !name.includes("coconut")) {
    return "Ube cream top. Contains dairy.";
  }
  if (name.includes("strawberry cream") && !name.includes("coconut")) {
    return "Strawberry cream top. Contains dairy.";
  }
  if (name.includes("strawberry cloud") && !name.includes("coconut") && !name.includes("matcha")) {
    return "Strawberry cloud foam top. Contains dairy.";
  }
  const isCloudDrink = name.includes("cloud");
  const isUbeCreamDrink = name.includes("ube cream");

  if (!isCloudDrink && !isUbeCreamDrink) return null;
  return "Contains dairy cream for the base.";
}

const matchaItems: MenuItemData[] = [
  {
    name: "Earl Grey Matcha",
    description: "Premium Kyoto matcha with earl grey notes. Choose your matcha strength below.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.matcha.earlGrey),
    temperatureOptionsOverride: ["Hot", "Iced"],
  },
  {
    name: "OG Matcha Latte",
    description:
      "Fully customisable — syrups, cold foams, milk, temperature, matcha strength, and sweetness.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.matcha.ogMatcha),
    temperatureOptionsOverride: ["Hot", "Iced"],
  },
  {
    name: "Strawberry Matcha",
    description: "Strawberry and matcha fusion. Adjust matcha strength as you like.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.matcha.strawberryMatcha),
  },
  {
    name: "Strawberry Cloud Matcha",
    description: "Strawberry, cloud foam, and matcha. Choose your matcha strength.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.matcha.strawberryCloudMatcha),
  },
  {
    name: "Ube Cream Matcha",
    description:
      "Ube cream and matcha. Default is 4g matcha, but you can select extra strong options.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.matcha.ubeCreamMatcha),
    temperatureOptionsOverride: ["Hot", "Iced"],
  },
  {
    name: "Mango Matcha",
    description: "Mango and matcha fusion with a bright, smooth finish.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.matcha.mangoMatcha),
  },
  {
    name: "Mango Sea Salt Matcha",
    description: "Mango matcha topped with sea salt foam.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.matcha.mangoSeaSaltMatcha),
  },
];

const coldBrewItems: MenuItemData[] = [
  { name: "OG Cold Brew", description: "", image: "", sizes: drinkSizes(MENU_DRINKS.coldBrew.og) },
  {
    name: "Ube Cream Coldbrew Latte",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coldBrew.ubeCream),
    milkOptionsOverride: [],
  },
  {
    name: "Brown Sugar Cold Brew",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coldBrew.brownSugar),
  },
  {
    name: "Black Pearl Cold Brew Latte",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coldBrew.blackPearl),
  },
  {
    name: "Spanish Latte Cold Brew",
    description: "No extra syrup add-ons — cold foam add-ons still available.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coldBrew.spanishLatteColdBrew),
    hideAddOns: true,
    coldFoamsAddOnOnly: true,
  },
];

const coffeeItems: MenuItemData[] = [
  {
    name: "Flat White",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.flatWhite),
    temperatureOptionsOverride: ["Hot"],
    coffeeShots: true,
  },
  {
    name: "Iced Latte",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.icedLatte),
    temperatureOptionsOverride: ["Iced"],
    coffeeShots: true,
  },
  {
    name: "Americano",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.americano),
    sizesByTemperature: {
      Hot: drinkSizes(MENU_DRINKS.coffee.americano),
      Iced: drinkSizes(MENU_DRINKS.coffee.americano),
    },
    temperatureOptionsOverride: ["Hot", "Iced"],
    milkOptionsOverride: [],
    coffeeShots: true,
  },
  {
    name: "Long Black",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.longBlack),
    sizesByTemperature: {
      Hot: drinkSizes(MENU_DRINKS.coffee.longBlack),
      Iced: drinkSizes(MENU_DRINKS.coffee.longBlack),
    },
    temperatureOptionsOverride: ["Hot", "Iced"],
    milkOptionsOverride: [],
    coffeeShots: true,
  },
  {
    name: "Caramel Latte",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.caramelLatte),
    sizesByTemperature: {
      Hot: drinkSizes(MENU_DRINKS.coffee.caramelLatte),
      Iced: drinkSizes(MENU_DRINKS.coffee.caramelLatte),
    },
    temperatureOptionsOverride: ["Hot", "Iced"],
    coffeeShots: true,
  },
  {
    name: "Mocha",
    description: "House chocolate and espresso with your choice of milk.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.mocha),
    temperatureOptionsOverride: ["Hot", "Iced"],
    coffeeShots: true,
  },
  {
    name: "Ube Spanish Latte",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.ubeSpanishLatte),
    temperatureOptionsOverride: ["Hot", "Iced"],
    coffeeShots: true,
  },
  {
    name: "Spanish Latte",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.spanishLatte),
    temperatureOptionsOverride: ["Hot", "Iced"],
    coffeeShots: true,
  },
  {
    name: "Biscoff Latte",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.biscoffLatte),
    temperatureOptionsOverride: ["Hot", "Iced"],
    coffeeShots: true,
  },
  {
    name: "White Mocha",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.whiteMocha),
    temperatureOptionsOverride: ["Hot", "Iced"],
    coffeeShots: true,
  },
  {
    name: "Batirol Latte",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.batirolLatte),
    temperatureOptionsOverride: ["Hot", "Iced"],
    coffeeShots: true,
  },
  {
    name: "Black Pearl Latte",
    description: "",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.coffee.blackPearlLatte),
    temperatureOptionsOverride: ["Hot", "Iced"],
    coffeeShots: true,
  },
];

const COFFEE_MENU_ITEM_NAMES = new Set(coffeeItems.map((item) => item.name));

/** Coffee drinks outside the $6 / $7 tier — large uses +$2 when syncing base price from backend. */
const COFFEE_TWO_DOLLAR_LARGE_UPCHARGE_NAMES = new Set([
  "Spanish Latte",
  "Ube Spanish Latte",
  "Batirol Latte",
]);

function largeSizeUpchargeForMenuItem(itemName: string): number {
  if (COFFEE_TWO_DOLLAR_LARGE_UPCHARGE_NAMES.has(itemName)) return LARGE_SIZE_UPCHARGE;
  return COFFEE_MENU_ITEM_NAMES.has(itemName) ? COFFEE_LARGE_UPCHARGE : LARGE_SIZE_UPCHARGE;
}

const nonCoffeeItems: MenuItemData[] = [
  {
    name: "Twilight Cream",
    description:
      "Ube cream top with your choice of milk. Oat or whole at menu price; almond or soy +$1. Syrups not included.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.cream.twilight),
    temperatureOptionsOverride: ["Hot", "Iced"],
    hideAddOns: true,
  },
  {
    name: "Strawberry Cream",
    description:
      "Strawberry cream top with your choice of milk. Oat or whole at menu price; almond or soy +$1. Syrups not included.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.cream.strawberry),
    temperatureOptionsOverride: ["Hot", "Iced"],
    hideAddOns: true,
  },
  {
    name: "Batirol Cream",
    description: "Chocolate batirol cream top with your choice of milk.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.cream.batirol),
    temperatureOptionsOverride: ["Hot", "Iced"],
    hideAddOns: true,
  },
];

const cloudItems: MenuItemData[] = [
  {
    name: "Black Pearl Coconut Cloud",
    description: "Refreshing coconut water and homemade black gulaman cloud foam.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.cloud.blackPearlCoconut),
    milkOptionsOverride: [],
  },
  {
    name: "Clover Coconut Cloud",
    description: "Refreshing coconut water and premium Kyoto Thea matcha powder cloud foam.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.cloud.cloverCoconut),
    milkOptionsOverride: [],
  },
  {
    name: "Twilight Coconut Cloud",
    description: "Refreshing coconut water and homemade ube cloud foam.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.cloud.twilightCoconut),
    milkOptionsOverride: [],
  },
  {
    name: "Batirol Cloud",
    description: "Refreshing coconut water with batirol chocolate cream cloud foam.",
    image: "",
    sizes: drinkSizes(MENU_DRINKS.cloud.batirolCloud),
    milkOptionsOverride: [],
  },
];

function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

function resolveBackendPrice(itemName: string, prices: Map<string, number>): number | null {
  const direct = prices.get(itemName.toLowerCase());
  if (typeof direct === "number") return direct;
  const aliases = BACKEND_NAME_ALIASES[itemName] ?? [];
  for (const alias of aliases) {
    const aliasPrice = prices.get(alias.toLowerCase());
    if (typeof aliasPrice === "number") return aliasPrice;
  }
  return null;
}

function applyBackendPrices(items: MenuItemData[], prices: Map<string, number>): MenuItemData[] {
  return items.map((item) => {
    const basePrice = resolveBackendPrice(item.name, prices);
    if (basePrice === null) return item;
    const explicitLargePrice = resolveBackendPrice(`${item.name} (Large)`, prices);

    const applySizePrices = (sizes: Size[]): Size[] =>
      sizes.map((size) => {
        if (size.price === "N/A") return size;
        if (size.label === "G") return { ...size, price: formatPrice(basePrice) };
        if (size.label === "V") {
          const largePrice = explicitLargePrice ?? basePrice + largeSizeUpchargeForMenuItem(item.name);
          return { ...size, price: formatPrice(largePrice) };
        }
        return size;
      });

    const sizesByTemperature = item.sizesByTemperature
      ? Object.fromEntries(
          Object.entries(item.sizesByTemperature).map(([temperature, sizes]) => [
            temperature,
            applySizePrices(sizes),
          ])
        )
      : undefined;

    return {
      ...item,
      sizes: applySizePrices(item.sizes),
      sizesByTemperature,
    };
  });
}

function AddedToCartDialog({
  open,
  itemName,
  onClose,
}: {
  open: boolean;
  itemName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5 py-10 bg-stll-charcoal/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="added-to-cart-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md border border-stll-charcoal/20 bg-[#FAF8F5] px-8 py-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center text-stll-muted hover:text-stll-charcoal text-xl leading-none border border-transparent hover:border-stll-charcoal/20"
          aria-label="Close"
        >
          ×
        </button>
        <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-3">Stll Haus</p>
        <h2 id="added-to-cart-title" className="text-xl font-black uppercase tracking-tight text-stll-charcoal leading-snug">
          Added to your order
        </h2>
        <p className="mt-3 text-sm text-stll-charcoal/90 leading-relaxed">{itemName}</p>
        <p className="mt-4 text-xs text-stll-muted leading-relaxed">
          Go to your cart to review and pay, or keep browsing the menu.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal/5 transition-colors"
          >
            Keep shopping
          </button>
          <Link
            href="/checkout"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase border border-stll-charcoal bg-stll-charcoal text-white text-center hover:bg-stll-charcoal/90 transition-colors"
          >
            Continue to cart
          </Link>
        </div>
      </div>
    </div>
  );
}

function MenuItemRow({
  item,
  milkOptions,
  showSyrups = true,
  showColdFoams = false,
  onItemAdded,
  canAddToCart = true,
  addBlockedMessage,
  isPreOrderOnly = false,
}: {
  item: MenuItemData;
  milkOptions?: string[];
  showSyrups?: boolean;
  showColdFoams?: boolean;
  onItemAdded?: (itemSummary: string) => void;
  canAddToCart?: boolean;
  addBlockedMessage?: string;
  isPreOrderOnly?: boolean;
}) {
  const isMatcha = item.name.toLowerCase().includes("matcha");
  const dairyCreamNote = getDairyCreamBaseNote(item.name);
  const slug = slugify(item.name);
  const rowMilkOptions = item.milkOptionsOverride !== undefined ? item.milkOptionsOverride : milkOptions;
  const rowTemperatureOptions = item.temperatureOptionsOverride ?? [];
  const initialSizes = item.sizes.filter((s) => s.price !== "N/A");
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(initialSizes[0]?.label || "");
  const [selectedSyrups, setSelectedSyrups] = useState<string[]>([]);
  const [selectedColdFoams, setSelectedColdFoams] = useState<string[]>([]);
  const [selectedMilk, setSelectedMilk] = useState(rowMilkOptions?.length ? rowMilkOptions[0] : "");
  const [selectedTemperature, setSelectedTemperature] = useState(
    rowTemperatureOptions.length ? rowTemperatureOptions[0] : ""
  );
  const [sweetness, setSweetness] = useState("Sweet");
  const [matchaStrength, setMatchaStrength] = useState("default");
  const [coffeeShotChoice, setCoffeeShotChoice] = useState<"1" | "2" | "3">("1");
  const activeSizesRaw =
    (rowTemperatureOptions.length > 0 && selectedTemperature
      ? item.sizesByTemperature?.[selectedTemperature]
      : undefined) ?? item.sizes;
  const validSizes = activeSizesRaw.filter((s) => s.price !== "N/A");

  const rowShowSyrups = showSyrups && !item.hideAddOns;
  const rowShowColdFoams =
    (showColdFoams && !item.hideAddOns) || Boolean(item.coldFoamsAddOnOnly);

  const handleSyrupChange = (syrup: string) => {
    setSelectedSyrups((prev) =>
      prev.includes(syrup) ? prev.filter((s) => s !== syrup) : [...prev, syrup]
    );
  };

  const handleColdFoamChange = (foam: string) => {
    setSelectedColdFoams((prev) =>
      prev.includes(foam) ? prev.filter((f) => f !== foam) : [...prev, foam]
    );
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddToCart) return;
    const sizeLabel = selectedSize;
    const sizeName = SIZE_LABELS[sizeLabel] ?? sizeLabel;
    const sortedSyrups = rowShowSyrups ? [...selectedSyrups].sort() : [];
    const sortedColdFoams = rowShowColdFoams ? [...selectedColdFoams].sort() : [];
    const displayName = `${item.name} (${sizeName}${selectedTemperature ? `, ${selectedTemperature}` : ""})`;
    const shotId = item.coffeeShots ? coffeeShotChoice : "noshots";
    const id = `${slug}-${sizeLabel}-${selectedTemperature || "notemp"}-${sortedSyrups.join("-") || "plain"}-${sortedColdFoams.join("-") || "nocfoam"}-${selectedMilk || "nomilk"}-${sweetness}-${matchaStrength}-${shotId}`;
    let price = parseFloat(validSizes.find((s) => s.label === sizeLabel)?.price.replace("$", "") || "0");
    let matchaDesc = "Default (4g)";
    if (isMatcha) {
      if (matchaStrength === "extra") { price += 0.5; matchaDesc = "Extra Strong (6g, +$0.50)"; }
      else if (matchaStrength === "strongest") { price += 1; matchaDesc = "Strongest (8g, +$1.00)"; }
    }
    if (item.coffeeShots) {
      if (coffeeShotChoice === "2") price += 0.5;
      else if (coffeeShotChoice === "3") price += 1;
    }
    let milkDesc = selectedMilk;
    if (selectedMilk && PREMIUM_MILKS.has(selectedMilk)) {
      price += MILK_SURCHARGE;
      milkDesc = `${selectedMilk} (+$${MILK_SURCHARGE})`;
    }
    let syrupExtras = 0;
    const syrupDescParts = sortedSyrups.map((s) => {
      const add = syrupSurchargeUsd(s);
      syrupExtras += add;
      if (add === 0) return s;
      const suffix = add === 0.5 ? "+$0.50" : add === 1 ? "+$1" : `+$${add.toFixed(2)}`;
      return `${s} (${suffix})`;
    });
    price += syrupExtras;
    let coldFoamExtras = 0;
    const coldFoamDescParts = sortedColdFoams.map((f) => {
      const add = coldFoamSurchargeUsd(f);
      coldFoamExtras += add;
      if (add === 0) return f;
      const suffix =
        add === 0.5 ? "+$0.50" : add === 1 ? "+$1" : add === 2 ? "+$2" : `+$${add.toFixed(2)}`;
      return `${f} (${suffix})`;
    });
    price += coldFoamExtras;
    const descArr = [];
    if (item.coffeeShots) {
      const shotLine =
        coffeeShotChoice === "1"
          ? "1 shot (included)"
          : coffeeShotChoice === "2"
            ? "Double (2 shots, +$0.50)"
            : "3 shots (+$1.00)";
      descArr.push(`Espresso: ${shotLine}`);
    }
    if (isMatcha) descArr.push(`Matcha: ${matchaDesc}`);
    if (sortedSyrups.length) descArr.push(`Syrups: ${syrupDescParts.join(", ")}`);
    if (sortedColdFoams.length) descArr.push(`Cold foam (add-on): ${coldFoamDescParts.join(", ")}`);
    if (selectedMilk) descArr.push(`Milk: ${milkDesc}`);
    if (selectedTemperature) descArr.push(`Temp: ${selectedTemperature}`);
    if (sweetness) descArr.push(`Sweetness: ${sweetness}`);
    const description = descArr.join(" | ");
    addItem({ id, name: displayName, description, price });
    onItemAdded?.(displayName);
  };

  return (
    <details className="group border-b border-stll-charcoal/10">
      <summary className="flex items-start justify-between py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex-1 min-w-0">
          <span className="block text-sm sm:text-base font-semibold text-stll-charcoal tracking-wide uppercase leading-snug">
            {item.name}
          </span>
          <span className="block mt-1 text-[11px] text-stll-muted/80 tracking-widest">
            {validSizes.map((s) => `${SIZE_LABELS[s.label] ?? s.label} ${s.price}`).join("  ·  ")}
          </span>
        </div>
        <span className="text-xs text-stll-muted/60 tracking-widest shrink-0 mt-1 group-open:hidden">+</span>
        <span className="text-xs text-stll-muted/60 tracking-widest shrink-0 mt-1 hidden group-open:inline">−</span>
      </summary>

      <form onSubmit={handleAddToCart}>
        <div className="pb-6 flex flex-col gap-5">
          {item.description && (
            <p className="text-xs text-stll-muted leading-relaxed">{item.description}</p>
          )}
          {dairyCreamNote && (
            <div className="rounded-md border border-stll-charcoal/15 bg-stll-charcoal/3 px-3 py-2">
              <p className="text-[10px] tracking-[0.18em] uppercase text-stll-charcoal/85">
                Dairy Notice
              </p>
              <p className="mt-1 text-xs text-stll-muted leading-relaxed">{dairyCreamNote}</p>
            </div>
          )}

          {/* Size */}
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Size</p>
            <div className="flex gap-2 flex-wrap">
              {validSizes.map((size) => (
                <label key={size.label} className="cursor-pointer">
                  <input type="radio" name="size" value={size.label} checked={selectedSize === size.label} onChange={() => setSelectedSize(size.label)} className="sr-only peer" />
                  <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                    {SIZE_LABELS[size.label] ?? size.label} · {size.price}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Milk + Sweetness side by side */}
          <div className="flex gap-6 flex-wrap items-start">
            {rowTemperatureOptions.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Temperature</p>
                <div className="flex gap-2 flex-wrap">
                  {rowTemperatureOptions.map((temperature) => (
                    <label key={temperature} className="cursor-pointer">
                      <input
                        type="radio"
                        name="temperature"
                        value={temperature}
                        checked={selectedTemperature === temperature}
                        onChange={() => {
                          setSelectedTemperature(temperature);
                          const nextSizes =
                            (item.sizesByTemperature?.[temperature] ?? item.sizes).filter(
                              (s) => s.price !== "N/A"
                            );
                          if (!nextSizes.some((s) => s.label === selectedSize)) {
                            setSelectedSize(nextSizes[0]?.label || "");
                          }
                        }}
                        className="sr-only peer"
                      />
                      <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                        {temperature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {rowMilkOptions && rowMilkOptions.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Milk Choice</p>
                <div className="flex gap-2 flex-wrap">
                  {rowMilkOptions.map((milk) => (
                    <label key={milk} className="cursor-pointer">
                      <input type="radio" name="milk" value={milk} checked={selectedMilk === milk} onChange={() => setSelectedMilk(milk)} className="sr-only peer" />
                      <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                        {milk}
                        {PREMIUM_MILKS.has(milk) ? " +$1" : ""}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Sweetness</p>
              <div className="flex gap-2 flex-wrap">
                {["Sweet", "Less Sweet"].map((level) => (
                  <label key={level} className="cursor-pointer">
                    <input type="radio" name="sweetness" value={level} checked={sweetness === level} onChange={() => setSweetness(level)} className="sr-only peer" />
                    <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {item.coffeeShots && (
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Espresso shots</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "1" as const, label: "1 shot (included)" },
                  { value: "2" as const, label: "Double (+$0.50)" },
                  { value: "3" as const, label: "3 shots (+$1)" },
                ].map((opt) => (
                  <label key={opt.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`coffee-shots-${slug}`}
                      value={opt.value}
                      checked={coffeeShotChoice === opt.value}
                      onChange={() => setCoffeeShotChoice(opt.value)}
                      className="sr-only peer"
                    />
                    <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Matcha Strength below milk + sweetness */}
          {isMatcha && (
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Matcha Strength</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "default", label: "Default (4g)" },
                  { value: "extra", label: "Extra Strong (6g) +$0.50" },
                  { value: "strongest", label: "Strongest (8g) +$1.00" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMatchaStrength(opt.value)}
                    className={`px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal ${matchaStrength === opt.value ? "bg-stll-charcoal text-white border-stll-charcoal" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] mt-1 text-stll-muted">Our default is 4g of matcha. Choose a stronger option for a more intense flavor.</p>
            </div>
          )}

          {/* Syrups — not offered on coconut cloud drinks */}
          {rowShowSyrups && (
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Add Extra Syrup</p>
              <div className="flex gap-2 flex-wrap">
                {SYRUPS.map((syrup) => (
                  <label key={syrup} className="cursor-pointer">
                    <input type="checkbox" name="syrup" value={syrup} checked={selectedSyrups.includes(syrup)} onChange={() => handleSyrupChange(syrup)} className="sr-only peer" />
                    <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      {syrup}
                      {formatSyrupPriceLabel(syrupSurchargeUsd(syrup))}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {rowShowColdFoams && (
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Cold foam (add-on)</p>
              <div className="flex gap-2 flex-wrap">
                {COLD_FOAMS.map((foam) => (
                  <label key={foam} className="cursor-pointer">
                    <input
                      type="checkbox"
                      name="coldFoam"
                      value={foam}
                      checked={selectedColdFoams.includes(foam)}
                      onChange={() => handleColdFoamChange(foam)}
                      className="sr-only peer"
                    />
                    <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      {foam}
                      {formatSyrupPriceLabel(coldFoamSurchargeUsd(foam))}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {!canAddToCart && addBlockedMessage && (
            <p className="text-xs text-stll-muted leading-relaxed">{addBlockedMessage}</p>
          )}
          <button
            type="submit"
            disabled={!canAddToCart}
            className="w-full sm:w-auto px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {canAddToCart ? (isPreOrderOnly ? "Pre-order" : "Add to Order") : "Ordering closed"}
          </button>
        </div>
      </form>
    </details>
  );
}

const SIP_AND_BITE_PRICE = 16.5;
const SIP_BITE_CLOVER_CLOUD_DRINK = "Clover Coconut Cloud";
const SIP_BITE_CLOVER_CLOUD_ADD = 2;

type SipBiteSeriesId = "coldbrew" | "coffee" | "cloud";

const SIP_BITE_SERIES: { id: SipBiteSeriesId; label: string }[] = [
  { id: "coldbrew", label: "Cold Brew" },
  { id: "coffee", label: "Coffee Series" },
  { id: "cloud", label: "Coconut Cloud" },
];

type SipBiteDippingId = "mixed" | "soy" | "chilli";

const SIP_BITE_DIPPING: { id: SipBiteDippingId; label: string }[] = [
  { id: "mixed", label: "Soy & chilli oil (mixed)" },
  { id: "soy", label: "Soy only" },
  { id: "chilli", label: "Chilli oil only" },
];

function SipAndBiteSection({
  coldBrewItems,
  coffeeItems,
  cloudItems,
  milkOptions = ["Oat", "Whole", "Almond", "Soy"],
  onItemAdded,
  canAddToCart = true,
  addBlockedMessage,
  isPreOrderOnly = false,
}: {
  coldBrewItems: MenuItemData[];
  coffeeItems: MenuItemData[];
  cloudItems: MenuItemData[];
  milkOptions?: string[];
  onItemAdded?: (itemSummary: string) => void;
  canAddToCart?: boolean;
  addBlockedMessage?: string;
  isPreOrderOnly?: boolean;
}) {
  const { addItem } = useCart();
  const [series, setSeries] = useState<SipBiteSeriesId>("coldbrew");
  const drinksForSeries = useMemo(
    () =>
      series === "coldbrew" ? coldBrewItems : series === "coffee" ? coffeeItems : cloudItems,
    [series, coldBrewItems, coffeeItems, cloudItems]
  );

  const [selectedDrinkName, setSelectedDrinkName] = useState("");
  const item =
    drinksForSeries.find((d) => d.name === selectedDrinkName) ?? drinksForSeries[0] ?? null;

  useEffect(() => {
    const first = drinksForSeries[0]?.name ?? "";
    setSelectedDrinkName(first);
  }, [series, drinksForSeries]);

  const rowMilkOptions =
    item?.milkOptionsOverride !== undefined ? item.milkOptionsOverride : milkOptions;
  const rowTemperatureOptions = item?.temperatureOptionsOverride ?? [];
  const [selectedMilk, setSelectedMilk] = useState("");
  const [selectedTemperature, setSelectedTemperature] = useState("");
  const [sweetness, setSweetness] = useState("Sweet");
  const [coffeeShotChoice, setCoffeeShotChoice] = useState<"1" | "2" | "3">("1");
  const [siomaiDipping, setSiomaiDipping] = useState<SipBiteDippingId>("mixed");

  useEffect(() => {
    if (!item) return;
    setSelectedMilk(rowMilkOptions?.length ? rowMilkOptions[0] : "");
    setSelectedTemperature(rowTemperatureOptions.length ? rowTemperatureOptions[0] : "");
    setSweetness("Sweet");
    setCoffeeShotChoice("1");
  }, [item?.name]);

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddToCart || !item) return;

    const tempSuffix = selectedTemperature ? `, ${selectedTemperature}` : "";
    const displayName = `SIP & BITE — ${item.name} (Regular${tempSuffix})`;
    const slug = slugify(item.name);
    const dippingLabel = SIP_BITE_DIPPING.find((d) => d.id === siomaiDipping)?.label ?? siomaiDipping;
    const id = `sip-bite-${series}-${slug}-${selectedTemperature || "notemp"}-${selectedMilk || "nomilk"}-${sweetness}-${siomaiDipping}-${item.coffeeShots ? coffeeShotChoice : "noshots"}`;

    const cloverCloudAdd =
      item.name === SIP_BITE_CLOVER_CLOUD_DRINK ? SIP_BITE_CLOVER_CLOUD_ADD : 0;
    const comboPrice = SIP_AND_BITE_PRICE + cloverCloudAdd;

    const descArr = ["6pc siomai included", `Dipping: ${dippingLabel}`];
    if (cloverCloudAdd > 0) descArr.push(`Clover Cloud add-on: +$${cloverCloudAdd.toFixed(2)}`);
    if (item.coffeeShots) {
      const shotLine =
        coffeeShotChoice === "1"
          ? "1 shot"
          : coffeeShotChoice === "2"
            ? "Double (2 shots)"
            : "3 shots";
      descArr.push(`Espresso: ${shotLine}`);
    }
    if (selectedMilk) descArr.push(`Milk: ${selectedMilk}`);
    if (selectedTemperature) descArr.push(`Temp: ${selectedTemperature}`);
    if (sweetness && (rowMilkOptions?.length || rowTemperatureOptions.length)) {
      descArr.push(`Sweetness: ${sweetness}`);
    }
    descArr.push(`Series: ${SIP_BITE_SERIES.find((s) => s.id === series)?.label ?? series}`);

    addItem({
      id,
      name: displayName,
      description: descArr.join(" | "),
      price: comboPrice,
    });
    onItemAdded?.(displayName);
  };

  if (!drinksForSeries.length) return null;

  return (
    <section className="mb-20">
      <div className="flex items-baseline gap-4 mb-1">
        <h2 className="text-[2.5rem] sm:text-[3.5rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          Sip &amp; Bite
        </h2>
      </div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-2">
        Combo — your drink + 6pc siomai
      </p>
      <p className="text-xs text-stll-muted mb-2 uppercase tracking-[0.15em]">
        $16.50 · Regular drink from Cold Brew, Coffee, or Coconut Cloud series
      </p>
      <p className="text-xs text-stll-muted/90 mb-6 leading-relaxed">
        Clover Cloud is a <span className="font-medium text-stll-charcoal">+$2 add</span> on the combo ($18.50).
      </p>

      <details className="group border-b border-stll-charcoal/10" open>
        <summary className="flex items-start justify-between py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex-1 min-w-0">
            <span className="block text-sm sm:text-base font-semibold text-stll-charcoal tracking-wide uppercase leading-snug">
              Sip &amp; Bite Combo
            </span>
            <span className="block mt-1 text-[11px] text-stll-muted/80 tracking-widest">
              From $16.50 · Includes 6pc siomai · Clover Cloud +$2
            </span>
          </div>
          <span className="text-xs text-stll-muted/60 tracking-widest shrink-0 mt-1 group-open:hidden">+</span>
          <span className="text-xs text-stll-muted/60 tracking-widest shrink-0 mt-1 hidden group-open:inline">−</span>
        </summary>

        <form onSubmit={handleAddToCart}>
          <div className="pb-6 flex flex-col gap-5">
            <p className="text-xs text-stll-muted leading-relaxed">
              Pick one drink from the series below. Combo is served regular size with 6pc siomai on the side.
            </p>

            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Drink series</p>
              <div className="flex gap-2 flex-wrap">
                {SIP_BITE_SERIES.map((s) => (
                  <label key={s.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="sip-bite-series"
                      checked={series === s.id}
                      onChange={() => setSeries(s.id)}
                      className="sr-only peer"
                    />
                    <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Choose your drink</p>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {drinksForSeries.map((drink) => (
                  <label key={drink.name} className="cursor-pointer">
                    <input
                      type="radio"
                      name="sip-bite-drink"
                      checked={selectedDrinkName === drink.name}
                      onChange={() => setSelectedDrinkName(drink.name)}
                      className="sr-only peer"
                    />
                    <span className="block px-4 py-2.5 text-[11px] tracking-[0.12em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal leading-snug">
                      {drink.name}
                      {drink.name === SIP_BITE_CLOVER_CLOUD_DRINK ? " (+$2)" : ""}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {item?.description && (
              <p className="text-xs text-stll-muted leading-relaxed">{item.description}</p>
            )}
            {item?.name === SIP_BITE_CLOVER_CLOUD_DRINK && (
              <p className="text-xs text-stll-charcoal/85 leading-relaxed border border-stll-charcoal/15 bg-stll-charcoal/3 px-3 py-2">
                Clover Cloud adds $2 to this combo (total $18.50).
              </p>
            )}

            <div className="flex gap-6 flex-wrap items-start">
              {rowTemperatureOptions.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Temperature</p>
                  <div className="flex gap-2 flex-wrap">
                    {rowTemperatureOptions.map((temperature) => (
                      <label key={temperature} className="cursor-pointer">
                        <input
                          type="radio"
                          name="sip-bite-temperature"
                          checked={selectedTemperature === temperature}
                          onChange={() => setSelectedTemperature(temperature)}
                          className="sr-only peer"
                        />
                        <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                          {temperature}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {rowMilkOptions && rowMilkOptions.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Milk choice</p>
                  <div className="flex gap-2 flex-wrap">
                    {rowMilkOptions.map((milk) => (
                      <label key={milk} className="cursor-pointer">
                        <input
                          type="radio"
                          name="sip-bite-milk"
                          checked={selectedMilk === milk}
                          onChange={() => setSelectedMilk(milk)}
                          className="sr-only peer"
                        />
                        <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                          {milk}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(rowMilkOptions?.length || rowTemperatureOptions.length) > 0 && (
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Sweetness</p>
                  <div className="flex gap-2 flex-wrap">
                    {["Sweet", "Less Sweet"].map((level) => (
                      <label key={level} className="cursor-pointer">
                        <input
                          type="radio"
                          name="sip-bite-sweetness"
                          checked={sweetness === level}
                          onChange={() => setSweetness(level)}
                          className="sr-only peer"
                        />
                        <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">
                Siomai dipping <span className="text-red-400">*</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {SIP_BITE_DIPPING.map((opt) => (
                  <label key={opt.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="sip-bite-dipping"
                      required
                      checked={siomaiDipping === opt.id}
                      onChange={() => setSiomaiDipping(opt.id)}
                      className="sr-only peer"
                    />
                    <span className="block px-4 py-2 text-[11px] tracking-[0.12em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal leading-snug">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {item?.coffeeShots && (
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Espresso shots</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "1" as const, label: "1 shot (included)" },
                    { value: "2" as const, label: "Double (2 shots)" },
                    { value: "3" as const, label: "3 shots" },
                  ].map((opt) => (
                    <label key={opt.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="sip-bite-shots"
                        checked={coffeeShotChoice === opt.value}
                        onChange={() => setCoffeeShotChoice(opt.value)}
                        className="sr-only peer"
                      />
                      <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {!canAddToCart && addBlockedMessage && (
              <p className="text-xs text-stll-muted leading-relaxed">{addBlockedMessage}</p>
            )}
            <button
              type="submit"
              disabled={!canAddToCart || !item}
              className="w-full sm:w-auto px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {canAddToCart
                ? isPreOrderOnly
                  ? "Pre-order Sip & Bite"
                  : item?.name === SIP_BITE_CLOVER_CLOUD_DRINK
                    ? "Add Sip & Bite — $18.50"
                    : "Add Sip & Bite — $16.50"
                : "Ordering closed"}
            </button>
          </div>
        </form>
      </details>
    </section>
  );
}

function MenuSection({
  title,
  subtitle,
  items,
  milkOptions,
  milkNote,
  showSyrups = true,
  showColdFoams = false,
  onItemAdded,
  canAddToCart = true,
  addBlockedMessage,
  isPreOrderOnly = false,
}: {
  title: string;
  subtitle: string;
  items: MenuItemData[];
  milkOptions?: string[];
  milkNote?: string;
  showSyrups?: boolean;
  showColdFoams?: boolean;
  onItemAdded?: (itemSummary: string) => void;
  canAddToCart?: boolean;
  addBlockedMessage?: string;
  isPreOrderOnly?: boolean;
}) {
  return (
    <section className="mb-20">
      <div className="flex items-baseline gap-4 mb-1">
        <h2 className="text-[2.5rem] sm:text-[3.5rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          {title}
        </h2>
      </div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-2">{subtitle}</p>
      {milkNote && (
        <p className="text-xs text-stll-muted mb-2 uppercase tracking-[0.15em]">{milkNote}</p>
      )}
      <div className="flex flex-col divide-y divide-stll-charcoal/10">
        {items.map((item) => (
          <MenuItemRow
            key={item.name}
            item={item}
            milkOptions={milkOptions}
            showSyrups={showSyrups}
            showColdFoams={showColdFoams}
            onItemAdded={onItemAdded}
            canAddToCart={canAddToCart}
            addBlockedMessage={addBlockedMessage}
            isPreOrderOnly={isPreOrderOnly}
          />
        ))}
      </div>
    </section>
  );
}

export default function GalleryPage() {
  const { data: orderingStatus } = useOrderingStatus();
  const canAddToCart = orderingStatus?.canAddToCart ?? true;
  const isPreOrderOnly = orderingStatus?.isPreOrderOnly ?? false;
  const addBlockedMessage = orderingStatus?.canAddToCart === false ? orderingStatus.message : undefined;
  const [cartPrompt, setCartPrompt] = useState<{ open: boolean; name: string }>({ open: false, name: "" });
  const closeCartPrompt = useCallback(() => setCartPrompt({ open: false, name: "" }), []);
  const openCartPrompt = useCallback((name: string) => setCartPrompt({ open: true, name }), []);
  const [menuState, setMenuState] = useState(() => ({
    matchaItems,
    coldBrewItems,
    coffeeItems,
    nonCoffeeItems,
    cloudItems,
  }));

  useEffect(() => {
    if (!ENABLE_BACKEND_MENU_SYNC) return;
    let cancelled = false;

    async function syncMenuPrices() {
      try {
        const res = await fetch("/api/menu-prices", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { items?: BackendMenuItem[] };
        if (!Array.isArray(json.items)) return;

        const backendPrices = new Map<string, number>();
        for (const row of json.items) {
          if (typeof row.name !== "string" || typeof row.price !== "number") continue;
          backendPrices.set(row.name.toLowerCase(), row.price);
        }

        if (cancelled) return;
        setMenuState({
          matchaItems: applyBackendPrices(matchaItems, backendPrices),
          coldBrewItems: applyBackendPrices(coldBrewItems, backendPrices),
          coffeeItems: applyBackendPrices(coffeeItems, backendPrices),
          nonCoffeeItems: applyBackendPrices(nonCoffeeItems, backendPrices),
          cloudItems: applyBackendPrices(cloudItems, backendPrices),
        });
      } catch {
        // Keep static menu pricing if backend sync is unavailable.
      }
    }

    syncMenuPrices();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <AddedToCartDialog
        open={cartPrompt.open}
        itemName={cartPrompt.name}
        onClose={closeCartPrompt}
      />
      <div className="pt-32 pb-16 px-6 sm:px-12 lg:px-20 border-b border-stll-charcoal/10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-4">Stll Haus — Matcha &amp; Coffee</p>
        <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          Menu
        </h1>
      </div>
      <div className="px-6 sm:px-12 lg:px-20 pt-16 pb-24">
        <OrderingStatusBanner status={orderingStatus} className="mb-10" />
        <MenuSection
          title="Matcha Lattes"
          subtitle="Premium Kyoto Matcha from Thea Matcha, Oat milk base"
          items={menuState.matchaItems}
          milkOptions={["Oat", "Whole", "Almond", "Soy"]}
          milkNote="OAT OR WHOLE AT MENU PRICE. ALMOND OR SOY +$1."
          showColdFoams
          onItemAdded={openCartPrompt}
          canAddToCart={canAddToCart}
          addBlockedMessage={addBlockedMessage}
          isPreOrderOnly={isPreOrderOnly}
        />
        <MenuSection
          title="Cold Brew Coffees"
          subtitle="Slow steeped, oat milk base"
          items={menuState.coldBrewItems}
          milkOptions={["Oat", "Whole", "Almond", "Soy"]}
          milkNote="OAT OR WHOLE AT MENU PRICE. ALMOND OR SOY +$1."
          showColdFoams
          onItemAdded={openCartPrompt}
          canAddToCart={canAddToCart}
          addBlockedMessage={addBlockedMessage}
          isPreOrderOnly={isPreOrderOnly}
        />
        <MenuSection
          title="Coffee Series"
          subtitle="House coffee lattes"
          items={menuState.coffeeItems}
          milkOptions={["Oat", "Whole", "Almond", "Soy"]}
          milkNote="OAT OR WHOLE AT MENU PRICE. ALMOND OR SOY +$1."
          showColdFoams
          onItemAdded={openCartPrompt}
          canAddToCart={canAddToCart}
          addBlockedMessage={addBlockedMessage}
          isPreOrderOnly={isPreOrderOnly}
        />
        <SipAndBiteSection
          coldBrewItems={menuState.coldBrewItems}
          coffeeItems={menuState.coffeeItems}
          cloudItems={menuState.cloudItems}
          milkOptions={["Oat", "Whole", "Almond", "Soy"]}
          onItemAdded={openCartPrompt}
          canAddToCart={canAddToCart}
          addBlockedMessage={addBlockedMessage}
          isPreOrderOnly={isPreOrderOnly}
        />
        <MenuSection
          title="Non Coffee Series"
          subtitle="Cream-topped and classic chocolate — no syrup add-ons"
          items={menuState.nonCoffeeItems}
          milkOptions={["Oat", "Whole", "Almond", "Soy"]}
          milkNote="OAT OR WHOLE AT MENU PRICE. ALMOND OR SOY +$1."
          showSyrups={false}
          showColdFoams={false}
          onItemAdded={openCartPrompt}
          canAddToCart={canAddToCart}
          addBlockedMessage={addBlockedMessage}
          isPreOrderOnly={isPreOrderOnly}
        />
        <MenuSection
          title="Coconut Cloud Drinks"
          subtitle="Coconut water, house-made cloud foams — no milk (coconut water base)"
          items={menuState.cloudItems}
          milkOptions={[]}
          showSyrups={false}
          showColdFoams
          onItemAdded={openCartPrompt}
          canAddToCart={canAddToCart}
          addBlockedMessage={addBlockedMessage}
          isPreOrderOnly={isPreOrderOnly}
        />
      </div>
    </div>
  );
}