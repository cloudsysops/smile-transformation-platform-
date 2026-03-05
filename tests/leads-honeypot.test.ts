import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const single = vi.fn();
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ insert }));
  const getServerSupabase = vi.fn(() => ({ from }));
  const checkRateLimit = vi.fn(() => true);
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const createLogger = vi.fn(() => logger);
  return {
    single,
    select,
    insert,
    from,
    getServerSupabase,
    checkRateLimit,
    createLogger,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabase: mocks.getServerSupabase,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
}));

vi.mock("@/lib/logger", () => ({
  createLogger: mocks.createLogger,
}));

import { POST } from "@/app/api/leads/route";

describe("POST /api/leads honeypot handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.single.mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-111111111111" },
      error: null,
    });
  });

  it("uses trimmed company_website and skips DB writes when honeypot is filled", async () => {
    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: "Bot",
          last_name: "Traffic",
          email: "bot@example.com",
          company_website: "   https://spam.example.com  ",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      ok: true,
      request_id: expect.any(String),
    });
    expect(mocks.getServerSupabase).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("treats whitespace-only company_website as empty and continues normal flow", async () => {
    const response = await POST(
      new Request("http://localhost/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: "Jane",
          last_name: "Doe",
          email: "jane@example.com",
          company_website: "    ",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({
      lead_id: "11111111-1111-4111-8111-111111111111",
      request_id: expect.any(String),
    });
    expect(mocks.checkRateLimit).toHaveBeenCalledTimes(1);
    expect(mocks.getServerSupabase).toHaveBeenCalledTimes(1);
    expect(mocks.from).toHaveBeenCalledWith("leads");
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });
});
