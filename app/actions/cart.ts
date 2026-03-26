"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getServerStripe } from "@/lib/stripe";


const SIZE_LABELS: Record<string, string> = { T: "Tall", G: "Grande", V: "Venti" };

type CartItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  quantity: number;
};

export async function addToCartAction(formData: FormData) {
  const cookieStore = await cookies();

  const itemName = (formData.get("item-name") as string) ?? "";
  const itemSlug = (formData.get("item-slug") as string) ?? "";
  const sizeLabel = (formData.get("size") as string) ?? "G";
  const syrups = formData.getAll("syrup") as string[];
  const priceStr = (formData.get(`price_${sizeLabel}`) as string) ?? "0";
  const price = parseFloat(priceStr) || 0;

  const sizeName = SIZE_LABELS[sizeLabel] ?? sizeLabel;
  const displayName = `${itemName} (${sizeName})`;
  const id = `${itemSlug}-${sizeLabel}-${syrups.join("-") || "plain"}`;
  const description = syrups.length ? `Syrups: ${syrups.join(", ")}` : "";

  // Read existing cart from cookie
  const existing = cookieStore.get("stll-cart")?.value;
  let cart: CartItem[] = [];
  if (existing) {
    try {
      cart = JSON.parse(decodeURIComponent(existing));
    } catch {
      cart = [];
    }
  }

  // Add or increment
  const idx = cart.findIndex((i) => i.id === id);
  if (idx >= 0) {
    cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + 1 };
  } else {
    cart.push({ id, name: displayName, description, price, quantity: 1 });
  }

  // Persist in cookie — httpOnly: false so CartContext can also read it client-side
  cookieStore.set("stll-cart", encodeURIComponent(JSON.stringify(cart)), {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
    httpOnly: false,
  });

  // Redirect back to gallery with success indicator in URL
  redirect(`/gallery?added=${encodeURIComponent(displayName)}`);
}

export async function removeFromCartAction(formData: FormData) {
  const cookieStore = await cookies();
  const id = formData.get("id") as string;

  const existing = cookieStore.get("stll-cart")?.value;
  let cart: CartItem[] = [];
  if (existing) {
    try {
      cart = JSON.parse(decodeURIComponent(existing));
    } catch {
      cart = [];
    }
  }

  cart = cart.filter((i) => i.id !== id);

  cookieStore.set("stll-cart", encodeURIComponent(JSON.stringify(cart)), {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
    httpOnly: false,
  });
  redirect("/checkout");
}

export async function clearCartAction() {
  const cookieStore = await cookies();
  cookieStore.set("stll-cart", "", { path: "/", maxAge: 0 });
}

function readCart(cookieStore: Awaited<ReturnType<typeof cookies>>): CartItem[] {
  try {
    const val = cookieStore.get("stll-cart")?.value;
    if (!val) return [];
    return JSON.parse(decodeURIComponent(val)) as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(cookieStore: Awaited<ReturnType<typeof cookies>>, cart: CartItem[]) {
  cookieStore.set("stll-cart", encodeURIComponent(JSON.stringify(cart)), {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
    httpOnly: false,
  });
}

export async function updateQuantityAction(formData: FormData) {
  const cookieStore = await cookies();
  const id = formData.get("id") as string;
  const delta = parseInt(formData.get("delta") as string, 10);
  const cart = readCart(cookieStore);
  const updated = cart
    .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
    .filter((i) => i.quantity > 0);
  writeCart(cookieStore, updated);
  redirect("/checkout");
}

export async function stripeCheckoutAction(formData: FormData) {
  const cookieStore = await cookies();
  const cart = readCart(cookieStore);
  if (!cart.length) redirect("/checkout");

  const pickupTime = (formData.get("pickupTime") as string) || "ASAP";
  const notes = (formData.get("notes") as string) || "";

  if (!process.env.NEXT_PUBLIC_APP_URL) throw new Error("Missing NEXT_PUBLIC_APP_URL");

  const stripe = getServerStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: cart.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    metadata: { pickupTime, notes },
  });

  redirect(session.url!);
}


export async function placeOrderAction(formData: FormData) {
  const cookieStore = await cookies();
  const cart = readCart(cookieStore);
  if (!cart.length) {
    redirect("/checkout");
    return;
  }

  const paymentMethod = (formData.get("paymentMethod") as string) || "stripe";
  const pickupTime = (formData.get("pickupTime") as string) || "ASAP";
  const notes = (formData.get("notes") as string) || "";
  const customerName = (formData.get("customerName") as string) || "";

  // Always call /api/checkout to trigger email notification and handle order
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        pickupTime,
        notes,
        customerName,
        contact: "", // Add contact if available
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      redirect("/checkout?error=order_failed");
      return;
    }
    const data = await res.json();
    if (paymentMethod === "stripe" && data.sessionId) {
      // Stripe payment: redirect to Stripe checkout
      const stripe = getServerStripe();
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      redirect(session.url!);
      return;
    } else {
      // Other payment: redirect to success page
      redirect(`/success?method=${paymentMethod}`);
    }
  } catch {
    redirect("/checkout?error=order_failed");
  }
}
