import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPackageBySlug } from "@/lib/packages";
import { getPublishedAssets } from "@/lib/assets";
import {
  FloatingWhatsAppButton,
  MobileStickyCtaBar,
  buildWhatsAppHref,
} from "@/app/_components/ConversionCtas";

type Props = { params: Promise<{ slug: string }> };

function packageHighlights(slug: string, location: string) {
  if (slug === "smile-manizales" || location === "Manizales") {
    return {
      accommodation: "Private finca-style recovery lodging",
      tourism: "Scenic coffee-region routes and calm nature surroundings",
      conversionNotes: [
        "Ideal for guests who want a quieter recovery setting",
        "Family-run hospitality and concierge-style guidance",
      ],
    };
  }

  return {
    accommodation: "Premium city lodging with close logistics access",
    tourism: "Optional Medellín + Guatapé companion experiences",
    conversionNotes: [
      "Great for guests who prefer city access and convenience",
      "Family-run team with premium transport coordination",
    ],
  };
}

export default async function PackagePage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getPublishedPackageBySlug(slug);
  if (!pkg) notFound();

  const locationFilter =
    pkg.location === "Medellín"
      ? "Medellín"
      : pkg.location === "Manizales"
        ? "Manizales"
        : undefined;

  const categories =
    slug === "smile-manizales" ? ["finca", "lodging", "tour"] : ["clinic", "lodging", "tour"];

  const packageAssets = await getPublishedAssets({
    location: locationFilter,
    limit: 8,
  });

  const filteredAssets =
    packageAssets?.filter(
      (a) => a.category && categories.includes(a.category),
    ) ?? [];

  const depositFormatted =
    pkg.deposit_cents != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
          pkg.deposit_cents / 100,
        )
      : null;
  const included = pkg.included ?? [];
  const highlights = packageHighlights(pkg.slug, pkg.location);
  const assessmentHref = `/assessment?package=${encodeURIComponent(pkg.slug)}`;
  const whatsappMessage = `Hello, I would like guidance on the ${pkg.name} package.`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 hover:underline">
            ← Smile Transformation
          </Link>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{pkg.name}</h1>
              <p className="mt-1 text-sm text-zinc-300">{pkg.location}</p>
            </div>
            <Link
              href={assessmentHref}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              Start Free Assessment
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
        <section className="mb-8 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Premium coordination package
          </p>
          {pkg.description && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-200 sm:text-base">{pkg.description}</p>
          )}
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Duration</p>
              <p className="mt-1 font-medium text-zinc-100">
                {pkg.duration_days != null ? `${pkg.duration_days} days` : "Personalized"}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Deposit</p>
              <p className="mt-1 font-medium text-zinc-100">{depositFormatted ?? "Contact team"}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Accommodation</p>
              <p className="mt-1 text-zinc-100">{highlights.accommodation}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Tourism experience</p>
              <p className="mt-1 text-zinc-100">{highlights.tourism}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={assessmentHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              Start Free Assessment
            </Link>
            <Link
              href="/#packages"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-700 px-6 text-sm font-semibold text-zinc-100 hover:border-zinc-500"
            >
              View Packages
            </Link>
            <a
              href={buildWhatsAppHref(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>

        {pkg.description && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold">Why choose this package</h2>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              {highlights.conversionNotes.map((note) => (
                <li key={note} className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 text-emerald-300">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {filteredAssets.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold">Gallery</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {filteredAssets.slice(0, 6).map((asset) =>
                asset.url ? (
                  <li
                    key={asset.id}
                    className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.alt_text ?? asset.title ?? "Package image"}
                      className="h-40 w-full object-cover"
                    />
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        )}

        <section className="mb-8 flex flex-wrap gap-6 text-sm">
          {pkg.duration_days != null && (
            <div>
              <span className="font-medium text-zinc-500">Duration</span>
              <p className="mt-1">{pkg.duration_days} days</p>
            </div>
          )}
          {depositFormatted && (
            <div>
              <span className="font-medium text-zinc-500">Deposit</span>
              <p className="mt-1">{depositFormatted}</p>
            </div>
          )}
        </section>

        {included.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold">Included</h2>
            <ul className="mt-2 list-inside list-disc text-zinc-300">
              {included.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {pkg.itinerary_outline && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold">Itinerary outline (non-medical)</h2>
            <p className="mt-2 whitespace-pre-line text-zinc-300">{pkg.itinerary_outline}</p>
          </section>
        )}

        <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <div className="mt-3 space-y-3 text-sm text-zinc-300">
            <details className="rounded-lg border border-zinc-800 p-3">
              <summary className="cursor-pointer font-medium text-zinc-100">How does deposit work?</summary>
              <p className="mt-2">
                After your assessment is reviewed, admin shares a secure Stripe deposit link to reserve coordination.
              </p>
            </details>
            <details className="rounded-lg border border-zinc-800 p-3">
              <summary className="cursor-pointer font-medium text-zinc-100">Are flights included?</summary>
              <p className="mt-2">Flights are typically separate. We help coordinate timing and local transfers.</p>
            </details>
            <details className="rounded-lg border border-zinc-800 p-3">
              <summary className="cursor-pointer font-medium text-zinc-100">What does the company coordinate?</summary>
              <p className="mt-2">
                USA LLC coordinates hospitality and clinic access logistics only. Medical services are billed separately by clinics in Colombia.
              </p>
            </details>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-400/50 bg-emerald-500/10 p-6 text-center">
          <h2 className="text-lg font-semibold sm:text-xl">Ready to start this package?</h2>
          <p className="mt-2 text-sm text-zinc-200">
            Complete the free assessment and we&apos;ll coordinate your next steps.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={assessmentHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              Start Free Assessment
            </Link>
            <a
              href={buildWhatsAppHref(whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-xs leading-relaxed text-zinc-300 sm:text-sm">
          <p>
            <strong>Legal disclaimer:</strong> Smile Transformation USA LLC provides coordination and
            hospitality services only. Medical care is provided and billed separately by licensed clinics
            in Colombia. No guaranteed outcomes.
          </p>
        </section>
      </main>
      <FloatingWhatsAppButton message={whatsappMessage} />
      <MobileStickyCtaBar
        assessmentHref={assessmentHref}
        packagesHref="/#packages"
        whatsappMessage={whatsappMessage}
      />
    </div>
  );
}

