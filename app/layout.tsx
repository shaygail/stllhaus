import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { PriceUpdateNotice } from "@/components/PriceUpdateNotice";
import { ClosedNotice } from "@/components/ClosedNotice";
import { loadOrderingSettings } from "@/lib/ordering-settings-store";
import { publicSiteUrl } from "@/lib/site-url";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const siteUrl = publicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "STLL HAUS | Matcha & Coffee Bar – New Plymouth, Taranaki",
    template: "%s | STLL HAUS",
  },
  description:
    "STLL HAUS (stllhaus) is a matcha and coffee bar in New Plymouth / Taranaki — handcrafted matcha, cold brew, ube drinks, and siomai for pickup orders and local markets. Order online at stllhaus.co.",
  applicationName: "STLL HAUS",
  keywords: [
    "STLL HAUS",
    "STLLHAUS",
    "Stll Haus",
    "stllhaus",
    "stllhaus.co",
    "stllhausco",
    "matcha New Plymouth",
    "matcha Taranaki",
    "coffee bar New Plymouth",
    "ube drink",
    "cold brew Taranaki",
    "siomai New Plymouth",
    "market stall Taranaki",
  ],
  authors: [{ name: "STLL HAUS", url: siteUrl }],
  creator: "STLL HAUS",
  publisher: "STLL HAUS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: siteUrl,
    siteName: "STLL HAUS",
    title: "STLL HAUS | Matcha & Coffee Bar – New Plymouth, Taranaki",
    description:
      "Handcrafted matcha, cold brew, ube drinks, and siomai. Order online for pickup or find STLL HAUS at markets across Taranaki.",
    images: [
      {
        url: "/head-webpage.jpg",
        width: 1200,
        height: 630,
        alt: "STLL HAUS – matcha and coffee bar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "STLL HAUS | Matcha & Coffee Bar – New Plymouth, Taranaki",
    description:
      "Handcrafted matcha, cold brew, ube drinks, and siomai. Order online at stllhaus.co.",
    images: ["/head-webpage.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "food and drink",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await loadOrderingSettings();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body className="min-h-full bg-stll-cream text-stll-charcoal" suppressHydrationWarning>
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <PriceUpdateNotice enabled={settings.priceUpdateNoticeEnabled} />
          <ClosedNotice />
        </CartProvider>
      </body>
    </html>
  );
}
