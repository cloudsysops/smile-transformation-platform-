import Link from "next/link";
import { getPublishedPackages } from "@/lib/packages";
import { getPublishedAssets } from "@/lib/assets";
import {
  FloatingWhatsAppButton,
  MobileStickyCtaBar,
  buildWhatsAppHref,
} from "@/app/_components/ConversionCtas";

function formatDeposit(cents: number | null): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const testimonials = [
  {
    quote:
      "The team coordinated clinic scheduling, airport pickup, and lodging with clear communication from day one.",
    author: "Patient from Texas",
    context: "Medellín coordination",
  },
  {
    quote:
      "Our stay in Manizales felt private and calm. The hospitality support helped my family focus on recovery logistics.",
    author: "Family from Canada",
    context: "Manizales finca recovery",
  },
  {
    quote:
      "Premium and organized experience. We always knew what came next for transport, check-ins, and follow-up steps.",
    author: "Patient from Florida",
    context: "International coordination",
  },
];

const faqs = [
  {
    question: "What is included?",
    answer:
      "We coordinate clinic access, lodging planning, local transport, and concierge-style trip support. Scope depends on the package selected.",
  },
  {
    question: "How long is the stay?",
    answer:
      "Most stays are around one to two weeks depending on package and itinerary planning. Final timing is confirmed after assessment.",
  },
  {
    question: "How does the deposit work?",
    answer:
      "After assessment and admin confirmation, we share a Stripe deposit link to secure coordination and scheduling windows.",
  },
  {
    question: "Are flights included?",
    answer:
      "Flights are typically not included. We can provide guidance for timing and airport coordination.",
  },
  {
    question: "What does the company coordinate?",
    answer:
      "The USA LLC provides international coordination and hospitality logistics. Medical services are handled and billed separately by clinics in Colombia.",
  },
  {
    question: "Is there a legal disclaimer?",
    answer:
      "Yes. We do not provide medical care in the USA entity and we do not guarantee medical outcomes.",
  },
];

function packageHighlights(slug: string, location: string) {
  if (slug === "smile-manizales" || location === "Manizales") {
    return {
      accommodation: "Private finca-style recovery lodging",
      tourism: "Coffee-region calm routes and scenic recovery pace",
      benefits: ["Family-run coordination", "Quiet recovery setting", "Premium transport logistics"],
    };
  }
  return {
    accommodation: "Premium urban lodging near coordination points",
    tourism: "Optional Medellín + Guatapé local experiences",
    benefits: ["Fast access logistics", "Family-run specialists", "Bilingual concierge support"],
  };
}

