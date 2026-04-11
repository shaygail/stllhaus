"use client";

import { useCart } from "@/components/CartContext";
import { useState } from "react";

type Size = { label: string; price: string };

type MenuItemData = {
  name: string;
  description: string;
  image: string;
  sizes: Size[];
  /** When set, replaces the section default. Use `[]` to hide milk choice for this drink. */
  milkOptionsOverride?: string[];
  /** When set, shows temperature choices for this drink. */
  temperatureOptionsOverride?: string[];
  /** When true, hides syrup and cold foam add-ons (e.g. OG Matcha: milk, temp, matcha strength only). */
  hideAddOns?: boolean;
};

const SIZE_LABELS: Record<string, string> = { T: "Small", G: "Regular", V: "Large" };
const MILK_SURCHARGE = 1;
const PREMIUM_MILKS = new Set(["Almond", "Soy"]);

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
  if (name.includes("choco cream")) {
    return "Chocolate cream top. Contains dairy.";
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
  { name: "Earl Grey Matcha",            description: "Premium Kyoto matcha with earl grey notes. Choose your matcha strength below.", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "N/A" }], temperatureOptionsOverride: ["Hot", "Iced"] },
  {
    name: "OG Matcha Latte",
    description: "Simple matcha latte — milk, hot or iced, and matcha strength only. No syrup or cold foam add-ons.",
    image: "",
    sizes: [{ label: "G", price: "$7" }, { label: "V", price: "N/A" }],
    temperatureOptionsOverride: ["Hot", "Iced"],
    hideAddOns: true,
  },
  {
    name: "Classic Matcha",
    description: "Fully customisable — syrups, cold foams, milk, temperature, matcha strength, and sweetness.",
    image: "",
    sizes: [{ label: "G", price: "$7" }, { label: "V", price: "N/A" }],
    temperatureOptionsOverride: ["Hot", "Iced"],
  },
  { name: "Strawberry Matcha",           description: "Strawberry and matcha fusion. Adjust matcha strength as you like.", image: "", sizes: [{ label: "G", price: "$10" }, { label: "V", price: "N/A" }] },
  { name: "Strawberry Cloud Matcha", description: "Strawberry, cloud foam, and matcha. Choose your matcha strength.", image: "", sizes: [{ label: "G", price: "$11" }, { label: "V", price: "N/A" }] },
  { name: "Ube Cream Matcha",            description: "Ube cream and matcha. Default is 4g matcha, but you can select extra strong options.", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }], temperatureOptionsOverride: ["Hot", "Iced"] },
];

