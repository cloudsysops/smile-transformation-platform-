import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getBookings } from "@/lib/bookings";

export default async function AdminBookingsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login?next=/admin/bookings");
  }
  const bookings = await getBookings();

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
            <Link href="/admin/bookings" className="text-sm font-medium text-zinc-900 underline">
              Bookings
            </Link>
            <Link href="/admin/consultations" className="text-sm text-zinc-600 hover:underline">
              Consultations
            </Link>
            <Link href="/admin/assets" className="text-sm text-zinc-600 hover:underline">
              Assets
            </Link>
          </nav>
          <h1 className="text-xl font-semibold">Admin — Bookings</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        {bookings.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-white p-8 text-zinc-500">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 font-semibold">Lead ID</th>
                  <th className="px-4 py-3 font-semibold">Package ID</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Deposit</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">{b.lead_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">{b.package_id.slice(0, 8)}…</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          b.status === "completed"
                            ? "text-emerald-600"
                            : b.status === "cancelled"
                              ? "text-red-600"
                              : "text-zinc-600"
                        }
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{b.deposit_paid ? "Paid" : "—"}</td>
                    <td className="px-4 py-3 text-zinc-500">{new Date(b.created_at).toLocaleDateString()}</td>
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
