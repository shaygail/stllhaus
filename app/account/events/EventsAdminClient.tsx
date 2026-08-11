"use client";

import type { MarketEventInput } from "@/lib/market-events";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AdminEvent = MarketEventInput & {
  slug?: string;
  dateLabel?: string;
  startDate?: string;
  endDate?: string | null;
};

const emptyForm: MarketEventInput = {
  name: "",
  date: "",
  startTime: "08:00",
  endTime: "13:00",
  location: "",
  description: "",
  imagePath: "/ube.jpg",
  imageAlt: "STLL HAUS ube matcha drink, New Plymouth",
  published: true,
};

const IMAGE_OPTIONS = [
  { path: "/ube.jpg", alt: "STLL HAUS ube matcha drink, New Plymouth" },
  { path: "/head-webpage.jpg", alt: "STLL HAUS matcha and coffee bar at a local market, Taranaki" },
  { path: "/part2.jpg", alt: "STLL HAUS cloud collection drinks, New Plymouth" },
  { path: "/niyo photo.png", alt: "STLL HAUS handcrafted matcha drink, New Plymouth" },
];

export function EventsAdminClient() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [form, setForm] = useState<MarketEventInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      const data = (await res.json()) as { events?: AdminEvent[]; error?: string };
      if (res.status === 401) {
        setError("You do not have admin access. Sign in with the team admin account on the login page.");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not load events.");
        return;
      }
      setEvents(data.events ?? []);
    } catch {
      setError("Could not load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  function startNewEvent() {
    setForm(emptyForm);
    setSuccess(null);
    setError(null);
  }

  function startEditEvent(event: AdminEvent) {
    setForm({
      id: event.id,
      name: event.name,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime ?? "",
      location: event.location,
      description: event.description,
      imagePath: event.imagePath ?? "",
      imageAlt: event.imageAlt ?? "",
      published: event.published,
    });
    setSuccess(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: form }),
      });
      const data = (await res.json()) as { saved?: boolean; error?: string; detail?: string };
      if (res.status === 401) {
        setError("You do not have admin access.");
        return;
      }
      if (res.status === 503) {
        setError(data.detail ?? "Supabase is not configured. Run supabase/market_events.sql.");
        return;
      }
      if (!res.ok) {
        setError(data.detail ?? data.error ?? "Could not save event.");
        return;
      }
      setSuccess(form.id ? "Event updated." : "Event created.");
      setForm(emptyForm);
      await loadEvents();
    } catch {
      setError("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(id: string) {
    if (!window.confirm("Delete this event? It will be removed from the public Events page.")) return;
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not delete event.");
        return;
      }
      setSuccess("Event deleted.");
      if (form.id === id) setForm(emptyForm);
      await loadEvents();
    } catch {
      setError("Delete failed. Try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-[70vh] px-6 sm:px-12 lg:px-20 py-24 max-w-3xl mx-auto">
      <p className="text-[10px] tracking-[0.35em] uppercase text-stll-muted mb-4">Admin</p>
      <h1 className="text-3xl font-black uppercase tracking-tight text-stll-charcoal mb-2">
        Manage events
      </h1>
      <p className="text-sm text-stll-muted leading-relaxed mb-6">
        Add markets and pop-ups for the public Events page. Changes appear within about a minute.
      </p>
      <p className="text-sm text-stll-muted leading-relaxed mb-10">
        <Link href="/account" className="underline underline-offset-2 hover:text-stll-charcoal">
          ← Back to account
        </Link>
        {" · "}
        <Link href="/events" className="underline underline-offset-2 hover:text-stll-charcoal">
          View public page
        </Link>
        {" · "}
        <Link href="/admin/ordering" className="underline underline-offset-2 hover:text-stll-charcoal">
          Ordering hours
        </Link>
      </p>

      <form onSubmit={(e) => void saveEvent(e)} className="border border-stll-charcoal/15 bg-white/60 p-6 mb-10 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[10px] tracking-[0.25em] uppercase text-stll-muted">
            {form.id ? "Edit event" : "New event"}
          </h2>
          {form.id && (
            <button
              type="button"
              onClick={startNewEvent}
              className="text-[10px] tracking-[0.2em] uppercase text-stll-muted hover:text-stll-charcoal"
            >
              Cancel edit
            </button>
          )}
        </div>

        <Field label="Event name">
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Stratford Market"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Start time">
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
              required
              className={inputClass}
            />
          </Field>
          <Field label="End time">
            <input
              type="time"
              value={form.endTime ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            required
            placeholder="Stratford, Taranaki"
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            required
            rows={4}
            placeholder="Short description for the event card…"
            className={`${inputClass} resize-y min-h-24`}
          />
        </Field>

        <Field label="Image">
          <select
            value={form.imagePath ?? ""}
            onChange={(e) => {
              const selected = IMAGE_OPTIONS.find((option) => option.path === e.target.value);
              setForm((prev) => ({
                ...prev,
                imagePath: e.target.value,
                imageAlt: selected?.alt ?? prev.imageAlt,
              }));
            }}
            className={inputClass}
          >
            <option value="">No image</option>
            {IMAGE_OPTIONS.map((option) => (
              <option key={option.path} value={option.path}>
                {option.path}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Image alt text">
          <input
            value={form.imageAlt ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, imageAlt: e.target.value }))}
            placeholder="STLL HAUS ube matcha drink, New Plymouth"
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-3 text-sm text-stll-charcoal">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
            className="h-4 w-4 accent-stll-charcoal"
          />
          Published on the Events page
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase border border-stll-charcoal bg-stll-charcoal text-white hover:bg-stll-charcoal/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : form.id ? "Update event" : "Create event"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-4 text-sm text-stll-charcoal">{success}</p>}

      <section className="border border-stll-charcoal/15 bg-white/60 p-6">
        <h2 className="text-[10px] tracking-[0.25em] uppercase text-stll-muted mb-4">
          All events
        </h2>
        {loading ? (
          <p className="text-sm text-stll-muted">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-stll-muted leading-relaxed">
            No events yet. Create one above, or run <code className="text-xs">supabase/market_events.sql</code> to
            seed the database.
          </p>
        ) : (
          <ul className="divide-y divide-stll-charcoal/10">
            {events.map((event) => (
              <li key={event.id} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stll-charcoal">{event.name}</p>
                  <p className="text-xs text-stll-muted mt-1">
                    {event.dateLabel ?? event.date} · {event.location}
                  </p>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-stll-muted/70 mt-2">
                    {event.published ? "Published" : "Draft"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEditEvent(event)}
                    className="text-[10px] tracking-[0.2em] uppercase text-stll-charcoal border border-stll-charcoal/20 px-4 py-2 hover:bg-stll-charcoal/5"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => event.id && void removeEvent(event.id)}
                    disabled={deletingId === event.id}
                    className="text-[10px] tracking-[0.2em] uppercase text-red-700 border border-red-200 px-4 py-2 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === event.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full px-4 py-3 text-sm border border-stll-charcoal/20 bg-white text-stll-charcoal placeholder:text-stll-muted/60 focus:outline-none focus:border-stll-charcoal/40";
