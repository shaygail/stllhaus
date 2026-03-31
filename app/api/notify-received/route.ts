import { NextRequest, NextResponse } from "next/server";
import { sendOrderReceivedNotification } from "@/lib/email";

// This endpoint should be protected in production!
export async function POST(request: NextRequest) {
  try {
    let contact = "";
    let customerName = "";
    let customerEmail = "";
    let orderId = "";
    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json();
      contact = body.contact;
      customerName = body.customerName;
      customerEmail = body.customerEmail || body.contact;
      orderId = body.orderId || "";
    } else {
      const formData = await request.formData();
      contact = formData.get("contact") as string;
      customerName = formData.get("customerName") as string;
      customerEmail = (formData.get("customerEmail") as string) || contact;
      orderId = (formData.get("orderId") as string) || "";
    }
    if (!contact || !customerName || !customerEmail) {
      return NextResponse.json({ error: "Missing contact, customer name, or email" }, { status: 400 });
    }
    await sendOrderReceivedNotification({ contact, customerName, customerEmail, orderId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order received notify error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
