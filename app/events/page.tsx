import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { buildEventsJsonLd } from "@/lib/event-schema";
import {
  loadPublishedPastEvents,
  loadPublishedUpcomingEvents,
} from "@/lib/market-events-store";

export const metadata: Metadata = {
  title: "Events & Markets | STLL HAUS – Matcha & Coffee Bar, New Plymouth",
  description:
    "Find STLL HAUS at upcoming markets and pop-ups around Taranaki. Handcrafted matcha, cold brew & ube drinks — see where we're pouring next.",
  openGraph: {
    title: "Events & Markets | STLL HAUS – Matcha & Coffee Bar, New Plymouth",
    description:
      "Find STLL HAUS at upcoming markets and pop-ups around Taranaki. Handcrafted matcha, cold brew & ube drinks — see where we're pouring next.",
  },
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    loadPublishedUpcomingEvents(),
    loadPublishedPastEvents(),
  ]);
  const jsonLd = buildEventsJsonLd(upcoming);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#FAF8F5] min-h-screen">
        {/* Page header */}
        <div className="pt-32 pb-16 px-6 sm:px-12 lg:px-20 border-b border-stll-charcoal/10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-4">
            Stll Haus — Bell Block, New Plymouth
          </p>
          <h1 className="text-[3rem] sm:text-[5rem] lg:text-[6.5rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
            Find Us At Our Next Market
          </h1>
        </div>

        {/* Intro + hero image */}
        <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-stll-charcoal/10">
          <div className="px-6 sm:px-12 lg:px-20 py-16 sm:py-20 flex flex-col justify-center">
            <p className="text-sm text-stll-muted leading-relaxed max-w-lg">
              STLL HAUS pops up at local markets and stalls across Taranaki — bringing
              handcrafted matcha, slow-steeped cold brew, and ube drinks to your
              neighbourhood. Check back here for upcoming dates, or follow us on
              Instagram for last-minute appearances and market-day updates.
            </p>
            <p className="mt-4 text-sm text-stll-muted leading-relaxed max-w-lg">
              Based in Bell Block, New Plymouth, we pour with the same calm,
              intentional energy whether you order online or find us at a stall.
            </p>
          </div>

          <div className="relative min-h-[50vw] lg:min-h-[420px] overflow-hidden bg-stll-light">
            <Image
              src="/head-webpage.jpg"
              alt="STLL HAUS matcha and coffee bar at a local market, Taranaki"
              fill
              unoptimized
              className="object-cover object-center"
              priority
            />
          </div>
        </section>

        {/* Upcoming event listings */}
        <section className="px-6 sm:px-12 lg:px-20 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-10">
              Upcoming Events
            </p>

            {upcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-stll-muted leading-relaxed">
                No upcoming events listed yet — follow{" "}
                <a
                  href="https://www.instagram.com/stllhausco/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-stll-charcoal hover:text-stll-charcoal/70 transition-colors"
                >
                  @stllhausco
                </a>{" "}
                for the latest.
              </p>
            )}
          </div>
        </section>

        {/* Past events */}
        {past.length > 0 && (
          <section className="px-6 sm:px-12 lg:px-20 pb-16 sm:pb-24 border-t border-stll-charcoal/10">
            <div className="max-w-5xl mx-auto pt-16 sm:pt-24">
              <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-3">
                Looking back
              </p>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-stll-charcoal leading-tight mb-4">
                Previous Markets
              </h2>
              <p className="text-sm text-stll-muted leading-relaxed max-w-lg mb-10">
                Markets and pop-ups we&apos;ve poured at recently — thanks for stopping by.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} variant="past" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-stll-charcoal text-white px-6 sm:px-12 lg:px-20 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[10px] tracking-[0.35em] uppercase text-white/35 mb-6">
              Can&apos;t make it to the market?
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight">
              Order Ahead Online
            </h2>
            <p className="mt-5 text-sm text-white/50 leading-relaxed max-w-md mx-auto">
              Browse the full menu and place a pickup order from Bell Block — ready
              when you are.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/menu"
                className="inline-block border border-white/25 text-white text-[11px] tracking-[0.3em] uppercase px-10 py-4 hover:bg-white hover:text-stll-charcoal transition-all duration-400"
              >
                View Menu
              </Link>
              <a
                href="https://www.instagram.com/stllhausco/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-white/15 text-white/70 text-[11px] tracking-[0.3em] uppercase px-10 py-4 hover:border-white/40 hover:text-white transition-colors duration-400"
              >
                @stllhausco
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
