import { sendCustomerReceiptEmail, sendOrderNotification } from "@/lib/email";
import { randomUUID } from "crypto";
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

      // Get contact info from form
      const contactPhone = formData.get("contactPhone") as string;
      const contactInstagram = formData.get("contactInstagram") as string;
      const contactEmail = formData.get("contactEmail") as string;
      const sendReceipt = formData.get("sendReceipt") === "on";
      // Prefer email for receipts and notifications
      const contact = contactEmail || contactPhone || contactInstagram || "";

      // Step 1: Generate a unique orderId for tracking
      const orderId = randomUUID();

      await sendOrderNotification({
        customerName: customerName || "Unknown",
        items,
        total,
        contact,
        notes,
        pickupTime,
        toEmail: process.env.ORDER_NOTIFICATION_EMAIL || "your@email.com",
        attachment,
        customerEmail: contactEmail,
        orderId,
      });

      if (sendReceipt && contactEmail?.trim()) {
        await sendCustomerReceiptEmail({
          customerName: customerName || "Unknown",
          customerEmail: contactEmail.trim(),
          items,
          total,
          pickupTime,
          paymentMethod,
          orderId,
          notes: notes || undefined,
        });
      }

      return NextResponse.json({ success: true, orderId });
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