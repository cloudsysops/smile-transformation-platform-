import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllSpecialists } from "@/lib/specialists";

export default async function AdminSpecialistsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login?next=/admin/specialists");
  }
  const specialists = await getAllSpecialists();

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
            <Link href="/admin/specialists" className="text-sm font-medium text-zinc-900 underline">
              Specialists
            </Link>
            <Link href="/admin/experiences" className="text-sm text-zinc-600 hover:underline">
              Experiences
            </Link>
            <Link href="/admin/bookings" className="text-sm text-zinc-600 hover:underline">
              Bookings
            </Link>
            <Link href="/admin/consultations" className="text-sm text-zinc-600 hover:underline">
              Consultations
            </Link>
            <Link href="/admin/assets" className="text-sm text-zinc-600 hover:underline">
              Assets
            </Link>
          </nav>
          <h1 className="text-xl font-semibold">Admin — Specialists</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <p className="mb-4 text-sm text-zinc-500">
          Only published + approved specialists appear on the public site.
        </p>
        {specialists.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-white p-8 text-zinc-500">No specialists yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Specialty</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Published</th>
                </tr>
              </thead>
              <tbody>
                {specialists.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-100">
                    <td className="px-4 py-3 font-medium text-zinc-900">{s.name}</td>
                    <td className="px-4 py-3 text-zinc-600">{s.specialty}</td>
                    <td className="px-4 py-3 text-zinc-600">{s.city}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          s.approval_status === "approved"
                            ? "text-emerald-600"
                            : s.approval_status === "rejected" || s.approval_status === "suspended"
                              ? "text-red-600"
                              : "text-amber-600"
                        }
                      >
                        {s.approval_status ?? "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{s.published ? "Yes" : "No"}</td>
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
