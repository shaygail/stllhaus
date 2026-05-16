"use client";

import type { OrderingStatusResponse } from "@/hooks/useOrderingStatus";
import Link from "next/link";

export function OrderingStatusBanner({
  status,
  className = "",
}: {
  status: OrderingStatusResponse | null;
  className?: string;
}) {
  if (!status || status.status === "open") return null;

  const isPreOrder = status.isPreOrderOnly;

  return (
    <div
      className={`rounded-md border px-4 py-4 ${className} ${
        status.status === "disabled"
          ? "border-stll-charcoal/20 bg-stll-charcoal/5"
          : isPreOrder
            ? "border-amber-700/25 bg-amber-50/80"
            : "border-stll-charcoal/20 bg-stll-charcoal/5"
      }`}
    >
      <p className="text-[10px] tracking-[0.25em] uppercase text-stll-charcoal/80 mb-2">
        {status.status === "disabled"
          ? "Ordering paused"
          : isPreOrder
            ? "Pre-order"
            : "Currently closed"}
      </p>
      <p className="text-sm text-stll-charcoal leading-relaxed">{status.message}</p>
      {isPreOrder && (
        <p className="mt-2 text-xs text-stll-muted leading-relaxed">
          Add drinks below, then at checkout choose a pickup time at or after we open.
        </p>
      )}
      {!status.canAddToCart && (
        <Link
          href="/"
          className="mt-3 inline-block text-[10px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal"
        >
          ← Back to home
        </Link>
      )}
    </div>
  );
}
