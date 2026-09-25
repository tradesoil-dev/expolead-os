"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Bot, X, Send, Plus, Loader2, Sparkles, Minus, Clock, History, ChevronLeft, MessageSquare } from "lucide-react";
import AiMarkdown from "@/components/AiMarkdown";

type Citation = { type: "connection" | "exhibition"; id: string; label: string };
type Msg = { role: "user" | "assistant"; content: string; citations?: Citation[] };
type Exh = { id: string; name: string };
type Conv = { id: string; title: string | null; updated_at: string };
type Usage = { remaining: number; limit: number };

// Floating "Ask ELOS" button that opens a right-side chat drawer. ELOS answers
// only from the user's own data (grounded, read-only) via /api/assistant/chat.
// Admin-only while in build (rendered from the app layout behind is_admin).
// ELOS uses an indigo accent so it reads as its own AI surface, distinct from
// the emerald app chrome.
export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [exhibitions, setExhibitions] = useState<Exh[]>([]);
  const [exhibitionId, setExhibitionId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // Load the user's exhibitions once, when the drawer is first opened.
  useEffect(() => {
    if (!open || exhibitions.length > 0 || !isSupabaseConfigured) return;
    (async () => {
      const { data } = await createClient()
        .from("exhibitions")
        .select("id, name")
        .order("start_date", { ascending: false });
      setExhibitions((data ?? []) as Exh[]);
    })();
  }, [open, exhibitions.length]);

  // Resume the most recent saved conversation when the drawer opens with an
  // empty thread (e.g. after a page refresh). While the app stays open the
  // in-memory thread is kept, so this only rehydrates when there is nothing.
  useEffect(() => {
    if (!open || !isSupabaseConfigured || messages.length > 0 || conversationId) return;
    (async () => {
      const supabase = createClient();
      const { data: conv } = await supabase
        .from("ai_conversations")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!conv) return;
      const { data: msgs } = await supabase
        .from("ai_messages")
        .select("role, content, citations")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });
      if (msgs && msgs.length > 0) {
        setConversationId(conv.id);
        setMessages(msgs.map((m: any) => ({ role: m.role, content: m.content, citations: m.citations ?? [] })));
      }
    })();
  }, [open]);

  // Refresh the "questions left this hour" counter when the drawer opens.
  useEffect(() => {
    if (!open) return;
    refreshUsage();
  }, [open]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function refreshUsage() {
    try {
      const res = await fetch("/api/assistant/usage");
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      if (data?.hourly && typeof data.hourly.remaining === "number") setUsage(data.hourly as Usage);
    } catch {
      // Counter is a nicety; ignore failures.
    }
  }

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || sending) return;
    setError(null);
    setInput("");
    setView("chat");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setSending(true);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, conversationId, exhibitionId: exhibitionId || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "The assistant could not answer that.");
        return;
      }
      setConversationId(data.conversationId ?? conversationId);
      setMessages((m) => [...m, { role: "assistant", content: data.answer, citations: data.citations ?? [] }]);
    } catch {
      setError("Could not reach the assistant. Please try again.");
    } finally {
      setSending(false);
      refreshUsage();
    }
  }

  function newChat() {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setView("chat");
  }

  async function openHistory() {
    setView("history");
    setError(null);
    if (!isSupabaseConfigured) return;
    setLoadingHistory(true);
    try {
      const { data } = await createClient()
        .from("ai_conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);
      setConversations((data ?? []) as Conv[]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function openConversation(id: string) {
    const supabase = createClient();
    const { data: msgs } = await supabase
      .from("ai_messages")
      .select("role, content, citations")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    setConversationId(id);
    setMessages((msgs ?? []).map((m: any) => ({ role: m.role, content: m.content, citations: m.citations ?? [] })));
    setError(null);
    setView("chat");
  }

  const selectedExhibition = exhibitions.find((e) => e.id === exhibitionId);
  const suggestions = selectedExhibition
    ? [
        `Summarise ${selectedExhibition.name}`,
        `Who should I follow up with first at ${selectedExhibition.name}?`,
        `Which connections at ${selectedExhibition.name} have I not visited?`,
        "What are my overdue follow-ups?",
        "Show my highest-priority connections",
      ]
    : [
        "Which leads haven't I followed up with?",
        "What are my overdue follow-ups?",
        "Show my highest-priority connections",
        "What is my total pipeline value?",
        "Which connections have I not visited yet?",
      ];

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open ELOS assistant"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-700"
        >
          <Bot className="h-5 w-5" /> Ask ELOS
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20 sm:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:w-[440px]">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Bot className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">ELOS</p>
                  <p className="text-[11px] text-ink-400">Your ExpoLead OS assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={openHistory} title="Chat history" aria-label="Chat history" className={`rounded-lg p-1.5 hover:bg-ink-50 ${view === "history" ? "text-indigo-600" : "text-ink-500"}`}>
                  <History className="h-4 w-4" />
                </button>
                <button type="button" onClick={newChat} title="New chat" className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-ink-500 hover:bg-ink-50">
                  <Plus className="h-3.5 w-3.5" /> New
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Minimize" title="Minimize (keeps this chat)" className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-50">
                  <Minus className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" title="Close (keeps this chat)" className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-50">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {view === "history" ? (
              /* History browser */
              <div className="flex-1 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  className="flex w-full items-center gap-1.5 border-b border-ink-100 px-4 py-2.5 text-xs font-medium text-ink-500 hover:bg-ink-50"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back to chat
                </button>
                {loadingHistory ? (
                  <div className="flex items-center gap-2 px-4 py-4 text-sm text-ink-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading your chats…
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-ink-400">No past chats yet. Ask ELOS something and it will appear here.</p>
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {conversations.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => openConversation(c.id)}
                          className={`flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-ink-50 ${c.id === conversationId ? "bg-indigo-50/60" : ""}`}
                        >
                          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-ink-900">{c.title || "Untitled chat"}</span>
                            <span className="block text-[11px] text-ink-400">
                              {new Date(c.updated_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <>
                {/* Context selector */}
                <div className="border-b border-ink-100 px-4 py-2">
                  <label className="flex items-center gap-2 text-xs text-ink-500">
                    Context
                    <select
                      value={exhibitionId}
                      onChange={(e) => setExhibitionId(e.target.value)}
                      className="flex-1 rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-800 outline-none focus:border-indigo-500"
                    >
                      <option value="">All exhibitions</option>
                      {exhibitions.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Thread */}
                <div ref={threadRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                  {messages.length === 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-ink-500">
                        Ask ELOS about your connections, follow-ups, opportunities and shows. It answers only from your own data.
                      </p>
                      <p className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-100">
                        <Clock className="h-3 w-3 shrink-0" />
                        {usage ? `${usage.remaining} of ${usage.limit} questions left this hour` : "You can ask up to 30 questions an hour."}
                      </p>
                      <div className="space-y-1.5">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => send(s)}
                            className="flex w-full items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-left text-sm text-indigo-800 transition-colors hover:bg-indigo-100"
                          >
                            <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-600" /> {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((m, i) =>
                    m.role === "user" ? (
                      <div key={i} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-3.5 py-2 text-sm text-white">
                          {m.content}
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="max-w-full rounded-2xl rounded-bl-sm border border-ink-100 bg-white px-3.5 py-2.5">
                        <AiMarkdown text={m.content} />
                        {m.citations && m.citations.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-ink-50 pt-2">
                            {m.citations.map((c) => (
                              <Link
                                key={`${c.type}-${c.id}`}
                                href={c.type === "exhibition" ? `/exhibitions/${c.id}` : `/connections/${c.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100"
                              >
                                {c.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ),
                  )}

                  {sending && (
                    <div className="flex items-center gap-2 text-sm text-ink-400">
                      <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                    </div>
                  )}
                  {error && <p className="text-sm font-medium text-amber-700">{error}</p>}
                </div>

                {/* Input */}
                <div className="border-t border-ink-100 p-3">
                  {messages.length > 0 && usage && (
                    <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                      <Clock className="h-3 w-3 shrink-0" /> {usage.remaining} of {usage.limit} questions left this hour
                    </p>
                  )}
                  <form
                    onSubmit={(e) => { e.preventDefault(); send(input); }}
                    className="flex items-end gap-2"
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                      }}
                      rows={1}
                      placeholder="Ask about your shows…"
                      className="max-h-32 flex-1 resize-none rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={sending || !input.trim()}
                      aria-label="Send"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                  <p className="mt-1.5 px-1 text-[10px] text-ink-400">
                    AI answers from your data and can be wrong. Check the linked records before acting.
                  </p>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
