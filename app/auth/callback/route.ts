import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getRedirectPathForRole, type ProfileRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = createLogger(requestId);
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "";

  // 1. Ensure we have a Supabase auth session
  const user = await getCurrentUser();
  if (!user?.id || !user.email) {
    log.info("auth/callback: no session or user", { hasUser: !!user });
    const loginUrl = new URL("/login", url.origin);
    if (next) {
      loginUrl.searchParams.set("next", next);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Ensure there is a profile row; create one as patient if missing
  const supabase = getServerSupabase();
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    log.warn("auth/callback: profile select error", { error: selectError.message });
    const loginUrl = new URL("/login", url.origin);
    if (next) {
      loginUrl.searchParams.set("next", next);
    }
    return NextResponse.redirect(loginUrl);
  }

  let role: ProfileRole = (existing?.role as ProfileRole) ?? "patient";

  if (!existing) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: (user.user_metadata as { full_name?: string } | null)?.full_name ?? null,
      role: "patient",
      is_active: true,
    });
    if (insertError) {
      log.warn("auth/callback: profile insert error", { error: insertError.message });
      const loginUrl = new URL("/login", url.origin);
      if (next) {
        loginUrl.searchParams.set("next", next);
      }
      return NextResponse.redirect(loginUrl);
    }
    role = "patient";
  } else if (existing.is_active === false) {
    log.info("auth/callback: profile inactive");
    const loginUrl = new URL("/login", url.origin);
    if (next) {
      loginUrl.searchParams.set("next", next);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirect using role-based path, honoring `next` when present
  const defaultPath = getRedirectPathForRole(role);
  const targetPath = next || defaultPath || "/patient";
  const targetUrl = new URL(targetPath, url.origin);
  log.info("auth/callback: redirect", { role, targetPath });

  return NextResponse.redirect(targetUrl);
}

