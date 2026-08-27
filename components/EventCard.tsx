"use client";

import type { MarketEvent } from "@/lib/market-events";
import Image from "next/image";
import { useId, useState } from "react";

type EventCardProps = {
  event: MarketEvent;
  showImage?: boolean;
  /** Defaults to upcoming; past events show a "Past" label. */
  variant?: "upcoming" | "past";
};

export function EventCard({ event, showImage = true, variant = "upcoming" }: EventCardProps) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const isPast = variant === "past";

  return (
    <article
      className={`group border border-stll-charcoal/10 bg-white/70 overflow-hidden transition-all duration-300 hover:border-stll-charcoal/20 hover:shadow-soft ${
        isPast ? "opacity-90" : ""
      }`}
    >
      {showImage && event.image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-stll-light">
          <Image
            src={event.image}
            alt={event.imageAlt ?? `${event.name} — STLL HAUS market pop-up`}
            fill
            unoptimized
            className={`object-cover object-center transition-transform duration-500 group-hover:scale-[1.02] ${
              isPast ? "grayscale-[25%]" : ""
            }`}
          />
        </div>
      )}

      <div className="p-6 sm:p-8">
        <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-3">
          {isPast ? "Past" : "Upcoming"}
        </p>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-stll-charcoal leading-tight">
          {event.name}
        </h2>

        <dl className="mt-5 space-y-3">
          <div>
            <dt className="text-[10px] tracking-[0.25em] uppercase text-stll-muted/70">Date</dt>
            <dd className="mt-1 text-sm text-stll-charcoal">{event.dateLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.25em] uppercase text-stll-muted/70">Location</dt>
            <dd className="mt-1 text-sm text-stll-charcoal">{event.location}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={detailsId}
          className="mt-5 text-[10px] tracking-[0.25em] uppercase text-stll-charcoal/70 hover:text-stll-charcoal border-b border-stll-charcoal/20 hover:border-stll-charcoal/50 transition-colors"
        >
          {open ? "Hide details" : "More details"}
        </button>

        <div
          id={detailsId}
          hidden={!open}
          className={open ? "mt-5 pt-5 border-t border-stll-charcoal/10" : undefined}
        >
          <p className="text-sm text-stll-muted leading-relaxed">{event.description}</p>
        </div>
      </div>
    </article>
  );
}
