import { NextResponse } from "next/server";
import { createApiRequestContext, getErrorMessage, internalServerError } from "@/lib/api-errors";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const UpdateLeadSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "deposit_paid", "completed", "cancelled"]),
});

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const { requestId, log } = createApiRequestContext();

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = UpdateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("leads")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status")
      .single();
    if (error) {
      log.error("Failed to update lead status", { error: error.message, lead_id: id });
      return internalServerError(requestId);
    }
    return NextResponse.json(data);
  } catch (error) {
    log.error("Unhandled lead PATCH error", { error: getErrorMessage(error) });
    return internalServerError(requestId);
  }
}
