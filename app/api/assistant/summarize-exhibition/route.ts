import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAuthedClient } from "@/lib/supabase/authed";
import { allowAiRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";

// AI Exhibition Intelligence assistant, slice 1: summarise ONE exhibition.
//
// Design: the FACTS (counts, pipeline, connection list) are computed here in
// code from the user's own rows, and only the OBSERVATIONS narrative is asked
// of the model. That keeps recorded facts and AI opinion cleanly separated and
// stops the model from inventing numbers. Everything is fetched with the
// caller's RLS-scoped client (never the service role), so it can only ever read
// what that user is allowed to see.
//
// While we build, this is gated to admin accounts only.

// Prefer the stronger model for a good recap; fall back if it is unavailable
// on the account so a first run never hard-fails on a model id.
const MODELS = ["claude-sonnet-5", "claude-haiku-4-5"] as const;

type Facts = {
  connections: number;
  visited: number;
  remaining: number;
  followUpsScheduled: number;
  pipelineValue: number;
  opportunities: number;
  quotationRequested: number;
  highPriority: number;
  avgDealValue: number;
  // Percentages (0-100, rounded) for an at-a-glance analytical read.
  metrics: {
    visitRate: number;
    followUpCoverage: number;
    quotationRate: number;
    highPriorityShare: number;
  };
  connectionList: { company: string; status: string; visited: boolean; priority: string; country: string | null }[];
};

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

function clip(s: unknown, n: number): string {
  return typeof s === "string" ? s.slice(0, n).trim() : "";
}

export async function POST(req: Request) {
  const { supabase, user } = await getAuthedClient(req);
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Admin-only while the feature is in build.
  const { data: prof } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!prof?.is_admin) {
    return NextResponse.json({ error: "Not available yet." }, { status: 403 });
  }

  if (!(await allowAiRequest(supabase, "assistant_month"))) {
    return NextResponse.json(
      { error: "You have reached your monthly ELOS limit. It resets soon." },
      { status: 429 },
    );
  }
  if (!(await allowAiRequest(supabase, "assistant"))) {
    return NextResponse.json(
      { error: "You are using ELOS very quickly. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The AI assistant is not set up yet. Add ANTHROPIC_API_KEY in Vercel, then try again." },
      { status: 503 },
    );
  }

  let exhibitionId = "";
  try {
    const body = await req.json();
    exhibitionId = typeof body?.exhibitionId === "string" ? body.exhibitionId : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!exhibitionId) {
    return NextResponse.json({ error: "No exhibition specified." }, { status: 400 });
  }

  // All queries below run under the caller's session, so RLS restricts them to
  // this user's own rows. A missing/foreign id simply returns nothing.
  const { data: exhibition } = await supabase
    .from("exhibitions")
    .select("id, name, location, start_date, end_date")
    .eq("id", exhibitionId)
    .single();
  if (!exhibition) {
    return NextResponse.json({ error: "Exhibition not found." }, { status: 404 });
  }

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select(
      "company_name, country, interest_type, priority, follow_up_status, follow_up_date, visited, booth_number, hall, notes, summary, contacts(full_name, position), products(name, application)",
    )
    .eq("exhibition_id", exhibitionId);

  const { data: meetings } = await supabase
    .from("meetings")
    .select("notes, met_on")
    .eq("exhibition_id", exhibitionId);

  const { data: opps } = await supabase
    .from("opportunities")
    .select("name, status, deal_value, exhibition, destination_market, products:opportunity_products(name, quantity, quantity_unit)")
    .eq("exhibition", exhibition.name);

  const sup = suppliers ?? [];
  const opportunities = opps ?? [];

  // Deterministic facts (never the model's job).
  const connections = sup.length;
  const visited = sup.filter((s: any) => s.visited).length;
  const followUpsScheduled = sup.filter((s: any) => s.follow_up_date && s.follow_up_status !== "closed").length;
  const quotationRequested = sup.filter((s: any) => s.follow_up_status === "quotation_requested").length;
  const highPriority = sup.filter((s: any) => s.priority === "high").length;
  const pipelineValue = opportunities.reduce((n: number, o: any) => n + (Number(o.deal_value) || 0), 0);
  const facts: Facts = {
    connections,
    visited,
    remaining: connections - visited,
    followUpsScheduled,
    pipelineValue,
    opportunities: opportunities.length,
    quotationRequested,
    highPriority,
    avgDealValue: opportunities.length > 0 ? Math.round(pipelineValue / opportunities.length) : 0,
    metrics: {
      visitRate: pct(visited, connections),
      followUpCoverage: pct(followUpsScheduled, connections),
      quotationRate: pct(quotationRequested, connections),
      highPriorityShare: pct(highPriority, connections),
    },
    connectionList: sup.map((s: any) => ({
      company: s.company_name ?? "(no name)",
      status: s.follow_up_status ?? "new",
      visited: !!s.visited,
      priority: s.priority ?? "medium",
      country: s.country ?? null,
    })),
  };

  if (facts.connections === 0) {
    return NextResponse.json({
      facts,
      observations: "There are no connections captured for this exhibition yet, so there is nothing to summarise. Capture the companies you met and add notes, then ask again.",
      model: null,
    });
  }

  // Compact dossier for the model. Cap sizes so a big show cannot blow up the
  // prompt (and cost). Notes/summaries are clipped, connections capped.
  const dossierConnections = sup.slice(0, 40).map((s: any) => {
    const contacts = (s.contacts ?? []).map((c: any) => [c.full_name, c.position].filter(Boolean).join(", ")).filter(Boolean);
    const products = (s.products ?? []).map((p: any) => p.name).filter(Boolean);
    return [
      `Company: ${s.company_name ?? "(no name)"}${s.country ? ` (${s.country})` : ""}`,
      `Type: ${s.interest_type ?? "?"} | Priority: ${s.priority ?? "?"} | Status: ${s.follow_up_status ?? "?"} | ${s.visited ? "Visited" : "Not visited"}`,
      contacts.length ? `Contacts: ${contacts.join("; ")}` : "",
      products.length ? `Products: ${products.join("; ")}` : "",
      s.summary ? `Summary: ${clip(s.summary, 600)}` : "",
      s.notes ? `Notes: ${clip(s.notes, 600)}` : "",
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  const dossierOpps = opportunities.slice(0, 30).map((o: any) => {
    const items = (o.products ?? []).map((p: any) => [p.name, p.quantity, p.quantity_unit].filter(Boolean).join(" ")).filter(Boolean);
    return `Opportunity: ${o.name ?? "(no name)"} | Status: ${o.status ?? "?"}${o.destination_market ? ` | Market: ${o.destination_market}` : ""}${items.length ? ` | Items: ${items.join("; ")}` : ""}`;
  }).join("\n");

  const dossierMeetings = (meetings ?? []).slice(0, 20).map((m: any) => clip(m.notes, 400)).filter(Boolean).join("\n---\n");

  const factLine =
    `Recorded totals: ${facts.connections} connections, ${facts.visited} visited (${facts.metrics.visitRate}%), ` +
    `${facts.followUpsScheduled} follow-ups scheduled (${facts.metrics.followUpCoverage}% coverage), ` +
    `${facts.quotationRequested} at quotation stage (${facts.metrics.quotationRate}%), ` +
    `${facts.highPriority} high priority (${facts.metrics.highPriorityShare}%), ` +
    `${facts.opportunities} opportunities, pipeline ${facts.pipelineValue}.`;

  const system =
    "You are ELOS, ExpoLead OS's exhibition intelligence assistant. You are given structured data about ONE trade exhibition that belongs to the signed-in user: the companies they captured, notes, any linked opportunities, and the recorded totals with percentages. " +
    "Write a concise, analytical briefing with exactly two markdown sections, each introduced by a level-2 heading:\n" +
    "## Observations\n(3 to 6 bullet points on what stands out: strong leads, momentum, gaps, and risks. Weave in the given percentages where they make a point, e.g. 'only 40% have a follow-up scheduled'. Reference companies by name.)\n" +
    "## Prioritise next\n(3 to 6 bullet points of concrete next actions, most important first.)\n" +
    "Rules: use ONLY the data provided; never invent company names, numbers, quantities, or commitments; only cite percentages that are given, do not compute new ones; if the data is thin, say what is missing instead of guessing. " +
    "These are observations and suggestions, not recorded facts. Use markdown: '## ' headings, '- ' bullets, and '**bold**' for the few most important names or figures. Keep it practical for a salesperson. No preamble before the first heading.";

  const content =
    `Exhibition: ${exhibition.name}${exhibition.location ? ` (${exhibition.location})` : ""}\n` +
    `${factLine}\n\n` +
    `CONNECTIONS:\n${dossierConnections}\n\n` +
    (dossierOpps ? `OPPORTUNITIES:\n${dossierOpps}\n\n` : "") +
    (dossierMeetings ? `MEETING NOTES:\n${dossierMeetings}\n\n` : "") +
    "Write the two-section briefing now.";

  const anthropic = new Anthropic({ apiKey });
  let observations = "";
  let usedModel: string | null = null;
  let lastErr: unknown = null;
  for (const model of MODELS) {
    try {
      const msg = await anthropic.messages.create({
        model,
        max_tokens: 700,
        system,
        messages: [{ role: "user", content }],
      });
      observations = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      if (observations) {
        usedModel = model;
        break;
      }
    } catch (e) {
      lastErr = e;
    }
  }

  if (!observations) {
    console.error("summarize-exhibition: model call failed", lastErr);
    return NextResponse.json({ error: "Could not generate a summary. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ facts, observations, model: usedModel });
}
