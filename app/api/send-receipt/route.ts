import { sendCustomerReceiptEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

type Item = { name: string; quantity: number; price: number };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerEmail,
      customerName,
      items,
      total,
      pickupTime,
      paymentMethod,
      orderId,
      notes,
    } = body as {
      customerEmail?: string;
      customerName?: string;
      items?: Item[];
      total?: number;
      pickupTime?: string;
      paymentMethod?: string;
      orderId?: string;
      notes?: string;
    };

    if (!customerEmail?.trim() || !isValidEmail(customerEmail.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!customerName?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }
    for (const item of items) {
      if (
        typeof item.name !== "string" ||
        item.name.length > 500 ||
        typeof item.quantity !== "number" ||
        item.quantity < 1 ||
        item.quantity > 999 ||
        typeof item.price !== "number" ||
        item.price < 0 ||
        item.price > 99999
      ) {
        return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
      }
    }
    if (typeof total !== "number" || total < 0 || total > 999999) {
      return NextResponse.json({ error: "Invalid total" }, { status: 400 });
    }

    await sendCustomerReceiptEmail({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      items,
      total,
      pickupTime: typeof pickupTime === "string" ? pickupTime : undefined,
      paymentMethod: typeof paymentMethod === "string" ? paymentMethod : undefined,
      orderId: typeof orderId === "string" ? orderId : undefined,
      notes: typeof notes === "string" ? notes : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send receipt error:", error);
    return NextResponse.json({ error: "Failed to send receipt" }, { status: 500 });
  }
}
