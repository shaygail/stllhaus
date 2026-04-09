"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditLoggedDateForm({ id, initialDate }: { id: string; initialDate: string }) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError("");
    try {
      const res = await fetch(`/api/business-logs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logged_at: new Date(date).toISOString() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not update date.");
      setState("saved");
      router.refresh();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not update date.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Edit date entered</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-stll-charcoal/20 bg-white px-3 py-2 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
          required
        />
      </label>
      <button
        type="submit"
        disabled={state === "saving"}
        className="px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50"
      >
        {state === "saving" ? "Saving..." : "Update Date"}
      </button>
      {state === "saved" && <p className="text-sm text-stll-charcoal">Date updated.</p>}
      {state === "error" && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
