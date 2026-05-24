import { NextResponse } from "next/server";
import {
  createBusinessLogsAdminClient,
  isBusinessLogType,
  parseBusinessLogEntry,
} from "@/lib/business-logs";
import { isRecordsAccessDenied } from "@/lib/records-access";

type CreateLogBody = {
  log_type?: unknown;
  title?: unknown;
  details?: unknown;
  logged_at?: unknown;
  entered_by?: unknown;
  amount?: unknown;
  reference_id?: unknown;
  attachments?: unknown;
  tags?: unknown;
  corrects_log_id?: unknown;
};

export async function GET(request: Request) {
  if (await isRecordsAccessDenied()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "missing_server_config" }, { status: 503 });
  }

  const url = new URL(request.url);
  const typeParam = url.searchParams.get("type");
  const limitParam = Number(url.searchParams.get("limit") ?? "30");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.floor(limitParam), 1), 200) : 30;

  let query = supabase
    .from("business_logs")
    .select("*")
    .order("logged_at", { ascending: false })
    .limit(limit);

  if (typeParam && isBusinessLogType(typeParam)) {
    query = query.eq("log_type", typeParam);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map(parseBusinessLogEntry).filter((r): r is NonNullable<typeof r> => Boolean(r));
  return NextResponse.json({ logs: rows });
}

export async function POST(request: Request) {
  if (await isRecordsAccessDenied()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createBusinessLogsAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "missing_server_config" }, { status: 503 });
  }

  let body: CreateLogBody;
  try {
    body = (await request.json()) as CreateLogBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isBusinessLogType(body.log_type)) {
    return NextResponse.json({ error: "invalid_log_type" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const details = String(body.details ?? "").trim();
  const enteredBy = String(body.entered_by ?? "").trim();
  const loggedAt = String(body.logged_at ?? "").trim();

  if (!title || !details || !enteredBy || !loggedAt) {
    return NextResponse.json({ error: "missing_required_fields" }, { status: 400 });
  }

  const parsedDate = new Date(loggedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "invalid_logged_at" }, { status: 400 });
  }

  const amount =
    body.amount === null || body.amount === undefined || body.amount === ""
      ? null
      : Number(body.amount);
  if (amount !== null && !Number.isFinite(amount)) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  const tags =
    Array.isArray(body.tags) && body.tags.every((t) => typeof t === "string")
      ? body.tags.map((t) => t.trim()).filter(Boolean)
      : [];

  const insertRow = {
    log_type: body.log_type,
    status: "active" as const,
    logged_at: parsedDate.toISOString(),
    entered_by: enteredBy,
    title,
    details,
    amount: amount === null ? null : Number(amount.toFixed(2)),
    reference_id: String(body.reference_id ?? "").trim() || null,
    attachments: String(body.attachments ?? "").trim() || null,
    tags,
    corrects_log_id: String(body.corrects_log_id ?? "").trim() || null,
  };

  const { data, error } = await supabase
    .from("business_logs")
    .insert(insertRow)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const parsed = parseBusinessLogEntry(data);
  return NextResponse.json({ log: parsed });
}
