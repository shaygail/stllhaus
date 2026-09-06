import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | STLL HAUS – Matcha, Cold Brew & Siomai",
  description:
    "Order from the STLL HAUS menu — ceremonial matcha, ube, cold brew, Sip & Bite combos, and siomai. Pickup in New Plymouth / Taranaki or find us at markets.",
  openGraph: {
    title: "Menu | STLL HAUS – Matcha, Cold Brew & Siomai",
    description:
      "Order from the STLL HAUS menu — ceremonial matcha, ube, cold brew, and siomai. Pickup or markets across Taranaki.",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
