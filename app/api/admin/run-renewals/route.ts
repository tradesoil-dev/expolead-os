import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processRenewals } from "@/lib/renewals";

/**
 * Admin-only manual trigger for the renewal reminder check. Lets Gladwin run
 * it from the Subscriptions screen without needing the cron secret, which
 * Vercel does not let you read back once set.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const results = await processRenewals();
  return NextResponse.json(results, { status: results.ok ? 200 : 500 });
}
