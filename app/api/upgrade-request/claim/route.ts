import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPaymentClaimedEmail } from "@/lib/upgrade-email";

/**
 * Called when a customer presses "I have made the payment".
 *
 * The update runs through claim_upgrade_payment, a security-definer function
 * that only allows pending -> payment_claimed on the caller's own row. Users
 * have no UPDATE policy on upgrade_requests, so nobody can mark themselves
 * confirmed by calling this.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { reference?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const reference = (body.reference ?? "").trim();
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("claim_upgrade_payment", {
    p_reference: reference,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const claimed = Array.isArray(data) ? data[0] : data;
  if (!claimed) {
    // No row matched: wrong reference, someone else's, or already confirmed.
    return NextResponse.json({ error: "We could not find that request" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // The record is what matters. A failed notification must not tell the
  // customer their claim did not register, so this is logged, not thrown.
  const { error: emailError } = await sendPaymentClaimedEmail({
    customerEmail: user.email ?? "",
    customerName: profile?.full_name ?? null,
    plan: claimed.plan,
    billingCycle: claimed.billing_cycle,
    amountUsd: Number(claimed.amount_usd),
    reference: claimed.reference,
  });
  if (emailError) {
    console.error("Payment claim saved but notification failed", reference, emailError);
  }

  return NextResponse.json({ ok: true });
}