const coldBrewItems: MenuItemData[] = [
  { name: "OG Cold Brew",                description: "", image: "", sizes: [{ label: "T", price: "$6" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  {
    name: "Ube Cream Coldbrew Latte",
    description: "",
    image: "",
    sizes: [{ label: "T", price: "$7" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }],
    milkOptionsOverride: [],
  },
  { name: "Brown Sugar Cold Brew",       description: "", image: "", sizes: [{ label: "T", price: "$7" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Black Pearl Cold Brew Latte", description: "", image: "", sizes: [{ label: "T", price: "$7" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Spanish Latte Cold Brew",     description: "", image: "", sizes: [{ label: "T", price: "$7" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }] },
];

const coffeeItems: MenuItemData[] = [
  { name: "Ube Spanish Latte", description: "", image: "", sizes: [{ label: "G", price: "$8.50" }, { label: "V", price: "$11.00" }], temperatureOptionsOverride: ["Hot", "Iced"] },
  { name: "Spanish Latte", description: "", image: "", sizes: [{ label: "G", price: "$8.00" }, { label: "V", price: "$10.00" }], temperatureOptionsOverride: ["Hot", "Iced"] },
  { name: "Biscoff Latte", description: "", image: "", sizes: [{ label: "G", price: "$9.00" }, { label: "V", price: "$13.00" }], temperatureOptionsOverride: ["Hot", "Iced"] },
];

const nonCoffeeItems: MenuItemData[] = [
  {
    name: "Twilight Cream",
    description:
      "Ube cream top with your choice of milk. Oat or whole at menu price; almond or soy +$1. Syrups not included.",
    image: "",
    sizes: [{ label: "G", price: "$8.50" }, { label: "V", price: "$10.00" }],
    temperatureOptionsOverride: ["Hot", "Iced"],
    hideAddOns: true,
  },
  {
    name: "Choco Cream",
    description:
      "Chocolate cream top with your choice of milk. Oat or whole at menu price; almond or soy +$1. Syrups not included.",
    image: "",
    sizes: [{ label: "G", price: "$8.50" }, { label: "V", price: "$10.00" }],
    temperatureOptionsOverride: ["Hot", "Iced"],
    hideAddOns: true,
  },
  {
    name: "Strawberry Cloud",
    description:
      "Strawberry cloud foam top with your choice of milk. Oat or whole at menu price; almond or soy +$1. Syrups not included.",
    image: "",
    sizes: [{ label: "G", price: "$8.50" }, { label: "V", price: "$10.00" }],
    temperatureOptionsOverride: ["Hot", "Iced"],
    hideAddOns: true,
  },
  {
    name: "Strawberry Cream",
    description:
      "Strawberry cream top with your choice of milk. Oat or whole at menu price; almond or soy +$1. Syrups not included.",
    image: "",
    sizes: [{ label: "G", price: "$8.50" }, { label: "V", price: "$10.00" }],
    temperatureOptionsOverride: ["Hot", "Iced"],
    hideAddOns: true,
  },
  {
    name: "Midnight Cocoa",
    description: "Classic cocoa — served hot or iced. Oat or whole at menu price; almond or soy +$1.",
    image: "",
    sizes: [{ label: "G", price: "$8.50" }, { label: "V", price: "$10.00" }],
    temperatureOptionsOverride: ["Hot", "Iced"],
    hideAddOns: true,
  },
];

const cloudItems: MenuItemData[] = [
  { name: "Black Pearl Coconut Cloud", description: "Refreshing coconut water and homemade black gulaman cloud foam.", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Clover Coconut Cloud",      description: "Refreshing coconut water and premium Kyoto Thea matcha powder cloud foam.", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Twilight Coconut Cloud",    description: "Refreshing coconut water and homemade ube cloud foam.", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  {
    name: "Midnight Coconut Cloud",
    description: "Refreshing coconut water with chocolate cream cloud foam.",
    image: "",
    sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }],
  },
];

function MenuItemRow({
  item,
  milkOptions,
  showSyrups = true,
  showColdFoams = false,
}: {
  item: MenuItemData;
  milkOptions?: string[];
  showSyrups?: boolean;
  showColdFoams?: boolean;
}) {
  const isMatcha = item.name.toLowerCase().includes("matcha");
  const dairyCreamNote = getDairyCreamBaseNote(item.name);
  const validSizes = item.sizes.filter((s) => s.price !== "N/A");
  const slug = slugify(item.name);
  const rowMilkOptions = item.milkOptionsOverride !== undefined ? item.milkOptionsOverride : milkOptions;
  const rowTemperatureOptions = item.temperatureOptionsOverride ?? [];
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(validSizes[0]?.label || "");
  const [selectedSyrups, setSelectedSyrups] = useState<string[]>([]);
  const [selectedColdFoams, setSelectedColdFoams] = useState<string[]>([]);
  const [selectedMilk, setSelectedMilk] = useState(rowMilkOptions?.length ? rowMilkOptions[0] : "");
  const [selectedTemperature, setSelectedTemperature] = useState(
    rowTemperatureOptions.length ? rowTemperatureOptions[0] : ""
  );
  const [sweetness, setSweetness] = useState("Sweet");
  const [matchaStrength, setMatchaStrength] = useState("default");

  const rowShowSyrups = showSyrups && !item.hideAddOns;
  const rowShowColdFoams = showColdFoams && !item.hideAddOns;

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
    const sizeLabel = selectedSize;
    const sizeName = SIZE_LABELS[sizeLabel] ?? sizeLabel;
    const sortedSyrups = rowShowSyrups ? [...selectedSyrups].sort() : [];
    const sortedColdFoams = rowShowColdFoams ? [...selectedColdFoams].sort() : [];
    const displayName = `${item.name} (${sizeName}${selectedTemperature ? `, ${selectedTemperature}` : ""})`;
    const id = `${slug}-${sizeLabel}-${selectedTemperature || "notemp"}-${sortedSyrups.join("-") || "plain"}-${sortedColdFoams.join("-") || "nocfoam"}-${selectedMilk || "nomilk"}-${sweetness}-${matchaStrength}`;
    let price = parseFloat(validSizes.find((s) => s.label === sizeLabel)?.price.replace("$", "") || "0");
    let matchaDesc = "Default (4g)";
    if (isMatcha) {
      if (matchaStrength === "extra") { price += 0.5; matchaDesc = "Extra Strong (6g, +$0.50)"; }
      else if (matchaStrength === "strongest") { price += 1; matchaDesc = "Strongest (8g, +$1.00)"; }
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
    if (isMatcha) descArr.push(`Matcha: ${matchaDesc}`);
    if (sortedSyrups.length) descArr.push(`Syrups: ${syrupDescParts.join(", ")}`);
    if (sortedColdFoams.length) descArr.push(`Cold foam (add-on): ${coldFoamDescParts.join(", ")}`);
    if (selectedMilk) descArr.push(`Milk: ${milkDesc}`);
    if (selectedTemperature) descArr.push(`Temp: ${selectedTemperature}`);
    if (sweetness) descArr.push(`Sweetness: ${sweetness}`);
    const description = descArr.join(" | ");
    addItem({ id, name: displayName, description, price });
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

          <button type="submit" className="w-full sm:w-auto px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white text-center cursor-pointer">
            Add to Order
          </button>
        </div>
      </form>
    </details>
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
}: {
  title: string;
  subtitle: string;
  items: MenuItemData[];
  milkOptions?: string[];
  milkNote?: string;
  showSyrups?: boolean;
  showColdFoams?: boolean;
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
          />
        ))}
      </div>
    </section>
  );
}

export default function GalleryPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <div className="pt-32 pb-16 px-6 sm:px-12 lg:px-20 border-b border-stll-charcoal/10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-4">Stll Haus — Matcha &amp; Coffee</p>
        <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          Menu
        </h1>
      </div>
      <div className="px-6 sm:px-12 lg:px-20 pt-16 pb-24">
        <MenuSection
          title="Matcha Lattes"
          subtitle="Premium Kyoto Matcha from Thea Matcha, Oat milk base"
          items={matchaItems}
          milkOptions={["Oat", "Whole", "Almond", "Soy"]}
          milkNote="OAT OR WHOLE AT MENU PRICE. ALMOND OR SOY +$1."
          showColdFoams
        />
        <MenuSection
          title="Cold Brew Coffees"
          subtitle="Slow steeped, oat milk base"
          items={coldBrewItems}
          milkOptions={["Oat", "Whole", "Almond", "Soy"]}
          milkNote="OAT OR WHOLE AT MENU PRICE. ALMOND OR SOY +$1."
          showColdFoams
        />
        <MenuSection
          title="Coffee Series"
          subtitle="House coffee lattes"
          items={coffeeItems}
          milkOptions={["Oat", "Whole", "Almond", "Soy"]}
          milkNote="OAT OR WHOLE AT MENU PRICE. ALMOND OR SOY +$1."
          showColdFoams
        />
        <MenuSection
          title="Non Coffee Series"
          subtitle="Cream-topped and classic chocolate — no syrup add-ons"
          items={nonCoffeeItems}
          milkOptions={["Oat", "Whole", "Almond", "Soy"]}
          milkNote="OAT OR WHOLE AT MENU PRICE. ALMOND OR SOY +$1."
          showSyrups={false}
          showColdFoams={false}
        />
        <MenuSection
          title="Coconut Cloud Drinks"
          subtitle="Coconut water, house-made cloud foams"
          items={cloudItems}
          showSyrups={false}
          showColdFoams
        />
      </div>
    </div>
  );
}