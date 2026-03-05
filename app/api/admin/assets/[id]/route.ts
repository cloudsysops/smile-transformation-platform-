import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createApiRequestContext, getErrorMessage, internalServerError } from "@/lib/api-errors";
import { getServerSupabase } from "@/lib/supabase/server";
import { AssetUpdateSchema } from "@/lib/validation/asset";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const { requestId, log } = createApiRequestContext();

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const json = await request.json().catch(() => ({}));
    const parsed = AssetUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    const body = parsed.data;

    if (body.title !== undefined) updates.title = body.title;
    if (body.category !== undefined) updates.category = body.category;
    if (body.location !== undefined) updates.location = body.location;
    if (body.alt_text !== undefined) updates.alt_text = body.alt_text;
    if (body.source_url !== undefined) updates.source_url = body.source_url ?? null;
    if (body.tags !== undefined) {
      updates.tags = body.tags.map((t) => t.toLowerCase());
    }
    if (body.approved !== undefined) updates.approved = body.approved;
    if (body.published !== undefined) updates.published = body.published;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from("assets")
      .update(updates)
      .eq("id", id)
      .select(
        "id, title, category, location, tags, approved, published, storage_path, alt_text, created_at",
      )
      .single();

    if (error) {
      log.error("Failed to update asset", { error: error.message, asset_id: id });
      return internalServerError(requestId);
    }

    return NextResponse.json(data);
  } catch (error) {
    log.error("Unhandled asset PATCH error", { error: getErrorMessage(error) });
    return internalServerError(requestId);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { requestId, log } = createApiRequestContext();

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const supabase = getServerSupabase();
    const { data: asset, error } = await supabase
      .from("assets")
      .select("id, storage_path")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      log.error("Failed to load asset for delete", { error: error.message, asset_id: id });
      return internalServerError(requestId);
    }

    if (!asset) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const storagePath = asset.storage_path as string | null;
    if (storagePath) {
      await supabase.storage.from("assets").remove([storagePath]);
    }

    const { error: updateError } = await supabase
      .from("assets")
      .update({
        deleted_at: new Date().toISOString(),
        approved: false,
        published: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      log.error("Failed to soft-delete asset", { error: updateError.message, asset_id: id });
      return internalServerError(requestId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error("Unhandled asset DELETE error", { error: getErrorMessage(error) });
    return internalServerError(requestId);
  }
}

