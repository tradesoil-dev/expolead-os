import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendCheckinEmail } from "@/lib/checkin-email";
import { SURVEY_V2 } from "@/lib/survey-v2";

export const runtime = "nodejs";

// Admin-only: send a pilot the post-show check-in email with a private survey
// link. The link carries a random token; only its SHA-256 hash is stored, so
// the database alone can never reconstruct a working link.
//
// Refuses: admins, accounts not on the pilot list, pilots whose access has
// ended, and pilots who have not accepted their invite yet (their "Open
// ExpoLead OS" button would not work; use Resend invite instead). A second
// send for the same campaign needs an explicit confirm from the admin.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!prof?.is_admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  let userId = "";
  let exhibition = "";
  let campaign = "";
  let confirmRepeat = false;
  try {
    const body = await req.json();
    userId = typeof body?.user_id === "string" ? body.user_id : "";
    exhibition = typeof body?.exhibition === "string" ? body.exhibition.replace(/\s+/g, " ").trim() : "";
    campaign = typeof body?.campaign === "string" ? body.campaign.replace(/\s+/g, " ").trim() : "";
    confirmRepeat = body?.confirm_repeat === true;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!userId) return NextResponse.json({ error: "Missing user." }, { status: 400 });
  if (!exhibition || exhibition.length > 80) {
    return NextResponse.json({ error: "Enter the exhibition name (up to 80 characters)." }, { status: 400 });
  }
  if (!campaign) campaign = exhibition;
  if (campaign.length > 80) return NextResponse.json({ error: "Campaign name is too long." }, { status: 400 });

  const admin = createServiceClient();

  const { data: target } = await admin
    .from("profiles")
    .select("is_admin, full_name, pilot_invited_at, early_access_until")
    .eq("id", userId)
    .single();
  if (!target) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (target.is_admin) return NextResponse.json({ error: "Cannot send a check-in to an admin account." }, { status: 400 });
  if (!target.pilot_invited_at) return NextResponse.json({ error: "This account is not on the pilot list." }, { status: 400 });
  if (!target.early_access_until || new Date(target.early_access_until).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Their pilot access has ended." }, { status: 400 });
  }

  const { data: authData } = await admin.auth.admin.getUserById(userId);
  const authUser = authData?.user;
  if (!authUser?.email) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (!authUser.email_confirmed_at && !authUser.last_sign_in_at) {
    return NextResponse.json(
      { error: "This pilot has not accepted their invite yet. Use Resend invite first." },
      { status: 400 },
    );
  }

  // Same campaign already sent? Ask the admin to confirm before sending again.
  const { data: previous, error: prevErr } = await admin
    .from("feedback_checkins")
    .select("id, sent_at, answered_at")
    .eq("user_id", userId)
    .eq("campaign", campaign)
    .order("sent_at", { ascending: false })
    .limit(1);
  if (prevErr) {
    return NextResponse.json(
      { error: "Feedback is not set up yet. Run migration 0054 in Supabase first." },
      { status: 503 },
    );
  }
  if (previous && previous.length && !confirmRepeat) {
    const p = previous[0];
    return NextResponse.json(
      {
        needsConfirm: true,
        answered: !!p.answered_at,
        sentAt: p.sent_at,
      },
      { status: 409 },
    );
  }

  // Has the pilot captured anything yet? Only changes one sentence in the email.
  let notUsedYet = true;
  try {
    const { count } = await admin
      .from("suppliers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    notUsedYet = !count;
  } catch {
    /* default wording */
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { data: row, error: insErr } = await admin
    .from("feedback_checkins")
    .insert({
      user_id: userId,
      exhibition_name: exhibition,
      campaign,
      token_hash: tokenHash,
      survey_version: SURVEY_V2,
      sent_by: user.id,
    })
    .select("id")
    .single();
  if (insErr || !row) {
    return NextResponse.json({ error: "Could not create the check-in. Please try again." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://expoleados.com";
  const accessLabel = new Date(target.early_access_until).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  let sendFailed = false;
  try {
    const res = await sendCheckinEmail({
      email: authUser.email,
      firstName: (target.full_name ?? "").split(" ")[0],
      exhibition,
      surveyUrl: `${siteUrl}/checkin/${token}`,
      appUrl: `${siteUrl}/login`,
      accessUntilLabel: accessLabel,
      notUsedYet,
    });
    if (res?.error) sendFailed = true;
  } catch {
    sendFailed = true;
  }

  if (sendFailed) {
    // Never leave a "sent" row for an email that did not go out.
    await admin.from("feedback_checkins").delete().eq("id", row.id);
    return NextResponse.json({ error: "The email could not be sent. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
