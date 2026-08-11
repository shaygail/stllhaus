import { authorizeAdminRequest } from "@/lib/admin-request-auth";
import { formatSupabaseAdminError } from "@/lib/supabase-admin-errors";
import {
  deleteMarketEvent,
  loadAllMarketEvents,
  saveMarketEvent,
} from "@/lib/market-events-store";
import { rowToFormValues, type MarketEventInput } from "@/lib/market-events";
import { NextResponse } from "next/server";

function parseEventInput(raw: unknown): MarketEventInput | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;

  const name = String(body.name ?? "").trim();
  const date = String(body.date ?? "").trim();
  const startTime = String(body.startTime ?? "").trim();
  const location = String(body.location ?? "").trim();
  const description = String(body.description ?? "").trim();

  if (!name || !date || !startTime || !location || !description) return null;

  return {
    id: typeof body.id === "string" ? body.id : undefined,
    name,
    date,
    startTime,
    endTime: typeof body.endTime === "string" ? body.endTime : undefined,
    location,
    description,
    imagePath: typeof body.imagePath === "string" ? body.imagePath : undefined,
    imageAlt: typeof body.imageAlt === "string" ? body.imageAlt : undefined,
    published: body.published !== false,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret")?.trim() ?? "";
  const auth = await authorizeAdminRequest(secret ? { secret } : undefined);
  if (!auth.ok) return auth.response;

  try {
    const rows = await loadAllMarketEvents();
    return NextResponse.json({
      events: rows.map((row) => ({
        ...rowToFormValues(row),
        slug: row.slug,
        dateLabel: row.date_label,
        startDate: row.start_date,
        endDate: row.end_date,
      })),
    });
  } catch {
    return NextResponse.json({ error: "load_failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const auth = await authorizeAdminRequest(body);
  if (!auth.ok) return auth.response;

  const input = parseEventInput(
    typeof body === "object" && body !== null && "event" in body
      ? (body as { event: unknown }).event
      : body
  );

  if (!input) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  try {
    const saved = await saveMarketEvent(input);
    return NextResponse.json({ event: rowToFormValues(saved), saved: true });
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

export async function DELETE(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const auth = await authorizeAdminRequest(body);
  if (!auth.ok) return auth.response;

  const id =
    typeof body === "object" && body !== null && "id" in body
      ? String((body as { id: unknown }).id ?? "").trim()
      : "";

  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  try {
    await deleteMarketEvent(id);
    return NextResponse.json({ deleted: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "delete_failed";
    if (msg === "missing_supabase_config") {
      return NextResponse.json({ error: "missing_supabase_config" }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
