"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getServerStripe } from "@/lib/stripe";
import { sendOrderToPOS } from "@/lib/pos";

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

  if (paymentMethod === "stripe") {
    if (!process.env.STRIPE_SECRET_KEY) {
      redirect("/checkout?error=stripe_not_configured");
      return;
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      redirect("/checkout?error=missing_app_url");
      return;
    }
    try {
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
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?method=stripe`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
        metadata: { pickupTime, notes },
      });
      redirect(session.url!);
      return;
    } catch {
      redirect("/checkout?error=stripe_failed");
      return;
    }
  } else {
    // Send order to POS for cash/bank_transfer
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await sendOrderToPOS({
      items: cart,
      subtotal,
      payment_method: paymentMethod,
    });
    // Optionally: send SMS/email notification here
    redirect(`/success?method=${paymentMethod}`);
  }
}
