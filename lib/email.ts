import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderNotification({
  customerName,
  items,
  total,
  contact,
  notes,
  pickupTime,
  toEmail,
  attachment,
}: {
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  contact: string;
  notes?: string;
  pickupTime?: string;
  toEmail: string;
  attachment?: { filename: string; content: Buffer; contentType: string };
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
      <p style="font-size: 11px; color: #bbb; margin: 0;">STLL HAUS · Order Notification</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: 'noreply@stllhaus.co',
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