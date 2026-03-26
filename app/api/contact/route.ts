import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }


    const html = `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; padding: 32px 24px;">
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">New Contact Inquiry</h2>
        <p style="color: #888; margin-top: 0; font-size: 14px;">STLL HAUS</p>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Name</h3>
        <p style="margin: 0; font-size: 15px; font-weight: 600;">${name}</p>
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px; margin-top: 24px;">Email</h3>
        <p style="margin: 0; font-size: 15px;">${email}</p>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 8px;">Message</h3>
        <p style="margin: 0; font-size: 14px; color: #333; white-space: pre-line;">${message}</p>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #bbb; margin: 0;">STLL HAUS · Contact Inquiry</p>
      </div>
    `;

    const data = await resend.emails.send({
      from: "inquiries@stllhaus.co",
      to: ["admin@stllhaus.co"],
      subject: `New Contact Inquiry from ${name}`,
      replyTo: email,
      html,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
