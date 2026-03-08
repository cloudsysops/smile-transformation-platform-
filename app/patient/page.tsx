import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePatient } from "@/lib/auth";
import { getPatientDashboardData } from "@/lib/dashboard-data";

export default async function PatientDashboardPage() {
  let profile;
  try {
    const ctx = await requirePatient();
    profile = ctx.profile;
  } catch {
    redirect("/login?next=/patient");
  }
  const email = profile.email ?? "";
  const data = await getPatientDashboardData(email);
  const leads = data.leads as { id: string; first_name: string; last_name: string; email: string; status: string; package_slug: string | null; created_at: string }[];
  const bookings = data.bookings as { id: string; lead_id: string; status: string; total_price_usd: number | null; deposit_paid: boolean; start_date: string | null; end_date: string | null }[];
  const consultations = data.consultations as { id: string; lead_id: string; status: string; requested_at: string | null; scheduled_at: string | null }[];
  const payments = data.payments as { id: string; lead_id: string; status: string; amount_cents: number | null; created_at: string }[];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/patient" className="text-sm font-medium text-zinc-900 underline">
              My journey
            </Link>
            <Link href="/assessment" className="text-sm text-zinc-600 hover:underline">
              New assessment
            </Link>
          </nav>
          <h1 className="text-xl font-semibold">Patient dashboard</h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h2 className="mb-6 text-2xl font-semibold">Your submissions and status</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">Assessments</p>
            <p className="mt-1 text-2xl font-semibold">{leads.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">Bookings</p>
            <p className="mt-1 text-2xl font-semibold">{bookings.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">Consultations</p>
            <p className="mt-1 text-2xl font-semibold">{consultations.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">Payments</p>
            <p className="mt-1 text-2xl font-semibold">{payments.length}</p>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="mb-2 text-lg font-medium">Your assessments</h3>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            {leads.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500">
                No submissions yet.{" "}
                <Link href="/assessment" className="text-emerald-600 hover:underline">
                  Start free assessment
                </Link>
              </p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Package</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-zinc-100">
                      <td className="px-4 py-3">{l.first_name} {l.last_name}</td>
                      <td className="px-4 py-3">{l.status}</td>
                      <td className="px-4 py-3">{l.package_slug ?? "—"}</td>
                      <td className="px-4 py-3 text-zinc-600">{new Date(l.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {(bookings.length > 0 || payments.length > 0) && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {bookings.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-medium">Booking status</h3>
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Deposit</th>
                        <th className="px-4 py-3 font-medium">Dates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-zinc-100">
                          <td className="px-4 py-3">{b.status}</td>
                          <td className="px-4 py-3">{b.deposit_paid ? "Paid" : "—"}</td>
                          <td className="px-4 py-3 text-zinc-600">
                            {b.start_date && b.end_date
                              ? `${new Date(b.start_date).toLocaleDateString()} – ${new Date(b.end_date).toLocaleDateString()}`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {payments.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-medium">Payment status</h3>
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-zinc-100">
                          <td className="px-4 py-3">{p.status}</td>
                          <td className="px-4 py-3">{p.amount_cents != null ? `$${(p.amount_cents / 100).toFixed(2)}` : "—"}</td>
                          <td className="px-4 py-3 text-zinc-600">{new Date(p.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
