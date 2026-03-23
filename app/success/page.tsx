export const metadata = {
  title: "Order Success - STLL HAUS",
};

import Link from "next/link";
import SuccessHandler from "@/components/SuccessHandler";

const BANK_DETAILS = {
  bankName: process.env.BANK_NAME ?? "Your Bank Name",
  accountName: process.env.BANK_ACCOUNT_NAME ?? "STLL HAUS",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "0000 0000",
  sortCode: process.env.BANK_SORT_CODE ?? "00-00-00",
  reference: "STLL ORDER",
};

type Props = {
  searchParams: Promise<{ method?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { method } = await searchParams;

  const subtitles: Record<string, string> = {
    cash: "Please pay at the counter when you pick up your order.",
    bank_transfer: "Please complete your bank transfer using the details below.",
    stripe: "Payment received. Thank you!",
  };

  const subtitle = subtitles[method ?? ""] ?? "Thank you for your order. We'll have it ready soon!";

  return (
    <>
      <SuccessHandler />
      <div className="animate-fadeIn flex min-h-96 flex-col items-center justify-center text-center pt-28 pb-16 px-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-stll-sage/20 to-stll-accent/20 border border-stll-sage/30 animate-float">
          <div className="text-5xl">🤍</div>
        </div>
        <h1 className="mt-8 text-4xl font-bold bg-linear-to-r from-stll-charcoal via-stll-muted to-stll-charcoal bg-clip-text text-transparent animate-slideUp">Your order is being prepared</h1>
        <p className="mt-4 text-lg text-stll-muted animate-slideUp" style={{ animationDelay: "100ms" }}>{subtitle}</p>
        <p className="mt-2 font-semibold text-stll-sage animate-slideUp" style={{ animationDelay: "200ms" }}>Your loyalty points have been added to your card!</p>

        {method === "bank_transfer" && (
          <div className="mt-8 w-full max-w-sm rounded-2xl border border-stll-light bg-white p-6 text-left animate-slideUp" style={{ animationDelay: "250ms" }}>
            <p className="text-xs tracking-[0.2em] uppercase text-stll-muted mb-4">Bank Transfer Details</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stll-muted">Bank</dt>
                <dd className="font-medium text-stll-charcoal">{BANK_DETAILS.bankName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stll-muted">Account Name</dt>
                <dd className="font-medium text-stll-charcoal">{BANK_DETAILS.accountName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stll-muted">Account Number</dt>
                <dd className="font-medium text-stll-charcoal">{BANK_DETAILS.accountNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stll-muted">Sort Code</dt>
                <dd className="font-medium text-stll-charcoal">{BANK_DETAILS.sortCode}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stll-muted">Reference</dt>
                <dd className="font-medium text-stll-charcoal">{BANK_DETAILS.reference}</dd>
              </div>
            </dl>
          </div>
        )}

        {method === "cash" && (
          <div className="mt-8 rounded-2xl border border-stll-light bg-white px-8 py-5 animate-slideUp" style={{ animationDelay: "250ms" }}>
            <p className="text-2xl">💵</p>
            <p className="mt-2 text-sm text-stll-muted">Pay when you collect your order at the counter.</p>
          </div>
        )}

        <div className="mt-10 flex gap-4 animate-scaleIn" style={{ animationDelay: "300ms" }}>
          <Link href="/" className="rounded-full bg-linear-to-r from-stll-accent to-[#b8956a] px-8 py-3 text-sm font-semibold text-stll-charcoal shadow-soft transition-all duration-300 hover:shadow-lg hover:scale-110 active:scale-95 group relative overflow-hidden">
            <span className="relative z-10">Back to home</span>
            <span className="absolute inset-0 rounded-full bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></span>
          </Link>
          <Link href="/loyalty" className="rounded-full border-2 border-stll-sage px-8 py-3 text-sm font-semibold text-stll-sage transition-all duration-300 hover:bg-stll-sage/10 hover:scale-105 active:scale-95">
            View loyalty card
          </Link>
        </div>
      </div>
    </>
  );
}
