import { redirect } from "next/navigation";
import Link from "next/link";
import { requireProviderManager } from "@/lib/auth";
import { getProviderDashboardData } from "@/lib/dashboard-data";

export default async function ProviderDashboardPage() {
  let profile;
  try {
    const ctx = await requireProviderManager();
    profile = ctx.profile;
  } catch {
    redirect("/login?next=/provider");
  }
  const providerId = profile.provider_id;
  if (!providerId) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <header className="border-b border-zinc-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <nav className="flex items-center gap-3">
              <Link href="/provider" className="text-sm font-medium text-zinc-900 underline">
                Provider
              </Link>
            </nav>
            <h1 className="text-xl font-semibold">Provider dashboard</h1>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-8">
          <p className="text-zinc-600">Your account is not linked to a provider. Contact an admin.</p>
        </main>
      </div>
    );
  }
  const data = await getProviderDashboardData(providerId);
  const provider = data.provider as { id: string; name: string; city: string; approval_status: string; published: boolean } | null;
  const packages = data.packages as { id: string; slug: string; name: string; published: boolean }[];
  const specialists = data.specialists as { id: string; name: string; specialty: string; approval_status: string; published: boolean }[];
  const experiences = data.experiences as { id: string; name: string; city: string; published: boolean }[];
  const bookings = data.bookings as { id: string; status: string; lead_id: string; package_id: string }[];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/provider" className="text-sm font-medium text-zinc-900 underline">
              Overview
            </Link>
          </nav>
          <h1 className="text-xl font-semibold">Provider dashboard</h1>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h2 className="mb-6 text-2xl font-semibold">
          {provider?.name ?? "Provider"} {provider?.city ? ` · ${provider.city}` : ""}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">Packages</p>
            <p className="mt-1 text-2xl font-semibold">{packages.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">Specialists</p>
            <p className="mt-1 text-2xl font-semibold">{specialists.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">Experiences</p>
            <p className="mt-1 text-2xl font-semibold">{experiences.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">Recent bookings</p>
            <p className="mt-1 text-2xl font-semibold">{bookings.length}</p>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="mb-2 text-lg font-medium">Recent bookings</h3>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            {bookings.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500">No bookings yet.</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Lead ID</th>
                    <th className="px-4 py-3 font-medium">Package ID</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 10).map((b) => (
                    <tr key={b.id} className="border-b border-zinc-100">
                      <td className="px-4 py-3">{b.status}</td>
                      <td className="px-4 py-3 font-mono text-xs">{b.lead_id.slice(0, 8)}…</td>
                      <td className="px-4 py-3 font-mono text-xs">{b.package_id.slice(0, 8)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
