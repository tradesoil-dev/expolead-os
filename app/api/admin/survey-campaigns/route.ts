import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/survey-campaigns";
import { CAMPAIGNS } from "@/lib/survey-v2";

// Admin: create a public survey link for a show, and open or close it.
// Writes the server-only survey_campaigns table (migration 0058).

export const dynamic = "force-dynamic";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const exhibition = clip(body.exhibition, 80);
  const label = clip(body.label, 80);
  const slug = slugify(clip(body.slug, 80) || label);
  if (!exhibition) return NextResponse.json({ error: "Add the exhibition name." }, { status: 400 });
  if (!label) return NextResponse.json({ error: "Add the survey name, e.g. Gulfood 2027." }, { status: 400 });
  if (slug.length < 3) return NextResponse.json({ error: "The link needs at least 3 letters or numbers." }, { status: 400 });

  const { error } = await g.admin.from("survey_campaigns").insert({ slug, exhibition, label, open: true, has_assets: false });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "A survey with this name or link already exists." }, { status: 409 });
    if (error.code === "42P01") return NextResponse.json({ error: "Run migration 0058 in Supabase first." }, { status: 500 });
    return NextResponse.json({ error: "Could not create the survey." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, slug });
}

// Delete a survey link for good. Only a closed survey with no answers, so a
// live link or collected answers can never be lost by a mis-click. The
// built-in SIAL Paris survey (also defined in code) cannot be deleted.
export async function DELETE(req: NextRequest) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  const slug = clip(req.nextUrl.searchParams.get("slug"), 80);
  if (!slug) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (CAMPAIGNS[slug]) return NextResponse.json({ error: "This is a built-in survey and cannot be deleted. Close it instead." }, { status: 400 });

  const { data: row } = await g.admin.from("survey_campaigns").select("slug, open").eq("slug", slug).maybeSingle();
  if (!row) return NextResponse.json({ error: "Survey not found." }, { status: 404 });
  if (row.open) return NextResponse.json({ error: "Close the survey before deleting it." }, { status: 400 });

  const { count } = await g.admin.from("survey_responses").select("id", { count: "exact", head: true }).eq("campaign", slug);
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: `This survey has ${count} ${count === 1 ? "answer" : "answers"}. Keep it closed, or archive and delete the answers first.` }, { status: 409 });
  }

  const { error } = await g.admin.from("survey_campaigns").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: "Could not delete the survey." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const slug = clip(body.slug, 80);
  if (!slug || typeof body.open !== "boolean") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  // Upsert so a survey that so far only existed in code can be closed too.
  const { data: existing } = await g.admin.from("survey_campaigns").select("slug").eq("slug", slug).maybeSingle();
  const { error } = existing
    ? await g.admin.from("survey_campaigns").update({ open: body.open }).eq("slug", slug)
    : { error: { code: "missing" } };
  if (error) return NextResponse.json({ error: error.code === "missing" ? "Survey not found. Run migration 0058 first." : "Could not update the survey." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
