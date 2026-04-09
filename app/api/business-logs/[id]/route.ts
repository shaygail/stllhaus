import { NextResponse } from "next/server";
import { createBusinessLogsAdminClient, parseBusinessLogEntry } from "@/lib/business-logs";

type UpdateBody = {
  logged_at?: unknown;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "missing_server_config" }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const { data, error } = await supabase.from("business_logs").select("*").eq("id", id).single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ log: parseBusinessLogEntry(data) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "missing_server_config" }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const loggedAt = String(body.logged_at ?? "").trim();
  if (!loggedAt) {
    return NextResponse.json({ error: "missing_logged_at" }, { status: 400 });
  }

  const parsedDate = new Date(loggedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "invalid_logged_at" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("business_logs")
    .update({ logged_at: parsedDate.toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: parseBusinessLogEntry(data) });
}
