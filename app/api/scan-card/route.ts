import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { allowAiRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Reads a business-card photo and returns the contact fields to pre-fill the
// connection form. The image is sent to Claude for extraction and is NOT stored.
// Dormant until ANTHROPIC_API_KEY is set (returns 503), like /api/summarize.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!(await allowAiRequest(supabase, "scan_card"))) {
    return NextResponse.json(
      { error: "You have reached the card-scan limit for now. Please try again later." },
      { status: 429 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Card scanning is not set up yet. Add ANTHROPIC_API_KEY in Vercel, then try again." },
      { status: 503 },
    );
  }

  let image = "";
  let mediaType = "image/jpeg";
  try {
    const body = await req.json();
    image = typeof body?.image === "string" ? body.image : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Accept a data URL or a bare base64 string; derive the media type from a
  // data URL prefix when present.
  const comma = image.indexOf(",");
  if (image.startsWith("data:") && comma !== -1) {
    const header = image.slice(5, comma);
    const semi = header.indexOf(";");
    mediaType = (semi !== -1 ? header.slice(0, semi) : header) || mediaType;
    image = image.slice(comma + 1);
  }
  if (!image) {
    return NextResponse.json({ error: "No image received." }, { status: 400 });
  }
  // Size guard: base64 is ~1.33x the bytes, so ~8M chars is a ~6MB image.
  if (image.length > 8_000_000) {
    return NextResponse.json({ error: "Image is too large. Take a closer, smaller photo." }, { status: 413 });
  }
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(mediaType)) mediaType = "image/jpeg";

  const anthropic = new Anthropic({ apiKey });
  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system:
        "You extract contact details from a photo of a business card for a lead-capture app. " +
        "Return ONLY a JSON object with exactly these keys: full_name, position, company_name, email, phone, whatsapp, website, country. " +
        "Use null for any field that is not clearly present on the card. Do not guess or invent values. " +
        "phone and whatsapp are separate: only set whatsapp if the card explicitly labels a WhatsApp number. " +
        "Output only the JSON object, with no preamble, explanation, or code fences.",
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg", data: image } },
            { type: "text", text: "Extract the contact details from this business card as JSON." },
          ],
        },
      ],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    let parsed: Record<string, unknown> = {};
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch {
          /* leave empty */
        }
      }
    }

    const pick = (k: string) => {
      const v = parsed[k];
      return typeof v === "string" && v.trim() ? v.trim() : null;
    };
    // Capitalise the first letter of each word in a personal name (e.g. "gerald"
    // -> "Gerald"), leaving the rest as-is so "McDonald" survives.
    const titleCaseName = (s: string | null) =>
      s ? s.split(/(\s+)/).map((w) => (/\p{L}/u.test(w) ? w[0].toUpperCase() + w.slice(1) : w)).join("") : null;

    return NextResponse.json({
      fields: {
        full_name: titleCaseName(pick("full_name")),
        position: pick("position"),
        company_name: pick("company_name"),
        email: pick("email"),
        phone: pick("phone"),
        whatsapp: pick("whatsapp"),
        website: pick("website"),
        country: pick("country"),
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not read the card. Please try again." }, { status: 502 });
  }
}
