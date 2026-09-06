import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { peekTrialQuota } from "@/lib/trial-quota";

export const runtime = "nodejs";

// Read-only: how much of each trial AI allowance the signed-in user has left.
// Drives the "X of N left" nudge on the recorder and the card scanner. Never
// consumes anything; the actual gating happens inside the AI endpoints.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const [recording, card_scan] = await Promise.all([
    peekTrialQuota(supabase, "recording"),
    peekTrialQuota(supabase, "card_scan"),
  ]);

  return NextResponse.json({ recording, card_scan });
}
