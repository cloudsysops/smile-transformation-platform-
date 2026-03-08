"use client";

import Link from "next/link";

type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
};

type Props = { initialLeads: Lead[] };

export default function AdminLeadsList({ initialLeads }: Props) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialLeads.map((lead) => (
            <tr key={lead.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="font-medium text-zinc-900 hover:text-emerald-600 hover:underline dark:text-zinc-100"
                >
                  {lead.first_name} {lead.last_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{lead.email}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                  {lead.status}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                {new Date(lead.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="text-sm font-medium text-emerald-600 hover:underline"
                >
                  View details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {initialLeads.length === 0 && (
        <p className="p-8 text-center text-zinc-500">No leads yet.</p>
      )}
    </div>
  );
}
