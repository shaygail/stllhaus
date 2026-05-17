import { publicSiteUrl } from "@/lib/site-url";
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
  cash: "CASH / EFTPOS at pickup",
};

/** Customer email: shop triggers this when the order is ready for pickup (see new-order email button). */
export async function sendOrderReadyForPickupEmail({
  customerName,
  customerEmail,
  orderId,
}: {
  customerName: string;
  customerEmail: string;
  orderId?: string;
}) {
  const name = escapeHtml(customerName);
  const oid = orderId ? escapeHtml(orderId) : "";
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
      <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 8px;">Your order is ready for pickup</h2>
      <p style="font-size: 15px;">Hi ${name},</p>
      <p style="font-size: 15px;">Your order is ready. Please come by to pick it up when you can. If you chose delivery, we will bring it out or contact you shortly.</p>
      ${orderId ? `<p style="font-size: 13px; color: #888; margin-top: 16px;"><strong>Order ID:</strong> ${oid}</p>` : ""}
      <p style="font-size: 13px; color: #888; margin-top: 24px;">Thank you for ordering with STLL HAUS.</p>
    </div>
  `;
  const { data, error } = await resend.emails.send({
    from: "noreply@stllhaus.co",
    to: customerEmail,
    subject: "Your order is ready for pickup — STLL HAUS",
    html,
  });
  if (error) {
    console.error("[Resend] Error sending order ready for pickup email:", error);
    throw new Error(error.message);
  }
  console.log("[Resend] Order ready for pickup email sent, id:", data?.id);
}

type OrderLineItem = { name: string; quantity: number; price: number; description?: string };

function orderItemRowsHtml(items: OrderLineItem[]) {
  return items
    .map((item) => {
      const desc =
        item.description?.trim() &&
        `<div style="font-size:12px;color:#666;margin-top:4px;line-height:1.35;">${escapeHtml(item.description.trim())}</div>`;
      const each = item.price.toFixed(2);
      const subtotal = (item.price * item.quantity).toFixed(2);
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">
            ${escapeHtml(item.name)}
            ${desc || ""}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: right;">$${each}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: right;">$${subtotal}</td>
        </tr>
      `;
    })
    .join("");
}

function orderItemsTableHtml(items: OrderLineItem[]) {
  return `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Item</th>
          <th style="text-align: center; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Qty</th>
          <th style="text-align: right; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Each</th>
          <th style="text-align: right; font-size: 11px; color: #aaa; padding-bottom: 8px; font-weight: 500;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemRowsHtml(items)}
      </tbody>
    </table>`;
}

export function isValidCustomerEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function sendOrderConfirmationEmail({
  customerName,
  customerEmail,
  contactPhone,
  contactInstagram,
  items,
  total,
  pickupTime,
  pickupLocationTitle,
  pickupLocationDetail,
  paymentMethod,
  orderId,
  notes,
}: {
  customerName: string;
  customerEmail: string;
  contactPhone?: string;
  contactInstagram?: string;
  items: OrderLineItem[];
  total: number;
  pickupTime?: string;
  pickupLocationTitle?: string;
  pickupLocationDetail?: string;
  paymentMethod?: string;
  orderId?: string;
  notes?: string;
}) {
  const itemsTable = orderItemsTableHtml(items);
  const linesSum = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalMismatch = Math.abs(linesSum - total) > 0.02;

  const payLabel = paymentMethod ? paymentLabel[paymentMethod] ?? paymentMethod : "—";

  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
      <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 4px;">Order confirmation — STLL HAUS</h2>
      <p style="color: #888; margin-top: 0; font-size: 14px;">Hi ${escapeHtml(customerName)},</p>
      <p style="color: #555; margin: 12px 0 0; font-size: 14px; line-height: 1.5;">We've received your order. Here are the details. We'll email you again when it's ready for pickup or delivery.</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      ${orderId ? `<p style="font-size: 12px; color: #888; margin: 0 0 16px;"><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>` : ""}

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Time</h3>
      <p style="margin: 0; font-size: 15px;">${escapeHtml(pickupTime || "Not specified")}</p>

      ${
        pickupLocationTitle?.trim()
          ? `
      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 20px 0 8px;">Where</h3>
      <p style="margin: 0; font-size: 15px;">${escapeHtml(pickupLocationTitle.trim())}</p>
      ${
        pickupLocationDetail?.trim()
          ? `<p style="margin: 8px 0 0; font-size: 13px; color: #555; line-height: 1.45;">${escapeHtml(pickupLocationDetail.trim())}</p>`
          : ""
      }
      `
          : ""
      }

      <p style="margin: 12px 0 0; font-size: 13px; color: #555;">Payment: ${escapeHtml(payLabel)}</p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Your contact on this order</h3>
      <p style="margin: 0; font-size: 14px; color: #333;">Email: ${escapeHtml(customerEmail)}</p>
      ${contactPhone?.trim() ? `<p style="margin: 6px 0 0; font-size: 14px; color: #333;">Phone: ${escapeHtml(contactPhone.trim())}</p>` : ""}
      ${contactInstagram?.trim() ? `<p style="margin: 6px 0 0; font-size: 14px; color: #333;">Instagram: ${escapeHtml(contactInstagram.trim())}</p>` : ""}

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 12px;">Items</h3>
      ${itemsTable}

      <div style="text-align: right; margin-top: 16px;">
        <p style="font-size: 16px; font-weight: bold; margin: 0;">Total: $${total.toFixed(2)}</p>
        ${totalMismatch ? `<p style="font-size: 11px; color: #a44; margin: 8px 0 0;">Line items add to $${linesSum.toFixed(2)} — total above is what was submitted at checkout.</p>` : ""}
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
    subject: `Order confirmation — STLL HAUS${orderId ? ` · ${orderId.slice(0, 8)}` : ""}`,
    html,
  });

  if (error) {
    console.error("[Resend] Error sending order confirmation:", error);
    throw new Error(error.message);
  }
  console.log("[Resend] Order confirmation sent, id:", data?.id);
}

