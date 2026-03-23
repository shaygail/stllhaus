import { getServerStripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

type CheckoutRequest = {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  pickupTime: string;
  notes: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error("Missing NEXT_PUBLIC_APP_URL");
    }

    const stripe = getServerStripe();

    const lineItems = body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          metadata: {
            pickupTime: body.pickupTime,
            notes: body.notes,
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        pickupTime: body.pickupTime,
        notes: body.notes,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
