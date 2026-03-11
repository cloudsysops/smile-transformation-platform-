"use client";

import { useState } from "react";
import type { LeadCopilotOutput } from "@/lib/ai/schemas";

type Props = Readonly<{
  leadId: string;
  leadPhone?: string | null;
  leadFirstName?: string | null;
}>;

function getPriorityClass(priority: string): string {
  if (priority === "high") return "bg-emerald-100 text-emerald-800";
  if (priority === "medium") return "bg-amber-100 text-amber-800";
  return "bg-zinc-100 text-zinc-700";
}

/** Normalize phone for wa.me: digits only, max 15. */
function phoneDigits(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "").slice(0, 15);
}

export default function LeadCopilotPanel({ leadId, leadPhone }: Props) {
  const [copilot, setCopilot] = useState<LeadCopilotOutput | null>(null);
  const [fromFallback, setFromFallback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) {
        setError(data?.error ?? "Failed to generate");
        return;
      }
      setCopilot(data.copilot ?? null);
      setFromFallback(!!data.from_fallback);
    } catch {
      setLoading(false);
      setError("Request failed");
    }
  }

  function copyToClipboard(text: string, key: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const priorityClass = copilot ? getPriorityClass(copilot.priority) : "";

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-zinc-900">AI Lead Copilot</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Generate a short summary, priority, and copy-paste ready WhatsApp and email drafts. Result is reused until you click Regenerate.
      </p>

      {!copilot && !loading && (
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Generate summary & drafts
        </button>
      )}

      {loading && (
        <p className="mt-4 text-sm text-zinc-500">Generating…</p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {copilot && !loading && (
        <div className="mt-4 space-y-4">
          {fromFallback && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Suggested draft (AI unavailable). You can still copy and edit.
            </p>
          )}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Summary</h3>
            <p className="mt-1 text-sm text-zinc-900">{copilot.summary}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Priority</h3>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass}`}>
              {copilot.priority.toUpperCase()}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Suggested WhatsApp</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(copilot.whatsapp_draft, "whatsapp")}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  {copied === "whatsapp" ? "Copied" : "Copy"}
                </button>
                {leadPhone && phoneDigits(leadPhone).length >= 10 ? (
                  <a
                    href={`https://wa.me/${phoneDigits(leadPhone)}?text=${encodeURIComponent(copilot.whatsapp_draft)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    Open in WhatsApp
                  </a>
                ) : (
                  <span className="text-xs text-zinc-400">Add phone to open in WhatsApp</span>
                )}
              </div>
            </div>
            <div className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800 whitespace-pre-wrap">
              {copilot.whatsapp_draft}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Suggested email</h3>
              <button
                type="button"
                onClick={() => copyToClipboard(copilot.email_draft, "email")}
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                {copied === "email" ? "Copied" : "Copy"}
              </button>
            </div>
            {copilot.email_subject && (
              <p className="mt-1 text-xs text-zinc-500">Subject: {copilot.email_subject}</p>
            )}
            <div className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800 whitespace-pre-wrap">
              {copilot.email_draft}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-700"
          >
            Regenerate
          </button>
        </div>
      )}
    </section>
  );
}
