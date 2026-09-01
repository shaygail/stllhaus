"use client";

import type { ClosedDateRange, OrderingSettings } from "@/lib/ordering-settings";
import { formatClosedDateRangeLabel } from "@/lib/ordering-settings";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultForm: OrderingSettings = {
  orderingEnabled: true,
  drinksOrderingEnabled: true,
  blockOrdersWhenClosed: true,
  preOrderWhenClosed: true,
  forceClosed: false,
  forceOpen: false,
  marketMode: false,
  marketResumeAt: "",
  timezone: "Pacific/Auckland",
  useWeekdayWeekendSchedule: true,
  weekdayHours: { openTime: "17:30", closeTime: "21:00" },
  weekendHours: { openTime: "11:00", closeTime: "21:00" },
  singleHours: { openTime: "11:00", closeTime: "21:00" },
  closedDays: [],
  closedDateRanges: [],
  snacksAllowedOnClosedDates: true,
  priceUpdateNoticeEnabled: false,
};

export default function AdminOrderingPage() {
  const [form, setForm] = useState<OrderingSettings>(defaultForm);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRangeStart, setNewRangeStart] = useState("");
  const [newRangeEnd, setNewRangeEnd] = useState("");
  const [newRangeLabel, setNewRangeLabel] = useState("");

  const loadSettings = useCallback(async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ordering-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as { settings?: OrderingSettings; error?: string; detail?: string };
      if (res.status === 401) {
        setError("You do not have admin access. Sign in at /login first.");
        return;
      }
      if (!res.ok) {
        setError(data.detail ?? data.error ?? "Could not load settings.");
        return;
      }
      if (data.settings) {
        setForm(data.settings);
        setLoaded(true);
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ordering-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });
      const data = (await res.json()) as { saved?: boolean; error?: string; detail?: string };
      if (res.status === 401) {
        setError("You do not have admin access. Sign in at /login first.");
        return;
      }
      if (!res.ok) {
        setError(data.detail ?? data.error ?? "Could not save settings.");
        return;
      }
      setSuccess("Settings saved. The menu will reflect changes within about a minute.");
      setLoaded(true);
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleClosedDay(day: number) {
    setForm((prev) => ({
      ...prev,
      closedDays: prev.closedDays.includes(day)
        ? prev.closedDays.filter((d) => d !== day)
        : [...prev.closedDays, day].sort((a, b) => a - b),
    }));
  }

  function addClosedDateRange() {
    const start = newRangeStart.trim();
    const end = (newRangeEnd.trim() || newRangeStart).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
      setError("Choose a valid start and end date for the closed period.");
      return;
    }
    const ordered: ClosedDateRange = {
      startDate: start <= end ? start : end,
      endDate: start <= end ? end : start,
      ...(newRangeLabel.trim() ? { label: newRangeLabel.trim().slice(0, 80) } : {}),
    };
    setForm((prev) => ({
      ...prev,
      closedDateRanges: [...prev.closedDateRanges, ordered].sort((a, b) =>
        a.startDate.localeCompare(b.startDate)
      ),
    }));
    setNewRangeStart("");
    setNewRangeEnd("");
    setNewRangeLabel("");
    setError(null);
  }

  function removeClosedDateRange(index: number) {
    setForm((prev) => ({
      ...prev,
      closedDateRanges: prev.closedDateRanges.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="min-h-[70vh] px-6 py-24 max-w-lg mx-auto">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Admin</p>
      <h1 className="text-2xl font-black uppercase tracking-tight text-stll-charcoal mb-2">Menu ordering</h1>
      <p className="text-sm text-stll-muted leading-relaxed mb-8">
        Control when customers can order on the website. When closed, you can block cart entirely or allow
        pre-orders for pickup after you open. Run{" "}
        <code className="text-xs">supabase/ordering_settings.sql</code> once so settings persist in Supabase.
      </p>
      <p className="text-sm text-stll-muted leading-relaxed mb-8 -mt-4">
        <Link href="/admin/stats" className="underline underline-offset-2 hover:text-stll-charcoal">
          Registration stats
        </Link>
        {" · "}
        <Link href="/admin/loyalty" className="underline underline-offset-2 hover:text-stll-charcoal">
          Loyalty members
        </Link>
        {" · "}
        <Link href="/account/events" className="underline underline-offset-2 hover:text-stll-charcoal">
          Manage events
        </Link>
      </p>

      {loading && !loaded && (
        <p className="text-sm text-stll-muted mb-8">Loading settings…</p>
      )}

      {loaded && (
        <form onSubmit={(e) => void saveSettings(e)} className="flex flex-col gap-6 border-t border-stll-charcoal/10 pt-10">
          <Toggle
            label="Online ordering enabled"
            hint="Turn off to pause all menu orders."
            checked={form.orderingEnabled}
            onChange={(v) => setForm((p) => ({ ...p, orderingEnabled: v }))}
          />
          <Toggle
            label="Drinks ordering enabled"
            hint="Turn off to pause drinks (and Sip & Bite combos) while still allowing snacks like siomai."
            checked={form.drinksOrderingEnabled}
            onChange={(v) => setForm((p) => ({ ...p, drinksOrderingEnabled: v }))}
          />
          <Toggle
            label="Block cart when closed"
            hint="When off, customers can still add items outside hours (not recommended)."
            checked={form.blockOrdersWhenClosed}
            onChange={(v) => setForm((p) => ({ ...p, blockOrdersWhenClosed: v }))}
          />
          <Toggle
            label="Allow pre-orders when closed"
            hint="Customers can order before you open; checkout requires pickup at or after open time."
            checked={form.preOrderWhenClosed}
            onChange={(v) => setForm((p) => ({ ...p, preOrderWhenClosed: v }))}
          />
          <Toggle
            label="Force closed now"
            hint="Overrides hours — useful for holidays or sold out for the day."
            checked={form.forceClosed}
            onChange={(v) => setForm((p) => ({ ...p, forceClosed: v, forceOpen: v ? false : p.forceOpen }))}
          />
          <Toggle
            label="Force open now"
            hint="Overrides hours — accept orders outside normal hours."
            checked={form.forceOpen}
            onChange={(v) => setForm((p) => ({ ...p, forceOpen: v, forceClosed: v ? false : p.forceClosed }))}
          />

          <div className="border border-amber-700/25 bg-amber-50/60 p-4 -mx-1">
            <Toggle
              label="At a market (pause online orders)"
              hint="Shows a 'currently at a market' note and blocks online orders until the resume time below."
              checked={form.marketMode}
              onChange={(v) => setForm((p) => ({ ...p, marketMode: v }))}
            />
            {form.marketMode && (
              <div className="mt-4">
                <label
                  htmlFor="market-resume"
                  className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5"
                >
                  Resume online orders at
                </label>
                <input
                  id="market-resume"
                  type="datetime-local"
                  value={form.marketResumeAt}
                  onChange={(e) => setForm((p) => ({ ...p, marketResumeAt: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-stll-charcoal/20 bg-white"
                />
                <p className="text-xs text-stll-muted mt-1.5 leading-relaxed">
                  Customers see “We&apos;ll resume online orders at …”. Orders re-open automatically once
                  this time passes. Leave blank to just say “back soon”.
                </p>
              </div>
            )}
          </div>

          <div className="border border-stll-charcoal/10 bg-white/80 p-4 -mx-1 space-y-1">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-3">Website notices</p>
            <Toggle
              label="Price update popup"
              hint="Shows a one-time notice about drink price changes when someone first opens the site (until they dismiss it)."
              checked={form.priceUpdateNoticeEnabled}
              onChange={(v) => setForm((p) => ({ ...p, priceUpdateNoticeEnabled: v }))}
            />
          </div>

          <Toggle
            label="Different hours on weekdays vs weekends"
            hint="Mon–Fri use weekday hours; Sat–Sun use weekend hours."
            checked={form.useWeekdayWeekendSchedule}
            onChange={(v) => setForm((p) => ({ ...p, useWeekdayWeekendSchedule: v }))}
          />

          {form.useWeekdayWeekendSchedule ? (
            <>
              <HoursBlock
                title="Weekdays (Mon–Fri)"
                hours={form.weekdayHours}
                onChange={(weekdayHours) => setForm((p) => ({ ...p, weekdayHours }))}
              />
              <HoursBlock
                title="Weekends (Sat–Sun)"
                hours={form.weekendHours}
                onChange={(weekendHours) => setForm((p) => ({ ...p, weekendHours }))}
              />
            </>
          ) : (
            <HoursBlock
              title="Every day"
              hours={form.singleHours}
              onChange={(singleHours) => setForm((p) => ({ ...p, singleHours }))}
            />
          )}

          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Closed days</p>
            <div className="flex flex-wrap gap-2">
              {DAY_LABELS.map((label, day) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleClosedDay(day)}
                  className={`px-3 py-2 text-[10px] tracking-[0.15em] uppercase border ${
                    form.closedDays.includes(day)
                      ? "bg-stll-charcoal text-white border-stll-charcoal"
                      : "border-stll-charcoal/25 text-stll-charcoal"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-stll-charcoal/10 bg-white/80 p-4 -mx-1 space-y-4">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1">
                Closed from / until
              </p>
              <p className="text-xs text-stll-muted leading-relaxed">
                Set the dates you are closed (e.g. this weekend or a holiday). Customers see a closed
                popup. Use the same date in both fields for a single closed day.
              </p>
            </div>

            <Toggle
              label="Allow siomai / snacks on closed dates"
              hint="When on, drinks stay unavailable but customers can still order siomai during closed periods."
              checked={form.snacksAllowedOnClosedDates}
              onChange={(v) => setForm((p) => ({ ...p, snacksAllowedOnClosedDates: v }))}
            />

            {form.closedDateRanges.length > 0 && (
              <ul className="space-y-2">
                {form.closedDateRanges.map((range, index) => (
                  <li
                    key={`${range.startDate}-${range.endDate}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-3 border border-stll-charcoal/10 bg-white px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm text-stll-charcoal">
                        Closed {formatClosedDateRangeLabel(range)}
                      </p>
                      {range.label && (
                        <p className="text-[10px] tracking-[0.15em] uppercase text-stll-muted mt-0.5">
                          {range.label}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeClosedDateRange(index)}
                      className="text-[10px] tracking-[0.2em] uppercase text-red-700 border border-red-200 px-3 py-1.5 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="closed-range-start"
                  className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5"
                >
                  Closed from
                </label>
                <input
                  id="closed-range-start"
                  type="date"
                  value={newRangeStart}
                  onChange={(e) => {
                    setNewRangeStart(e.target.value);
                    if (!newRangeEnd) setNewRangeEnd(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-sm border border-stll-charcoal/20 bg-white"
                />
              </div>
              <div>
                <label
                  htmlFor="closed-range-end"
                  className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5"
                >
                  Closed until
                </label>
                <input
                  id="closed-range-end"
                  type="date"
                  value={newRangeEnd}
                  onChange={(e) => setNewRangeEnd(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stll-charcoal/20 bg-white"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="closed-range-label"
                className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-1.5"
              >
                Note (optional)
              </label>
              <input
                id="closed-range-label"
                type="text"
                value={newRangeLabel}
                onChange={(e) => setNewRangeLabel(e.target.value)}
                placeholder="Holiday break"
                className="w-full px-3 py-2 text-sm border border-stll-charcoal/20 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={addClosedDateRange}
              className="px-6 py-2.5 text-[10px] tracking-[0.2em] uppercase border border-stll-charcoal/25 text-stll-charcoal hover:bg-stll-charcoal hover:text-white transition-colors"
            >
              Add closed dates
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal bg-stll-charcoal text-white hover:bg-stll-charcoal/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      )}

      {success && <p className="mt-6 text-sm text-green-800 leading-relaxed">{success}</p>}
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

function HoursBlock({
  title,
  hours,
  onChange,
}: {
  title: string;
  hours: { openTime: string; closeTime: string };
  onChange: (h: { openTime: string; closeTime: string }) => void;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.15em] uppercase text-stll-muted/80">Opens</span>
          <input
            type="time"
            value={hours.openTime}
            onChange={(e) => onChange({ ...hours, openTime: e.target.value })}
            className="px-3 py-2 text-sm border border-stll-charcoal/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] tracking-[0.15em] uppercase text-stll-muted/80">Closes</span>
          <input
            type="time"
            value={hours.closeTime}
            onChange={(e) => onChange({ ...hours, closeTime: e.target.value })}
            className="px-3 py-2 text-sm border border-stll-charcoal/20"
          />
        </label>
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex gap-3 cursor-pointer items-start">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1"
      />
      <span>
        <span className="block text-sm font-medium text-stll-charcoal">{label}</span>
        <span className="block text-xs text-stll-muted mt-0.5">{hint}</span>
      </span>
    </label>
  );
}
