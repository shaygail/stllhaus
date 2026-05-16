import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Ordering — STLL HAUS",
  robots: { index: false, follow: false },
};

export default function AdminOrderingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
