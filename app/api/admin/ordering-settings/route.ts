import { mergeOrderingSettings, type OrderingSettings } from "@/lib/ordering-settings";
import { loadOrderingSettings, saveOrderingSettings } from "@/lib/ordering-settings-store";
import { NextResponse } from "next/server";

function verifyAdminSecret(secret: string): boolean {
  const adminSecret = process.env.ADMIN_STATS_SECRET?.trim();
  if (!adminSecret) return false;
  return secret === adminSecret;
}

export async function POST(request: Request) {
  const adminSecret = process.env.ADMIN_STATS_SECRET?.trim();
  if (!adminSecret) {
    return NextResponse.json({ error: "admin_stats_not_configured" }, { status: 503 });
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

  if (!verifyAdminSecret(secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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
          detail: "Add Supabase keys and run supabase/ordering_settings.sql, or use env ORDERING_* defaults only.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
