import { EventCard } from "@/components/EventCard";
import { loadPublishedUpcomingEvents } from "@/lib/market-events-store";
import Link from "next/link";

export async function HomeEventsSection() {
  const events = await loadPublishedUpcomingEvents();
  const featured = events.slice(0, 3);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FAF8F5] border-y border-stll-charcoal/10 px-6 sm:px-12 lg:px-20 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-3">
              Find us in person
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-stll-charcoal leading-tight">
              Upcoming Markets
            </h2>
            <p className="mt-4 text-sm text-stll-muted leading-relaxed max-w-lg">
              Catch STLL HAUS at local markets and pop-ups across Taranaki — handcrafted matcha,
              cold brew, and slow-crafted drinks, poured fresh for your still moment.
            </p>
          </div>
          <Link
            href="/events"
            className="self-start shrink-0 inline-block border border-stll-charcoal/20 text-stll-charcoal text-[11px] tracking-[0.3em] uppercase px-8 py-3.5 hover:bg-stll-charcoal hover:text-white transition-all duration-300"
          >
            All Events
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featured.map((event) => (
            <EventCard key={event.id} event={event} showImage={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
