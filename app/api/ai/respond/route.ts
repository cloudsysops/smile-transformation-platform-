import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";
import { aiJsonError, createAiRouteContext, ensureAiRouteAccess } from "@/lib/ai/admin-route";
import { getAgentSystemPrompt } from "@/lib/ai/prompts";
import { callAgent } from "@/lib/ai/openai";
import { LeadTriageOutputSchema, SalesResponderOutputSchema } from "@/lib/ai/schemas";
import { getLatestLeadAiRow, saveLeadAiFields } from "@/lib/ai/storage";

const BodySchema = z.object({
  lead_id: z.string().uuid(),
  cta_url: z.string().url().optional(),
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
      .select("id, first_name, last_name, email, phone, country, package_slug, message")
      .eq("id", parsedBody.data.lead_id)
      .single();

    if (leadError || !lead) {
      return aiJsonError(requestId, "Lead not found", 404);
    }

    const { row: aiRow, error: aiError } = await getLatestLeadAiRow(
      supabase,
      parsedBody.data.lead_id,
      "id, triage_json",
    );
    if (aiError) {
      log.error("Failed to load lead_ai row", { error: aiError });
      return aiJsonError(requestId, "Failed to generate reply", 500);
    }
    const triageMaybe = LeadTriageOutputSchema.safeParse(aiRow?.triage_json);

    const ctaUrl = parsedBody.data.cta_url ?? `${new URL(request.url).origin}/assessment`;
    const systemPrompt = await getAgentSystemPrompt("sales-responder");
    const responseRaw = await callAgent({
      agentName: "sales-responder",
      systemPrompt,
      userJson: {
        lead: {
          name: `${lead.first_name} ${lead.last_name}`.trim(),
          email: lead.email,
          phone: lead.phone,
          country: lead.country,
          package_slug: lead.package_slug,
          notes: lead.message,
        },
        triage: triageMaybe.success ? triageMaybe.data : null,
        cta_url: ctaUrl,
      },
    });

    const messageParsed = SalesResponderOutputSchema.safeParse(responseRaw);
    if (!messageParsed.success) {
      log.warn("Sales responder schema validation failed", { issues: messageParsed.error.issues });
      return aiJsonError(requestId, "Invalid AI response format", 502);
    }

    const message = messageParsed.data;
    const messagePayload = {
      ...message,
      cta_url: ctaUrl,
      generated_at: new Date().toISOString(),
    };

    const saveError = await saveLeadAiFields({
      supabase,
      leadId: parsedBody.data.lead_id,
      existingId: aiRow?.id,
      fields: { messages_json: messagePayload },
    });
    if (saveError) {
      log.error("Failed to persist messages_json", { error: saveError });
      return aiJsonError(requestId, "Failed to save reply", 500);
    }

    log.info("Lead response generated", { lead_id: parsedBody.data.lead_id });
    return NextResponse.json({ message: messagePayload, request_id: requestId });
  } catch (err) {
    log.error("Respond route error", { err: String(err) });
    return aiJsonError(requestId, "Server error", 500);
  }
}
