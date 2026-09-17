import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { type PlanId, type BillingCycle } from "@/lib/plans";
import { getPricing, standardAmount } from "@/lib/pricing";
import { createCheckout, usdToLkrCents, isPaymentsConfigured } from "@/lib/payments/paymentslk";

export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://expoleados.com";

// Creates a payments.lk hosted checkout for an upgrade and returns its URL.
// The amount is derived server-side from the admin-managed pricing, never the
// browser. SANDBOX: since the API is LKR-only for now, the USD price is
// converted to LKR with a placeholder rate (see lib/payments/paymentslk).
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if (!isPaymentsConfigured()) {
    return NextResponse.json({ error: "Card payment is not set up yet." }, { status: 503 });
  }

  let plan: PlanId;
  let billingCycle: BillingCycle;
  try {
    const body = await req.json();
    plan = body?.plan;
    billingCycle = body?.billingCycle;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (plan !== "starter" && plan !== "growth") {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }
  if (billingCycle !== "monthly" && billingCycle !== "annual") {
    return NextResponse.json({ error: "Unknown billing cycle" }, { status: 400 });
  }

  const pricing = await getPricing();
  const amountUsd = standardAmount(pricing, plan, billingCycle);
  const amountLkrCents = usdToLkrCents(amountUsd);

  const { data: reference, error: refErr } = await supabase.rpc("new_upgrade_reference");
  if (refErr || !reference) {
    return NextResponse.json({ error: "Could not create a reference" }, { status: 500 });
  }

  const { error: insErr } = await supabase.from("upgrade_requests").insert({
    user_id: user.id,
    plan,
    billing_cycle: billingCycle,
    amount_usd: amountUsd,
    reference,
    provider: "payments_lk",
  });
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  try {
    const checkout = await createCheckout({
      amountCents: amountLkrCents,
      description: `ExpoLead OS ${plan} (${billingCycle})`,
      reference,
      successUrl: `${APP_URL}/upgrade?paid=1&ref=${encodeURIComponent(reference)}`,
      cancelUrl: `${APP_URL}/upgrade?canceled=1`,
    });
    await supabase
      .from("upgrade_requests")
      .update({ provider_payment_id: checkout.id })
      .eq("reference", reference);
    return NextResponse.json({ url: checkout.url, reference });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 502 },
    );
  }
}
