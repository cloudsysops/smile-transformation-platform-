import { NextResponse } from "next/server";

/**
 * Liveness probe: app process is running.
 * Use for load balancers / orchestrators (e.g. GET /api/health).
 */
export async function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA
    ?? process.env.GITHUB_SHA
    ?? process.env.COMMIT_SHA
    ?? "unknown";
  const requestId = crypto.randomUUID();

  return NextResponse.json({
    status: "ok",
    version,
    time: new Date().toISOString(),
    request_id: requestId,
  });
}
