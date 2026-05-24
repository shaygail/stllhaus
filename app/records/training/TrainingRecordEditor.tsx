"use client";

import type { StaffTrainingDocument } from "@/lib/training-records";
import {
  TRAINING_TOPICS,
  serializeStaffTrainingDocument,
} from "@/lib/training-records";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  logId: string;
  document: StaffTrainingDocument;
};

function newRowId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function TrainingRecordEditor({ logId, document }: Props) {
  const router = useRouter();
  const [doc, setDoc] = useState(document);
  const [topic, setTopic] = useState<string>(TRAINING_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [staffName, setStaffName] = useState(document.profile.employeeName);
  const [trainerInitials, setTrainerInitials] = useState("");
  const [trainingDate, setTrainingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function saveDocument(nextDoc: StaffTrainingDocument) {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch(`/api/business-logs/${logId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: serializeStaffTrainingDocument(nextDoc) }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Unable to save training record");
      setDoc(nextDoc);
      setStatus("saved");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to save training record");
    }
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    await saveDocument(doc);
  }

  return (
    <div className="space-y-10 print:hidden">
      <form onSubmit={onSaveProfile} className="bg-white border border-stll-charcoal/10 p-6 space-y-4">
        <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold">
          Staff details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Staff name</span>
            <input
              type="text"
              value={doc.profile.employeeName}
              onChange={(e) =>
                setDoc((prev) => ({ ...prev, profile: { ...prev.profile, employeeName: e.target.value } }))
              }
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Position*</span>
            <input
              type="text"
              value={doc.profile.position}
              onChange={(e) =>
                setDoc((prev) => ({ ...prev, profile: { ...prev.profile, position: e.target.value } }))
              }
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Start date*</span>
            <input
              type="date"
              value={doc.profile.startDate}
              onChange={(e) =>
                setDoc((prev) => ({ ...prev, profile: { ...prev.profile, startDate: e.target.value } }))
              }
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Email*</span>
            <input
              type="email"
              value={doc.profile.email}
              onChange={(e) =>
                setDoc((prev) => ({ ...prev, profile: { ...prev.profile, email: e.target.value } }))
              }
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Phone number*</span>
            <input
              type="tel"
              value={doc.profile.phoneNumber}
              onChange={(e) =>
                setDoc((prev) => ({ ...prev, profile: { ...prev.profile, phoneNumber: e.target.value } }))
              }
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="px-6 py-2.5 text-[11px] tracking-[0.2em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Save Staff Details"}
        </button>
      </form>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const resolvedTopic = topic === "Other" ? customTopic.trim() : topic;
          if (!resolvedTopic) {
            setStatus("error");
            setError("Topic is required.");
            return;
          }
          const nextDoc: StaffTrainingDocument = {
            ...doc,
            sessions: [
              ...doc.sessions,
              {
                id: newRowId(),
                topic: resolvedTopic,
                staffName: staffName.trim() || doc.profile.employeeName,
                trainerInitials: trainerInitials.trim(),
                date: trainingDate,
              },
            ],
          };
          await saveDocument(nextDoc);
          setTrainerInitials("");
        }}
        className="bg-white border border-stll-charcoal/10 p-6 space-y-4"
      >
        <h2 className="text-xs tracking-[0.3em] uppercase text-stll-charcoal font-semibold">
          Add training session
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block sm:col-span-2">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">
              Topic (part of the plan covered)
            </span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
            >
              {TRAINING_TOPICS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="Other">Other (custom topic)</option>
            </select>
          </label>
          {topic === "Other" && (
            <label className="block sm:col-span-2">
              <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Custom topic</span>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
              />
            </label>
          )}
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Staff&apos;s name</span>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Trainer initials</span>
            <input
              type="text"
              value={trainerInitials}
              onChange={(e) => setTrainerInitials(e.target.value)}
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
              placeholder="e.g. SG"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase text-stll-muted mb-2">Date</span>
            <input
              type="date"
              value={trainingDate}
              onChange={(e) => setTrainingDate(e.target.value)}
              className="w-full border border-stll-charcoal/20 bg-white px-3 py-3 text-sm"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="px-6 py-2.5 text-[11px] tracking-[0.2em] uppercase border bg-stll-charcoal border-stll-charcoal text-white disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Add Session Row"}
        </button>
      </form>

      {status === "saved" && <p className="text-sm text-stll-charcoal">Saved.</p>}
      {status === "error" && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
