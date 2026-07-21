import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendUpgradeRequestEmail } from "@/lib/upgrade-email";
import { PLAN_PRICES, type PlanId, type BillingCycle } from "@/lib/plans";

/**
 * Records an upgrade request and notifies Gladwin. Called when a logged-in
 * user submits the in-app upgrade form.
 *
 * The price is looked up server-side from PLAN_PRICES rather than taken from
 * the request body, so a tampered browser cannot record a $1 Growth plan.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { plan?: string; billingCycle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const plan = body.plan as PlanId;
  const billingCycle = body.billingCycle as BillingCycle;

  if (plan !== "starter" && plan !== "growth") {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }
  if (billingCycle !== "monthly" && billingCycle !== "annual") {
    return NextResponse.json({ error: "Unknown billing cycle" }, { status: 400 });
  }

  const amountUsd = PLAN_PRICES[plan][billingCycle];

  const { data: reference, error: refError } = await supabase.rpc("new_upgrade_reference");
  if (refError || !reference) {
    return NextResponse.json({ error: "Could not create a reference" }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("upgrade_requests").insert({
    user_id: user.id,
    plan,
    billing_cycle: billingCycle,
    amount_usd: amountUsd,
    reference,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // The record is what matters. A failed notification must not lose the
  // request or show the customer an error, so this is logged, not thrown.
  const { error: emailError } = await sendUpgradeRequestEmail({
    customerEmail: user.email ?? "",
    customerName: profile?.full_name ?? null,
    plan,
    billingCycle,
    amountUsd,
    reference,
  });
  if (emailError) {
    console.error("Upgrade request saved but notification failed", reference, emailError);
  }

  return NextResponse.json({ reference, amountUsd });
}
