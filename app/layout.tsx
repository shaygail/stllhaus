import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { LoyaltyProvider } from "@/components/LoyaltyContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "STLL HAUS",
  description: "A home for quiet sips, chill whisks, and slow, zero-rush brews.",
  keywords: ["STLL HAUS", "matcha", "ube", "beverage", "slow living"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-stll-cream text-stll-charcoal">
        <CartProvider>
          <LoyaltyProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </LoyaltyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
