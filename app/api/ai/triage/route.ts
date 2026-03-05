import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { aiJsonError, createAiRouteContext, ensureAiRouteAccess } from "@/lib/ai/admin-route";
import { getAgentSystemPrompt } from "@/lib/ai/prompts";
import { callAgent } from "@/lib/ai/openai";
import { LeadTriageOutputSchema } from "@/lib/ai/schemas";
import { getLatestLeadAiRow, saveLeadAiFields } from "@/lib/ai/storage";

const BodySchema = z.object({
  lead_id: z.string().uuid(),
}).strict();

export async function POST(request: Request) {
  const { requestId, log } = createAiRouteContext();
  const accessError = await ensureAiRouteAccess(requestId);
  if (accessError) {
    return accessError;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsedBody = BodySchema.safeParse(body);
    if (!parsedBody.success) {
      return aiJsonError(requestId, "Invalid body", 400);
    }

    const supabase = getServerSupabase();
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, first_name, last_name, email, phone, package_slug, message")
      .eq("id", parsedBody.data.lead_id)
      .single();

    if (leadError || !lead) {
      return aiJsonError(requestId, "Lead not found", 404);
    }

    const systemPrompt = await getAgentSystemPrompt("lead-triage");
    const triageRaw = await callAgent({
      agentName: "lead-triage",
      systemPrompt,
      userJson: {
        name: `${lead.first_name} ${lead.last_name}`.trim(),
        email: lead.email,
        phone: lead.phone,
        preferred_city:
          lead.package_slug === "smile-manizales"
            ? "Manizales"
            : lead.package_slug === "smile-medellin"
              ? "Medellín"
              : null,
        desired_dates: null,
        notes: lead.message,
        package_slug: lead.package_slug,
      },
    });

    const triageParsed = LeadTriageOutputSchema.safeParse(triageRaw);
    if (!triageParsed.success) {
      log.warn("Triage schema validation failed", { issues: triageParsed.error.issues });
      return aiJsonError(requestId, "Invalid AI response format", 502);
    }

    const triage = triageParsed.data;
    const { row: existingRow, error: existingError } = await getLatestLeadAiRow(
      supabase,
      parsedBody.data.lead_id,
      "id",
    );
    if (existingError) {
      log.error("Failed to load lead_ai row", { error: existingError });
      return aiJsonError(requestId, "Failed to save triage", 500);
    }
    const saveError = await saveLeadAiFields({
      supabase,
      leadId: parsedBody.data.lead_id,
      existingId: existingRow?.id,
      fields: { triage_json: triage },
    });
    if (saveError) {
      log.error("Failed to persist triage", { error: saveError });
      return aiJsonError(requestId, "Failed to save triage", 500);
    }

    log.info("Lead triage generated", { lead_id: parsedBody.data.lead_id });
    return NextResponse.json({ triage, request_id: requestId });
  } catch (err) {
    log.error("Triage route error", { err: String(err) });
    return aiJsonError(requestId, "Server error", 500);
  }
}
