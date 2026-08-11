import type { MarketEvent } from "@/lib/market-events";
import { eventImageForSchema } from "@/lib/event-image";
import { publicSiteUrl } from "@/lib/site-url";

function parseLocationParts(location: string) {
  const parts = location.split(",").map((part) => part.trim());
  return {
    locality: parts[0] ?? location,
    region: parts[1] ?? "Taranaki",
  };
}

export function buildEventsJsonLd(events: MarketEvent[]) {
  const siteUrl = publicSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": events.map((event) => {
      const { locality, region } = parseLocationParts(event.location);

      return {
        "@type": "Event",
        "@id": `${siteUrl}/events#${event.id}`,
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        ...(event.endDate ? { endDate: event.endDate } : {}),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: {
          "@type": "Place",
          name: event.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: locality,
            addressRegion: region,
            addressCountry: "NZ",
          },
        },
        organizer: {
          "@type": "Organization",
          name: "STLL HAUS",
          url: siteUrl,
        },
        ...(event.image
          ? { image: eventImageForSchema(event.image, siteUrl) }
          : {}),
      };
    }),
  };
}
