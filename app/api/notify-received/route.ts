import { sendOrderReadyForPickupEmail } from "@/lib/email";
import { publicSiteUrl } from "@/lib/site-url";
import { NextRequest, NextResponse } from "next/server";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Hidden fields may contain a compact string; pull the first valid email. */
function resolveRecipientEmail(customerEmailRaw: string, contactRaw: string): string | null {
  const candidates = [
    customerEmailRaw.trim(),
    ...String(contactRaw)
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter((l) => /^email:\s*/i.test(l))
      .map((l) => l.replace(/^email:\s*/i, "").trim()),
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (isValidEmail(c)) return c.trim();
    const m = c.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    if (m && isValidEmail(m[0])) return m[0].trim();
  }
  return null;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function htmlResponse(title: string, body: string, ok: boolean) {
  const origin = esc(publicSiteUrl());
  const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} — STLL HAUS</title>
</head>
<body style="margin:0;font-family:system-ui,sans-serif;background:#faf8f5;color:#2f2f2f;">
  <div style="max-width:520px;margin:48px auto;padding:0 24px;">
    <p style="font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:#7a7a7a;margin:0 0 16px;">STLL HAUS</p>
    <h1 style="font-size:22px;font-weight:700;margin:0 0 12px;">${esc(title)}</h1>
    <p style="font-size:15px;line-height:1.55;margin:0 0 24px;">${esc(body)}</p>
    <a href="${origin}" style="display:inline-block;font-size:13px;color:#2f2f2f;text-decoration:underline;">Back to site</a>
  </div>
</body>
</html>`;
  return new NextResponse(page, {
    status: ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function handleNotify(args: {
  contact: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  wantsJson: boolean;
}) {
  const { contact, customerName, customerEmail, orderId, wantsJson } = args;
  const name = (customerName || "").trim();
  const recipient = resolveRecipientEmail(customerEmail, contact);

  if (!name || !recipient) {
    const msg = "Missing customer name or a valid customer email.";
    if (wantsJson) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return htmlResponse("Could not send", msg, false);
  }

  try {
    await sendOrderReadyForPickupEmail({
      customerName: name,
      customerEmail: recipient,
      orderId: orderId.trim() || undefined,
    });
  } catch (e) {
    console.error("Order ready for pickup notify error:", e);
    const msg = "Failed to send email. Check Resend logs and RESEND_API_KEY.";
    if (wantsJson) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    return htmlResponse("Something went wrong", msg, false);
  }

  if (wantsJson) {
    return NextResponse.json({ success: true });
  }
  return htmlResponse(
    "Email sent",
    `We told ${recipient} their order is ready for pickup.`,
    true
  );
}

function wantsJsonResponse(request: NextRequest): boolean {
  if (request.nextUrl.searchParams.get("src") === "email") {
    return false;
  }
  const accept = (request.headers.get("accept") || "").toLowerCase();
  if (accept.includes("text/html")) {
    return false;
  }
  if (
    request.headers.get("sec-fetch-mode") === "navigate" ||
    request.headers.get("sec-fetch-dest") === "document"
  ) {
    return false;
  }
  if (accept.includes("application/json")) {
    return true;
  }
  return true;
}

export async function POST(request: NextRequest) {
  const wantsJson = wantsJsonResponse(request);

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      const contact = String(body.contact ?? "");
      const customerName = String(body.customerName ?? "");
      const customerEmail = String(body.customerEmail ?? body.contact ?? "");
      const orderId = String(body.orderId ?? "");
      return handleNotify({ contact, customerName, customerEmail, orderId, wantsJson: true });
    }

    const formData = await request.formData();
    const contact = String(formData.get("contact") ?? "");
    const customerName = String(formData.get("customerName") ?? "");
    const customerEmail = String(formData.get("customerEmail") ?? formData.get("contact") ?? "");
    const orderId = String(formData.get("orderId") ?? "");
    return handleNotify({ contact, customerName, customerEmail, orderId, wantsJson });
  } catch (error) {
    console.error("Order ready for pickup notify error:", error);
    if (wantsJson) {
      return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }
    return htmlResponse(
      "Something went wrong",
      "Could not process this request. Try again or contact the customer directly.",
      false
    );
  }
}
