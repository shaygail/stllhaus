"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type LoginClientProps = {
  adminSignInEnabled: boolean;
};

export function LoginClient({ adminSignInEnabled }: LoginClientProps) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  async function signInAsAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/admin-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        redirect: "manual",
        body: JSON.stringify({
          email: adminEmail.trim(),
          password: adminPassword,
          next,
        }),
      });

      if (res.status === 303 || res.status === 302 || res.status === 307 || res.status === 308) {
        const location = res.headers.get("Location");
        window.location.href = location ?? next;
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
        redirect?: string;
        error?: string;
        detail?: string;
      };

      if (res.status === 503) {
        setError(data.detail ?? "Team sign-in is not configured yet.");
        return;
      }
      if (res.status === 401) {
        setError("Incorrect team email or password.");
        return;
      }
      if (!res.ok) {
        setError(data.detail ?? data.error ?? "Could not sign in. Try again.");
        return;
      }

      window.location.href = data.redirect ?? next;
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Stll Haus</p>
      <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-stll-charcoal mb-2 text-center">
        Team sign in
      </h1>
      <p className="text-sm text-stll-muted text-center max-w-md mb-10">
        Staff only — sign in to manage events, ordering hours, and admin tools.
      </p>

      {adminSignInEnabled ? (
        <form onSubmit={(e) => void signInAsAdmin(e)} className="w-full max-w-sm flex flex-col gap-3">
          <label htmlFor="admin-email" className="sr-only">
            Team email
          </label>
          <input
            id="admin-email"
            type="email"
            name="email"
            autoComplete="username"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="Team email"
            required
            className="w-full px-4 py-3 text-sm border border-stll-charcoal/20 bg-white text-stll-charcoal placeholder:text-stll-muted/60 focus:outline-none focus:border-stll-charcoal/40"
          />
          <label htmlFor="admin-password" className="sr-only">
            Team password
          </label>
          <input
            id="admin-password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Team password"
            required
            className="w-full px-4 py-3 text-sm border border-stll-charcoal/20 bg-white text-stll-charcoal placeholder:text-stll-muted/60 focus:outline-none focus:border-stll-charcoal/40"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal bg-stll-charcoal text-white hover:bg-stll-charcoal/90 transition-colors disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-stll-muted text-center max-w-md">
          Team sign-in is not configured yet. Contact your site administrator.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-red-700 text-center max-w-md">{error}</p>}
      <Link href="/" className="mt-10 text-[11px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal">
        ← Back to home
      </Link>
    </div>
  );
}
