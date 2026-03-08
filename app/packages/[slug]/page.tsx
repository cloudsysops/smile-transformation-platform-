import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPackageBySlug } from "@/lib/packages";
import { getProviderById } from "@/lib/providers";

type Props = { params: Promise<{ slug: string }> };

function formatMoney(cents: number | null): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPublishedPackageBySlug(slug);
  if (!pkg) return { title: "Package | Smile Transformation" };
  return {
    title: `${pkg.name} | Smile Transformation`,
    description: pkg.description ?? undefined,
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPublishedPackageBySlug(slug);
  if (!pkg) notFound();

  const provider = pkg.provider_id ? await getProviderById(pkg.provider_id) : null;
  const cityLabel = pkg.recovery_city
    ? `${pkg.location} → ${pkg.recovery_city}`
    : pkg.location;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
          >
            ← All packages
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <article>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {provider && (
              <span className="text-sm font-medium text-zinc-500">{provider.name}</span>
            )}
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400 capitalize">
              {pkg.type ?? "health"}
            </span>
            {pkg.badge && (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                {pkg.badge}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{pkg.name}</h1>
          <p className="mt-2 text-zinc-400">{cityLabel}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {pkg.duration_days != null && (
              <span className="font-medium text-zinc-300">{pkg.duration_days} days</span>
            )}
            {(pkg.price_cents != null && pkg.price_cents > 0) && (
              <span className="font-semibold text-white">From {formatMoney(pkg.price_cents)}</span>
            )}
            {pkg.deposit_cents != null && (
              <span className="text-emerald-400">Deposit {formatMoney(pkg.deposit_cents)}</span>
            )}
          </div>
          {pkg.description && (
            <div className="mt-6 prose prose-invert max-w-none">
              <p className="text-zinc-300">{pkg.description}</p>
            </div>
          )}
          {Array.isArray(pkg.included) && pkg.included.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold text-white">What&apos;s included</h2>
              <ul className="mt-2 space-y-2 text-zinc-300">
                {pkg.included.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-500" aria-hidden>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {pkg.itinerary_outline && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold text-white">Itinerary outline</h2>
              <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">
                {pkg.itinerary_outline}
              </div>
            </section>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/assessment?package=${encodeURIComponent(pkg.slug)}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-zinc-900 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              Start Assessment
            </Link>
            <Link
              href="/packages"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-zinc-600 px-6 py-3 text-base font-semibold text-white transition hover:border-zinc-500 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              Browse all packages
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
