import { NextResponse, after } from "next/server";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { SURVEY_V2, cleanAnswersV2, emailProblem } from "@/lib/survey-v2";
import { getCampaign } from "@/lib/survey-campaigns";
import { sendSurveyReportEmail } from "@/lib/survey-report-email";
import { reportEmailAllowed } from "@/lib/report-email-cap";

export const runtime = "nodejs";

// Public (no sign-in) submit for /survey/<campaign>. Defences: answers and
// contact fields validated server-side, a hidden field bots fill in, one
// answer per email per campaign, and at most 5 answers an hour per connection
// (by salted hash; the raw address is never stored). The report email is a
// best-effort side effect sent after the response and can never fail a save.

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export async function POST(req: Request) {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > 30_000) return NextResponse.json({ error: "Too much data." }, { status: 413 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bot trap: pretend success, store nothing.
  if (clip(body?.website, 200)) return NextResponse.json({ ok: true });

  const campaign = await getCampaign(clip(body?.campaign, 80));
  if (!campaign || !campaign.open) return NextResponse.json({ error: "This survey is not open." }, { status: 400 });

  const answers = cleanAnswersV2(body?.answers, "public");
  if (!answers) return NextResponse.json({ error: "Please answer every question." }, { status: 400 });

  const c = body?.contact ?? {};
  const email = clip(c.email, 254).toLowerCase();
  const name = clip(c.name, 120);
  const company = clip(c.company, 160);
  const nextShow = clip(c.nextShow, 120);
  if (emailProblem(email)) return NextResponse.json({ error: emailProblem(email) }, { status: 400 });
  if (!name || !company || !nextShow) return NextResponse.json({ error: "Please fill in your name, company and next trade show." }, { status: 400 });

  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "";
  const ipHash = ip ? createHash("sha256").update(`${process.env.SURVEY_IP_SALT || "expolead-survey"}:${ip}`).digest("hex") : null;

  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return NextResponse.json({ error: "Could not save your answers. Please try again." }, { status: 500 });
  }

  try {
    if (ipHash) {
      const since = new Date(Date.now() - 3600_000).toISOString();
      const { count } = await admin.from("survey_responses").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
      if ((count ?? 0) >= 5) return NextResponse.json({ error: "Too many answers from this connection. Please try again later." }, { status: 429 });
    }
    const { count: dup } = await admin.from("survey_responses").select("id", { count: "exact", head: true }).eq("campaign", campaign.slug).eq("email", email);
    if ((dup ?? 0) > 0) return NextResponse.json({ error: "This email has already taken this survey. Thank you!" }, { status: 409 });

    const { error } = await admin.from("survey_responses").insert({
      campaign: campaign.slug,
      source: clip(body?.source, 40).toLowerCase().replace(/[^a-z0-9_-]/g, "") || null,
      role_show: answers.role_show,
      email,
      full_name: name,
      company_name: company,
      whatsapp: clip(c.whatsapp, 40) || null,
      linkedin: clip(c.linkedin, 200) || null,
      next_show: nextShow,
      wants_try: answers.try === "yes",
      wants_results: c.results === true,
      consent_contact: c.consent === true,
      survey_version: SURVEY_V2,
      answers,
      ip_hash: ipHash,
    });
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: "Could not save your answers. Please try again." }, { status: 500 });
  }

  after(async () => {
    try {
      if (!(await reportEmailAllowed(admin))) return;
      await sendSurveyReportEmail({ email, firstName: name.split(" ")[0], company, exhibition: campaign.exhibition, campaignLabel: campaign.label, answers });
    } catch {
      /* best effort */
    }
  });

  return NextResponse.json({ ok: true });
}
