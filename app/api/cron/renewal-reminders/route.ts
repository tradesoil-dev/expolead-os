import { NextResponse } from "next/server";
import { processRenewals } from "@/lib/renewals";

// Daily Vercel Cron (see vercel.json). Reminds paid accounts before and at
// their renewal, and flags overdue ones. The logic lives in lib/renewals so
// the admin "Run renewal check now" button can reuse it.

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Vercel Cron sends the secret in an Authorization header. For manual runs
  // the same secret can be passed as ?key=, since a browser cannot set an
  // Authorization header from a plain URL.
  const authHeader = request.headers.get("authorization");
  const key = new URL(request.url).searchParams.get("key");
  const authorised = !CRON_SECRET || authHeader === `Bearer ${CRON_SECRET}` || key === CRON_SECRET;
  if (!authorised) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await processRenewals();
  return NextResponse.json(results, { status: results.ok ? 200 : 500 });
}
