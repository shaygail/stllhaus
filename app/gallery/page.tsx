"use client";
const matchaItems: MenuItemData[] = [
  { name: "Earl Grey Matcha",            description: "", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "N/A" }] },
  { name: "OG Matcha Latte",             description: "", image: "", sizes: [{ label: "G", price: "$7" }, { label: "V", price: "N/A" }] },
  { name: "Strawberry Matcha",           description: "", image: "", sizes: [{ label: "G", price: "$10" }, { label: "V", price: "N/A" }] },
  { name: "Strawberry and Cloud Matcha", description: "", image: "", sizes: [{ label: "G", price: "$11" }, { label: "V", price: "N/A" }] },
  { name: "Ube Cream Matcha",            description: "", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }] },
];
import { useCart } from "@/components/CartContext";
import { useState } from "react";


const SYRUPS = ["Ube", "Earl Grey", "Strawberry", "Brown Sugar"] as const;

type Size = { label: string; price: string };

type MenuItemData = {
  name: string;
  description: string;
  image: string;
  sizes: Size[];
};

const SIZE_LABELS: Record<string, string> = { T: "Tall", G: "Grande", V: "Venti" };

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function MenuItemRow({ item, milkOptions }: { item: MenuItemData; milkOptions?: string[] }) {
  const validSizes = item.sizes.filter((s) => s.price !== "N/A");
  const slug = slugify(item.name);
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(validSizes[0]?.label || "");
  const [selectedSyrups, setSelectedSyrups] = useState<string[]>([]);
  const [selectedMilk, setSelectedMilk] = useState(milkOptions ? milkOptions[0] : "");
  const [sweetness, setSweetness] = useState("Sweet");

  const handleSyrupChange = (syrup: string) => {
    setSelectedSyrups((prev) =>
      prev.includes(syrup) ? prev.filter((s) => s !== syrup) : [...prev, syrup]
    );
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    const sizeLabel = selectedSize;
    const sizeName = SIZE_LABELS[sizeLabel] ?? sizeLabel;
    const sortedSyrups = [...selectedSyrups].sort();
    const displayName = `${item.name} (${sizeName})`;
    const id = `${slug}-${sizeLabel}-${sortedSyrups.join("-") || "plain"}-${selectedMilk || "nomilk"}-${sweetness}`;
    const price = parseFloat(validSizes.find((s) => s.label === sizeLabel)?.price.replace("$", "") || "0");
    const descArr = [];
    if (sortedSyrups.length) descArr.push(`Syrups: ${sortedSyrups.join(", ")}`);
    if (selectedMilk) descArr.push(`Milk: ${selectedMilk}`);
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

          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Size</p>
            <div className="flex gap-2 flex-wrap">
              {validSizes.map((size) => (
                <label key={size.label} className="cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value={size.label}
                    checked={selectedSize === size.label}
                    onChange={() => setSelectedSize(size.label)}
                    className="sr-only peer"
                  />
                  <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                    {SIZE_LABELS[size.label] ?? size.label} · {size.price}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {milkOptions && (
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Milk Choice</p>
              <div className="flex gap-2 flex-wrap">
                {milkOptions.map((milk) => (
                  <label key={milk} className="cursor-pointer">
                    <input
                      type="radio"
                      name="milk"
                      value={milk}
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

          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Sweetness</p>
            <div className="flex gap-2 flex-wrap">
              {["Sweet", "Less Sweet"].map((level) => (
                <label key={level} className="cursor-pointer">
                  <input
                    type="radio"
                    name="sweetness"
                    value={level}
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

          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Add Syrup</p>
            <div className="flex gap-2 flex-wrap">
              {SYRUPS.map((syrup) => (
                <label key={syrup} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="syrup"
                    value={syrup}
                    checked={selectedSyrups.includes(syrup)}
                    onChange={() => handleSyrupChange(syrup)}
                    className="sr-only peer"
                  />
                  <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                    {syrup}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full sm:w-auto px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white text-center cursor-pointer">
            Add to Order
          </button>
        </div>
      </form>
    </details>
  );
}

// (Removed duplicate and misplaced menu arrays and MenuSection)

const coldBrewItems: MenuItemData[] = [
  { name: "OG Cold Brew",                description: "", image: "", sizes: [{ label: "T", price: "$6" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Ube Cream Coldbrew Latte",    description: "", image: "", sizes: [{ label: "T", price: "$7" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Brown Sugar Cold Brew",       description: "", image: "", sizes: [{ label: "T", price: "$7" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Black Pearl Cold Brew Latte", description: "", image: "", sizes: [{ label: "T", price: "$7" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Spanish Latte Cold Brew",     description: "", image: "", sizes: [{ label: "T", price: "$7" }, { label: "G", price: "$8" }, { label: "V", price: "$10" }] },
];

const cloudItems: MenuItemData[] = [
  { name: "Black Pearl Coconut Cloud", description: "Refreshing coconut water and homemade black gulaman cloud foam.", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Clover Coconut Cloud",      description: "Refreshing coconut water and premium Kyoto Thea matcha powder cloud foam.", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  { name: "Twilight Coconut Cloud",    description: "Refreshing coconut water and homemade ube cloud foam.", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }] },
];

function MenuSection({ title, subtitle, items, milkOptions, milkNote }: { title: string; subtitle: string; items: MenuItemData[]; milkOptions?: string[]; milkNote?: string }) {
  return (
    <section className="mb-20">
      <div className="flex items-baseline gap-4 mb-1">
        <h2 className="text-[2.5rem] sm:text-[3.5rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          {title}
        </h2>
      </div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-2">{subtitle}</p>
      {milkNote && <p className="text-xs text-stll-muted mb-2">{milkNote}</p>}
      <div className="flex flex-col divide-y divide-stll-charcoal/10">
        {items.map((item) => (
          <MenuItemRow key={item.name} item={item} milkOptions={milkOptions} />
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
          subtitle="Kyoto Thea matcha, oat milk base"
          items={matchaItems}
          milkOptions={["Oat", "Whole", "Almond"]}
          milkNote="Oat milk is default. Whole/Almond available upon request."
        />
        <MenuSection
          title="Cold Brew Coffees"
          subtitle="Single origin, slow steeped, oat milk base"
          items={coldBrewItems}
          milkOptions={["Oat", "Whole", "Almond"]}
          milkNote="Oat milk is default. Whole/Almond available upon request."
        />
        <MenuSection
          title="Coconut Cloud Drinks"
          subtitle="Coconut water, house-made cloud foams"
          items={cloudItems}
        />
      </div>
    </div>
  );
}
