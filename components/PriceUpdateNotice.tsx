"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "stll-price-update-notice-v1";

type PriceUpdateNoticeProps = {
  enabled: boolean;
};

export function PriceUpdateNotice({ enabled }: PriceUpdateNoticeProps) {
  const [open, setOpen] = useState(false);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "dismissed") return;
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [enabled]);

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

  if (!enabled || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center px-5 py-10 bg-stll-charcoal/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-update-notice-title"
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
          id="price-update-notice-title"
          className="text-xl font-black uppercase tracking-tight text-stll-charcoal leading-snug"
        >
          A quick note on prices
        </h2>
        <p className="mt-4 text-sm text-stll-charcoal/90 leading-relaxed">
          We&apos;ve made a small adjustment to some drink prices due to recent increases in the
          cost of the milks and creams we use.
        </p>
        <p className="mt-3 text-sm text-stll-charcoal/90 leading-relaxed">
          Thank you for your understanding — we&apos;re still committed to the same quality you
          love.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-8 w-full px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase border border-stll-charcoal bg-stll-charcoal text-white hover:bg-stll-charcoal/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
