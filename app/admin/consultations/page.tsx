import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getConsultations } from "@/lib/consultations";

export default async function AdminConsultationsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login?next=/admin/consultations");
  }
  const consultations = await getConsultations();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/admin/overview" className="text-sm text-zinc-600 hover:underline">
              Overview
            </Link>
            <Link href="/admin/leads" className="text-sm text-zinc-600 hover:underline">
              Leads
            </Link>
            <Link href="/admin/providers" className="text-sm text-zinc-600 hover:underline">
              Providers
            </Link>
            <Link href="/admin/specialists" className="text-sm text-zinc-600 hover:underline">
              Specialists
            </Link>
            <Link href="/admin/experiences" className="text-sm text-zinc-600 hover:underline">
              Experiences
            </Link>
            <Link href="/admin/bookings" className="text-sm text-zinc-600 hover:underline">
              Bookings
            </Link>
            <Link href="/admin/consultations" className="text-sm font-medium text-zinc-900 underline">
              Consultations
            </Link>
            <Link href="/admin/assets" className="text-sm text-zinc-600 hover:underline">
              Assets
            </Link>
          </nav>
          <h1 className="text-xl font-semibold">Admin — Consultations</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        {consultations.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-white p-8 text-zinc-500">No consultations yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 font-semibold">Lead ID</th>
                  <th className="px-4 py-3 font-semibold">Specialist ID</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Scheduled</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">{c.lead_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">{c.specialist_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-zinc-600">{c.status}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {c.scheduled_at
                        ? new Date(c.scheduled_at).toLocaleString()
                        : c.scheduled_date
                          ? `${c.scheduled_date} ${c.scheduled_time ?? ""}`.trim()
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
