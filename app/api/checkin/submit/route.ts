import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { cleanAnswers } from "@/lib/checkin-survey";

export const runtime = "nodejs";

// Public (no sign-in) endpoint for the check-in survey. The only credential is
// the private token from the email link, matched by its SHA-256 hash. Answers
// are validated against the survey definition, and each link can be answered
// exactly once: the update only matches a row that is still unanswered, so two
// fast submits cannot both write.
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

  const answers = cleanAnswers(raw);
  if (!answers) return NextResponse.json({ error: "Please answer every question not marked optional." }, { status: 400 });

  const tokenHash = createHash("sha256").update(token).digest("hex");

  let data: { id: string }[] | null = null;
  try {
    const res = await createServiceClient()
      .from("feedback_checkins")
      .update({ answers, answered_at: new Date().toISOString(), wants_call: answers.call === "yes" })
      .eq("token_hash", tokenHash)
      .is("answered_at", null)
      .select("id");
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

  return NextResponse.json({ ok: true });
}
