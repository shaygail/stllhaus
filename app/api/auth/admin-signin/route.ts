import {
  getAdminAccountEmail,
  getAdminAccountPassword,
  isAdminAccountConfigured,
  syncAdminSupabaseUser,
  verifyAdminAccountCredentials,
} from "@/lib/admin-account";
import { createBusinessLogsAdminClient } from "@/lib/business-logs";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { NextResponse, type NextRequest } from "next/server";

function sanitizeNextPath(raw: string | undefined): string {
  const next = (raw ?? "/account").trim();
  if (!next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

export async function POST(request: NextRequest) {
  if (!isAdminAccountConfigured()) {
    return NextResponse.json({ error: "admin_account_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email ?? "").trim()
      : "";
  const password =
    typeof body === "object" && body !== null && "password" in body
      ? String((body as { password: unknown }).password ?? "")
      : "";
  const nextPath = sanitizeNextPath(
    typeof body === "object" && body !== null && "next" in body
      ? String((body as { next: unknown }).next ?? "/account")
      : "/account"
  );

  if (!email || !password) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 });
  }

  if (!verifyAdminAccountCredentials(email, password)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const sync = await syncAdminSupabaseUser();
  if (!sync.ok) {
    return NextResponse.json(
      {
        error: sync.error,
        detail:
          sync.error === "missing_supabase_config"
            ? "Supabase service role key is required for team sign-in."
            : "Could not sync the admin account. Try again.",
      },
      { status: sync.error === "missing_supabase_config" ? 503 : 500 }
    );
  }

  const adminEmail = getAdminAccountEmail()!;
  const adminPassword = getAdminAccountPassword()!;
  const adminClient = createBusinessLogsAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "missing_supabase_config", detail: "Supabase service role key is required for team sign-in." },
      { status: 503 }
    );
  }

  const { data: signInData, error: signInError } = await adminClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (signInError || !signInData.session) {
    return NextResponse.json(
      {
        error: "sign_in_failed",
        detail: signInError?.message ?? "Supabase did not return a session. Check your Supabase keys.",
      },
      { status: 500 }
    );
  }

  const redirectUrl = new URL(nextPath, request.url);
  const response = NextResponse.redirect(redirectUrl);
  const supabase = createSupabaseRouteHandlerClient(request, response);
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
  });

  if (sessionError) {
    return NextResponse.json(
      { error: "session_failed", detail: sessionError.message },
      { status: 500 }
    );
  }

  return response;
}
