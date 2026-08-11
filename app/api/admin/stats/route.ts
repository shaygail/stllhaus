import { authorizeAdminRequest } from "@/lib/admin-request-auth";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Returns total registered Auth users (paginated count).
 * Authorized via team session or body `{ "secret": "<ADMIN_STATS_SECRET>" }`.
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
    body = {};
  }

  const auth = await authorizeAdminRequest(body);
  if (!auth.ok) return auth.response;

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
