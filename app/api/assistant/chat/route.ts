import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAuthedClient } from "@/lib/supabase/authed";
import { allowAiRequest } from "@/lib/rate-limit";
import { ASSISTANT_TOOLS, runAssistantTool, type Citation } from "@/lib/assistant/tools";

export const runtime = "nodejs";

// AI Exhibition Intelligence assistant, slice 2: grounded multi-turn chat.
//
// The model can only answer using data returned by the read-only, RLS-scoped
// tools in lib/assistant/tools.ts (run as the caller, never the service role).
// Chat Q&A uses Haiku to keep cost low. Conversation history is persisted
// best-effort: if the ai_chat migration is not applied yet, the chat still
// answers, it just does not save history. Admin-only while in build.

const MODEL = "claude-haiku-4-5";
const MAX_TOOL_HOPS = 5;

export async function POST(req: Request) {
  const { supabase, user } = await getAuthedClient(req);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!prof?.is_admin) return NextResponse.json({ error: "Not available yet." }, { status: 403 });

  if (!(await allowAiRequest(supabase, "assistant"))) {
    return NextResponse.json({ error: "You have reached the assistant limit for now. Please try again later." }, { status: 429 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The AI assistant is not set up yet." }, { status: 503 });
  }

  let message = "";
  let conversationId: string | null = null;
  let exhibitionId: string | null = null;
  try {
    const body = await req.json();
    message = typeof body?.message === "string" ? body.message.trim() : "";
    conversationId = typeof body?.conversationId === "string" ? body.conversationId : null;
    exhibitionId = typeof body?.exhibitionId === "string" ? body.exhibitionId : null;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!message) return NextResponse.json({ error: "Say something first." }, { status: 400 });
  if (message.length > 2000) message = message.slice(0, 2000);

  // Best-effort: load conversation history (last turns) if the table exists.
  const history: Anthropic.MessageParam[] = [];
  if (conversationId) {
    const { data: prior } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);
    for (const m of prior ?? []) {
      if (m.role === "user" || m.role === "assistant") {
        history.push({ role: m.role, content: String(m.content ?? "") });
      }
    }
  }

  const contextLine = exhibitionId
    ? `The user is currently focused on the exhibition with id "${exhibitionId}". When they say "this exhibition" or "this show", use that id.`
    : "No specific exhibition is selected; use list_exhibitions if the user names one.";

  const system =
    "You are ELOS, ExpoLead OS's exhibition intelligence assistant, embedded in the signed-in user's own workspace. You help a salesperson understand and act on THEIR exhibition data: connections (companies met), follow-ups, opportunities and notes. " +
    contextLine + " " +
    "Rules: answer ONLY from data returned by the tools. Call tools to fetch what you need; never invent companies, numbers, quantities or commitments. If a tool returns nothing, say so plainly. Only cite percentages that get_metrics returns; do not compute your own. " +
    "Distinguish recorded facts from your own suggestions. Be concise and practical for someone deciding what to do next. " +
    "Format in clean markdown: short paragraphs, '## ' headings when helpful, '- ' bullets, and '**bold**' for key company names or figures.";

  const messages: Anthropic.MessageParam[] = [...history, { role: "user", content: message }];
  const citations: Citation[] = [];
  const anthropic = new Anthropic({ apiKey });

  let answer = "";
  try {
    for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
      const resp = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system,
        tools: ASSISTANT_TOOLS,
        messages,
      });
      messages.push({ role: "assistant", content: resp.content });

      if (resp.stop_reason === "tool_use") {
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const block of resp.content) {
          if (block.type === "tool_use") {
            const { result, citations: cts } = await runAssistantTool(block.name, block.input, supabase);
            citations.push(...cts);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(result).slice(0, 12000),
            });
          }
        }
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      answer = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      break;
    }
  } catch (e) {
    console.error("assistant chat: model call failed", e);
    return NextResponse.json({ error: "The assistant could not answer that. Please try again." }, { status: 502 });
  }

  if (!answer) {
    return NextResponse.json({ error: "The assistant could not answer that. Please try again." }, { status: 502 });
  }

  // Dedupe citations by id, cap for the UI.
  const seen = new Set<string>();
  const uniqueCitations = citations.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true))).slice(0, 12);

  // Persist best-effort (no-op if the migration is not applied yet).
  let convId = conversationId;
  try {
    if (!convId) {
      const { data: conv } = await supabase
        .from("ai_conversations")
        .insert({ exhibition_id: exhibitionId, title: message.slice(0, 60) })
        .select("id")
        .single();
      convId = conv?.id ?? null;
    }
    if (convId) {
      await supabase.from("ai_messages").insert([
        { conversation_id: convId, role: "user", content: message },
        { conversation_id: convId, role: "assistant", content: answer, citations: uniqueCitations },
      ]);
      await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
    }
  } catch {
    // history not saved (table missing / transient) — the answer still returns.
  }

  return NextResponse.json({ conversationId: convId, answer, citations: uniqueCitations });
}
