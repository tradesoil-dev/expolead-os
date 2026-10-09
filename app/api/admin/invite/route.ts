import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPilotInviteEmail } from "@/lib/invite-email";

export const runtime = "nodejs";

// Admin-only: provision a customer/pilot account by email, with full self-
// expiring access and optional ELOS, and send them a branded set-your-own-
// password link. Replaces the old "tell Claude to grant access" step.
//
// Security: the caller is verified as an admin via their own session first;
// only then do we use the service-role client for the privileged operations
// (creating the auth user, minting the link, setting access flags).
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!prof?.is_admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const fullName = typeof body?.full_name === "string" ? body.full_name.trim() : "";
  const companyName = typeof body?.company_name === "string" ? body.company_name.trim() : "";
  const accessUntil = typeof body?.access_until === "string" ? body.access_until : ""; // yyyy-mm-dd
  const fullAccess = body?.full_access !== false; // default true
  const elos = !!body?.elos;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (fullAccess && !accessUntil) {
    return NextResponse.json({ error: "Pick an access-until date." }, { status: 400 });
  }
  const accessUntilIso = accessUntil ? new Date(`${accessUntil}T23:59:59Z`).toISOString() : null;
  if (accessUntil && Number.isNaN(Date.parse(accessUntilIso as string))) {
    return NextResponse.json({ error: "Invalid access-until date." }, { status: 400 });
  }

  const admin = createServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://expoleados.com";
  const redirectTo = `${siteUrl}/update-password`;

  // Create + invite the user. If they already exist, fall back to a recovery
  // (set-password) link so returning people can still be re-provisioned.
  let actionLink = "";
  let userId = "";
  let existing = false;

  const invite = await admin.auth.admin.generateLink({ type: "invite", email, options: { redirectTo } });
  if (invite.error) {
    const recovery = await admin.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo } });
    if (recovery.error || !recovery.data?.properties?.action_link || !recovery.data?.user?.id) {
      return NextResponse.json(
        { error: recovery.error?.message || invite.error.message || "Could not create the invite." },
        { status: 400 },
      );
    }
    actionLink = recovery.data.properties.action_link;
    userId = recovery.data.user.id;
    existing = true;
  } else {
    actionLink = invite.data?.properties?.action_link ?? "";
    userId = invite.data?.user?.id ?? "";
  }
  if (!userId || !actionLink) {
    return NextResponse.json({ error: "Could not create the account link." }, { status: 500 });
  }

  // Grant pilot access on the profile (handle_new_user already created the row).
  const profileUpdate: Record<string, any> = {
    early_access_until: fullAccess ? accessUntilIso : null,
    elos_enabled: elos,
  };
  if (fullAccess) profileUpdate.pilot_invited_at = new Date().toISOString();
  if (fullName) profileUpdate.full_name = fullName;
  if (companyName) profileUpdate.company_name = companyName;

  const { error: upErr } = await admin.from("profiles").update(profileUpdate).eq("id", userId);
  if (upErr) {
    return NextResponse.json({ error: `Account created but access was not set: ${upErr.message}` }, { status: 500 });
  }

  // Send the branded set-password link via Resend.
  let emailSent = true;
  try {
    const accessLabel = accessUntil
      ? new Date(`${accessUntil}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : "further notice";
    await sendPilotInviteEmail(email, fullName.split(" ")[0] || "there", actionLink, accessLabel);
  } catch {
    emailSent = false;
  }

  return NextResponse.json({ ok: true, existing, emailSent });
}