/** @deprecated Use sendOrderConfirmationEmail */
export async function sendCustomerReceiptEmail(
  params: Parameters<typeof sendOrderConfirmationEmail>[0]
) {
  return sendOrderConfirmationEmail(params);
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
  pickupLocationTitle,
  pickupLocationDetail,
  paymentMethod,
  toEmail,
  attachment,
  customerEmail,
  orderId,
  subjectLocationSuffix,
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
  pickupLocationTitle?: string;
  pickupLocationDetail?: string;
  paymentMethod?: string;
  toEmail: string;
  attachment?: { filename: string; content: Buffer; contentType: string };
  customerEmail?: string;
  orderId?: string;
  /** Short location text for the email subject line (e.g. "STLL HAUS (Bell Block)"). */
  subjectLocationSuffix?: string;
}) {
  const itemsTable = orderItemsTableHtml(items);
  const linesSum = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalMismatch = Math.abs(linesSum - total) > 0.02;
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

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Time</h3>
      <p style="margin: 0; font-size: 15px;">${escapeHtml(pickupTime || "Not specified")}</p>

      ${
        pickupLocationTitle?.trim()
          ? `
      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 20px 0 8px;">Where</h3>
      <p style="margin: 0; font-size: 15px;">${escapeHtml(pickupLocationTitle.trim())}</p>
      ${
        pickupLocationDetail?.trim()
          ? `<p style="margin: 8px 0 0; font-size: 13px; color: #555; line-height: 1.45;">${escapeHtml(pickupLocationDetail.trim())}</p>`
          : ""
      }
      `
          : ""
      }

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 12px;">Order Items</h3>
      ${itemsTable}

      <div style="text-align: right; margin-top: 16px;">
        <p style="font-size: 16px; font-weight: bold; margin: 0;">Total: $${total.toFixed(2)}</p>
        ${totalMismatch ? `<p style="font-size: 11px; color: #a44; margin: 8px 0 0;">Line items add to $${linesSum.toFixed(2)} — check cart vs total.</p>` : ""}
      </div>

      ${notes?.trim() ? `
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Notes</h3>
        <p style="margin: 0; font-size: 14px; color: #333;">${escapeHtml(notes.trim())}</p>
      ` : ""}

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
      <form action="${escapeHtml(publicSiteUrl())}/api/notify-received?src=email" method="POST">
        <input type="hidden" name="contact" value="${escapeHtml(contactCompact)}" />
        <input type="hidden" name="customerName" value="${escapeHtml(customerName)}" />
        <input type="hidden" name="customerEmail" value="${escapeHtml((customerEmail || contactCompact).trim())}" />
        <input type="hidden" name="orderId" value="${escapeHtml(orderId || "")}" />
        <button type="submit" style="background: #222; color: #fff; border: none; padding: 12px 24px; font-size: 14px; border-radius: 4px; cursor: pointer;">Order is ready for pickup — email customer</button>
      </form>
      <p style="font-size: 11px; color: #888; margin: 10px 0 0;">Tap when the order is ready. We only email the customer after you press this button (not when they first order).</p>
      <p style="font-size: 11px; color: #bbb; margin: 0; margin-top: 16px;">STLL HAUS · Order Notification</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: "noreply@stllhaus.co",
    to: toEmail,
    subject: `New Order from ${customerName} — ${pickupTime || "ASAP"}${
      subjectLocationSuffix?.trim() ? ` · ${subjectLocationSuffix.trim()}` : ""
    }`,
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
