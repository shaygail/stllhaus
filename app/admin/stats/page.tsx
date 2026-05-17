"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminStatsPage() {
  const [secret, setSecret] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<number | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchStats(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    setRegisteredUsers(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secret.trim() }),
      });
      const data = (await res.json()) as {
        registeredUsers?: number;
        hitCap?: boolean;
        warning?: string;
        error?: string;
      };
      if (res.status === 503 && data.error === "admin_stats_not_configured") {
        setError(
          "Admin stats are not configured yet. Add ADMIN_STATS_SECRET to your server environment (e.g. Vercel), redeploy, then try again."
        );
        return;
      }
      if (res.status === 401) {
        setError("Incorrect key.");
        return;
      }
      if (!res.ok) {
        setError(data.error === "missing_server_config" ? "Server configuration is incomplete." : "Could not load stats.");
        return;
      }
      if (typeof data.registeredUsers === "number") {
        setRegisteredUsers(data.registeredUsers);
        if (data.warning) setWarning(data.warning);
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] px-6 py-24 max-w-md mx-auto">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Admin</p>
      <h1 className="text-2xl font-black uppercase tracking-tight text-stll-charcoal mb-2">Registration stats</h1>
      <p className="text-sm text-stll-muted leading-relaxed mb-4">
        Total users in Supabase Auth (anyone who completed email signup). Enter the{" "}
        <span className="font-semibold text-stll-charcoal">ADMIN_STATS_SECRET</span> from your host env — this page is
        not linked from the public site.
      </p>
      <p className="text-sm text-stll-muted leading-relaxed mb-8">
        <Link href="/admin/loyalty" className="underline underline-offset-2 hover:text-stll-charcoal">
          Loyalty members
        </Link>
        {" · "}
        <Link href="/admin/ordering" className="underline underline-offset-2 hover:text-stll-charcoal">
          Menu ordering
        </Link>
      </p>

      <form onSubmit={(e) => void fetchStats(e)} className="flex flex-col gap-4">
        <label htmlFor="admin-secret" className="sr-only">
          Admin secret
        </label>
        <input
          id="admin-secret"
          type="password"
          autoComplete="off"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Admin key"
          className="w-full px-4 py-3 text-sm border border-stll-charcoal/20 bg-white text-stll-charcoal placeholder:text-stll-muted/60 focus:outline-none focus:border-stll-charcoal/40"
        />
        <button
          type="submit"
          disabled={loading || !secret.trim()}
          className="w-full px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal bg-stll-charcoal text-white hover:bg-stll-charcoal/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Loading…" : "Show count"}
        </button>
      </form>

      {registeredUsers !== null && (
        <div className="mt-10 border border-stll-charcoal/15 bg-white/60 p-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Registered users</p>
          <p className="text-4xl font-black text-stll-charcoal tabular-nums">{registeredUsers}</p>
        </div>
      )}

      {warning && <p className="mt-6 text-sm text-amber-800 leading-relaxed">{warning}</p>}
      {error && <p className="mt-6 text-sm text-red-700 leading-relaxed">{error}</p>}

      <Link
        href="/"
        className="mt-12 inline-block text-[11px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal"
      >
        ← Back to home
      </Link>
    </div>
  );
}
