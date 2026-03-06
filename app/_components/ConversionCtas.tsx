import Link from "next/link";

// Replace this fallback with your production WhatsApp number in E.164 format (country code + number).
const DEFAULT_WHATSAPP_NUMBER = "15551234567";

function getWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
}

function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

export function buildWhatsAppHref(message: string): string {
  const number = normalizeWhatsAppNumber(getWhatsAppNumber());
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

type MobileStickyCtaBarProps = {
  assessmentHref: string;
  packagesHref?: string;
  whatsappMessage: string;
};

export function MobileStickyCtaBar({
  assessmentHref,
  packagesHref = "/#packages",
  whatsappMessage,
}: MobileStickyCtaBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-2">
        <Link
          href={assessmentHref}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-2 text-center text-xs font-semibold text-zinc-900"
        >
          Start Free
          <br />
          Assessment
        </Link>
        <Link
          href={packagesHref}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-700 px-2 text-center text-xs font-semibold text-zinc-100"
        >
          View
          <br />
          Packages
        </Link>
        <a
          href={buildWhatsAppHref(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-500 px-2 text-center text-xs font-semibold text-emerald-950"
        >
          Chat on
          <br />
          WhatsApp
        </a>
      </div>
    </div>
  );
}

type FloatingWhatsAppButtonProps = {
  message: string;
};

export function FloatingWhatsAppButton({ message }: FloatingWhatsAppButtonProps) {
  return (
    <a
      href={buildWhatsAppHref(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-4 z-40 hidden h-14 min-w-14 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400 sm:inline-flex"
      aria-label="Chat on WhatsApp"
    >
      WhatsApp
    </a>
  );
}
