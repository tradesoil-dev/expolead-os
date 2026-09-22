import type Anthropic from "@anthropic-ai/sdk";
import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

// A link back to a real ExpoLead record, so answers can cite their sources.
export type Citation = { type: "connection" | "exhibition"; id: string; label: string };

// Read-only tools the assistant may call. Every executor runs on the caller's
// RLS-scoped client, so it can only ever read that user's own rows. Nothing
// here writes. The deterministic maths (counts, percentages) lives here, not in
// the model, so figures are trustworthy.
export const ASSISTANT_TOOLS: Anthropic.Tool[] = [
  {
    name: "list_exhibitions",
    description: "List the user's exhibitions (id, name, location, dates). Use this to resolve an exhibition the user names into its id before calling other tools.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_metrics",
    description: "Recorded totals and percentages for one exhibition (pass exhibition_id) or across all exhibitions (omit it): connections, visited and visit rate, follow-up coverage, quotation-stage share, high-priority share, opportunities, pipeline value.",
    input_schema: {
      type: "object",
      properties: { exhibition_id: { type: "string", description: "Optional exhibition id to scope to one show." } },
    },
  },
  {
    name: "list_connections",
    description: "List the user's captured connections (companies), newest first, with status, priority, country, follow-up date and a short note excerpt. Filter by exhibition_id, follow_up_status, priority, or visited.",
    input_schema: {
      type: "object",
      properties: {
        exhibition_id: { type: "string" },
        follow_up_status: { type: "string", description: "One of: new, contacted, sample_requested, quotation_requested, under_discussion, closed." },
        priority: { type: "string", description: "high, medium, or low." },
        visited: { type: "boolean" },
        limit: { type: "number", description: "Max rows (default 25, max 50)." },
      },
    },
  },
  {
    name: "list_followups",
    description: "Connections that have a follow-up scheduled (status not closed). Set overdue_only to only those whose follow-up date has passed. Optionally scope to an exhibition_id.",
    input_schema: {
      type: "object",
      properties: {
        exhibition_id: { type: "string" },
        overdue_only: { type: "boolean" },
      },
    },
  },
];

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.slice(0, n).trim() : "");

export async function runAssistantTool(
  name: string,
  input: any,
  supabase: ServerClient,
): Promise<{ result: unknown; citations: Citation[] }> {
  switch (name) {
    case "list_exhibitions": {
      const { data } = await supabase
        .from("exhibitions")
        .select("id, name, location, start_date, end_date")
        .order("start_date", { ascending: false });
      const rows = data ?? [];
      return {
        result: rows.map((e: any) => ({ id: e.id, name: e.name, location: e.location, start: e.start_date, end: e.end_date })),
        citations: rows.map((e: any) => ({ type: "exhibition" as const, id: e.id, label: e.name })),
      };
    }

    case "get_metrics": {
      let q = supabase.from("suppliers").select("priority, follow_up_status, follow_up_date, visited, exhibition_id");
      let exhibitionName: string | null = null;
      if (input?.exhibition_id) {
        q = q.eq("exhibition_id", input.exhibition_id);
        const { data: ex } = await supabase.from("exhibitions").select("name").eq("id", input.exhibition_id).single();
        exhibitionName = ex?.name ?? null;
      }
      const { data: sup } = await q;
      const s = sup ?? [];
      const connections = s.length;
      const visited = s.filter((r: any) => r.visited).length;
      const followUps = s.filter((r: any) => r.follow_up_date && r.follow_up_status !== "closed").length;
      const quotation = s.filter((r: any) => r.follow_up_status === "quotation_requested").length;
      const highPriority = s.filter((r: any) => r.priority === "high").length;

      let oppQ = supabase.from("opportunities").select("deal_value, exhibition");
      if (exhibitionName) oppQ = oppQ.eq("exhibition", exhibitionName);
      const { data: opps } = await oppQ;
      const o = opps ?? [];
      const pipelineValue = o.reduce((n: number, r: any) => n + (Number(r.deal_value) || 0), 0);

      return {
        result: {
          scope: exhibitionName ?? "all exhibitions",
          connections,
          visited,
          visitRatePct: pct(visited, connections),
          followUpsScheduled: followUps,
          followUpCoveragePct: pct(followUps, connections),
          quotationRequested: quotation,
          quotationRatePct: pct(quotation, connections),
          highPriority,
          highPriorityPct: pct(highPriority, connections),
          opportunities: o.length,
          pipelineValue,
          avgDealValue: o.length ? Math.round(pipelineValue / o.length) : 0,
        },
        citations: [],
      };
    }

    case "list_connections": {
      const limit = Math.min(Math.max(Number(input?.limit) || 25, 1), 50);
      let q = supabase
        .from("suppliers")
        .select("id, company_name, country, interest_type, priority, follow_up_status, follow_up_date, visited, notes, summary")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (input?.exhibition_id) q = q.eq("exhibition_id", input.exhibition_id);
      if (input?.follow_up_status) q = q.eq("follow_up_status", input.follow_up_status);
      if (input?.priority) q = q.eq("priority", input.priority);
      if (typeof input?.visited === "boolean") q = q.eq("visited", input.visited);
      const { data } = await q;
      const rows = data ?? [];
      return {
        result: rows.map((r: any) => ({
          id: r.id,
          company: r.company_name,
          country: r.country,
          type: r.interest_type,
          priority: r.priority,
          status: r.follow_up_status,
          follow_up_date: r.follow_up_date,
          visited: r.visited,
          note: clip(r.summary || r.notes, 240),
        })),
        citations: rows.map((r: any) => ({ type: "connection" as const, id: r.id, label: r.company_name ?? "Connection" })),
      };
    }

    case "list_followups": {
      let q = supabase
        .from("suppliers")
        .select("id, company_name, priority, follow_up_status, follow_up_date")
        .not("follow_up_date", "is", null)
        .neq("follow_up_status", "closed")
        .order("follow_up_date", { ascending: true });
      if (input?.exhibition_id) q = q.eq("exhibition_id", input.exhibition_id);
      if (input?.overdue_only) q = q.lt("follow_up_date", new Date().toISOString().slice(0, 10));
      const { data } = await q;
      const rows = data ?? [];
      return {
        result: rows.map((r: any) => ({
          id: r.id,
          company: r.company_name,
          priority: r.priority,
          status: r.follow_up_status,
          follow_up_date: r.follow_up_date,
        })),
        citations: rows.map((r: any) => ({ type: "connection" as const, id: r.id, label: r.company_name ?? "Connection" })),
      };
    }

    default:
      return { result: { error: `Unknown tool: ${name}` }, citations: [] };
  }
}
