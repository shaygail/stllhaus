import { authorizeAdminRequest } from "@/lib/admin-request-auth";
import { mergeOrderingSettings, type OrderingSettings } from "@/lib/ordering-settings";
import { loadOrderingSettings, saveOrderingSettings } from "@/lib/ordering-settings-store";
import { formatSupabaseAdminError } from "@/lib/supabase-admin-errors";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const auth = await authorizeAdminRequest(body);
  if (!auth.ok) return auth.response;

  const savePayload =
    typeof body === "object" && body !== null && "settings" in body
      ? (body as { settings: unknown }).settings
      : undefined;

  if (savePayload === undefined) {
    try {
      const settings = await loadOrderingSettings();
      return NextResponse.json({ settings });
    } catch {
      return NextResponse.json({ error: "load_failed" }, { status: 500 });
    }
  }

  const settings = mergeOrderingSettings(savePayload) as OrderingSettings;

  try {
    await saveOrderingSettings(settings);
    return NextResponse.json({ settings, saved: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "save_failed";
    if (msg === "missing_supabase_config") {
      return NextResponse.json(
        {
          error: "missing_supabase_config",
          detail: "Add Supabase keys to env and run supabase/admin_setup.sql in the Supabase SQL Editor.",
        },
        { status: 503 }
      );
    }
    const formatted = formatSupabaseAdminError(e, "supabase/admin_setup.sql");
    return NextResponse.json(formatted, { status: 500 });
  }
}
