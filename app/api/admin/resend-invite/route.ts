import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPilotInviteEmail } from "@/lib/invite-email";

export const runtime = "nodejs";

// Admin-only: send a fresh set-your-password invite to a pilot who has NOT
// accepted yet (link expired or never opened). Same branded email as the
// first invite, with a new one-time link.
//
// Safety: this can only ever reach an account that has never been used, so it
// cannot disturb anyone's existing password. It refuses when the account
// has confirmed its email or signed in at least once, when it is an admin,
// or when it is not on the pilot list.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!prof?.is_admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  let userId = "";
  try {
    const body = await req.json();
    userId = typeof body?.user_id === "string" ? body.user_id : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!userId) return NextResponse.json({ error: "Missing user." }, { status: 400 });

  const admin = createServiceClient();

  const { data: target } = await admin
    .from("profiles")
    .select("is_admin, full_name, pilot_invited_at, early_access_until")
    .eq("id", userId)
    .single();
  if (!target) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (target.is_admin) {
    return NextResponse.json({ error: "Cannot send an invite to an admin account." }, { status: 400 });
  }
  if (!target.pilot_invited_at) {
    return NextResponse.json({ error: "This account is not on the pilot list." }, { status: 400 });
  }
  if (!target.early_access_until || new Date(target.early_access_until).getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "Their pilot access has ended. Invite them again with a new access date first." },
      { status: 400 },
    );
  }

  const { data: authData, error: authErr } = await admin.auth.admin.getUserById(userId);
  const authUser = authData?.user;
  if (authErr || !authUser?.email) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  // The core safeguard: only accounts that have never been used.
  if (authUser.email_confirmed_at || authUser.last_sign_in_at) {
    return NextResponse.json(
      { error: "This pilot has already accepted. If they cannot sign in, ask them to use Forgot password on the sign-in page." },
      { status: 400 },
    );
  }

  const email = authUser.email;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://expoleados.com";
  const redirectTo = `${siteUrl}/update-password`;

  // Prefer a fresh invite link; if Supabase will not re-issue an invite for
  // this account, fall back to a recovery link. The set-password page accepts
  // both, and either way the account has no password yet.
  let hashed = "";
  let linkType: "invite" | "recovery" = "invite";
  const inv = await admin.auth.admin.generateLink({ type: "invite", email, options: { redirectTo } });
  if (!inv.error && inv.data?.properties?.hashed_token) {
    hashed = inv.data.properties.hashed_token;
  } else {
    const rec = await admin.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo } });
    if (rec.error || !rec.data?.properties?.hashed_token) {
      return NextResponse.json({ error: "Could not create a new link. Please try again." }, { status: 500 });
    }
    hashed = rec.data.properties.hashed_token;
    linkType = "recovery";
  }
  const actionLink = `${siteUrl}/update-password?token_hash=${encodeURIComponent(hashed)}&type=${linkType}`;

  const accessLabel = new Date(target.early_access_until).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  try {
    await sendPilotInviteEmail(email, (target.full_name ?? "").split(" ")[0] || "there", actionLink, accessLabel);
  } catch {
    return NextResponse.json({ error: "The new link was created but the email could not be sent. Please try again." }, { status: 502 });
  }

  // Best-effort audit; never blocks the resend.
  try {
    await admin.from("security_events").insert({ user_id: userId, type: "invite_resent", detail: `by admin ${user.id}` });
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({ ok: true, emailSent: true });
}
