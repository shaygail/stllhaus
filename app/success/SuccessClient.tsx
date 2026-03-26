"use client";

import Link from "next/link";
import Image from "next/image";

export default function SuccessClient() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh] py-24">
      <div className="inline-flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-b from-stll-sage/10 to-stll-accent/10 border border-stll-sage/20 mb-8">
        <span className="text-6xl">🤍</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-stll-charcoal mb-4">Your order is being prepared</h1>
      <p className="text-lg text-stll-muted mb-10">Thank you for your order. We&apos;ll have it ready soon!</p>

      <p className="text-[11px] tracking-[0.3em] uppercase text-stll-muted mb-8">Enjoyed your visit? Let us know!</p>

      <div className="flex flex-col sm:flex-row gap-6 mb-12 justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://g.page/r/CSCrKOGMTz7VEBM/review"
            alt="Google Review QR Code"
            width={120}
            height={120}
            className="border border-stll-charcoal/10"
          />
          <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted">Google Review</p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:ml-8">
          <Image
            src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://www.facebook.com/stllhausco/reviews"
            alt="Facebook Review QR Code"
            width={120}
            height={120}
            className="border border-stll-charcoal/10"
          />
          <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted">Facebook Review</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Image
            src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://linktr.ee/stllhausco"
            alt="Socials QR Code"
            width={120}
            height={120}
            className="border border-stll-charcoal/10"
          />
          <p className="text-[10px] tracking-[0.3em] uppercase text-stll-muted">Follow Our Socials</p>
        </div>
      </div>

      <Link href="/" className="mx-auto w-full sm:w-auto px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white text-center cursor-pointer">
        Back Home
      </Link>
    </div>
  );
}