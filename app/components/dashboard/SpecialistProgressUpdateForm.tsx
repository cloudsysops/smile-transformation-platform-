"use client";

import { useState } from "react";
import { TREATMENT_STAGES } from "@/lib/clinical/stages";

type Props = Readonly<{
  leadId: string;
  onSuccess?: () => void;
}>;

export default function SpecialistProgressUpdateForm({ leadId, onSuccess }: Props) {
  const [stageKey, setStageKey] = useState<string>(TREATMENT_STAGES[0].key);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/clinical/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          stage_key: stageKey,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }
      setNotes("");
      onSuccess?.();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Add progress update
      </h3>
      <p className="mt-1 text-sm text-zinc-600">Stage and notes for this case</p>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="stage_key" className="block text-sm font-medium text-zinc-700">
            Stage
          </label>
          <select
            id="stage_key"
            value={stageKey}
            onChange={(e) => setStageKey(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            required
          >
            {TREATMENT_STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-zinc-700">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Brief note for the patient..."
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save progress"}
        </button>
      </div>
    </form>
  );
}
