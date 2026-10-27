import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { requireAdmin } from "@/lib/admin-guard";
import { toCsv } from "@/lib/export/csv";
import { cleanAnswersV2 } from "@/lib/survey-v2";
import { getCampaigns } from "@/lib/survey-campaigns";
import { ARCHIVE_HEADERS, archiveCsvRow, retentionCutoff } from "@/lib/survey-archive";

// Admin: anonymised survey archive (migration 0058).
//   GET    ?scope=old|all  download an anonymised CSV of public survey answers
//   DELETE ?confirm=yes    delete answers older than 24 months (Privacy Notice s9)
//   POST                   upload archive rows again (from a downloaded file)

export const dynamic = "force-dynamic";

const ROLES = new Set(["exhibit", "visit", "both"]);
const MAX_UPLOAD = 5000;

export async function GET(req: NextRequest) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  const scope = req.nextUrl.searchParams.get("scope") === "old" ? "old" : "all";
  const campaigns = await getCampaigns();
  let q = g.admin.from("survey_responses").select("campaign, source, role_show, answers, created_at").order("created_at", { ascending: true }).limit(10000);
  if (scope === "old") q = q.lt("created_at", retentionCutoff().toISOString());
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "Could not read the survey answers." }, { status: 500 });

  const rows = (data ?? []).map((r) =>
    archiveCsvRow({
      campaign: campaigns[r.campaign]?.label ?? r.campaign,
      source: r.source,
      role: r.role_show,
      month: String(r.created_at).slice(0, 7),
      answers: r.answers,
    }),
  );
  const name = `expolead-survey-archive-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(toCsv(ARCHIVE_HEADERS, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(req: NextRequest) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  if (req.nextUrl.searchParams.get("confirm") !== "yes") return NextResponse.json({ error: "Confirm first." }, { status: 400 });
  const { data, error } = await g.admin.from("survey_responses").delete().lt("created_at", retentionCutoff().toISOString()).select("id");
  if (error) return NextResponse.json({ error: "Could not delete the old answers." }, { status: 500 });
  return NextResponse.json({ deleted: data?.length ?? 0 });
}

export async function POST(req: NextRequest) {
  const g = await requireAdmin();
  if (!g.ok) return g.response;
  let body: { rows?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Could not read the file." }, { status: 400 });
  }
  if (!Array.isArray(body.rows) || body.rows.length === 0) return NextResponse.json({ error: "No rows found in the file." }, { status: 400 });
  if (body.rows.length > MAX_UPLOAD) return NextResponse.json({ error: `Up to ${MAX_UPLOAD} rows per upload.` }, { status: 400 });

  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const valid: Record<string, unknown>[] = [];
  let invalid = 0;
  for (const raw of body.rows) {
    const r = (raw ?? {}) as Record<string, unknown>;
    const campaign = s(r.campaign, 80);
    const source = s(r.source, 40).toLowerCase().replace(/[^a-z0-9_-]/g, "") || null;
    const role = s(r.role, 10);
    const month = s(r.month, 7);
    let answers: unknown = null;
    try {
      answers = JSON.parse(s(r.answers, 20000));
    } catch {
      answers = null;
    }
    const clean = cleanAnswersV2(answers, "public");
    if (!campaign || !ROLES.has(role) || !/^\d{4}-\d{2}$/.test(month) || !clean || clean.role_show !== role) {
      invalid++;
      continue;
    }
    const key = createHash("sha256").update(JSON.stringify([campaign, source, role, month, clean])).digest("hex");
    valid.push({ archive_key: key, campaign, source, role_show: role, answered_month: month, answers: clean });
  }
  if (!valid.length) return NextResponse.json({ added: 0, duplicates: 0, invalid });

  const { data, error } = await g.admin.from("survey_archive").upsert(valid, { onConflict: "archive_key", ignoreDuplicates: true }).select("id");
  if (error) {
    if (error.code === "42P01") return NextResponse.json({ error: "Run migration 0058 in Supabase first." }, { status: 500 });
    return NextResponse.json({ error: "Could not save the archive." }, { status: 500 });
  }
  const added = data?.length ?? 0;
  return NextResponse.json({ added, duplicates: valid.length - added, invalid });
}
