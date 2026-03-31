"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type LastOrder = {
  customerEmail: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  pickupTime: string;
  paymentMethod: string;
  orderId?: string;
  notes?: string;
};

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const method = searchParams.get("method");
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [receiptStatus, setReceiptStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [receiptError, setReceiptError] = useState("");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("stll-last-order");
      if (raw) {
        const parsed = JSON.parse(raw) as LastOrder;
        if (parsed?.customerEmail) {
          setLastOrder(parsed);
          setReceiptEmail(parsed.customerEmail);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleResendReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastOrder || !receiptEmail.trim()) return;
    setReceiptStatus("loading");
    setReceiptError("");
    try {
      const res = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: receiptEmail.trim(),
          customerName: lastOrder.customerName,
          items: lastOrder.items,
          total: lastOrder.total,
          pickupTime: lastOrder.pickupTime,
          paymentMethod: lastOrder.paymentMethod,
          orderId: lastOrder.orderId,
          notes: lastOrder.notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Could not send receipt");
      }
      setReceiptStatus("sent");
    } catch (err) {
      setReceiptStatus("error");
      setReceiptError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const paymentLabel = method === "cash" ? "Cash at pickup" : method === "bank_transfer" ? "Bank transfer" : null;

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <div className="pt-32 pb-16 px-6 sm:px-12 lg:px-20 border-b border-stll-charcoal/10">
        <p className="text-[10px] tracking-[0.4em] uppercase text-stll-muted mb-4">Stll Haus</p>
        <h1 className="text-[4rem] sm:text-[6rem] font-black uppercase tracking-tight text-stll-charcoal leading-none">
          Thank you for your order
        </h1>
      </div>

      <div className="px-6 sm:px-12 lg:px-20 pt-16 pb-24 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-stll-charcoal tracking-tight mb-4">
          Your order has been received
        </h2>
        {paymentLabel && (
          <p className="text-[11px] tracking-[0.2em] uppercase text-stll-muted mb-8">{paymentLabel}</p>
        )}

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-10 xl:gap-16">
          <div className="min-w-0 flex-1 lg:max-w-xl">
            <p className="text-sm text-stll-charcoal/90 mb-2 leading-relaxed">
              We&apos;ll have it ready soon.
            </p>
            <p className="text-sm text-stll-muted mb-12 leading-relaxed">
              We will send you an email or text message when your order is being made.
            </p>

            {lastOrder && (
              <section className="mb-12 border border-stll-charcoal/10 p-6 sm:p-8">
                <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-3">Receipt</p>
                <p className="text-[11px] tracking-[0.1em] text-stll-charcoal mb-6 leading-relaxed">
                  If you opted in at checkout, a receipt was sent to your email. You can also resend it to any address
                  below.
                </p>
                {receiptStatus === "sent" ? (
                  <p className="text-sm text-stll-charcoal">Receipt sent. Check your inbox.</p>
                ) : (
                  <form onSubmit={handleResendReceipt} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1 min-w-0">
                      <label htmlFor="receipt-email" className="block text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">
                        Email
                      </label>
                      <input
                        id="receipt-email"
                        type="email"
                        value={receiptEmail}
                        onChange={(e) => setReceiptEmail(e.target.value)}
                        required
                        className="w-full border border-stll-charcoal/25 bg-transparent px-4 py-3 text-[11px] tracking-[0.1em] text-stll-charcoal placeholder:text-stll-muted/50 focus:outline-none focus:border-stll-charcoal"
                        placeholder="you@email.com"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={receiptStatus === "loading"}
                      className="shrink-0 px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {receiptStatus === "loading" ? "Sending…" : "Send receipt"}
                    </button>
                  </form>
                )}
                {receiptError && <p className="text-xs text-red-600 mt-3">{receiptError}</p>}
              </section>
            )}

            <Link
              href="/"
              className="inline-block px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white text-center cursor-pointer"
            >
              Back Home
            </Link>
          </div>

          <aside className="shrink-0 w-full lg:w-auto lg:max-w-[min(100%,420px)] pt-2 border-t border-stll-charcoal/10 lg:border-t-0 lg:pt-0">
            <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted mb-8 text-center pt-8 lg:pt-0">
              Enjoyed your visit? Let us know!
            </p>
            <div className="flex flex-row flex-wrap justify-center gap-8 sm:gap-10 lg:gap-6">
              <div className="flex flex-col items-center gap-3 w-[120px]">
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://g.page/r/CSCrKOGMTz7VEBM/review"
                  alt="Google Review QR Code"
                  width={120}
                  height={120}
                  className="border border-stll-charcoal/10"
                />
                <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted text-center">Google Review</p>
              </div>

              <div className="flex flex-col items-center gap-3 w-[120px]">
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://www.facebook.com/stllhausco/reviews"
                  alt="Facebook Review QR Code"
                  width={120}
                  height={120}
                  className="border border-stll-charcoal/10"
                />
                <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted text-center">Facebook Review</p>
              </div>

              <div className="flex flex-col items-center gap-3 w-[120px]">
                <Image
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://linktr.ee/stllhausco"
                  alt="Socials QR Code"
                  width={120}
                  height={120}
                  className="border border-stll-charcoal/10"
                />
                <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted text-center">Follow Our Socials</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
