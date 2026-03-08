"use client";

import { useState } from "react";

const DEFAULT_CENTS = 50000; // $500

type Props = { leadId: string; leadStatus?: string };

export default function DepositButton({ leadId, leadStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const isPaid = leadStatus === "deposit_paid";

  async function handleClick() {
    setLoading(true);
    try {
      const origin = window.location.origin;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          amount_cents: DEFAULT_CENTS,
          success_url: `${origin}/admin/leads/${leadId}?paid=1`,
          cancel_url: `${origin}/admin/leads/${leadId}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  if (isPaid) {
    return (
      <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
        Deposit paid
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Redirecting..." : "Collect deposit"}
    </button>
  );
}
