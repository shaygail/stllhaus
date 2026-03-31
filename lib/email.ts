import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const paymentLabel: Record<string, string> = {
  bank_transfer: "Bank transfer",
  cash: "Cash at pickup",
};

export async function sendOrderReceivedNotification({
  contact,
  customerName,
  customerEmail,
  orderId,
}: {
  contact: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
}) {
  const name = escapeHtml(customerName);
  const oid = orderId ? escapeHtml(orderId) : "";
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
      <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 8px;">We have received your order!</h2>
      <p style="font-size: 15px;">Hi ${name},</p>
      <p style="font-size: 15px;">Your order has been received and is being prepared. We'll notify you when it's ready for pickup.</p>
      ${orderId ? `<p style="font-size: 13px; color: #888; margin-top: 16px;"><strong>Order ID:</strong> ${oid}</p>` : ""}
      <p style="font-size: 13px; color: #888; margin-top: 24px;">Thank you for ordering with STLL HAUS.</p>
    </div>
  `;
  const { data, error } = await resend.emails.send({
    from: "noreply@stllhaus.co",
    to: customerEmail,
    subject: "Your order has been received! — STLL HAUS",
    html,
  });
  if (error) {
    console.error("[Resend] Error sending order received notification:", error);
    throw new Error(error.message);
  }
  console.log("[Resend] Order received notification sent, id:", data?.id);
}

export async function sendCustomerReceiptEmail({
  customerName,
  customerEmail,
  items,
  total,
  pickupTime,
  paymentMethod,
  orderId,
  notes,
}: {
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  pickupTime?: string;
  paymentMethod?: string;
  orderId?: string;
  notes?: string;
}) {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">${escapeHtml(item.name)}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const payLabel = paymentMethod ? paymentLabel[paymentMethod] ?? paymentMethod : "—";

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
      <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 4px;">Your receipt — STLL HAUS</h2>
      <p style="color: #888; margin-top: 0; font-size: 14px;">Thank you, ${escapeHtml(customerName)}</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      ${orderId ? `<p style="font-size: 12px; color: #888; margin: 0 0 16px;"><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>` : ""}

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Pickup</h3>
      <p style="margin: 0; font-size: 15px;">${escapeHtml(pickupTime || "Not specified")}</p>

      <p style="margin: 12px 0 0; font-size: 13px; color: #555;">Payment: ${escapeHtml(payLabel)}</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 12px;">Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Item</th>
            <th style="text-align: center; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Qty</th>
            <th style="text-align: right; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 16px;">
        <p style="font-size: 16px; font-weight: bold; margin: 0;">Total: $${total.toFixed(2)}</p>
      </div>

      ${notes?.trim() ? `
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Notes</h3>
        <p style="margin: 0; font-size: 14px; color: #333;">${escapeHtml(notes.trim())}</p>
      ` : ""}

      <p style="font-size: 11px; color: #bbb; margin: 24px 0 0;">STLL HAUS</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: "noreply@stllhaus.co",
    to: customerEmail,
    subject: `Your receipt — STLL HAUS${orderId ? ` · ${orderId.slice(0, 8)}` : ""}`,
    html,
  });

  if (error) {
    console.error("[Resend] Error sending customer receipt:", error);
    throw new Error(error.message);
  }
  console.log("[Resend] Customer receipt sent, id:", data?.id);
}

export async function sendOrderNotification({
  customerName,
  items,
  total,
  contact,
  notes,
  pickupTime,
  toEmail,
  attachment,
  customerEmail,
  orderId,
}: {
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  contact: string;
  notes?: string;
  pickupTime?: string;
  toEmail: string;
  attachment?: { filename: string; content: Buffer; contentType: string };
  customerEmail?: string;
  orderId?: string;
}) {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">${item.name}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">New Order</h2>
      <p style="color: #888; margin-top: 0; font-size: 14px;">STLL HAUS</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Customer</h3>
      <p style="margin: 0; font-size: 15px; font-weight: 600;">${customerName}</p>
      ${contact ? `<p style="margin: 4px 0 0; font-size: 13px; color: #555;">${contact}</p>` : ""}
      ${orderId ? `<p style=\"margin: 4px 0 0; font-size: 12px; color: #888;\"><strong>Order ID:</strong> ${orderId}</p>` : ""}

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Pickup Time</h3>
      <p style="margin: 0; font-size: 15px;">${pickupTime || "Not specified"}</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 12px;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Item</th>
            <th style="text-align: center; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Qty</th>
            <th style="text-align: right; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div style="text-align: right; margin-top: 16px;">
        <p style="font-size: 16px; font-weight: bold; margin: 0;">Total: $${total.toFixed(2)}</p>
      </div>

      ${notes ? `
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Notes</h3>
        <p style="margin: 0; font-size: 14px; color: #333;">${notes}</p>
      ` : ""}

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
      <form action="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/notify-received" method="POST">
        <input type="hidden" name="contact" value="${contact}" />
        <input type="hidden" name="customerName" value="${customerName}" />
        <input type="hidden" name="customerEmail" value="${customerEmail || contact}" />
        <input type="hidden" name="orderId" value="${orderId || ""}" />
        <button type="submit" style="background: #222; color: #fff; border: none; padding: 12px 24px; font-size: 14px; border-radius: 4px; cursor: pointer;">Send Order Received Notification</button>
      </form>
      <p style="font-size: 11px; color: #bbb; margin: 0; margin-top: 16px;">STLL HAUS · Order Notification</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: "noreply@stllhaus.co",
    to: toEmail,
    subject: `New Order from ${customerName} — ${pickupTime || "ASAP"}`,
    html,
    attachments: attachment
      ? [
          {
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
          },
        ]
      : undefined,
  });

  if (error) {
    console.error("[Resend] Error:", error);
    throw new Error(error.message);
  }

  console.log("[Resend] Email sent, id:", data?.id);
}
