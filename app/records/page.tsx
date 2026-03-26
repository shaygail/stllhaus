export default function RecordsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-8 sm:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted/60 mb-4">
            Council Verification Access
          </p>
          <h1 className="text-5xl sm:text-6xl font-black text-stll-charcoal uppercase leading-[0.9] tracking-tight">
            BUSINESS<br />RECORDS
          </h1>
          <p className="mt-6 text-sm text-stll-muted leading-relaxed max-w-md">
            The following records are maintained for compliance purposes and are available for review by authorised council verifiers.
          </p>
        </div>

        {/* Training Records */}
        <section className="mb-12 border-t border-stll-charcoal/10 pt-10">
          <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold mb-6">
            Training Records
          </h2>
          <div className="bg-white border border-stll-charcoal/8 p-8">
            <p className="text-sm text-stll-muted leading-relaxed mb-6">
              Staff food safety training records will be listed here. Please contact us directly if you require access to specific documents.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-stll-charcoal/8">
                <span className="text-xs tracking-[0.15em] uppercase text-stll-charcoal/60">Staff Training Completion Records</span>
                <span className="text-xs text-stll-muted/50 italic">Document coming soon</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs tracking-[0.15em] uppercase text-stll-charcoal/60">Food Handler Certificates</span>
                <span className="text-xs text-stll-muted/50 italic">Document coming soon</span>
              </div>
            </div>
          </div>
        </section>

        {/* Temperature Records */}
        <section className="mb-12 border-t border-stll-charcoal/10 pt-10">
          <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold mb-6">
            Temperature Records
          </h2>
          <div className="bg-white border border-stll-charcoal/8 p-8">
            <p className="text-sm text-stll-muted leading-relaxed mb-6">
              Temperature monitoring logs for cold and hot storage are maintained daily. Records are available upon request.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-stll-charcoal/8">
                <span className="text-xs tracking-[0.15em] uppercase text-stll-charcoal/60">Refrigeration Temperature Log</span>
                <span className="text-xs text-stll-muted/50 italic">Document coming soon</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-stll-charcoal/8">
                <span className="text-xs tracking-[0.15em] uppercase text-stll-charcoal/60">Hot Holding Temperature Log</span>
                <span className="text-xs text-stll-muted/50 italic">Document coming soon</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs tracking-[0.15em] uppercase text-stll-charcoal/60">Delivery Temperature Records</span>
                <span className="text-xs text-stll-muted/50 italic">Document coming soon</span>
              </div>
            </div>
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
