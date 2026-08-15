import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Shared summariser for captured booth conversations. Takes transcript TEXT
// (never audio) and returns a concise summary the client writes into Notes.
// Platform-agnostic on purpose: the web recorder and the future mobile app
// both post transcript text here.
export async function POST(req: Request) {
  // Require a signed-in user so the endpoint can't be abused anonymously.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI summary is not set up yet. Add ANTHROPIC_API_KEY in Vercel, then try again." },
      { status: 503 }
    );
  }

  let transcript = "";
  try {
    const body = await req.json();
    transcript = typeof body?.transcript === "string" ? body.transcript.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!transcript) {
    return NextResponse.json({ error: "Nothing to summarise." }, { status: 400 });
  }

  // Guard against runaway input (and cost). A booth chat is short; clip anything huge.
  const clipped = transcript.slice(0, 12000);

  const anthropic = new Anthropic({ apiKey });
  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      system:
        "You summarise a single conversation captured at a trade-exhibition booth for a lead-management app. " +
        "Write a concise, factual summary (a short paragraph or a few plain lines) covering, when present: what the company or person deals in, products and quantities discussed, samples or pricing mentioned, and any agreed next steps or follow-ups. " +
        "Use only what is in the transcript. Do not invent names, numbers, or commitments. " +
        "The text comes from speech-to-text and may contain errors, so read for meaning. " +
        "Output only the summary, with no preamble or headings.",
      messages: [{ role: "user", content: `Transcript:\n\n${clipped}` }],
    });

    const summary = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!summary) {
      return NextResponse.json({ error: "Could not produce a summary." }, { status: 502 });
    }
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: "Summary failed. Please try again." }, { status: 502 });
  }
}
