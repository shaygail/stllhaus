import { sendSigninMagicLinkEmail } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function buildRedirectTo(request: Request, nextPath: string) {
  const url = new URL(request.url);
  return `${url.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
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
  let exists = false;

  for (let page = 1; page <= maxPages; page++) {
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    exists = usersData.users.some((u) => (u.email ?? "").toLowerCase() === email);
    if (exists || usersData.users.length < perPage) {
      break;
    }
  }

  if (!exists) {
    return NextResponse.json({ error: "not_registered" }, { status: 404 });
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: buildRedirectTo(request, nextPath),
    },
  });

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  const signInUrl = linkData.properties?.action_link;
  if (!signInUrl) {
    return NextResponse.json({ error: "missing_action_link" }, { status: 500 });
  }

  await sendSigninMagicLinkEmail({
    email,
    signInUrl,
  });

  return NextResponse.json({ success: true });
}
