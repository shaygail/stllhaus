"use client";


import { Button } from "@/components/Button";


export default function SuccessClient() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh] py-24">
      <div className="inline-flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-b from-stll-sage/10 to-stll-accent/10 border border-stll-sage/20 mb-8">
        <span className="text-6xl">🤍</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-stll-charcoal mb-4">Your order is being prepared</h1>
      <p className="text-lg text-stll-muted mb-10">Thank you for your order. We&apos;ll have it ready soon!</p>
      <Button href="/" className="mt-6">
        Back to home
      </Button>
    </div>
  );
}
