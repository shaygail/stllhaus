"use client";

export function PrintTrainingRecordButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal hover:text-white transition-colors print:hidden"
    >
      Print Record
    </button>
  );
}
