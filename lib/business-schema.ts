import { publicSiteUrl } from "@/lib/site-url";

/** Organization / cafe schema so Google can match brand-name searches. */
export function buildBusinessJsonLd() {
  const siteUrl = publicSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${siteUrl}/#business`,
    name: "STLL HAUS",
    alternateName: ["STLLHAUS", "Stll Haus", "stllhaus", "stllhaus.co"],
    url: siteUrl,
    logo: `${siteUrl}/logo-matcha.png`,
    image: `${siteUrl}/head-webpage.jpg`,
    description:
      "STLL HAUS is a matcha and coffee bar in Taranaki, New Zealand — handcrafted matcha, cold brew, ube drinks, and siomai for pickup orders and local markets.",
    servesCuisine: ["Matcha", "Coffee", "Cold brew", "Filipino snacks"],
    priceRange: "$$",
    areaServed: [
      { "@type": "City", name: "New Plymouth" },
      { "@type": "AdministrativeArea", name: "Taranaki" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Plymouth",
      addressRegion: "Taranaki",
      addressCountry: "NZ",
    },
    sameAs: [
      "https://www.instagram.com/stllhausco/",
      "https://www.facebook.com/stllhausco",
      "https://www.tiktok.com/@stllhausco",
      "https://www.trustpilot.com/review/stllhaus.co",
    ],
  };
}
