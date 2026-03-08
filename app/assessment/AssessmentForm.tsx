"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PackageRow } from "@/lib/packages";
import type { SpecialistRow } from "@/lib/specialists";
import type { ExperienceRow } from "@/lib/experiences";

const inputBase =
  "w-full rounded-xl border border-zinc-600 bg-zinc-900/80 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition";

type Props = Readonly<{
  packages: PackageRow[];
  specialists: SpecialistRow[];
  experiences: ExperienceRow[];
  prefillPackageSlug?: string;
}>;

export default function AssessmentForm({ packages, specialists, experiences, prefillPackageSlug = "" }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [messageLength, setMessageLength] = useState(0);
  const errorRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const specialistIds = fd.getAll("specialist_ids").filter((v): v is string => typeof v === "string" && v.length > 0);
    const experienceIds = fd.getAll("experience_ids").filter((v): v is string => typeof v === "string" && v.length > 0);
    const body = {
      first_name: (fd.get("first_name") as string)?.trim() ?? "",
      last_name: (fd.get("last_name") as string)?.trim() ?? "",
      email: (fd.get("email") as string)?.trim() ?? "",
      phone: (fd.get("phone") as string)?.trim() || undefined,
      country: (fd.get("country") as string)?.trim() || undefined,
      package_slug: (fd.get("package_slug") as string) || undefined,
      message: (fd.get("message") as string)?.trim() || undefined,
      specialist_ids: specialistIds,
      experience_ids: experienceIds,
      selected_experience_ids: experienceIds,
      travel_companions: (fd.get("travel_companions") as string)?.trim() || undefined,
      budget_range: (fd.get("budget_range") as string)?.trim() || undefined,
      company_website: (fd.get("company_website") as string) || undefined,
    };

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        const apiError = (data.error as string) || "";
        const message =
          res.status === 429
            ? "Too many attempts. Please try again later."
            : res.status === 400
              ? apiError.toLowerCase().includes("email")
                ? "Please check your email and other required fields."
                : "Please check your information and try again."
              : apiError || "Something went wrong. Please try again.";
        setErrorMessage(message);
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }
      const leadId = typeof data.lead_id === "string" ? data.lead_id : null;
      if (leadId) {
        router.push(`/thank-you?lead_id=${encodeURIComponent(leadId)}`);
        return;
      }
      setStatus("success");
      form.reset();
      setMessageLength(0);
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  return (
    <>
      {status === "success" && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 rounded-xl border border-emerald-800 bg-emerald-950/50 p-4 text-sm text-emerald-200"
        >
          Thank you. We&apos;ve received your request and will be in touch within 24 hours.
        </div>
      )}

      {status === "error" && (
        <div
          ref={errorRef}
          role="alert"
          aria-live="assertive"
          id="assessment-error"
          className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-200"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" aria-describedby={status === "error" ? "assessment-error" : undefined}>
        {/* Your details */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Your details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-zinc-300">
                First name <span className="text-red-400" aria-hidden>*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                maxLength={200}
                autoComplete="given-name"
                placeholder="Maria"
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Last name <span className="text-red-400" aria-hidden>*</span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                maxLength={200}
                autoComplete="family-name"
                placeholder="Garcia"
                className={inputBase}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Email <span className="text-red-400" aria-hidden>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="maria@example.com"
              className={inputBase}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Phone <span className="text-zinc-500">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                maxLength={50}
                autoComplete="tel"
                placeholder="+1 234 567 8900"
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Country <span className="text-zinc-500">(optional)</span>
              </label>
              <input
                id="country"
                name="country"
                type="text"
                maxLength={100}
                autoComplete="country-name"
                placeholder="e.g. United States"
                className={inputBase}
              />
            </div>
          </div>
        </fieldset>

        {/* Your journey */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Your journey
          </legend>
          <div>
            <label htmlFor="package_slug" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Travel package <span className="text-zinc-500">(optional)</span>
            </label>
            {packages.length > 0 ? (
              <select
                id="package_slug"
                name="package_slug"
                defaultValue={prefillPackageSlug}
                className={inputBase}
                aria-label="Choose a travel package"
              >
                <option value="">Select a package</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name}
                    {p.recovery_city ? ` (${p.location} → ${p.recovery_city})` : ` (${p.location})`}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="package_slug"
                name="package_slug"
                type="text"
                maxLength={100}
                defaultValue={prefillPackageSlug}
                placeholder="e.g. essential-care-journey"
                className={inputBase}
              />
            )}
          </div>

          {specialists.length > 0 && (
            <div>
              <span id="specialists-desc" className="mb-2 block text-sm font-medium text-zinc-300">
                Specialists you&apos;d like to consult <span className="text-zinc-500">(optional)</span>
              </span>
              <p className="mb-3 text-xs text-zinc-500">Select all that apply.</p>
              <div
                className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4"
                role="group"
                aria-labelledby="specialists-desc"
              >
                {specialists.map((s) => (
                  <label
                    key={s.id}
                    className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg py-2 transition hover:bg-zinc-800/50"
                  >
                    <input
                      type="checkbox"
                      name="specialist_ids"
                      value={s.id}
                      className="mt-1.5 h-5 w-5 shrink-0 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <span className="text-sm text-zinc-200">
                      <span className="font-medium text-white">{s.name}</span>
                      <span className="text-zinc-400"> — {s.specialty}</span>
                      <span className="text-zinc-500"> ({s.city})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {experiences.length > 0 && (
            <div>
              <span id="experiences-desc" className="mb-2 block text-sm font-medium text-zinc-300">
                Recovery experiences you&apos;re interested in <span className="text-zinc-500">(optional)</span>
              </span>
              <p className="mb-3 text-xs text-zinc-500">Select all that apply.</p>
              <div
                className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4"
                role="group"
                aria-labelledby="experiences-desc"
              >
                {experiences.map((ex) => (
                  <label
                    key={ex.id}
                    className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg py-2 transition hover:bg-zinc-800/50"
                  >
                    <input
                      type="checkbox"
                      name="experience_ids"
                      value={ex.id}
                      className="mt-1.5 h-5 w-5 shrink-0 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <span className="text-sm text-zinc-200">
                      <span className="font-medium text-white">{ex.name}</span>
                      <span className="text-zinc-500"> — {ex.city}</span>
                      {ex.duration_hours != null && (
                        <span className="text-zinc-500"> · {ex.duration_hours}h</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="travel_companions" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Travel companions <span className="text-zinc-500">(optional)</span>
              </label>
              <input
                id="travel_companions"
                name="travel_companions"
                type="text"
                maxLength={200}
                placeholder="e.g. spouse, friend"
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="budget_range" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Budget range <span className="text-zinc-500">(optional)</span>
              </label>
              <input
                id="budget_range"
                name="budget_range"
                type="text"
                maxLength={100}
                placeholder="e.g. $3,000–5,000"
                className={inputBase}
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Message <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              maxLength={2000}
              placeholder="Tell us about your goals, preferred dates, or any questions..."
              className={`${inputBase} resize-y min-h-[100px]`}
              onChange={(e) => setMessageLength(e.target.value.length)}
              aria-describedby="message-count"
            />
            <p id="message-count" className="mt-1 text-right text-xs text-zinc-500">
              {messageLength} / 2000
            </p>
          </div>
        </fieldset>

        {/* Honeypot */}
        <div className="absolute -left-[9999px] top-0" aria-hidden="true">
          <label htmlFor="company_website">Company website</label>
          <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full min-h-[48px] rounded-full bg-white px-8 py-3.5 text-base font-semibold text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {status === "loading" ? "Sending…" : "Request free evaluation"}
        </button>
      </form>
    </>
  );
}
