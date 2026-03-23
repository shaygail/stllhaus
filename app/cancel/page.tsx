export const metadata = {
  title: "Order Cancelled - STLL HAUS",
};

import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="animate-fadeIn flex min-h-96 flex-col items-center justify-center text-center pt-28 pb-16 px-8">
      <h1 className="text-3xl font-medium text-stll-charcoal">Order cancelled</h1>
      <p className="mt-3 text-stll-muted">No worries. Your cart has been saved.</p>
      <Link href="/checkout" className="mt-8 rounded-full bg-stll-accent px-6 py-3 text-sm font-medium text-stll-charcoal hover:opacity-90">
        Back to checkout
      </Link>
    </div>
  );
}
