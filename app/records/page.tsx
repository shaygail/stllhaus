import Link from "next/link";
import { createBusinessLogsAdminClient, type BusinessLogEntry } from "@/lib/business-logs";
import { COMPLIANCE_FORM_LABELS, parseComplianceForm } from "@/lib/compliance-forms";

async function getRecentLogs(): Promise<{ logs: BusinessLogEntry[]; error: string | null }> {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) return { logs: [], error: "Missing Supabase server configuration." };

  const { data, error } = await supabase
    .from("business_logs")
    .select("*")
    .eq("log_type", "compliance")
    .order("logged_at", { ascending: false })
    .limit(100);

  if (error) {
    return { logs: [], error: error.message };
  }

  return { logs: (data ?? []) as BusinessLogEntry[], error: null };
}

export default async function RecordsPage() {
  const { logs, error } = await getRecentLogs();
  const complianceLogs = logs.flatMap((log) => {
    const parsed = parseComplianceForm(log.details);
    return parsed ? [{ log, parsed }] : [];
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-8 sm:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted/60 mb-4">
            Council Verification Access
          </p>
          <h1 className="text-5xl sm:text-6xl font-black text-stll-charcoal uppercase leading-[0.9] tracking-tight">
            COMPLIANCE<br />RECORDS
          </h1>
          <p className="mt-6 text-sm text-stll-muted leading-relaxed max-w-md">
            Your most important operational forms in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/records/new"
              className="inline-flex px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border bg-stll-charcoal border-stll-charcoal text-white"
            >
              Add Form Entry
            </Link>
          </div>
        </div>

        {/* Recent Logs */}
        <section className="mb-12 border-t border-stll-charcoal/10 pt-10">
          <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold mb-6">
            Form Entries
          </h2>
          <div className="bg-white border border-stll-charcoal/8 p-8">
            {error ? (
              <p className="text-sm text-red-700 leading-relaxed">
                Could not load logs yet: {error}
              </p>
            ) : complianceLogs.length === 0 ? (
              <p className="text-sm text-stll-muted leading-relaxed">
                No form entries yet. Use "Add Form Entry" to start.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stll-charcoal/10">
                      <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Form</th>
                      <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Summary</th>
                      <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Entered By</th>
                      <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Date</th>
                      <th className="py-2 pr-4 text-[10px] tracking-[0.2em] uppercase text-stll-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceLogs.map(({ log, parsed }) => (
                      <tr key={log.id} className="border-b border-stll-charcoal/8 align-top">
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">{COMPLIANCE_FORM_LABELS[parsed.formType]}</td>
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">{log.title}</td>
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">{log.entered_by}</td>
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">
                          {new Date(log.logged_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-sm text-stll-charcoal">
                          <Link href={`/records/${log.id}`} className="underline underline-offset-2 hover:text-stll-muted">
                            View details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="mb-12 border-t border-stll-charcoal/10 pt-10">
          <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold mb-3">
            Council Registration Preview
          </h2>
          <p className="text-sm text-stll-muted leading-relaxed mb-5">
            Preview of your council registration certificate.
          </p>
          <div className="bg-white border border-stll-charcoal/8 p-4 sm:p-6">
            <div className="aspect-3/4 w-full border border-stll-charcoal/15 bg-stll-charcoal/3">
              <iframe
                src="/council-registration.pdf#view=FitH"
                title="Council registration certificate preview"
                className="w-full h-full"
              />
            </div>
            <p className="mt-3 text-xs text-stll-muted">
              If preview does not load, open directly:{" "}
              <a
                href="/council-registration.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-stll-charcoal"
              >
                council-registration.pdf
              </a>
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="border-t border-stll-charcoal/10 pt-10">
          <p className="text-xs tracking-[0.2em] uppercase text-stll-muted/60">
            For access to specific records or additional documentation, contact us at{" "}
            <a
              href="mailto:admin@stllhaus.co"
              className="text-stll-charcoal hover:underline"
            >
              admin@stllhaus.co
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
