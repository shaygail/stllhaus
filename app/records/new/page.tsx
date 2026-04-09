import Link from "next/link";
import { RecordLogForm } from "../RecordLogForm";

export default function NewRecordLogPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-8 sm:px-16 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted/60 mb-4">
          Records Input
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-stll-charcoal uppercase leading-[0.95] tracking-tight">
          Compliance Forms
        </h1>
        <p className="mt-5 text-sm text-stll-muted leading-relaxed max-w-xl">
          Add your key forms: allergens, staff sickness, fridge temperature checks, and trusted supplier records.
        </p>

        <div className="mt-8 bg-white border border-stll-charcoal/10 p-6 sm:p-8">
          <RecordLogForm />
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
