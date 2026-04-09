import { createClient } from "@supabase/supabase-js";

export const BUSINESS_LOG_TYPES = [
  "order",
  "inventory",
  "expense",
  "incident",
  "staff_note",
  "compliance",
] as const;

export type BusinessLogType = (typeof BUSINESS_LOG_TYPES)[number];

export type BusinessLogStatus = "active" | "corrected";

export type BusinessLogEntry = {
  id: string;
  log_type: BusinessLogType;
  status: BusinessLogStatus;
  logged_at: string;
  entered_by: string;
  title: string;
  details: string;
  amount: number | null;
  reference_id: string | null;
  attachments: string | null;
  tags: string[];
  corrects_log_id: string | null;
  created_at?: string;
};

export function createBusinessLogsAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !url) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isBusinessLogType(v: unknown): v is BusinessLogType {
  return typeof v === "string" && BUSINESS_LOG_TYPES.includes(v as BusinessLogType);
}

export function parseBusinessLogEntry(raw: unknown): BusinessLogEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.id !== "string") return null;
  if (!isBusinessLogType(row.log_type)) return null;
  if (row.status !== "active" && row.status !== "corrected") return null;
  if (typeof row.logged_at !== "string") return null;
  if (typeof row.entered_by !== "string") return null;
  if (typeof row.title !== "string") return null;
  if (typeof row.details !== "string") return null;

  return {
    id: row.id,
    log_type: row.log_type,
    status: row.status,
    logged_at: row.logged_at,
    entered_by: row.entered_by,
    title: row.title,
    details: row.details,
    amount: typeof row.amount === "number" ? row.amount : null,
    reference_id: typeof row.reference_id === "string" ? row.reference_id : null,
    attachments: typeof row.attachments === "string" ? row.attachments : null,
    tags: Array.isArray(row.tags) ? row.tags.filter((t): t is string => typeof t === "string") : [],
    corrects_log_id: typeof row.corrects_log_id === "string" ? row.corrects_log_id : null,
    created_at: typeof row.created_at === "string" ? row.created_at : undefined,
  };
}
