import Image from "next/image";
import type { MarketEvent } from "@/lib/market-events";

type EventCardProps = {
  event: MarketEvent;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="group border border-stll-charcoal/10 bg-white/70 overflow-hidden transition-all duration-300 hover:border-stll-charcoal/20 hover:shadow-soft">
      {event.image && (
        <div className="relative aspect-[16/9] overflow-hidden bg-stll-light">
          <Image
            src={event.image}
            alt={event.imageAlt ?? `${event.name} — STLL HAUS market pop-up`}
            fill
            unoptimized
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}

      <div className="p-6 sm:p-8">
        <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-3">
          Upcoming
        </p>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-stll-charcoal leading-tight">
          {event.name}
        </h2>

        <dl className="mt-5 space-y-3">
          <div>
            <dt className="text-[10px] tracking-[0.25em] uppercase text-stll-muted/70">
              Date
            </dt>
            <dd className="mt-1 text-sm text-stll-charcoal">{event.dateLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.25em] uppercase text-stll-muted/70">
              Location
            </dt>
            <dd className="mt-1 text-sm text-stll-charcoal">{event.location}</dd>
          </div>
        </dl>

        <p className="mt-5 text-sm text-stll-muted leading-relaxed">
          {event.description}
        </p>
      </div>
    </article>
  );
}
