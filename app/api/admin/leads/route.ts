import { NextResponse } from "next/server";
import { createApiRequestContext, getErrorMessage, internalServerError } from "@/lib/api-errors";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { requestId, log } = createApiRequestContext();

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("leads")
      .select("id, first_name, last_name, email, status, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      log.error("Failed to list leads", { error: error.message });
      return internalServerError(requestId);
    }
    return NextResponse.json(data ?? []);
  } catch (error) {
    log.error("Unhandled admin leads list error", { error: getErrorMessage(error) });
    return internalServerError(requestId);
  }
}
