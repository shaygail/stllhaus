import { isValidCustomerEmail, sendOrderConfirmationEmail, sendOrderNotification } from "@/lib/email";
import { isPickupSlotAllowed } from "@/lib/ordering-settings";
import { loadOrderingSettings } from "@/lib/ordering-settings-store";
import { cartUnitsEligibleForDelivery, deliveryLineItemName } from "@/lib/delivery";
import { formatDeliveryEmailDetail, resolveDeliveryPricing } from "@/lib/server-delivery-pricing";
import {
  isPickupLocationId,
  pickupLocationForEmail,
  pickupLocationShortLabel,
} from "@/lib/pickup-locations";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { pushCheckoutToPosPreorder } from "@/lib/pos-preorder";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const customerName = formData.get("customerName") as string;
      const pickupTime = String(formData.get("pickupTime") ?? "").trim();
      if (pickupTime.length < 10) {
        return NextResponse.json(
          { error: "invalid_pickup_time", detail: "Choose a pickup or delivery date and time." },
          { status: 400 }
        );
      }
      const slotMs = Date.parse(pickupTime);
      if (Number.isNaN(slotMs)) {
        return NextResponse.json(
          { error: "invalid_pickup_time", detail: "That date and time is not valid." },
          { status: 400 }
        );
      }
      const nowMs = Date.now();
      if (slotMs < nowMs - 120_000) {
        return NextResponse.json(
          { error: "invalid_pickup_time", detail: "Pick a time that is not in the past." },
          { status: 400 }
        );
      }
      const pickupMaxMs = 14 * 86400000;
      if (slotMs > nowMs + pickupMaxMs) {
        return NextResponse.json(
          { error: "invalid_pickup_time", detail: "Please choose a time within the next 14 days." },
          { status: 400 }
        );
      }

      const orderingSettings = await loadOrderingSettings();
      const orderingCheck = isPickupSlotAllowed(pickupTime, orderingSettings);
      if (!orderingCheck.ok) {
        return NextResponse.json(
          { error: "ordering_closed", detail: orderingCheck.detail },
          { status: 403 }
        );
      }

      const fulfillmentRaw = String(formData.get("fulfillment") ?? "pickup").trim().toLowerCase();
      const isDelivery = fulfillmentRaw === "delivery";
      const pickupLocationRaw = String(formData.get("pickupLocation") ?? "").trim();
      const notes = formData.get("notes") as string;
      const paymentMethod = formData.get("paymentMethod") as string;
      const itemsField = formData.get("items");
      if (typeof itemsField !== "string") {
        return NextResponse.json({ error: "invalid_items" }, { status: 400 });
      }
      let rawItems: unknown;
      try {
        rawItems = JSON.parse(itemsField);
      } catch {
        return NextResponse.json({ error: "invalid_items" }, { status: 400 });
      }
      type Line = { name: string; price: number; quantity: number; description?: string };
      const items: Line[] = Array.isArray(rawItems)
        ? rawItems.map((row: Record<string, unknown>) => ({
            name: String(row.name ?? "Item"),
            price: Math.max(0, Number(row.price) || 0),
            quantity: Math.min(999, Math.max(1, Math.floor(Number(row.quantity) || 1))),
            description: typeof row.description === "string" ? row.description : "",
          }))
        : [];
      if (items.length === 0) {
        return NextResponse.json({ error: "empty_cart" }, { status: 400 });
      }

      let pickupLocationTitle: string;
      let pickupLocationDetail: string | undefined;
      let subjectLocationSuffix: string;

      if (isDelivery) {
        const cartUnits = items.reduce((sum, row) => sum + row.quantity, 0);
        if (!cartUnitsEligibleForDelivery(cartUnits)) {
          return NextResponse.json({ error: "delivery_cart_minimum" }, { status: 400 });
        }
        const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
        if (deliveryAddress.length < 8 || deliveryAddress.length > 2000) {
          return NextResponse.json({ error: "invalid_delivery_address" }, { status: 400 });
        }
        const tierRaw = String(formData.get("deliveryTier") ?? "").trim();
        const priced = await resolveDeliveryPricing(deliveryAddress, tierRaw);
        if (!priced.ok) {
          return NextResponse.json(
            { error: priced.code, detail: priced.message },
            { status: 400 }
          );
        }
        const { resolved } = priced;
        items.push({
          name: deliveryLineItemName(resolved.tier),
          price: resolved.fee,
          quantity: 1,
          description: "",
        });
        pickupLocationTitle = "Delivery";
        pickupLocationDetail = formatDeliveryEmailDetail(deliveryAddress, resolved);
        subjectLocationSuffix = "Delivery";
      } else {
        if (!isPickupLocationId(pickupLocationRaw)) {
          return NextResponse.json({ error: "invalid_pickup_location" }, { status: 400 });
        }
        const pickupLoc = pickupLocationForEmail(pickupLocationRaw)!;
        pickupLocationTitle = pickupLoc.title;
        pickupLocationDetail = pickupLoc.detail;
        subjectLocationSuffix = pickupLocationShortLabel(pickupLocationRaw);
      }

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const proof = formData.get("proof");

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
      const contactDetail = [
        contactEmail?.trim() && `Email: ${contactEmail.trim()}`,
        contactPhone?.trim() && `Phone: ${contactPhone.trim()}`,
        contactInstagram?.trim() && `Instagram: ${contactInstagram.trim()}`,
      ]
        .filter(Boolean)
        .join("\n");

      const contactCompact = [contactEmail?.trim(), contactPhone?.trim(), contactInstagram?.trim()]
        .filter(Boolean)
        .join(" | ");

      // Step 1: Generate a unique orderId for tracking
      const orderId = randomUUID();

      try {
        await pushCheckoutToPosPreorder({
          customerName: customerName || "Unknown",
          pickupTime,
          items,
          fulfillmentLabel: pickupLocationDetail
            ? `${pickupLocationTitle} — ${pickupLocationDetail}`
            : pickupLocationTitle,
          paymentMethod: paymentMethod || "unknown",
          contactEmail: contactEmail?.trim() || undefined,
          contactPhone: contactPhone?.trim() || undefined,
          contactInstagram: contactInstagram?.trim() || undefined,
          customerNotes: typeof notes === "string" ? notes : undefined,
          orderId,
        });
      } catch (posError) {
        console.error("POS preorder push failed:", posError);
      }

      await sendOrderNotification({
        customerName: customerName || "Unknown",
        items,
        total,
        contact: contactDetail || contactCompact,
        contactCompact: contactCompact || contactEmail?.trim() || "",
        notes,
        pickupTime,
        pickupLocationTitle,
        pickupLocationDetail,
        paymentMethod,
        toEmail: process.env.ORDER_NOTIFICATION_EMAIL || "your@email.com",
        attachment,
        customerEmail: contactEmail,
        orderId,
        subjectLocationSuffix,
      });

      const trimmedEmail = contactEmail?.trim() ?? "";
      if (trimmedEmail && isValidCustomerEmail(trimmedEmail)) {
        await sendOrderConfirmationEmail({
          customerName: customerName || "Unknown",
          customerEmail: trimmedEmail,
          contactPhone: contactPhone?.trim() || undefined,
          contactInstagram: contactInstagram?.trim() || undefined,
          items,
          total,
          pickupTime,
          pickupLocationTitle,
          pickupLocationDetail,
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
    const message =
      error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json({ error: "checkout_failed", detail: message }, { status: 500 });
  }
}