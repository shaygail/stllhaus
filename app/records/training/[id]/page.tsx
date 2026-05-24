import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createBusinessLogsAdminClient } from "@/lib/business-logs";
import { hasRecordsAccess } from "@/lib/records-access";
import { isTrainingRecordLog, parseStaffTrainingDocument } from "@/lib/training-records";
import { PrintTrainingRecordButton } from "../PrintTrainingRecordButton";
import { TrainingRecordEditor } from "../TrainingRecordEditor";
import { TrainingRecordSheet } from "../TrainingRecordSheet";

async function getTrainingLog(id: string) {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("business_logs").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data;
}

export default async function TrainingRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await hasRecordsAccess())) {
    redirect("/records");
  }

  const { id } = await params;
  const log = await getTrainingLog(id);
  if (!log) notFound();

  const tags = Array.isArray(log.tags) ? log.tags.filter((t: unknown): t is string => typeof t === "string") : [];
  if (!isTrainingRecordLog(tags)) notFound();

  const document = parseStaffTrainingDocument(String(log.details ?? ""));
  if (!document) notFound();

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-8 sm:px-16 lg:px-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8 print:hidden">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted/60 mb-4">Staff Training</p>
            <h1 className="text-3xl sm:text-4xl font-black text-stll-charcoal uppercase leading-[0.95] tracking-tight">
              {document.profile.employeeName}
            </h1>
            <p className="mt-3 text-sm text-stll-muted">Training record for council verification</p>
          </div>
          <PrintTrainingRecordButton />
        </div>

        <TrainingRecordSheet document={document} />

        <div className="mt-10">
          <TrainingRecordEditor logId={id} document={document} />
        </div>

        <Link
          href="/records/training"
          className="inline-flex mt-8 text-[11px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal print:hidden"
        >
          ← Back to training records
        </Link>
      </div>
    </div>
  );
}
