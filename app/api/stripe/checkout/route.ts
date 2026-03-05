import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerConfig } from "@/lib/config/server";
import { createApiRequestContext, getErrorMessage, internalServerError } from "@/lib/api-errors";
import { getServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const BodySchema = z.object({
  lead_id: z.string().uuid(),
  amount_cents: z.number().int().positive(),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});

export async function POST(request: Request) {
  const { requestId, log } = createApiRequestContext();

  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const config = getServerConfig();
    if (!config.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }
    const body = await request.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { lead_id, amount_cents, success_url, cancel_url } = parsed.data;

    // Use the Stripe SDK default API version for package compatibility.
    const stripe = new Stripe(config.STRIPE_SECRET_KEY);
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount_cents,
            product_data: { name: "Deposit — Smile Transformation" },
          },
        },
      ],
      success_url: success_url || `${origin}/admin/leads/${lead_id}?paid=1`,
      cancel_url: cancel_url || `${origin}/admin/leads/${lead_id}`,
      metadata: { lead_id },
    });

    const supabase = getServerSupabase();
    const { error } = await supabase.from("payments").insert({
      lead_id,
      stripe_checkout_session_id: session.id,
      amount_cents,
      status: "pending",
    });
    if (error) {
      log.error("Failed to persist checkout session", { error: error.message, lead_id });
      return internalServerError(requestId);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    log.error("Unhandled Stripe checkout error", { error: getErrorMessage(error) });
    return internalServerError(requestId);
  }
}
