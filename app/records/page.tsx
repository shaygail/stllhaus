import Link from "next/link";
import { redirect } from "next/navigation";
import { createBusinessLogsAdminClient, type BusinessLogEntry } from "@/lib/business-logs";
import { getComplianceFormLabel, parseComplianceForm } from "@/lib/compliance-forms";
import {
  clearRecordsAccessCookie,
  hasRecordsAccess,
  hasRecordsAccessPasswordConfigured,
  setRecordsAccessCookie,
  validateRecordsPassword,
} from "@/lib/records-access";

const PAGE_SIZE = 50;

function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

async function getRecentLogs(page: number): Promise<{ logs: BusinessLogEntry[]; total: number; error: string | null }> {
  const supabase = createBusinessLogsAdminClient();
  if (!supabase) return { logs: [], total: 0, error: "Missing Supabase server configuration." };
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("business_logs")
    .select("*", { count: "exact" })
    .eq("log_type", "compliance")
    .order("logged_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { logs: [], total: 0, error: error.message };
  }

  return { logs: (data ?? []).filter((row) => {
    const tags = Array.isArray((row as BusinessLogEntry).tags) ? (row as BusinessLogEntry).tags : [];
    return !tags.includes("training_record");
  }) as BusinessLogEntry[], total: count ?? 0, error: null };
}

function formLabelForEntry(log: BusinessLogEntry, parsed: ReturnType<typeof parseComplianceForm>): string {
  if (parsed) return getComplianceFormLabel(parsed.formType);
  const typeTag = log.tags.find((t) => t !== "compliance_form" && t.trim());
  if (typeTag) return getComplianceFormLabel(typeTag);
  return "Compliance entry";
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; error?: string }>;
}) {
  const { page: pageRaw, error: errorParam } = await searchParams;
  const passwordEnabled = hasRecordsAccessPasswordConfigured();
  const isUnlocked = await hasRecordsAccess();
  const showProtectedContent = !passwordEnabled || isUnlocked;
  const currentPage = showProtectedContent ? parsePage(pageRaw) : 1;
  const { logs, total, error } = showProtectedContent
    ? await getRecentLogs(currentPage)
    : { logs: [], total: 0, error: null };
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const complianceLogs = logs.map((log) => ({
    log,
    parsed: parseComplianceForm(log.details),
  }));

  async function unlockRecords(formData: FormData) {
    "use server";
    const password = String(formData.get("password") ?? "");
    if (!validateRecordsPassword(password)) {
      redirect("/records?error=invalid_password");
    }
    await setRecordsAccessCookie();
    redirect("/records");
  }

  async function lockRecords() {
    "use server";
    await clearRecordsAccessCookie();
    redirect("/records");
  }

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
            {showProtectedContent
              ? "Your most important operational forms in one place."
              : "Compliance forms and staff training records are password-protected. The council registration certificate below stays public."}
          </p>
          {showProtectedContent && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/records/new"
                className="inline-flex px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border bg-stll-charcoal border-stll-charcoal text-white"
              >
                Add Form Entry
              </Link>
              <Link
                href="/records/training"
                className="inline-flex px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal hover:text-white transition-colors"
              >
                Staff Training Records
              </Link>
              {passwordEnabled && (
                <form action={lockRecords}>
                  <button
                    type="submit"
                    className="inline-flex px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal hover:text-white transition-colors"
                  >
                    Lock Records
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {showProtectedContent ? (
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
                  No form entries yet. Use &quot;Add Form Entry&quot; to start.
                </p>
              ) : (
                <>
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
                            <td className="py-3 pr-4 text-sm text-stll-charcoal">{formLabelForEntry(log, parsed)}</td>
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

                  <div className="mt-5 flex items-center justify-between text-xs text-stll-muted">
                    <span>
                      Page {currentPage} of {totalPages} ({total} total entries)
                    </span>
                    <div className="flex items-center gap-4">
                      {hasPrev ? (
                        <Link href={`/records?page=${prevPage}`} className="underline underline-offset-2 hover:text-stll-charcoal">
                          Previous
                        </Link>
                      ) : (
                        <span className="opacity-50">Previous</span>
                      )}
                      {hasNext ? (
                        <Link href={`/records?page=${nextPage}`} className="underline underline-offset-2 hover:text-stll-charcoal">
                          Next
                        </Link>
                      ) : (
                        <span className="opacity-50">Next</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        ) : (
          passwordEnabled && (
            <section className="mb-12 border-t border-stll-charcoal/10 pt-10">
              <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold mb-3">
                Protected Records Access
              </h2>
              <p className="text-sm text-stll-muted leading-relaxed mb-5">
                Enter the records password to view compliance forms, staff training records, and other documentation.
              </p>
              <div className="bg-white border border-stll-charcoal/8 p-6 sm:p-8">
                <form action={unlockRecords} className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <label className="block flex-1">
                    <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Password</span>
                    <input
                      type="password"
                      name="password"
                      required
                      className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
                    />
                  </label>
                  <button
                    type="submit"
                    className="px-6 py-3 text-[11px] tracking-[0.2em] uppercase border bg-stll-charcoal border-stll-charcoal text-white"
                  >
                    Unlock
                  </button>
                </form>
                {errorParam === "invalid_password" && (
                  <p className="mt-3 text-sm text-red-700">Incorrect password. Please try again.</p>
                )}
              </div>
            </section>
          )
        )}

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
