type CheckoutLine = {
  name: string;
  price: number;
  quantity: number;
  description?: string;
};

const DEFAULT_POS_API = "https://stllhaus-pos-production.up.railway.app";

function posApiBase(): string {
  const raw = (process.env.STLLHAUS_POS_API_URL ?? DEFAULT_POS_API).trim();
  return raw.replace(/\/+$/, "");
}

function slugId(name: string, index: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `web-${index}-${slug || "item"}`;
}

export async function pushCheckoutToPosPreorder(input: {
  customerName: string;
  pickupTime: string;
  items: CheckoutLine[];
  fulfillmentLabel: string;
  paymentMethod: string;
  contactEmail?: string;
  contactPhone?: string;
  contactInstagram?: string;
  customerNotes?: string;
  orderId: string;
}): Promise<number | null> {
  const itemLines = input.items.map((item) => {
    const mods = item.description?.trim();
    return `- ${item.quantity}× ${item.name}${mods ? ` — ${mods}` : ""}`;
  });
  const notesLines: string[] = [
    "Source: stllhaus.co",
    `Website order: ${input.orderId}`,
    `Fulfillment: ${input.fulfillmentLabel}`,
    `Payment: ${input.paymentMethod}`,
  ];
  const email = input.contactEmail?.trim();
  const phone = input.contactPhone?.trim();
  const instagram = input.contactInstagram?.trim();
  if (email) notesLines.push(`Email: ${email}`);
  if (phone) notesLines.push(`Phone: ${phone}`);
  if (instagram) notesLines.push(`Instagram: ${instagram}`);
  notesLines.push("", "Items:", ...itemLines);
  const customerNotes = input.customerNotes?.trim();
  if (customerNotes) {
    notesLines.push("", "Customer notes:", customerNotes);
  }
  const notes = notesLines.join("\n").trim();

  const body = {
    customer_name: input.customerName.trim() || "Website order",
    pickup_time: input.pickupTime,
    items: input.items.map((item, index) => ({
      id: slugId(item.name, index),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    notes,
  };

  const res = await fetch(`${posApiBase()}/preorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`POS preorder ${res.status}${detail ? `: ${detail.slice(0, 240)}` : ""}`);
  }

  try {
    const data = (await res.json()) as { id?: unknown };
    return typeof data.id === "number" ? data.id : null;
  } catch {
    return null;
  }
}

export async function fetchPreorderStatus(preorderId: number): Promise<{
  status: string;
  pickupTime?: string;
} | null> {
  try {
    const res = await fetch(`${posApiBase()}/preorder/${preorderId}`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { status?: string; pickup_time?: string };
      if (typeof data.status === "string") {
        return { status: data.status, pickupTime: data.pickup_time };
      }
    }
    const listRes = await fetch(`${posApiBase()}/preorders`, { cache: "no-store" });
    if (!listRes.ok) return null;
    const list = (await listRes.json()) as Array<{
      id?: number;
      status?: string;
      pickup_time?: string;
    }>;
    const row = list.find((entry) => entry.id === preorderId);
    if (!row || typeof row.status !== "string") return null;
    return { status: row.status, pickupTime: row.pickup_time };
  } catch (err) {
    console.error("POS preorder status fetch failed", err);
    return null;
  }
}
