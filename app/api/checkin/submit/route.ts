import { NextResponse, after } from "next/server";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { cleanAnswersV2, SURVEY_V2 } from "@/lib/survey-v2";
import { sendSurveyReportEmail } from "@/lib/survey-report-email";
import { reportEmailAllowed } from "@/lib/report-email-cap";

export const runtime = "nodejs";

// Public (no sign-in) endpoint for the check-in survey. The only credential is
// the private token from the email link, matched by its SHA-256 hash. Answers
// are validated against the survey definition, and each link can be answered
// exactly once: the update only matches a row that is still unanswered, so two
// fast submits cannot both write. The pilot then gets their report by email,
// a best-effort side effect sent after the response that can never fail a save.
export async function POST(req: Request) {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > 20_000) return NextResponse.json({ error: "Too much data." }, { status: 413 });

  let token = "";
  let raw: unknown = null;
  try {
    const body = await req.json();
    token = typeof body?.token === "string" ? body.token : "";
    raw = body?.answers;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) {
    return NextResponse.json({ error: "This survey link is not valid." }, { status: 400 });
  }

  const answers = cleanAnswersV2(raw, "pilot");
  if (!answers) return NextResponse.json({ error: "Please answer every question." }, { status: 400 });

  const tokenHash = createHash("sha256").update(token).digest("hex");

  let admin: ReturnType<typeof createServiceClient>;
  let data: { id: string; user_id: string; exhibition_name: string; campaign: string }[] | null = null;
  try {
    admin = createServiceClient();
    const res = await admin
      .from("feedback_checkins")
      .update({ answers, survey_version: SURVEY_V2, answered_at: new Date().toISOString(), wants_call: answers.call === "yes" })
      .eq("token_hash", tokenHash)
      .is("answered_at", null)
      .select("id, user_id, exhibition_name, campaign");
    if (res.error) throw res.error;
    data = res.data;
  } catch {
    return NextResponse.json({ error: "Could not save your answers. Please try again." }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "This survey has already been answered, or the link is not valid." },
      { status: 409 },
    );
  }

  const row = data[0];
  after(async () => {
    try {
      if (!(await reportEmailAllowed(admin))) return;
      const [{ data: u }, { data: prof }] = await Promise.all([
        admin.auth.admin.getUserById(row.user_id),
        admin.from("profiles").select("full_name, company_name").eq("id", row.user_id).maybeSingle(),
      ]);
      const email = u?.user?.email;
      if (!email) return;
      await sendSurveyReportEmail({
        email,
        firstName: (prof?.full_name ?? "").trim().split(" ")[0] ?? "",
        company: prof?.company_name ?? "",
        exhibition: row.exhibition_name,
        campaignLabel: row.campaign || row.exhibition_name,
        answers,
      });
    } catch {
      /* best effort */
    }
  });

  return NextResponse.json({ ok: true });
}
