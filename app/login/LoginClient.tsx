"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function signInWithEmailLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }
    setPendingEmail(true);
    setEmailSent(false);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (otpError) setError(otpError.message);
      else setEmailSent(true);
    } catch {
      setError("Could not send the link. Try again.");
    } finally {
      setPendingEmail(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Stll Haus</p>
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-stll-charcoal mb-2 text-center">
        Sign in
      </h1>
      <p className="text-sm text-stll-muted text-center max-w-md mb-10">
        Use any email and we&apos;ll send you a one-time sign-in link. This account will be used for loyalty rewards.
      </p>

      <form onSubmit={signInWithEmailLink} className="w-full max-w-sm flex flex-col gap-3">
        <label htmlFor="login-email" className="sr-only">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 text-sm border border-stll-charcoal/20 bg-white text-stll-charcoal placeholder:text-stll-muted/60 focus:outline-none focus:border-stll-charcoal/40"
        />
        <button
          type="submit"
          disabled={pendingEmail}
          className="w-full px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal bg-stll-charcoal text-white hover:bg-stll-charcoal/90 transition-colors disabled:opacity-50"
        >
          {pendingEmail ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>
      {emailSent && (
        <p className="mt-4 text-sm text-stll-charcoal text-center max-w-md">
          Check your inbox for a link to sign in. It may take a minute to arrive.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-700 text-center max-w-md">{error}</p>}
      <Link href="/" className="mt-10 text-[11px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal">
        ← Back to home
      </Link>
    </div>
  );
}
