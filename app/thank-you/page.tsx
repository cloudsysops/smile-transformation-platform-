import Link from "next/link";
import { WhatsAppButton } from "../components/WhatsAppButton";

type Props = { searchParams: Promise<{ lead_id?: string }> };

export default async function ThankYouPage({ searchParams }: Props) {
  const { lead_id } = await searchParams;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            ← Smile Transformation
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 text-center sm:py-16">
        <h1 className="text-2xl font-semibold">Your request has been received</h1>
        <p className="mt-4 text-zinc-400">
          Thank you for your interest in Smile Transformation. Our team will review your details and
          get in touch within 24 hours.
        </p>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 text-left">
          <h2 className="text-sm font-semibold text-white">Next steps</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-400">
            <li>Review by our team</li>
            <li>Contact within 24 hours</li>
            <li>You can also message us on WhatsApp anytime</li>
          </ul>
        </div>

        {lead_id && (
          <p className="mt-4 text-sm text-zinc-500">
            Reference: <span className="font-mono text-zinc-400">{lead_id}</span>
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <WhatsAppButton
            label="Message us on WhatsApp"
            variant="inline"
            className="inline-flex justify-center rounded-full border-0 bg-emerald-600 hover:bg-emerald-700"
          />
          <Link
            href="/"
            className="inline-block rounded-full border border-zinc-600 px-8 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Back to home
          </Link>
          <Link href="/#packages" className="text-sm font-medium text-zinc-400 underline hover:text-white">
            View packages
          </Link>
        </div>
      </main>
    </div>
  );
}
