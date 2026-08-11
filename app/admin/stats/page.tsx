"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function AdminStatsPage() {
  const [registeredUsers, setRegisteredUsers] = useState<number | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setError(null);
    setWarning(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as {
        registeredUsers?: number;
        hitCap?: boolean;
        warning?: string;
        error?: string;
      };
      if (res.status === 401) {
        setError("You do not have admin access. Sign in at /login first.");
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
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-[70vh] px-6 py-24 max-w-md mx-auto">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Admin</p>
      <h1 className="text-2xl font-black uppercase tracking-tight text-stll-charcoal mb-2">Registration stats</h1>
      <p className="text-sm text-stll-muted leading-relaxed mb-4">
        Total users in Supabase Auth (anyone who completed email signup).
      </p>
      <p className="text-sm text-stll-muted leading-relaxed mb-8">
        <Link href="/admin/loyalty" className="underline underline-offset-2 hover:text-stll-charcoal">
          Loyalty members
        </Link>
        {" · "}
        <Link href="/admin/ordering" className="underline underline-offset-2 hover:text-stll-charcoal">
          Menu ordering
        </Link>
        {" · "}
        <Link href="/account/events" className="underline underline-offset-2 hover:text-stll-charcoal">
          Manage events
        </Link>
      </p>

      {loading && registeredUsers === null && (
        <p className="text-sm text-stll-muted mb-8">Loading stats…</p>
      )}

      {registeredUsers !== null && (
        <div className="border border-stll-charcoal/15 bg-white/60 p-6">
          <p className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-2">Registered users</p>
          <p className="text-4xl font-black text-stll-charcoal tabular-nums">{registeredUsers}</p>
        </div>
      )}

      {warning && <p className="mt-6 text-sm text-amber-800 leading-relaxed">{warning}</p>}
      {error && <p className="mt-6 text-sm text-red-700 leading-relaxed">{error}</p>}

      <Link
        href="/account"
        className="mt-12 inline-block text-[11px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal"
      >
        ← Admin hub
      </Link>
    </div>
  );
}
