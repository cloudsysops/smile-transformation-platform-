import { beforeEach, describe, expect, it, vi } from "vitest";

const constructEventMock = vi.fn();
const fromMock = vi.fn();
const enqueueDepositPaidAutomationJobsMock = vi.fn();

vi.mock("@/lib/config/server", () => ({
  getServerConfig: () => ({
    STRIPE_SECRET_KEY: "sk_test_webhook",
    STRIPE_WEBHOOK_SECRET: "whsec_webhook",
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabase: () => ({
    from: fromMock,
  }),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@/lib/ai/automation", () => ({
  enqueueDepositPaidAutomationJobs: enqueueDepositPaidAutomationJobsMock,
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    webhooks = {
      constructEvent: constructEventMock,
    };
  },
}));

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    constructEventMock.mockReset();
    fromMock.mockReset();
    enqueueDepositPaidAutomationJobsMock.mockReset();
    enqueueDepositPaidAutomationJobsMock.mockResolvedValue([]);
  });

  it("ignores checkout sessions with non-payment mode", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_mode",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_mode",
          mode: "setup",
          payment_status: "paid",
          metadata: { lead_id: "550e8400-e29b-41d4-a716-446655440000" },
        },
      },
    });

    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}",
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true, ignored: "unsupported_mode" });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("ignores checkout.session.completed events that are not paid", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_unpaid",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_unpaid",
          mode: "payment",
          payment_status: "unpaid",
          metadata: { lead_id: "550e8400-e29b-41d4-a716-446655440000" },
        },
      },
    });

    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}",
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true, ignored: "payment_not_paid" });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns idempotent when webhook event is already recorded", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_duplicate_event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_dup",
          mode: "payment",
          payment_status: "paid",
          metadata: { lead_id: "550e8400-e29b-41d4-a716-446655440000" },
        },
      },
    });

    fromMock.mockImplementation((table: string) => {
      if (table === "stripe_webhook_events") {
        return {
          upsert: () => ({
            select: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}",
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true, idempotent: true });
  });

  it("handles duplicate insert races safely after unique constraints", async () => {
    let paymentSelectCalls = 0;

    constructEventMock.mockReturnValue({
      id: "evt_race",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_race",
          mode: "payment",
          payment_status: "paid",
          amount_total: 150000,
          metadata: { lead_id: "550e8400-e29b-41d4-a716-446655440000" },
        },
      },
    });

    fromMock.mockImplementation((table: string) => {
      if (table === "stripe_webhook_events") {
        return {
          upsert: () => ({
            select: () => ({
              limit: async () => ({ data: [{ id: "event_row_1" }], error: null }),
            }),
          }),
          update: () => ({
            eq: async () => ({ error: null }),
          }),
        };
      }
      if (table === "payments") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: async () => {
                  paymentSelectCalls += 1;
                  if (paymentSelectCalls === 1) {
                    return { data: [], error: null };
                  }
                  return {
                    data: [{
                      id: "payment_race_1",
                      lead_id: "550e8400-e29b-41d4-a716-446655440000",
                      status: "succeeded",
                    }],
                    error: null,
                  };
                },
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: null,
                error: {
                  code: "23505",
                  message: "duplicate key value violates unique constraint",
                },
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              eq: () => ({
                select: () => ({
                  maybeSingle: async () => ({ data: null, error: null }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === "leads") {
        return {
          update: () => ({
            eq: () => ({
              neq: async () => ({ error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}",
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true, idempotent: true });
    expect(enqueueDepositPaidAutomationJobsMock).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000");
  });
});
