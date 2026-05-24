"use client";

import {
  createEmptyTrainingDocument,
  employeeTrainingTitle,
  serializeStaffTrainingDocument,
  slugifyEmployeeKey,
} from "@/lib/training-records";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewTrainingRecordForm() {
  const router = useRouter();
  const [employeeName, setEmployeeName] = useState("");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [enteredBy, setEnteredBy] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    if (!employeeName.trim() || !enteredBy.trim()) {
      setStatus("error");
      setError("Staff name and entered-by are required.");
      return;
    }

    const doc = createEmptyTrainingDocument(employeeName);
    doc.profile.position = position.trim();
    doc.profile.startDate = startDate;
    doc.profile.email = email.trim();
    doc.profile.phoneNumber = phoneNumber.trim();

    try {
      const res = await fetch("/api/business-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log_type: "compliance",
          title: employeeTrainingTitle(employeeName),
          details: serializeStaffTrainingDocument(doc),
          entered_by: enteredBy.trim(),
          logged_at: new Date().toISOString(),
          amount: null,
          reference_id: slugifyEmployeeKey(employeeName),
          attachments: null,
          tags: ["training_record"],
        }),
      });

      const data = (await res.json()) as { error?: string; log?: { id?: string } };
      if (!res.ok) throw new Error(data.error || "Unable to create training record");

      router.push(`/records/training/${data.log?.id ?? ""}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to create training record");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="text-sm text-stll-muted leading-relaxed">
        Create one record per staff member. You can add training sessions to the table after saving.
      </p>

      <label className="block">
        <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Staff name</span>
        <input
          type="text"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
          placeholder="Full name"
          required
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Position*</span>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Start date*</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Email*</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Phone number*</span>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
          />
        </label>
      </div>

      <p className="text-xs text-stll-muted italic">
        Fields marked * are optional but useful for council records.
      </p>

      <label className="block">
        <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Entered by</span>
        <input
          type="text"
          value={enteredBy}
          onChange={(e) => setEnteredBy(e.target.value)}
          className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm text-stll-charcoal focus:outline-none focus:border-stll-charcoal/40"
          placeholder="Supervisor or manager name"
          required
        />
      </label>

      <button
        type="submit"
        disabled={status === "saving"}
        className="px-8 py-3 text-[11px] tracking-[0.3em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50"
      >
        {status === "saving" ? "Creating..." : "Create Training Record"}
      </button>

      {status === "error" && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}