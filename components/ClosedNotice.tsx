"use client";

import { useOrderingStatus } from "@/hooks/useOrderingStatus";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "stll-closed-notice:";

export function ClosedNotice() {
  const { data: status } = useOrderingStatus();
  const [open, setOpen] = useState(false);

  const shouldShow =
    Boolean(status) && (status?.status === "closed" || status?.status === "disabled");

  const dismissKey =
    status && shouldShow
      ? `${STORAGE_PREFIX}${status.nextOpenAt ?? status.message.slice(0, 48)}`
      : null;

  const dismiss = useCallback(() => {
    if (dismissKey) {
      try {
        sessionStorage.setItem(dismissKey, "1");
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  }, [dismissKey]);

  useEffect(() => {
    if (!shouldShow || !dismissKey) {
      setOpen(false);
      return;
    }
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(dismissKey) === "1";
    } catch {
      dismissed = false;
    }
    const timer = window.setTimeout(() => setOpen(!dismissed), 0);
    return () => window.clearTimeout(timer);
  }, [shouldShow, dismissKey]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismiss]);

  if (!status || !shouldShow || !open) return null;

  const title = status.marketClosed
    ? "We're at a market"
    : status.closedDateRangeActive
      ? "We're closed"
      : status.status === "disabled"
        ? "Ordering paused"
        : "We're closed";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-5 py-10 bg-stll-charcoal/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="closed-notice-title"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md border border-stll-charcoal/20 bg-[#FAF8F5] px-8 py-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center text-stll-muted hover:text-stll-charcoal text-xl leading-none border border-transparent hover:border-stll-charcoal/20"
          aria-label="Close"
        >
          ×
        </button>
        <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-3">Stll Haus</p>
        <h2
          id="closed-notice-title"
          className="text-xl font-black uppercase tracking-tight text-stll-charcoal leading-snug"
        >
          {title}
        </h2>
        {status.closedDateRangeLabel && (
          <p className="mt-2 text-[11px] tracking-[0.2em] uppercase text-stll-muted">
            {status.closedDateRangeLabel}
          </p>
        )}
        <p className="mt-4 text-sm text-stll-charcoal/90 leading-relaxed">{status.message}</p>
        {status.canAddSnacks && !status.canAddDrinks && (
          <p className="mt-3 text-sm text-stll-charcoal/70 leading-relaxed">
            Drinks aren&apos;t available right now — you can still order siomai from the menu.
          </p>
        )}
        {status.isPreOrderOnly && (
          <p className="mt-3 text-sm text-stll-charcoal/70 leading-relaxed">
            You can still place a pre-order now and choose a pickup time for when we&apos;re open.
          </p>
        )}
        <p className="mt-3 text-sm text-stll-charcoal/70 leading-relaxed">
          Follow{" "}
          <a
            href="https://www.instagram.com/stllhausco/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-stll-charcoal"
          >
            @stllhausco
          </a>{" "}
          for updates.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="w-full px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase border border-stll-charcoal bg-stll-charcoal text-white hover:bg-stll-charcoal/90 transition-colors"
          >
            Got it
          </button>
          <Link
            href="/menu"
            onClick={dismiss}
            className="w-full text-center px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal/5 transition-colors"
          >
            {status.canAddSnacks && !status.canAddDrinks
              ? "Order Siomai"
              : status.isPreOrderOnly
                ? "Pre-order on Menu"
                : "View Menu"}
          </Link>
        </div>
      </div>
    </div>
  );
}
