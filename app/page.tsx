import Link from "next/link";
import { getPublishedPackages } from "@/lib/packages";
import { getPublishedAssets } from "@/lib/assets";
import { getPublishedSpecialists } from "@/lib/specialists";
import { getPublishedExperiences } from "@/lib/experiences";
import { WhatsAppButton } from "./components/WhatsAppButton";
import PackageCard from "./components/landing/package-card";
import SpecialistCard from "./components/landing/specialist-card";
import ExperienceCard from "./components/landing/experience-card";
import StepFlowSection from "./components/landing/step-flow-section";
import type { PublicAsset } from "@/lib/assets";

function getPackageImage(assets: PublicAsset[], location: string): PublicAsset | null {
  const match = assets.find((a) => a.location === location && a.url);
  return match ?? assets.find((a) => a.url) ?? null;
}

const HOW_IT_WORKS_STEPS = [
  { step: 1, title: "Free evaluation", desc: "Share your details and goals. We review your case at no cost." },
  { step: 2, title: "Treatment plan", desc: "Our team and specialists recommend a personalized plan within 24 hours." },
  { step: 3, title: "Choose package", desc: "Select a package that fits your treatment and recovery journey." },
  { step: 4, title: "Travel to Medellín", desc: "We coordinate your arrival, lodging, and first consultations." },
  { step: 5, title: "Recovery in Manizales", desc: "Recover in the coffee region with optional experiences and support." },
  { step: 6, title: "Optional experiences", desc: "Customize your stay with coffee tours, wellness, and cultural activities." },
];

const TRUST_ITEMS = [
  { icon: "clinic", title: "Curated partner network", desc: "We work only with vetted clinics and specialists—no open marketplace." },
  { icon: "people", title: "Qualified specialists", desc: "Dental, dermatology, plastic surgery, wellness, and more. All recommendation-based." },
  { icon: "place", title: "Treatment in Medellín · Recovery in Manizales", desc: "Two-city journey with coordinated care and recovery in the coffee region." },
  { icon: "transport", title: "Full coordination", desc: "Lodging, transport between cities, and recovery support included." },
];

const WHY_COLOMBIA = [
  { title: "Up to 60–70% cost savings", desc: "World-class care at a fraction of US and European prices." },
  { title: "Experienced specialists", desc: "Board-certified and internationally trained professionals." },
  { title: "Modern clinics", desc: "State-of-the-art facilities and equipment." },
  { title: "Beautiful recovery destinations", desc: "Medellín and Manizales offer safe, welcoming environments." },
];

const TESTIMONIALS = [
  { quote: "Amazing care and beautiful recovery experience. From the first message to arrival, everything was coordinated.", author: "Patient, Medellín package", stars: 5 },
  { quote: "The team made me feel safe and informed. The specialists were excellent and the recovery in Manizales was perfect.", author: "Patient, Comfort Recovery Journey", stars: 5 },
];

