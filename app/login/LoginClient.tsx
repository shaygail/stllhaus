"use client";

import { getClientAuthRedirectBaseUrl } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"idle" | "signin" | "signup">("idle");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const base = () => getClientAuthRedirectBaseUrl();
  const redirectTo = () =>
    `${base()}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendSignInLink() {
    setError(null);
    setEmailSent(false);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }
    setPending("signin");
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: redirectTo(),
        },
      });
      if (otpError) {
        const msg = otpError.message.toLowerCase();
        if (msg.includes("signups not allowed") || msg.includes("user not found") || msg.includes("not registered")) {
          setError(
            "No account exists for this email yet. Use “Create account” below, or check the address for typos."
          );
        } else {
          setError(otpError.message);
        }
        return;
      }
      setEmailSent(true);
    } catch {
      setError("Could not send the link. Try again.");
    } finally {
      setPending("idle");
    }
  }

  async function sendSignUpLink() {
    setError(null);
    setEmailSent(false);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }
    setPending("signup");
    try {
      const res = await fetch("/api/auth/email-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as { exists?: boolean; error?: string };

      if (res.status === 503) {
        setError(
          "New account registration is not fully configured on the server. Please contact Stll Haus or try “Email me a sign-in link” if you already have an account."
        );
        return;
      }
      if (!res.ok) {
        setError(data.error === "invalid_email" ? "Enter a valid email address." : "Could not check this email. Try again.");
        return;
      }
      if (data.exists) {
        setError(
          "This email is already registered. Use “Email me a sign-in link” above instead of creating another account."
        );
        return;
      }

      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo(),
        },
      });
      if (otpError) {
        setError(otpError.message);
        return;
      }
      setEmailSent(true);
    } catch {
      setError("Could not send the link. Try again.");
    } finally {
      setPending("idle");
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Stll Haus</p>
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-stll-charcoal mb-2 text-center">
        Sign in
      </h1>
      <p className="text-sm text-stll-muted text-center max-w-md mb-10">
        One email per account. Sign in if you already ordered with us, or create an account if you&apos;re new.
      </p>

      <div className="w-full max-w-sm flex flex-col gap-3">
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
          type="button"
          onClick={() => void sendSignInLink()}
          disabled={pending !== "idle"}
          className="w-full px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal bg-stll-charcoal text-white hover:bg-stll-charcoal/90 transition-colors disabled:opacity-50"
        >
          {pending === "signin" ? "Sending…" : "Email me a sign-in link"}
        </button>
        <button
          type="button"
          onClick={() => void sendSignUpLink()}
          disabled={pending !== "idle"}
          className="w-full px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal/5 transition-colors disabled:opacity-50"
        >
          {pending === "signup" ? "Sending…" : "Create account"}
        </button>
      </div>
      {emailSent && (
        <p className="mt-4 text-sm text-stll-charcoal text-center max-w-md">
          Check your inbox for a link to continue. It may take a minute to arrive.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-700 text-center max-w-md">{error}</p>}
      <Link href="/" className="mt-10 text-[11px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal">
        ← Back to home
      </Link>
    </div>
  );
}
