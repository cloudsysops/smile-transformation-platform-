import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import LeadStatusForm from "../LeadStatusForm";
import DepositButton from "../DepositButton";
import LeadCopyButtons from "./LeadCopyButtons";
import AiActionsPanel from "./AiActionsPanel";
import { ItineraryOutputSchema, LeadTriageOutputSchema, OpsTasksOutputSchema, SalesResponderOutputSchema } from "@/lib/ai/schemas";

type Props = { params: Promise<{ id: string }>; searchParams?: Promise<{ paid?: string }> };
const StoredMessageSchema = SalesResponderOutputSchema.extend({
  cta_url: z.string().url().optional(),
  generated_at: z.string().optional(),
  lead_snapshot_minimal: z
    .object({
      lead_id: z.string().uuid(),
      name: z.string().min(1),
      email: z.string().email(),
      country: z.string().nullable(),
      package_slug: z.string().nullable(),
    })
    .optional(),
});

export default async function AdminLeadDetailPage({ params, searchParams }: Props) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login?next=/admin/leads");
  }
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const showPaidSuccess = resolvedSearchParams?.paid === "1";
  const supabase = getServerSupabase();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !lead) notFound();

  const { data: aiRows } = await supabase
    .from("lead_ai")
    .select("triage_json, messages_json, ops_json")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(1);
  const latestAi = aiRows?.[0];
  const triageMaybe = LeadTriageOutputSchema.safeParse(latestAi?.triage_json);
  const messagesMaybe = StoredMessageSchema.safeParse(latestAi?.messages_json);
  const opsMaybe = OpsTasksOutputSchema.safeParse(latestAi?.ops_json);

  const specialistIds = (lead.specialist_ids as string[] | null) ?? [];
  const experienceIds = (lead.experience_ids as string[] | null) ?? [];
  const { data: specialistsList } = specialistIds.length > 0
    ? await supabase.from("specialists").select("id, name, specialty").in("id", specialistIds)
    : { data: [] };
  const { data: experiencesList } = experienceIds.length > 0
    ? await supabase.from("experiences").select("id, name, city").in("id", experienceIds)
    : { data: [] };

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, deposit_cents, created_at")
    .eq("lead_id", id)
    .maybeSingle();

  const { data: itineraryRows } = await supabase
    .from("itineraries")
    .select("id, city, content_json, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const parsedItineraries = (itineraryRows ?? []).map((row) => {
    const parsed = ItineraryOutputSchema.safeParse(row.content_json);
    return {
      id: row.id as string,
      city: (row.city as string | null) ?? null,
      content_json: parsed.success ? parsed.data : null,
      created_at: row.created_at as string,
    };
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/admin/leads" className="text-sm text-zinc-600 hover:underline">← Leads</Link>
          <h1 className="text-xl font-semibold">Lead: {lead.first_name} {lead.last_name}</h1>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        {showPaidSuccess && (
          <div
            role="alert"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
          >
            Deposit registered successfully. The lead status will update shortly.
          </div>
        )}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <dl className="grid gap-3 text-sm">
            <div><dt className="font-medium text-zinc-500">Email</dt><dd>{lead.email}</dd></div>
            {lead.phone && <div><dt className="font-medium text-zinc-500">Phone</dt><dd>{lead.phone}</dd></div>}
            {lead.country && <div><dt className="font-medium text-zinc-500">Country</dt><dd>{lead.country}</dd></div>}
            {(lead.package_slug ?? lead.package_id) && (
              <div>
                <dt className="font-medium text-zinc-500">Package</dt>
                <dd>
                  {lead.package_slug ? (
                    <Link href={`/packages/${encodeURIComponent(lead.package_slug)}`} className="text-emerald-600 hover:underline">
                      {lead.package_slug}
                    </Link>
                  ) : (
                    <span className="text-zinc-500">ID: {lead.package_id}</span>
                  )}
                </dd>
              </div>
            )}
            {booking && (
              <div>
                <dt className="font-medium text-zinc-500">Booking</dt>
                <dd><span className="font-medium">{booking.status}</span>{booking.deposit_cents != null && ` · ${(booking.deposit_cents / 100).toFixed(0)} USD`}</dd>
              </div>
            )}
            {(specialistsList?.length ?? 0) > 0 && (
              <div>
                <dt className="font-medium text-zinc-500">Specialist consultation requests</dt>
                <dd className="mt-1">{(specialistsList ?? []).map((s: { name: string; specialty: string }) => `${s.name} (${s.specialty})`).join(", ")}</dd>
              </div>
            )}
            {(experiencesList?.length ?? 0) > 0 && (
              <div>
                <dt className="font-medium text-zinc-500">Experience interests</dt>
                <dd className="mt-1">{(experiencesList ?? []).map((e: { name: string; city: string }) => `${e.name} (${e.city})`).join(", ")}</dd>
              </div>
            )}
            <div><dt className="font-medium text-zinc-500">Status</dt><dd>{lead.status}</dd></div>
            <div><dt className="font-medium text-zinc-500">Created</dt><dd>{new Date(lead.created_at).toLocaleString()}</dd></div>
            {lead.message && <div><dt className="font-medium text-zinc-500">Message</dt><dd className="whitespace-pre-wrap">{lead.message}</dd></div>}
          </dl>
        </div>
        <LeadStatusForm leadId={lead.id} currentStatus={lead.status} />
        <LeadCopyButtons
          firstName={lead.first_name}
          lastName={lead.last_name}
          email={lead.email}
        />
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">Stripe deposit</h2>
          <p className="mt-1 text-sm text-zinc-600">Create a checkout session for the deposit.</p>
          <DepositButton leadId={lead.id} leadStatus={lead.status} />
        </div>
        <AiActionsPanel
          leadId={lead.id}
          initialTriage={triageMaybe.success ? triageMaybe.data : null}
          initialMessage={messagesMaybe.success ? messagesMaybe.data : null}
          initialItineraries={parsedItineraries}
          initialOps={opsMaybe.success ? opsMaybe.data : null}
        />
      </main>
    </div>
  );
}
