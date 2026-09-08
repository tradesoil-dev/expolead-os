import { NextResponse } from "next/server";
import { getAuthedClient } from "@/lib/supabase/authed";
import { allowAiRequest } from "@/lib/rate-limit";
import { peekTrialQuota, bumpTrialQuota, isTrialExhausted } from "@/lib/trial-quota";

export const runtime = "nodejs";

// Transcribes a recorded booth conversation via Deepgram (pre-recorded API)
// with speaker diarisation. Receives audio bytes, returns a speaker-labelled
// transcript. Audio is forwarded to Deepgram and NOT stored.
export async function POST(req: Request) {
  // Require a signed-in user so the endpoint can't be abused anonymously.
  const { supabase, user } = await getAuthedClient(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!(await allowAiRequest(supabase, "transcribe"))) {
    return NextResponse.json(
      { error: "You have reached the recording limit for now. Please try again later." },
      { status: 429 },
    );
  }

  // Trial cap: a trial account gets a fixed number of recordings for the whole
  // trial. Gate BEFORE Deepgram so an exhausted account never triggers a
  // billable call. Only a successful transcription is counted (bump below).
  const quota = await peekTrialQuota(supabase, "recording");
  if (isTrialExhausted(quota)) {
    return NextResponse.json(
      {
        error: `You have used all ${quota?.limit ?? 5} trial recordings. Upgrade to Starter to keep recording and summarising conversations.`,
        code: "trial_limit",
        feature: "recording",
        upgrade: true,
      },
      { status: 402 },
    );
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Recording transcription is not set up yet. Add DEEPGRAM_API_KEY in Vercel, then try again." },
      { status: 503 }
    );
  }

  const contentType = req.headers.get("content-type") || "audio/webm";
  const audio = await req.arrayBuffer();
  if (!audio || audio.byteLength === 0) {
    return NextResponse.json({ error: "No audio received." }, { status: 400 });
  }

  const params = new URLSearchParams({
    model: "nova-3",
    smart_format: "true",
    punctuate: "true",
    diarize: "true",
    // Auto-detect the spoken language so non-English booth conversations
    // (e.g. a buyer speaking through a translator) are transcribed, not dropped.
    detect_language: "true",
  });

  try {
    const dg = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: Buffer.from(audio),
    });

    if (!dg.ok) {
      return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 502 });
    }

    const data = await dg.json();
    const alt = data?.results?.channels?.[0]?.alternatives?.[0];

    // Prefer speaker-labelled paragraphs; fall back to the plain transcript.
    let transcript = "";
    const paras = alt?.paragraphs?.paragraphs;
    if (Array.isArray(paras) && paras.length > 0) {
      transcript = paras
        .map((p: any) => {
          const text = (p.sentences ?? []).map((s: any) => s.text).join(" ").trim();
          if (!text) return "";
          return typeof p.speaker === "number" ? `Speaker ${p.speaker + 1}: ${text}` : text;
        })
        .filter(Boolean)
        .join("\n");
    } else {
      transcript = (alt?.transcript ?? "").trim();
    }

    if (!transcript.trim()) {
      return NextResponse.json({ error: "No speech detected in the recording." }, { status: 502 });
    }
    // Count this successful recording against the trial cap and report what is left.
    const usage = await bumpTrialQuota(supabase, "recording");
    return NextResponse.json({ transcript, usage });
  } catch {
    return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 502 });
  }
}
