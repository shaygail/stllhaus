import { authorizeAdminRequest } from "@/lib/admin-request-auth";
import {
  buildLoyaltySummary,
  hasLoyaltyActivity,
  loyaltyMemberFromAuthUser,
  sortLoyaltyMembers,
  type AdminLoyaltyMember,
} from "@/lib/admin-loyalty";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Lists loyalty data from Supabase Auth user_metadata.
 * Body: `{ "secret": "<ADMIN_STATS_SECRET>", "includeZero"?: boolean }`
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

  const includeZero =
    typeof body === "object" &&
    body !== null &&
    "includeZero" in body &&
    Boolean((body as { includeZero: unknown }).includeZero);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const perPage = 1000;
  const maxPages = 50;
  let registeredUsersScanned = 0;
  let hitCap = false;
  const members: AdminLoyaltyMember[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    registeredUsersScanned += data.users.length;

    for (const user of data.users) {
      const member = loyaltyMemberFromAuthUser(user);
      if (includeZero || hasLoyaltyActivity(member)) {
        members.push(member);
      }
    }

    if (data.users.length < perPage) break;
    if (page === maxPages) hitCap = true;
  }

  const sorted = sortLoyaltyMembers(members);
  const summary = buildLoyaltySummary(sorted, registeredUsersScanned, hitCap);

  return NextResponse.json({ members: sorted, summary });
}
