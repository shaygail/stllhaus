import { sendSignupConfirmationEmail } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function buildRedirectTo(request: Request, nextPath: string) {
  const url = new URL(request.url);
  return `${url.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

function generateSignupPassword() {
  // Supabase admin signup link flow requires a password even when users sign in via email link.
  return `stll_${crypto.randomUUID()}_haus`;
}

export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!serviceKey || !supabaseUrl || !resendApiKey) {
    return NextResponse.json({ error: "missing_server_config" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? normalizeEmail(String((body as { email: unknown }).email ?? ""))
      : "";
  const nextPath =
    typeof body === "object" && body !== null && "next" in body
      ? String((body as { next: unknown }).next ?? "/account")
      : "/account";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const perPage = 1000;
  const maxPages = 15;
  for (let page = 1; page <= maxPages; page++) {
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const alreadyExists = usersData.users.some((u) => (u.email ?? "").toLowerCase() === email);
    if (alreadyExists) {
      return NextResponse.json({ error: "already_registered" }, { status: 409 });
    }

    if (usersData.users.length < perPage) {
      break;
    }
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password: generateSignupPassword(),
    options: {
      redirectTo: buildRedirectTo(request, nextPath),
    },
  });

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  const confirmUrl = linkData.properties?.action_link;
  if (!confirmUrl) {
    return NextResponse.json({ error: "missing_action_link" }, { status: 500 });
  }

  await sendSignupConfirmationEmail({
    email,
    confirmUrl,
  });

  return NextResponse.json({ success: true });
}
