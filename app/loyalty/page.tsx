"use client";

import { useState } from "react";
import { LoyaltyCardDisplay } from "@/components/LoyaltyCardDisplay";
import { useLoyalty } from "@/components/LoyaltyContext";

export default function LoyaltyPage() {
  const { card, initializeCard } = useLoyalty();
  const [showSignUp, setShowSignUp] = useState(!card);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      initializeCard(name, email);
      setShowSignUp(false);
      setName("");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-8 sm:px-16 lg:px-24">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted/60 mb-4">
            Member Programme
          </p>
          <h1 className="text-5xl sm:text-6xl font-black text-stll-charcoal uppercase leading-[0.9] tracking-tight">
            STLL HAUS<br />LOYALTY
          </h1>
          <p className="mt-6 text-sm text-stll-muted leading-relaxed max-w-md">
            Earn points on every purchase and move through our tiers. Slow down, and get rewarded for it.
          </p>
        </div>

        {/* Sign Up Form */}
        {showSignUp && !card && (
          <div className="mb-16 border-t border-stll-charcoal/10 pt-10">
            <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold mb-8">
              Join the Programme
            </h2>
            <form onSubmit={handleSignUp} className="space-y-6 max-w-sm">
              <div>
                <label className="block text-[10px] tracking-[0.25em] uppercase text-stll-muted/70 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border-b border-stll-charcoal/20 bg-transparent py-3 text-sm text-stll-charcoal placeholder:text-stll-muted/40 focus:outline-none focus:border-stll-charcoal transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.25em] uppercase text-stll-muted/70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border-b border-stll-charcoal/20 bg-transparent py-3 text-sm text-stll-charcoal placeholder:text-stll-muted/40 focus:outline-none focus:border-stll-charcoal transition-colors"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="border border-stll-charcoal text-stll-charcoal text-[11px] tracking-[0.3em] uppercase px-8 py-3 hover:bg-stll-charcoal hover:text-white transition-all duration-300"
                >
                  Create Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignUp(false)}
                  className="text-[11px] tracking-[0.3em] uppercase text-stll-muted/60 hover:text-stll-charcoal transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loyalty Card */}
        <LoyaltyCardDisplay />

        {/* How It Works */}
        {card && !showSignUp && (
          <div className="mt-16 border-t border-stll-charcoal/10 pt-10">
            <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { step: "01", text: "Earn 10 points per dollar spent on every purchase" },
                { step: "02", text: "Reach 250 points to unlock Silver tier" },
                { step: "03", text: "Reach 500 points to unlock Gold tier" },
                { step: "04", text: "Redeem points for free drinks and exclusive rewards" },
              ].map(({ step, text }) => (
                <div key={step} className="flex gap-5">
                  <span className="text-[10px] tracking-[0.2em] text-stll-muted/40 pt-0.5 shrink-0">{step}</span>
                  <p className="text-sm text-stll-muted leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tier Progression */}
        <div className="mt-16 border-t border-stll-charcoal/10 pt-10">
          <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold mb-8">
            Tier Progression
          </h2>
          <div className="space-y-0">
            {[
              { tier: "Bronze", range: "0 – 249 pts", perk: "Base tier" },
              { tier: "Silver", range: "250 – 499 pts", perk: "10% off every order" },
              { tier: "Gold", range: "500+ pts", perk: "20% off + exclusive perks" },
            ].map(({ tier, range, perk }) => (
              <div key={tier} className="flex items-center justify-between py-5 border-b border-stll-charcoal/8">
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-stll-charcoal font-medium">{tier}</p>
                  <p className="text-[10px] tracking-[0.15em] text-stll-muted/60 mt-0.5">{range}</p>
                </div>
                <p className="text-xs text-stll-muted/70 tracking-wide">{perk}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
