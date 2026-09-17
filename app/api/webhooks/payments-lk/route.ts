import { NextResponse } from "next/server";
import { constructEvent, SIGNATURE_HEADER } from "@/lib/payments/paymentslk";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

// payments.lk webhook. Verifies the signature (no user session; the signature
// IS the trust), then activates the account on payment.succeeded using a
// service-role client. Excluded from session middleware so it receives the raw
// body and is not redirected.
export async function POST(req: Request) {
  const secret = process.env.PAYMENTS_LK_WEBHOOK_SECRET;
  if (!secret) {
    // Not wired yet: acknowledge so PAYable does not pile up retries.
    return NextResponse.json({ received: true, note: "webhook secret not set" }, { status: 200 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get(SIGNATURE_HEADER);

  let event;
  try {
    event = constructEvent(rawBody, sig, secret);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid signature" },
      { status: 400 },
    );
  }

  if (event.type === "payment.succeeded") {
    const reference = typeof event.data?.reference === "string" ? event.data.reference : null;
    const paymentId = typeof event.data?.id === "string" ? event.data.id : null;

    if (reference) {
      try {
        const svc = createServiceClient();
        const { data: row } = await svc
          .from("upgrade_requests")
          .select("user_id, plan, status")
          .eq("reference", reference)
          .single();

        // Only act on a known, not-yet-confirmed request (idempotent: a repeat
        // delivery is a no-op).
        if (row && row.status !== "confirmed") {
          await svc
            .from("upgrade_requests")
            .update({
              status: "confirmed",
              confirmed_at: new Date().toISOString(),
              provider_payment_id: paymentId ?? undefined,
            })
            .eq("reference", reference);

          await svc
            .from("profiles")
            .update({ early_access: true, plan: row.plan })
            .eq("id", row.user_id);
        }
      } catch {
        // Return 500 so PAYable retries (it retries for a day); never leave a
        // paid customer unactivated because of a transient error.
        return NextResponse.json({ error: "activation failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
