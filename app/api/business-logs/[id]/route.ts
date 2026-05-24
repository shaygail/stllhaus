import { NextResponse } from "next/server";
import { createBusinessLogsAdminClient, parseBusinessLogEntry } from "@/lib/business-logs";
import { isRecordsAccessDenied } from "@/lib/records-access";
import { parseStaffTrainingDocument } from "@/lib/training-records";

type UpdateBody = {
  logged_at?: unknown;
  details?: unknown;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (await isRecordsAccessDenied()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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
  if (await isRecordsAccessDenied()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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

  const updates: { logged_at?: string; details?: string } = {};

  if (body.logged_at !== undefined) {
    const loggedAt = String(body.logged_at ?? "").trim();
    if (!loggedAt) {
      return NextResponse.json({ error: "missing_logged_at" }, { status: 400 });
    }
    const parsedDate = new Date(loggedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "invalid_logged_at" }, { status: 400 });
    }
    updates.logged_at = parsedDate.toISOString();
  }

  if (body.details !== undefined) {
    const details = String(body.details ?? "").trim();
    if (!details) {
      return NextResponse.json({ error: "missing_details" }, { status: 400 });
    }
    if (!parseStaffTrainingDocument(details)) {
      return NextResponse.json({ error: "invalid_training_details" }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await supabase
      .from("business_logs")
      .select("tags")
      .eq("id", id)
      .single();
    if (fetchError || !existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const tags = Array.isArray(existing.tags)
      ? existing.tags.filter((t: unknown): t is string => typeof t === "string")
      : [];
    if (!tags.includes("training_record")) {
      return NextResponse.json({ error: "details_update_not_allowed" }, { status: 403 });
    }

    updates.details = details;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "missing_update_fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("business_logs")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: parseBusinessLogEntry(data) });
}
