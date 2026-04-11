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

type OrderLineItem = { name: string; quantity: number; price: number; description?: string };

function orderItemRowsHtml(items: OrderLineItem[]) {
  return items
    .map((item) => {
      const desc =
        item.description?.trim() &&
        `<div style="font-size:12px;color:#666;margin-top:4px;line-height:1.35;">${escapeHtml(item.description.trim())}</div>`;
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">
            ${escapeHtml(item.name)}
            ${desc || ""}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");
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
  items: OrderLineItem[];
  total: number;
  pickupTime?: string;
  paymentMethod?: string;
  orderId?: string;
  notes?: string;
}) {
  const itemRows = orderItemRowsHtml(items);

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

export async function sendSignupConfirmationEmail({
  email,
  confirmUrl,
}: {
  email: string;
  confirmUrl: string;
}) {
  const safeEmail = escapeHtml(email);
  const safeConfirmUrl = escapeHtml(confirmUrl);

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
      <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 4px;">Confirm your signup — STLL HAUS</h2>
      <p style="color: #888; margin-top: 0; font-size: 14px;">One more step to finish creating your account</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <p style="margin: 0 0 12px; font-size: 15px;">You requested a new account for <strong>${safeEmail}</strong>.</p>
      <p style="margin: 0 0 20px; font-size: 14px; color: #555;">Click below to confirm your email and continue.</p>

      <a href="${safeConfirmUrl}" style="display: inline-block; background: #222; color: #fff; text-decoration: none; border: none; padding: 12px 20px; font-size: 13px; border-radius: 4px;">
        Confirm my email
      </a>

      <p style="font-size: 12px; color: #777; margin: 20px 0 0;">If the button does not work, copy and paste this link:</p>
      <p style="font-size: 12px; color: #555; word-break: break-all; margin-top: 6px;">${safeConfirmUrl}</p>

      <p style="font-size: 11px; color: #bbb; margin: 24px 0 0;">STLL HAUS</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: "noreply@stllhaus.co",
    to: email,
    subject: "Confirm your signup — STLL HAUS",
    html,
  });

  if (error) {
    console.error("[Resend] Error sending signup confirmation email:", error);
    throw new Error(error.message);
  }

  console.log("[Resend] Signup confirmation email sent, id:", data?.id);
}

export async function sendSigninMagicLinkEmail({
  email,
  signInUrl,
}: {
  email: string;
  signInUrl: string;
}) {
  const safeEmail = escapeHtml(email);
  const safeSignInUrl = escapeHtml(signInUrl);

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
      <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 4px;">Sign in to STLL HAUS</h2>
      <p style="color: #888; margin-top: 0; font-size: 14px;">Use this secure link to access your account</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <p style="margin: 0 0 12px; font-size: 15px;">A sign-in link was requested for <strong>${safeEmail}</strong>.</p>
      <p style="margin: 0 0 20px; font-size: 14px; color: #555;">Click below to continue.</p>

      <a href="${safeSignInUrl}" style="display: inline-block; background: #222; color: #fff; text-decoration: none; border: none; padding: 12px 20px; font-size: 13px; border-radius: 4px;">
        Sign in
      </a>

      <p style="font-size: 12px; color: #777; margin: 20px 0 0;">If the button does not work, copy and paste this link:</p>
      <p style="font-size: 12px; color: #555; word-break: break-all; margin-top: 6px;">${safeSignInUrl}</p>

      <p style="font-size: 11px; color: #bbb; margin: 24px 0 0;">STLL HAUS</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: "noreply@stllhaus.co",
    to: email,
    subject: "Your sign-in link — STLL HAUS",
    html,
  });

  if (error) {
    console.error("[Resend] Error sending sign-in magic link email:", error);
    throw new Error(error.message);
  }

  console.log("[Resend] Sign-in magic link email sent, id:", data?.id);
}

export async function sendOrderNotification({
  customerName,
  items,
  total,
  contact,
  contactCompact,
  notes,
  pickupTime,
  paymentMethod,
  toEmail,
  attachment,
  customerEmail,
  orderId,
}: {
  customerName: string;
  items: OrderLineItem[];
  total: number;
  /** Multi-line contact block for email display (plain text; will be escaped). */
  contact: string;
  /** Single-line value for hidden form fields (e.g. email | phone | instagram). */
  contactCompact: string;
  notes?: string;
  pickupTime?: string;
  paymentMethod?: string;
  toEmail: string;
  attachment?: { filename: string; content: Buffer; contentType: string };
  customerEmail?: string;
  orderId?: string;
}) {
  const itemRows = orderItemRowsHtml(items);
  const contactHtml = contact
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => escapeHtml(line))
    .join("<br/>");
  const payLabel = paymentMethod ? paymentLabel[paymentMethod] ?? paymentMethod : "—";

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
      <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">New Order</h2>
      <p style="color: #888; margin-top: 0; font-size: 14px;">STLL HAUS</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Customer</h3>
      <p style="margin: 0; font-size: 15px; font-weight: 600;">${escapeHtml(customerName)}</p>
      ${contactHtml ? `<p style="margin: 6px 0 0; font-size: 13px; color: #555; line-height: 1.5;">${contactHtml}</p>` : ""}
      ${orderId ? `<p style="margin: 6px 0 0; font-size: 12px; color: #888;"><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>` : ""}
      <p style="margin: 8px 0 0; font-size: 13px; color: #555;">Payment: ${escapeHtml(payLabel)}</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Pickup Time</h3>
      <p style="margin: 0; font-size: 15px;">${escapeHtml(pickupTime || "Not specified")}</p>

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

      ${notes?.trim() ? `
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Notes</h3>
        <p style="margin: 0; font-size: 14px; color: #333;">${escapeHtml(notes.trim())}</p>
      ` : ""}

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
      <form action="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/notify-received" method="POST">
        <input type="hidden" name="contact" value="${escapeHtml(contactCompact)}" />
        <input type="hidden" name="customerName" value="${escapeHtml(customerName)}" />
        <input type="hidden" name="customerEmail" value="${escapeHtml((customerEmail || contactCompact).trim())}" />
        <input type="hidden" name="orderId" value="${escapeHtml(orderId || "")}" />
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
