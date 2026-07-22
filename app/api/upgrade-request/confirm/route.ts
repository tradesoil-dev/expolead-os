import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendUpgradeConfirmedEmail } from "@/lib/upgrade-email";

/**
 * Admin confirms a payment: marks it received, unlocks the account, and tells
 * the customer.
 *
 * The confirm itself runs in admin_confirm_upgrade, which is gated on
 * is_admin() in the database, so this route cannot be used to grant access by
 * anyone who is not an admin even if they call it directly.
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

  const { data: confirmed, error } = await supabase.rpc("admin_confirm_upgrade", {
    p_reference: reference,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!confirmed) {
    return NextResponse.json(
      { error: "Nothing changed. It may already have been confirmed." },
      { status: 409 }
    );
  }

  // Re-read the row for the customer's email and plan details. The same
  // admin-gated function the screen uses, so no extra permissions are needed.
  const { data: rows } = await supabase.rpc("admin_list_upgrade_requests");
  const row = (rows ?? []).find((r: { reference: string }) => r.reference === reference);

  if (row) {
    // The payment is already recorded and the account already unlocked. A
    // failed email must not report failure, or an admin may confirm twice.
    const { error: emailError } = await sendUpgradeConfirmedEmail({
      customerEmail: row.email,
      customerName: row.full_name,
      plan: row.plan,
      billingCycle: row.billing_cycle,
      amountUsd: Number(row.amount_usd),
      reference: row.reference,
    });
    if (emailError) {
      console.error("Upgrade confirmed but customer email failed", reference, emailError);
      return NextResponse.json({ ok: true, emailSent: false });
    }
  }

  return NextResponse.json({ ok: true, emailSent: Boolean(row) });
}
