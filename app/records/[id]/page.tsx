import Link from "next/link";
import { notFound } from "next/navigation";
import { createBusinessLogsAdminClient } from "@/lib/business-logs";
import { COMPLIANCE_FORM_LABELS, parseComplianceForm } from "@/lib/compliance-forms";
import { EditLoggedDateForm } from "./EditLoggedDateForm";

function toDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((v) => toDisplayValue(v)).filter(Boolean).join(", ");
  return JSON.stringify(value);
}

function formatFieldLabel(path: string): string {
  return path
    .replace(/\[(\d+)\]/g, " $1")
    .replace(/\./g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function flattenPayload(
  value: unknown,
  prefix = ""
): Array<{ field: string; value: string }> {
  if (value === null || value === undefined) {
    return [{ field: prefix || "value", value: "" }];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return [{ field: prefix || "value", value: "" }];
    return value.flatMap((item, idx) => flattenPayload(item, `${prefix}[${idx}]`));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return [{ field: prefix || "value", value: "" }];
    return entries.flatMap(([k, v]) => flattenPayload(v, prefix ? `${prefix}.${k}` : k));
  }

  return [{ field: prefix || "value", value: toDisplayValue(value) }];
}

async function getLog(id: string) {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("business_logs").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data;
}

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const log = await getLog(id);
  if (!log) notFound();

  const parsed = parseComplianceForm(String(log.details ?? ""));
  const formLabel = parsed ? COMPLIANCE_FORM_LABELS[parsed.formType] : "Compliance Form";
  const detailRows = flattenPayload(parsed?.payload ?? { raw: log.details }).map((row) => ({
    field: formatFieldLabel(row.field),
    value: row.value,
  }));

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-8 sm:px-16 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted/60 mb-4">Record Detail</p>
        <h1 className="text-4xl sm:text-5xl font-black text-stll-charcoal uppercase leading-[0.95] tracking-tight">
          {formLabel}
        </h1>
        <p className="mt-4 text-sm text-stll-muted">Summary: {String(log.title ?? "")}</p>
        <p className="mt-1 text-sm text-stll-muted">Entered by: {String(log.entered_by ?? "")}</p>
        <p className="mt-1 text-sm text-stll-muted">
          Date: {new Date(String(log.logged_at)).toLocaleDateString()}
        </p>

        <EditLoggedDateForm
          id={id}
          initialDate={new Date(String(log.logged_at)).toISOString().slice(0, 10)}
        />

        <div className="mt-8 bg-white border border-stll-charcoal/10 p-6">
          <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-3">All entered fields</p>
          <div className="overflow-x-auto border border-stll-charcoal/10">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stll-charcoal/10 bg-stll-charcoal/3">
                  <th className="py-2 px-3 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Field</th>
                  <th className="py-2 px-3 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Value</th>
                </tr>
              </thead>
              <tbody>
                {detailRows.map((row) => (
                  <tr key={`${row.field}-${row.value}`} className="border-b border-stll-charcoal/10 align-top">
                    <td className="py-2 px-3 text-xs text-stll-charcoal/80">{row.field}</td>
                    <td className="py-2 px-3 text-sm text-stll-charcoal">{row.value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Link
          href="/records"
          className="inline-flex mt-6 text-[11px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal"
        >
          ← Back to records
        </Link>
      </div>
    </div>
  );
}
