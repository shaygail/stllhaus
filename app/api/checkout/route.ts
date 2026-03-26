import { sendOrderNotification } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const customerName = formData.get("customerName") as string;
      const pickupTime = formData.get("pickupTime") as string;
      const notes = formData.get("notes") as string;
      const paymentMethod = formData.get("paymentMethod") as string;
      const items = JSON.parse(formData.get("items") as string);
      const proof = formData.get("proof");

      type CartItem = { price: number; quantity: number };
      const total = (items as CartItem[]).reduce((sum: number, item) => sum + item.price * item.quantity, 0);

      let attachment = undefined;
      if (paymentMethod === "bank_transfer" && proof && typeof proof === "object" && "arrayBuffer" in proof) {
        const buffer = Buffer.from(await proof.arrayBuffer());
        attachment = {
          filename: (proof as File).name || "proof.jpg",
          content: buffer,
          contentType: (proof as File).type || "image/jpeg",
        };
      }

      await sendOrderNotification({
        customerName: customerName || "Unknown",
        items,
        total,
        contact: "",
        notes,
        pickupTime,
        toEmail: process.env.ORDER_NOTIFICATION_EMAIL || "your@email.com",
        attachment,
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}