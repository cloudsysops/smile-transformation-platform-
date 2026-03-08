"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PackageOption = { id: string; slug: string; name: string };

type Props = {
  leadId: string;
  currentRecommendedSlug: string | null;
  packages: PackageOption[];
};

export default function LeadRecommendationForm({
  leadId,
  currentRecommendedSlug,
  packages,
}: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(currentRecommendedSlug ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recommended_package_slug: slug.trim() || null,
      }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="font-semibold">Recommended package (override)</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Orientation only. Final treatment planning belongs to the specialist.
      </p>
      <div className="mt-3 flex gap-2">
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2 text-sm min-w-[200px]"
        >
          <option value="">— None —</option>
          {packages.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Update"}
        </button>
      </div>
    </form>
  );
}
