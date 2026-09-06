import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact STLL HAUS | Matcha & Coffee Bar, Taranaki",
  description:
    "Get in touch with STLL HAUS — matcha and coffee bar for pickup orders and markets in New Plymouth / Taranaki. Email inquiries, events, and collaborations.",
  openGraph: {
    title: "Contact STLL HAUS | Matcha & Coffee Bar, Taranaki",
    description:
      "Get in touch with STLL HAUS — pickup orders, markets, and collaborations in New Plymouth / Taranaki.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
