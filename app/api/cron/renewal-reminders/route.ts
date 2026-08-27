import { NextResponse } from "next/server";
import { processRenewals } from "@/lib/renewals";

// Daily Vercel Cron (see vercel.json). Reminds paid accounts before and at
// their renewal, and flags overdue ones. The logic lives in lib/renewals so
// the admin "Run renewal check now" button can reuse it.

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Only Vercel Cron (or a caller holding the secret) may run this. The secret
  // is accepted ONLY via the Authorization header, never a URL query, because
  // URLs land in logs and monitoring. Fail CLOSED: no secret configured means
  // refuse. Admins trigger a manual run through /api/admin/run-renewals instead.
  if (!CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await processRenewals();
  return NextResponse.json(results, { status: results.ok ? 200 : 500 });
}
