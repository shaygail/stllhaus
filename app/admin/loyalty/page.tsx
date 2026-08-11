"use client";

import type { AdminLoyaltyMember, AdminLoyaltySummary } from "@/lib/admin-loyalty";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminLoyaltyPage() {
  const [includeZero, setIncludeZero] = useState(false);
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<AdminLoyaltyMember[] | null>(null);
  const [summary, setSummary] = useState<AdminLoyaltySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.email?.toLowerCase().includes(q) ?? false) ||
        m.id.toLowerCase().includes(q)
    );
  }, [members, search]);

  const fetchLoyalty = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeZero }),
      });
      const data = (await res.json()) as {
        members?: AdminLoyaltyMember[];
        summary?: AdminLoyaltySummary;
        error?: string;
      };
      if (res.status === 401) {
        setError("You do not have admin access. Sign in at /login first.");
        return;
      }
      if (!res.ok) {
        setError(data.error === "missing_server_config" ? "Server configuration is incomplete." : "Could not load loyalty data.");
        return;
      }
      if (Array.isArray(data.members) && data.summary) {
        setMembers(data.members);
        setSummary(data.summary);
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [includeZero]);

  useEffect(() => {
    void fetchLoyalty();
  }, [fetchLoyalty]);

  return (
    <div className="min-h-[70vh] px-6 py-24 max-w-5xl mx-auto">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Admin</p>
      <h1 className="text-2xl font-black uppercase tracking-tight text-stll-charcoal mb-2">Loyalty members</h1>
      <p className="text-sm text-stll-muted leading-relaxed mb-4">
        Historical points and rewards for accounts that signed up before loyalty was removed.
      </p>
      <p className="text-sm text-stll-muted leading-relaxed mb-8">
        <Link href="/admin/stats" className="underline underline-offset-2 hover:text-stll-charcoal">
          Registration stats
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

      <label className="flex items-start gap-3 text-[11px] text-stll-charcoal leading-relaxed cursor-pointer mb-8 max-w-md">
        <input
          type="checkbox"
          checked={includeZero}
          onChange={(e) => setIncludeZero(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 border-stll-charcoal/40 accent-stll-charcoal"
        />
        Show all registered accounts (including 0 points)
      </label>

      {loading && !summary && (
        <p className="text-sm text-stll-muted mb-8">Loading loyalty data…</p>
      )}

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "With loyalty activity", value: summary.withAnyLoyaltyActivity },
            { label: "Total points", value: summary.totalPoints.toLocaleString() },
            { label: "Total member spend", value: `$${summary.totalSpent.toFixed(2)}` },
            { label: "Accounts scanned", value: summary.registeredUsersScanned },
          ].map(({ label, value }) => (
            <div key={label} className="border border-stll-charcoal/15 bg-white/60 p-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1">{label}</p>
              <p className="text-xl font-black text-stll-charcoal tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <div className="flex flex-wrap gap-4 text-[11px] tracking-[0.12em] uppercase text-stll-muted mb-8">
          <span>
            Bronze: <span className="text-stll-charcoal font-semibold">{summary.tierCounts.bronze}</span>
          </span>
          <span>
            Silver: <span className="text-stll-charcoal font-semibold">{summary.tierCounts.silver}</span>
          </span>
          <span>
            Gold: <span className="text-stll-charcoal font-semibold">{summary.tierCounts.gold}</span>
          </span>
          <span>
            10% off ready:{" "}
            <span className="text-stll-charcoal font-semibold">{summary.pendingTenPercent}</span>
          </span>
          <span>
            Free drink ready:{" "}
            <span className="text-stll-charcoal font-semibold">{summary.pendingFreeDrink}</span>
          </span>
        </div>
      )}

      {summary?.warning && (
        <p className="mb-6 text-sm text-amber-800 leading-relaxed">{summary.warning}</p>
      )}

      {members && (
        <>
          <div className="mb-4 max-w-sm">
            <label htmlFor="loyalty-search" className="sr-only">
              Search members
            </label>
            <input
              id="loyalty-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="w-full px-4 py-2.5 text-sm border border-stll-charcoal/20 bg-white text-stll-charcoal placeholder:text-stll-muted/60 focus:outline-none focus:border-stll-charcoal/40"
            />
          </div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-3">
            Showing {filtered.length} of {members.length} rows
          </p>
          <div className="overflow-x-auto border border-stll-charcoal/15 bg-white/60">
            <table className="w-full text-left text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-stll-charcoal/10 text-[10px] tracking-[0.2em] uppercase text-stll-muted">
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Points</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
                  <th className="px-4 py-3 font-medium">Spent</th>
                  <th className="px-4 py-3 font-medium">Rewards</th>
                  <th className="px-4 py-3 font-medium">Last points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stll-charcoal/10">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-stll-muted text-center">
                      No members match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className="text-stll-charcoal">
                      <td className="px-4 py-3">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-stll-muted mt-0.5">{m.email ?? "No email"}</p>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-semibold">{m.points}</td>
                      <td className="px-4 py-3 capitalize">{m.tier}</td>
                      <td className="px-4 py-3 tabular-nums">{m.totalPurchases}</td>
                      <td className="px-4 py-3 tabular-nums">${m.totalSpent.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs leading-relaxed">
                        {m.pendingTenPercent && (
                          <span className="block text-stll-charcoal">10% off ready</span>
                        )}
                        {m.pendingFreeDrink && (
                          <span className="block text-stll-charcoal">Free drink ready</span>
                        )}
                        {!m.pendingTenPercent && !m.pendingFreeDrink && m.earnedRewardsTotal === 0 && (
                          <span className="text-stll-muted">—</span>
                        )}
                        {m.earnedRewardsTotal > 0 && (
                          <span className="block text-stll-muted mt-0.5">
                            {m.earnedRewardsTotal} in history
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-stll-muted whitespace-nowrap">
                        {formatWhen(m.lastAwardedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

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
