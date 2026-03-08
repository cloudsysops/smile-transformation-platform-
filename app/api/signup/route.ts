/**
 * POST /api/signup — Create profile for current user (patient only).
 * Call after Supabase auth signUp. No public signup for admin/coordinator/provider/specialist.
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";
import { z } from "zod";

const BodySchema = z.object({
  full_name: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const log = createLogger(requestId);
  const user = await getCurrentUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  const full_name = parsed.success ? parsed.data.full_name ?? null : null;

  const supabase = getServerSupabase();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, message: "Profile already exists" });
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    full_name: full_name ?? user.user_metadata?.full_name ?? null,
    role: "patient",
    is_active: true,
  });
  if (error) {
    log.error("Signup profile insert failed", { error: error.message, user_id: user.id });
    return NextResponse.json(
      { error: "Could not create profile. Contact support." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
