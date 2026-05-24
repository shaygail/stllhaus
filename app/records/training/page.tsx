import Link from "next/link";
import { redirect } from "next/navigation";
import { createBusinessLogsAdminClient, type BusinessLogEntry } from "@/lib/business-logs";
import { hasRecordsAccess } from "@/lib/records-access";
import { parseStaffTrainingDocument } from "@/lib/training-records";

async function getTrainingRecords(): Promise<{ records: BusinessLogEntry[]; error: string | null }> {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) return { records: [], error: "Missing Supabase server configuration." };

  const { data, error } = await supabase
    .from("business_logs")
    .select("*")
    .eq("log_type", "compliance")
    .contains("tags", ["training_record"])
    .order("logged_at", { ascending: false });

  if (error) return { records: [], error: error.message };
  return { records: (data ?? []) as BusinessLogEntry[], error: null };
}

export default async function TrainingRecordsPage() {
  if (!(await hasRecordsAccess())) {
    redirect("/records");
  }

  const { records, error } = await getTrainingRecords();

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-8 sm:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted/60 mb-4">Staff Training</p>
        <h1 className="text-4xl sm:text-5xl font-black text-stll-charcoal uppercase leading-[0.95] tracking-tight">
          Training Records
        </h1>
        <p className="mt-5 text-sm text-stll-muted leading-relaxed max-w-xl">
          SS&amp;S staff training records — one sheet per team member with topics covered, trainer initials, and dates.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/records/training/new"
            className="inline-flex px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border bg-stll-charcoal border-stll-charcoal text-white"
          >
            New Staff Record
          </Link>
          <Link
            href="/records"
            className="inline-flex px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal hover:text-white transition-colors"
          >
            Back to Records
          </Link>
        </div>

        <section className="mt-10 bg-white border border-stll-charcoal/8 p-8">
          {error ? (
            <p className="text-sm text-red-700 leading-relaxed">Could not load training records: {error}</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-stll-muted leading-relaxed">
              No staff training records yet. Create one for each person who handles food in your business.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stll-charcoal/10">
                    <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Staff member</th>
                    <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Position</th>
                    <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Sessions</th>
                    <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Updated</th>
                    <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const doc = parseStaffTrainingDocument(record.details);
                    const sessionCount = doc?.sessions.length ?? 0;
                    return (
                      <tr key={record.id} className="border-b border-stll-charcoal/8 align-top">
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">
                          {doc?.profile.employeeName ?? record.title}
                        </td>
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">{doc?.profile.position || "—"}</td>
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">{sessionCount}</td>
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">
                          {new Date(record.logged_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">
                          <Link
                            href={`/records/training/${record.id}`}
                            className="underline underline-offset-2 hover:text-stll-muted"
                          >
                            Open record
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