export default async function Home() {
  const packages = await getPublishedPackages();
  const assets = await getPublishedAssets({ limit: 12 });

  const prioritized = [...assets].sort((a, b) => {
    const score = (x: { category: string | null }) =>
      x.category === "clinic" || x.category === "team" ? 1 : 0;
    return score(b) - score(a);
  });

  const featured = prioritized.slice(0, 6);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/90 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-base font-semibold tracking-wide sm:text-lg">Smile Transformation</span>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="#packages"
              className="hidden rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500 sm:inline-flex"
            >
              View Packages
            </Link>
            <Link
              href="/assessment"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 sm:px-5"
            >
              Start Free Assessment
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 pb-28 pt-10 sm:gap-20 sm:px-6 sm:pb-20 sm:pt-14">
        <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Clínica San Martín trust anchor
          </p>
          <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Smile Transformation Medellín &amp; Smile Transformation Manizales
          </h1>
          <p className="mt-4 max-w-3xl text-base text-zinc-300 sm:text-lg">
            Family-run specialists coordination with premium lodging + transport included in planning.
            We manage your hospitality and clinic access logistics in Colombia. No medical promises
            and no guaranteed outcomes.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/assessment"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 sm:text-base"
            >
              Start Free Assessment
            </Link>
            <Link
              href="#packages"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-700 px-6 text-sm font-semibold text-zinc-100 hover:border-zinc-500 sm:text-base"
            >
              View Packages
            </Link>
            <a
              href={buildWhatsAppHref("Hello, I would like guidance about Smile Transformation packages.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 sm:text-base"
            >
              Chat on WhatsApp
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-300 sm:text-sm">
            <span className="rounded-full border border-zinc-700 px-3 py-1">Medellín coordination</span>
            <span className="rounded-full border border-zinc-700 px-3 py-1">Manizales recovery finca option</span>
            <span className="rounded-full border border-zinc-700 px-3 py-1">USA LLC coordination only</span>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Clínica San Martín as trust anchor in Colombia",
            "Family-run coordination specialists",
            "Premium lodging + internal transport planning",
            "Optional Medellín + Guatapé local experiences",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-200">
              {item}
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "1) Start free assessment",
                body: "Share your goals and preferred timeline in under 5 minutes.",
              },
              {
                title: "2) Coordination review",
                body: "Our team prepares package and city recommendations for Medellín or Manizales.",
              },
              {
                title: "3) Reserve with deposit",
                body: "Receive secure Stripe deposit link once admin confirms logistics.",
              },
              {
                title: "4) Travel with support",
                body: "Arrival, lodging, transport, and concierge coordination throughout your stay.",
              },
            ].map((step) => (
              <li key={step.title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="mt-2 text-sm text-zinc-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="packages">
          <div className="mb-6 flex items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold sm:text-3xl">Packages overview</h2>
            <Link href="/assessment" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
              Start Free Assessment →
            </Link>
          </div>
          {packages.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-300">
              Packages are being updated. Start a free assessment and our team will share options.
            </div>
          ) : (
            <ul className="grid gap-5 lg:grid-cols-2">
              {packages.map((pkg) => {
                const highlights = packageHighlights(pkg.slug, pkg.location);
                return (
                  <li key={pkg.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xl font-semibold">{pkg.name}</h3>
                      <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300">
                        {pkg.location}
                      </span>
                    </div>
                    {pkg.description && <p className="mt-3 text-sm text-zinc-300">{pkg.description}</p>}
                    <dl className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                        <dt className="text-xs uppercase tracking-wide text-zinc-500">Duration</dt>
                        <dd className="mt-1 font-medium text-zinc-100">
                          {pkg.duration_days != null ? `${pkg.duration_days} days` : "Personalized"}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                        <dt className="text-xs uppercase tracking-wide text-zinc-500">Deposit</dt>
                        <dd className="mt-1 font-medium text-zinc-100">{formatDeposit(pkg.deposit_cents)}</dd>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                        <dt className="text-xs uppercase tracking-wide text-zinc-500">Accommodation</dt>
                        <dd className="mt-1 text-zinc-100">{highlights.accommodation}</dd>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                        <dt className="text-xs uppercase tracking-wide text-zinc-500">Tourism experience</dt>
                        <dd className="mt-1 text-zinc-100">{highlights.tourism}</dd>
                      </div>
                    </dl>
                    <ul className="mt-4 space-y-1 text-sm text-zinc-300">
                      {[...highlights.benefits, ...(pkg.included ?? []).slice(0, 2)].map((item) => (
                        <li key={`${pkg.slug}-${item}`} className="flex items-start gap-2">
                          <span aria-hidden className="mt-1 text-emerald-300">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/assessment?package=${encodeURIComponent(pkg.slug)}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
                      >
                        Start Free Assessment
                      </Link>
                      <Link
                        href={`/packages/${encodeURIComponent(pkg.slug)}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-700 px-5 text-sm font-semibold text-zinc-100 hover:border-zinc-500"
                      >
                        View package details
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {featured.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">Inside the experience</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {featured.map((a) =>
                a.url ? (
                  <li key={a.id} className="aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.url}
                      alt={a.alt_text ?? a.title ?? "Smile Transformation gallery image"}
                      className="h-full w-full object-cover"
                    />
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold sm:text-3xl">Why choose us</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[
              {
                title: "Family-run coordination",
                body: "Direct communication, premium organization, and one team aligned to your journey.",
              },
              {
                title: "Premium lodging + transport",
                body: "We coordinate comfortable stays and reliable local transfers for a smoother timeline.",
              },
              {
                title: "Recovery in Manizales finca",
                body: "Calmer environment for guests who prefer privacy and lower pace during recovery days.",
              },
              {
                title: "Medellín + Guatapé optional experience",
                body: "For selected itineraries, include local experiences that fit your non-medical schedule.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <h3 className="text-lg font-semibold text-zinc-100">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-300">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold sm:text-3xl">Testimonials</h2>
          <p className="mt-2 text-sm text-zinc-400">Placeholder structure ready for verified testimonials.</p>
          <ul className="mt-6 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <li key={item.author} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-sm leading-relaxed text-zinc-200">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-zinc-100">{item.author}</p>
                <p className="text-xs text-zinc-400">{item.context}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="faq">
          <h2 className="text-2xl font-semibold sm:text-3xl">FAQ</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((item) => (
              <details key={item.question} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-100 sm:text-base">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-zinc-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-400/50 bg-emerald-500/10 p-6 sm:p-9">
          <h2 className="text-2xl font-semibold sm:text-3xl">Ready to plan your trip?</h2>
          <p className="mt-3 max-w-3xl text-sm text-emerald-100/90 sm:text-base">
            Start with a free assessment and receive a premium coordination proposal for Medellín or
            Manizales.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/assessment"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
            >
              Start Free Assessment
            </Link>
            <a
              href={buildWhatsAppHref("Hi, I'd like help choosing between Medellín and Manizales packages.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-xs leading-relaxed text-zinc-300 sm:text-sm">
          <p>
            <strong>Legal and safety disclaimer:</strong> Smile Transformation USA LLC provides
            international coordination and hospitality services only. Medical services are billed
            separately by licensed clinics in Colombia, including Clínica San Martín. We do not
            provide medical services through the USA entity and we do not guarantee medical outcomes.
          </p>
        </section>
      </main>
      <FloatingWhatsAppButton message="Hello, I would like guidance about Smile Transformation packages." />
      <MobileStickyCtaBar
        assessmentHref="/assessment"
        packagesHref="/#packages"
        whatsappMessage="Hello, I would like guidance about Smile Transformation packages."
      />
    </div>
  );
}

