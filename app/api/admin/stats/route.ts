import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Returns total registered Auth users (paginated count).
 * Requires body `{ "secret": "<ADMIN_STATS_SECRET>" }` matching env.
 * Set ADMIN_STATS_SECRET in production; never expose the service role key to the client.
 */
export async function POST(request: Request) {
  const adminSecret = process.env.ADMIN_STATS_SECRET?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!adminSecret) {
    return NextResponse.json({ error: "admin_stats_not_configured" }, { status: 503 });
  }
  if (!serviceKey || !url) {
    return NextResponse.json({ error: "missing_server_config" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const secret =
    typeof body === "object" && body !== null && "secret" in body
      ? String((body as { secret: unknown }).secret ?? "")
      : "";

  if (!secret || secret !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const perPage = 1000;
  const maxPages = 50;
  let registeredUsers = 0;
  let hitCap = false;

  for (let page = 1; page <= maxPages; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    registeredUsers += data.users.length;
    if (data.users.length < perPage) {
      break;
    }
    if (page === maxPages) {
      hitCap = true;
    }
  }

  return NextResponse.json({
    registeredUsers,
    hitCap,
    ...(hitCap
      ? {
          warning:
            "Count may be incomplete (user list cap reached). Use Supabase Dashboard → Authentication → Users for an exact total.",
        }
      : {}),
  });
}
