"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
  last_contacted_at?: string | null;
  next_follow_up_at?: string | null;
  recommended_package_slug?: string | null;
};

type Props = Readonly<{
  initialLeads: Lead[];
  nowIso: string;
}>;

type LeadWithPriority = Lead & {
  priority: "overdue" | "due_soon" | "unplanned" | "normal";
  priorityScore: number;
};

const ACTIVE_STATUSES = new Set(["new", "contacted", "qualified"]);
const DAY_MS = 24 * 60 * 60 * 1000;

function resolvePriority(lead: Lead, now: number): LeadWithPriority["priority"] {
  const isActive = ACTIVE_STATUSES.has(lead.status);
  if (!isActive) return "normal";

  if (lead.next_follow_up_at) {
    const dueAt = new Date(lead.next_follow_up_at).getTime();
    if (!Number.isNaN(dueAt)) {
      if (dueAt < now) return "overdue";
      if (dueAt - now <= DAY_MS) return "due_soon";
      return "normal";
    }
  }
  return "unplanned";
}

function priorityScore(priority: LeadWithPriority["priority"]): number {
  switch (priority) {
    case "overdue":
      return 3;
    case "due_soon":
      return 2;
    case "unplanned":
      return 1;
    case "normal":
    default:
      return 0;
  }
}

function badgeClass(priority: LeadWithPriority["priority"]): string {
  switch (priority) {
    case "overdue":
      return "bg-red-100 text-red-700";
    case "due_soon":
      return "bg-amber-100 text-amber-800";
    case "unplanned":
      return "bg-zinc-200 text-zinc-700";
    case "normal":
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

function badgeLabel(priority: LeadWithPriority["priority"]): string {
  switch (priority) {
    case "overdue":
      return "Overdue";
    case "due_soon":
      return "Due soon";
    case "unplanned":
      return "Unplanned";
    case "normal":
    default:
      return "On track";
  }
}

/** Operator-friendly next action: recommend package vs collect deposit */
function nextActionLabel(lead: Lead): string {
  if (lead.status === "deposit_paid") return "—";
  const hasRecommendation = (lead.recommended_package_slug ?? "").trim() !== "";
  if (hasRecommendation) return "Ready to collect deposit";
  return "Ready to recommend package";
}

export default function AdminLeadsList({ initialLeads, nowIso }: Props) {
  const [showActionQueueOnly, setShowActionQueueOnly] = useState(false);
  const now = Number.isNaN(Date.parse(nowIso)) ? 0 : Date.parse(nowIso);

  const prioritizedLeads = useMemo<LeadWithPriority[]>(() => {
    const withPriority = initialLeads.map((lead) => {
      const priority = resolvePriority(lead, now);
      return {
        ...lead,
        priority,
        priorityScore: priorityScore(priority),
      };
    });

    withPriority.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return withPriority;
  }, [initialLeads, now]);

  const visibleLeads = useMemo(
    () =>
      showActionQueueOnly
        ? prioritizedLeads.filter((lead) => lead.priority !== "normal")
        : prioritizedLeads,
    [prioritizedLeads, showActionQueueOnly],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600">
          {visibleLeads.length} lead{visibleLeads.length === 1 ? "" : "s"}
          {showActionQueueOnly ? " in action queue" : " total"}
        </p>
        <button
          type="button"
          onClick={() => setShowActionQueueOnly((current) => !current)}
          className="rounded border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          {showActionQueueOnly ? "Show all" : "Show action queue"}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Name</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Email</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Priority</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Status</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Next action</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Next follow-up</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">Created</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {visibleLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-zinc-100">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-zinc-900">
                      {lead.first_name} {lead.last_name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{lead.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(lead.priority)}`}>
                    {badgeLabel(lead.priority)}
                  </span>
                </td>
                <td className="px-4 py-3">{lead.status}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-zinc-700">{nextActionLabel(lead)}</span>
                </td>
                <td className="px-4 py-3">
                  {lead.next_follow_up_at
                    ? new Date(lead.next_follow_up_at).toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {lead.last_contacted_at
                    ? new Date(lead.last_contacted_at).toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleLeads.length === 0 && (
          <p className="p-8 text-center text-zinc-500">No leads yet. New assessments will appear here.</p>
        )}
      </div>
    </div>
  );
}
