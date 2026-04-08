import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Returns whether an email is already registered in Supabase Auth.
 * Uses the service role key — keep it server-only. Needed so "Create account"
 * can reject emails that already have an account.
 */
export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !url) {
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const perPage = 1000;
  const maxPages = 15;

  for (let page = 1; page <= maxPages; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const found = data.users.some((u) => (u.email ?? "").toLowerCase() === email);
    if (found) {
      return NextResponse.json({ exists: true });
    }
    if (data.users.length < perPage) {
      break;
    }
  }

  return NextResponse.json({ exists: false });
}