function TrustIcon({ icon }: { icon: string }) {
  const c = "h-6 w-6 text-emerald-500";
  if (icon === "people") {
    return (
      <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  }
  if (icon === "clinic") {
    return (
      <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  if (icon === "transport") {
    return (
      <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    );
  }
  return (
    <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-hidden>
      {Array.from({ length: stars }).map((_, i) => (
        <span key={i} className="text-lg">★</span>
      ))}
    </div>
  );
}

export default async function Home() {
  const [packages, allAssets, specialists, experiences] = await Promise.all([
    getPublishedPackages(),
    getPublishedAssets({ limit: 24 }),
    getPublishedSpecialists(),
    getPublishedExperiences(),
  ]);
  const prioritized = [...allAssets].sort((a, b) => {
    const score = (x: { category: string | null }) => (x.category === "clinic" || x.category === "team" ? 1 : 0);
    return score(b) - score(a);
  });
  const heroImage = prioritized[0]?.url ? prioritized[0] : allAssets.find((a) => a.url) ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Announcement bar */}
      <div className="bg-emerald-950/90 border-b border-emerald-800/50 text-center py-2 px-4">
        <p className="text-sm text-emerald-100">
          Free evaluation — no commitment. We respond within 24 hours.{" "}
          <Link href="/assessment" className="font-semibold text-white underline underline-offset-2 hover:text-emerald-200">
            Start free
          </Link>
        </p>
      </div>

      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:py-5">
          <span className="text-lg font-semibold text-white">Smile Transformation</span>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/signin" className="hidden text-sm font-medium text-zinc-400 hover:text-white sm:inline-block">
              Sign in
            </Link>
            <Link
              href="/assessment"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 sm:px-5 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              Start Free Evaluation
            </Link>
            <Link
              href="/#packages"
              className="hidden rounded-full border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/80 sm:inline-block focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              View Packages
            </Link>
            <Link href="/#how-it-works" className="hidden text-sm font-medium text-zinc-400 hover:text-white sm:inline-block">
              How it works
            </Link>
            <Link href="/#specialists" className="hidden text-sm font-medium text-zinc-400 hover:text-white sm:inline-block">
              Specialists
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12 md:py-16">
        {/* 1. Hero */}
        <section id="hero" className="mb-20 scroll-mt-6 md:mb-28">
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
            <div>
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                Free Medical Evaluation · Treatment in Medellín · Recovery in Manizales
              </h1>
              <p className="mb-8 max-w-lg text-lg text-zinc-400">
                Free evaluation with no commitment. Treatment in Medellín, recovery in Manizales — one coordinated journey with trusted specialists and family-approved partners.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  href="/assessment"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-zinc-900 hover:bg-zinc-100 sm:w-auto focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  Start Free Evaluation
                </Link>
                <Link
                  href="/#packages"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border-2 border-zinc-600 px-8 py-4 text-base font-semibold text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/80 sm:w-auto focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  View Packages
                </Link>
                <div className="w-full sm:w-auto">
                  <WhatsAppButton label="Chat on WhatsApp" variant="inline" className="w-full justify-center rounded-full border-0 bg-emerald-600 px-8 py-4 text-base font-semibold hover:bg-emerald-700 sm:w-auto min-h-[48px]" />
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 md:aspect-square">
              {heroImage?.url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage.url}
                    alt={heroImage.alt_text ?? heroImage.title ?? "Smile Transformation - Medellín and Manizales"}
                    className="h-full w-full object-cover"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                </>
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-500">
                  <span className="text-sm font-medium">Medellín & Manizales</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. Trust + legal clarity */}
        <section id="trust" className="mb-20 scroll-mt-6 md:mb-28">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Curated trusted network
          </h2>
          <p className="mb-8 text-2xl font-bold text-white md:text-3xl">
            Providers and specialists join by invitation only. Family-oriented, high-quality, professional.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map(({ icon, title, desc }) => (
              <li key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 transition hover:border-zinc-700">
                <div className="mb-3">
                  <TrustIcon icon={icon} />
                </div>
                <h3 className="mb-1 font-bold text-white">{title}</h3>
                <p className="text-sm text-zinc-400">{desc}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-4 text-sm text-zinc-400">
            <strong className="text-zinc-300">Legal clarity:</strong> We are a coordination and hospitality platform. We do not provide medical advice, diagnosis, or treatment. Medical services are provided by licensed clinics and specialists in Colombia.
          </p>
        </section>

        {/* 3. Free Medical Evaluation */}
        <section id="evaluation" className="mb-20 scroll-mt-6 md:mb-28">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Free medical evaluation
          </h2>
          <p className="mb-8 max-w-2xl text-2xl font-bold text-white md:text-3xl">
            Get a free case review before you travel
          </p>
          <ul className="mb-8 grid gap-4 sm:grid-cols-3">
            <li className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">1</span>
              <div>
                <h3 className="font-semibold text-white">Submit your assessment</h3>
                <p className="mt-1 text-sm text-zinc-400">Share your details and goals. Optional: upload photos for a more accurate review.</p>
              </div>
            </li>
            <li className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">2</span>
              <div>
                <h3 className="font-semibold text-white">We review your case</h3>
                <p className="mt-1 text-sm text-zinc-400">Our team and specialists evaluate and prepare a personalized recommendation.</p>
              </div>
            </li>
            <li className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">3</span>
              <div>
                <h3 className="font-semibold text-white">Receive treatment plan</h3>
                <p className="mt-1 text-sm text-zinc-400">Get your plan, package options, and next steps—no obligation.</p>
              </div>
            </li>
          </ul>
          <Link
            href="/assessment"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            Start Free Assessment
          </Link>
        </section>

        {/* 4. How It Works */}
        <StepFlowSection steps={HOW_IT_WORKS_STEPS} title="How it works" className="mb-20 md:mb-28" />

        {/* 5. Travel Packages */}
        <section id="packages" className="mb-20 scroll-mt-6 md:mb-28">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Travel packages
          </h2>
          <p className="mb-8 max-w-2xl text-2xl font-bold text-white md:text-3xl">
            Two-city journey: treatment in Medellín, recovery in Manizales
          </p>
          {packages.length === 0 ? (
            <p className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-12 text-center text-zinc-500">
              No packages available at the moment. Check back soon.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, idx) => {
                const img = getPackageImage(allAssets, pkg.location);
                const recommended = pkg.badge === "MOST POPULAR" || (idx === 0 && !packages.some((p) => p.badge === "MOST POPULAR"));
                return (
                  <PackageCard key={pkg.id} pkg={pkg} image={img} recommended={!!recommended} />
                );
              })}
            </ul>
          )}
        </section>

        {/* 6. Meet Our Specialists */}
        {specialists.length > 0 && (
          <section id="specialists" className="mb-20 scroll-mt-6 md:mb-28">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Meet Our Specialists
            </h2>
            <p className="mb-8 max-w-2xl text-2xl font-bold text-white md:text-3xl">
              Free evaluation included in your visit
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {specialists.map((s) => (
                <SpecialistCard key={s.id} specialist={s} imageUrl={null} />
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="/assessment"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Request specialist consultations
              </Link>
            </div>
          </section>
        )}

        {/* 7. Recovery Experiences */}
        {experiences.length > 0 && (
          <section id="experiences" className="mb-20 scroll-mt-6 md:mb-28">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Customize your recovery experience
            </h2>
            <p className="mb-8 max-w-2xl text-2xl font-bold text-white md:text-3xl">
              Coffee tours, hot springs, paragliding, city tours, spa treatments, and more
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {experiences.map((ex) => (
                <ExperienceCard key={ex.id} experience={ex} />
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="/assessment"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Select experiences in your assessment
              </Link>
            </div>
          </section>
        )}

        {/* 8. Why Medellín + Manizales */}
        <section id="why-medellin-manizales" className="mb-20 scroll-mt-6 md:mb-28">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Why Medellín + Manizales
          </h2>
          <p className="mb-8 max-w-2xl text-2xl font-bold text-white md:text-3xl">
            Two cities, one coordinated journey: treatment then recovery
          </p>
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h3 className="mb-2 font-bold text-white">Medellín — treatment hub</h3>
              <p className="text-sm text-zinc-400">Modern clinics, experienced specialists, and your first consultations. We coordinate lodging and in-city transport so you focus on your care.</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h3 className="mb-2 font-bold text-white">Manizales — recovery in the coffee region</h3>
              <p className="text-sm text-zinc-400">Recover in a calm, welcoming environment. Optional experiences: coffee tours, hot springs, nature. Family-run hospitality and support.</p>
            </div>
          </div>
          <h2 className="mb-2 mt-12 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Why Colombia
          </h2>
          <p className="mb-8 max-w-2xl text-2xl font-bold text-white md:text-3xl">
            World-class care in a welcoming destination
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_COLOMBIA.map(({ title, desc }) => (
              <li key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 transition hover:border-zinc-700">
                <h3 className="mb-2 font-bold text-white">{title}</h3>
                <p className="text-sm text-zinc-400">{desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 9. Testimonials */}
        <section id="testimonials" className="mb-20 scroll-mt-6 md:mb-28">
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            What people say
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t, i) => (
              <blockquote key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8">
                <StarRating stars={t.stars} />
                <p className="mt-4 text-lg font-medium leading-relaxed text-zinc-200">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-4 text-sm text-zinc-500">— {t.author}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* 10. FAQ */}
        <section id="faq" className="mb-20 scroll-mt-6 md:mb-28">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            FAQ
          </h2>
          <p className="mb-8 text-2xl font-bold text-white md:text-3xl">
            Free evaluation, packages, and what to expect
          </p>
          <ul className="space-y-4">
            <li className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h3 className="mb-2 font-semibold text-white">Is the evaluation really free?</h3>
              <p className="text-sm text-zinc-400">Yes. You submit your details and goals; our team and specialists review your case at no cost. You receive a personalized treatment plan and package options with no obligation.</p>
            </li>
            <li className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h3 className="mb-2 font-semibold text-white">What does my package include?</h3>
              <p className="text-sm text-zinc-400">Each package description lists what is included (e.g. consultations, procedures, lodging, transport between Medellín and Manizales, recovery support). Check the package details and &ldquo;includes&rdquo; list for your chosen option.</p>
            </li>
            <li className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h3 className="mb-2 font-semibold text-white">Are flights included?</h3>
              <p className="text-sm text-zinc-400">International flights are not included. We coordinate lodging, in-country transport, and your program once you arrive. We can advise on travel and timing.</p>
            </li>
            <li className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h3 className="mb-2 font-semibold text-white">How does the deposit work?</h3>
              <p className="text-sm text-zinc-400">After you choose a package, a deposit secures your spot. The amount is shown on each package. The remainder is typically due according to the clinic&apos;s terms. We&apos;ll guide you through the process.</p>
            </li>
            <li className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h3 className="mb-2 font-semibold text-white">Medical disclaimer</h3>
              <p className="text-sm text-zinc-400">We coordinate travel and hospitality. Medical advice, diagnosis, and treatment are provided by licensed clinics and specialists in Colombia. Always discuss your specific case with your provider.</p>
            </li>
          </ul>
        </section>

        {/* 11. Final CTA */}
        <section id="cta" className="mb-20 scroll-mt-6 md:mb-28" aria-labelledby="final-cta-title">
          <div className="rounded-2xl border-2 border-emerald-500/50 bg-zinc-900/80 p-8 text-center md:p-14">
            <h2 id="final-cta-title" className="mb-3 text-2xl font-bold text-white md:text-4xl">
              Start Your Smile Transformation Journey
            </h2>
            <p className="mx-auto mb-8 max-w-md text-zinc-400">
              Get your free evaluation and personalized treatment plan. No commitment.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/assessment"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-semibold text-zinc-900 hover:bg-zinc-100 sm:w-auto focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Get Your Free Evaluation
              </Link>
              <WhatsAppButton
                label="Chat on WhatsApp"
                variant="inline"
                className="w-full justify-center rounded-full border-0 bg-emerald-600 px-10 py-4 text-lg font-semibold hover:bg-emerald-700 sm:w-auto min-h-[52px]"
              />
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-800 pt-12">
          <div className="grid gap-8 sm:grid-cols-3 md:grid-cols-4">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Packages</h3>
              <Link href="/#packages" className="block text-sm text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded">
                Explore packages
              </Link>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Start</h3>
              <Link href="/assessment" className="block text-sm text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded">
                Free evaluation
              </Link>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact</h3>
              <WhatsAppButton label="Chat on WhatsApp" variant="inline" className="inline-flex text-sm" />
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Legal</h3>
              <Link href="/legal" className="block text-sm text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded">
                Privacy &amp; legal
              </Link>
            </div>
          </div>
          <p className="mt-10 text-center text-sm text-zinc-500">
            USA LLC — International coordination &amp; hospitality. Medical services billed by clinics in Colombia.
          </p>
        </footer>

        {/* Sticky bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/98 backdrop-blur py-3 px-4">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
            <p className="text-sm font-medium text-zinc-300">
              Ready? Get your free evaluation — we respond within 24 hours.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/assessment"
                className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Get Free Evaluation
              </Link>
              <WhatsAppButton label="Chat" variant="inline" className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-zinc-600 bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950" />
            </div>
          </div>
        </div>
        <div className="h-20" aria-hidden />
      </main>
    </div>
  );
}
