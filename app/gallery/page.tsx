import Link from "next/link";
import { addToCartAction } from "@/app/actions/cart";

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

function MenuItemRow({ item }: { item: MenuItemData }) {
  const validSizes = item.sizes.filter((s) => s.price !== "N/A");
  const slug = slugify(item.name);

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

      <form action={addToCartAction}>
        <input type="hidden" name="item-name" value={item.name} />
        <input type="hidden" name="item-slug" value={slug} />
        {validSizes.map((size) => (
          <input key={size.label} type="hidden" name={`price_${size.label}`} value={size.price.replace("$", "")} />
        ))}

        <div className="pb-6 flex flex-col gap-5">
          {item.description && (
            <p className="text-xs text-stll-muted leading-relaxed">{item.description}</p>
          )}

          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Size</p>
            <div className="flex gap-2 flex-wrap">
              {validSizes.map((size, i) => (
                <label key={size.label} className="cursor-pointer">
                  <input type="radio" name="size" value={size.label} defaultChecked={i === 0} className="sr-only peer" />
                  <span className="block px-4 py-2 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal peer-checked:bg-stll-charcoal peer-checked:text-white peer-checked:border-stll-charcoal">
                    {SIZE_LABELS[size.label] ?? size.label} · {size.price}
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
                  <input type="checkbox" name="syrup" value={syrup} className="sr-only peer" />
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

function MenuSection({ title, subtitle, items }: { title: string; subtitle: string; items: MenuItemData[] }) {
  return (
    <section className="mb-20">
      <div className="flex items-baseline gap-4 mb-1">
        <h2 className="text-[2.5rem] sm:text-[3.5rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          {title}
        </h2>
      </div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-8">{subtitle}</p>
      <div>
        {items.map((item) => (
          <MenuItemRow key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const addedItem = typeof params.added === "string" ? decodeURIComponent(params.added) : null;

  const matchaItems: MenuItemData[] = [
    { name: "Earl Grey Matcha",            description: "", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "N/A" }] },
    { name: "OG Matcha Latte",             description: "", image: "", sizes: [{ label: "G", price: "$7" }, { label: "V", price: "N/A" }] },
    { name: "Strawberry Matcha",           description: "", image: "", sizes: [{ label: "G", price: "$10" }, { label: "V", price: "N/A" }] },
    { name: "Strawberry and Cloud Matcha", description: "", image: "", sizes: [{ label: "G", price: "$11" }, { label: "V", price: "N/A" }] },
    { name: "Ube Cream Matcha",            description: "", image: "", sizes: [{ label: "G", price: "$8" }, { label: "V", price: "$10" }] },
  ];

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

  return (
    <div className="bg-[#FAF8F5] min-h-screen">

      {addedItem && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-stll-charcoal text-white px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] tracking-[0.25em] uppercase">
            <span className="font-bold">{addedItem}</span> added to your order
          </p>
          <div className="flex gap-3">
            <Link href="/checkout" className="flex-1 sm:flex-initial text-center px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase bg-white text-stll-charcoal font-semibold">
              Checkout
            </Link>
            <Link href="/gallery" className="flex-1 sm:flex-initial text-center px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border border-white/40 text-white">
              Keep Shopping
            </Link>
          </div>
        </div>
      )}

      <div className="pt-32 pb-16 px-6 sm:px-12 lg:px-20 border-b border-stll-charcoal/10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-4">Stll Haus — Matcha &amp; Coffee</p>
        <h1 className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          Menu
        </h1>
      </div>

      <div className="px-6 sm:px-12 lg:px-20 pt-16 pb-24">
        <MenuSection title="Matcha" subtitle="Served with oat milk" items={matchaItems} />
        <MenuSection title="Cold Brew" subtitle="Brewed overnight" items={coldBrewItems} />
        <MenuSection title="Cloud" subtitle="Served with coconut water" items={cloudItems} />

        <div className="border-t border-stll-charcoal/10 pt-10 mt-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-stll-muted">Available add-ons — </span>
          <span className="text-[10px] tracking-[0.2em] text-stll-muted/70"> Ube &nbsp;·&nbsp; Earl Grey &nbsp;·&nbsp; Strawberry &nbsp;·&nbsp; Brown Sugar</span>
        </div>
      </div>
    </div>
  );
}
