"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Sparkles, Loader2, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/useToast";

// Records a booth conversation and transcribes it with speaker labels via
// Deepgram (/api/transcribe), then either saves the transcript to Notes or
// turns it into an AI summary (/api/summarize). Audio is sent for
// transcription and never stored. The audio-capture piece is deliberately the
// only browser-specific part; the transcribe + summarise steps are shared APIs
// the mobile app will reuse.

type Phase = "idle" | "consent" | "recording" | "transcribing" | "review" | "summarizing" | "summary";

export default function ConversationRecorder({
  supplierId,
  onAppend,
}: {
  supplierId?: string;
  onAppend?: (block: string) => void;
}) {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();

  const [supported, setSupported] = useState(true);
  const [consented, setConsented] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      typeof MediaRecorder !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia;
    if (!ok) setSupported(false);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startRecording() {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      showToast("Microphone access was blocked.", "error");
      setPhase("idle");
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];

    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream);
    } catch {
      showToast("Could not start recording on this device.", "error");
      stream.getTracks().forEach((t) => t.stop());
      setPhase("idle");
      return;
    }
    recorderRef.current = mr;
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      void handleStopped(mr.mimeType);
    };
    mr.start();

    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    setPhase("recording");
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase("transcribing");
    try {
      recorderRef.current?.stop();
    } catch {
      /* onstop handles the rest */
    }
  }

  async function handleStopped(mimeType: string) {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const type = mimeType || "audio/webm";
    const blob = new Blob(chunksRef.current, { type });
    chunksRef.current = [];

    if (!blob.size) {
      showToast("No audio was captured.", "error");
      setPhase("review");
      return;
    }
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": type },
        body: blob,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data?.error ?? "Transcription failed.", "error");
        setTranscript("");
        setPhase("review");
        return;
      }
      setTranscript(data.transcript ?? "");
      setPhase("review");
    } catch {
      showToast("Transcription failed. Please try again.", "error");
      setPhase("review");
    }
  }

  function onRecordClick() {
    if (!consented) {
      setPhase("consent");
      return;
    }
    startRecording();
  }

  async function summarise() {
    const text = transcript.trim();
    if (!text) {
      showToast("Nothing to summarise yet.", "error");
      return;
    }
    setPhase("summarizing");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data?.error ?? "Summary failed.", "error");
        setPhase("review");
        return;
      }
      setSummary(data.summary);
      setPhase("summary");
    } catch {
      showToast("Summary failed. Please try again.", "error");
      setPhase("review");
    }
  }

  async function appendToNotes(text: string, label: string) {
    const value = text.trim();
    if (!value) {
      showToast("Nothing to save yet.", "error");
      return;
    }
    const stamp = new Date().toLocaleDateString();
    const block = `${label} (${stamp}):\n${value}`;

    // Form mode: hand it to the form's Notes field; it saves with the connection.
    if (onAppend) {
      onAppend(block);
      reset();
      showToast("Added to notes.", "success");
      return;
    }

    // DB mode: append directly to the existing connection's notes.
    if (!supplierId) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from("suppliers").select("notes").eq("id", supplierId).single();
    const existing = data?.notes?.trim() ? data.notes.trim() + "\n\n" : "";
    const { error } = await supabase
      .from("suppliers")
      .update({ notes: existing + block })
      .eq("id", supplierId);
    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    reset();
    showToast("Saved to notes.", "success");
    router.refresh();
  }

  const addToNotes = () => appendToNotes(summary, "Conversation summary");
  const saveTranscript = () => appendToNotes(transcript, "Conversation notes");

  function reset() {
    setTranscript("");
    setSummary("");
    setElapsed(0);
    setPhase("idle");
  }

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const btn =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60";

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      {ToastUI}
      <div className="mb-1 flex items-center gap-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
          <Mic className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-sm font-semibold">Capture conversation</h2>
      </div>
      <p className="mb-4 text-xs text-ink-400">
        Records the conversation and transcribes it with speaker labels. Save the transcript to Notes, or turn it into an AI summary. Only the text is kept, no audio is stored.
      </p>

      {/* Fallback: device can't record audio */}
      {!supported ? (
        <div className="space-y-3">
          <div className="flex gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3.5 py-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed text-amber-800">
              Recording isn&rsquo;t supported in this browser. Type or dictate the conversation below (use your keyboard&rsquo;s mic), then save it to Notes.
            </p>
          </div>
          <ManualBox transcript={transcript} setTranscript={setTranscript} onSave={saveTranscript} onSummarise={summarise} phase={phase} saving={saving} btn={btn} />
          {phase === "summary" && (
            <SummaryBlock summary={summary} saving={saving} onAdd={addToNotes} onRedo={summarise} onCancel={reset} btn={btn} />
          )}
        </div>
      ) : phase === "idle" ? (
        <button onClick={onRecordClick} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
          <Mic className="h-4 w-4" />
          Record conversation
        </button>
      ) : phase === "consent" ? (
        <div className="space-y-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">Before you record</p>
          <p className="text-xs leading-relaxed text-emerald-800">
            Make sure everyone in the conversation has agreed to be recorded. Only the text is kept, no audio is stored.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setConsented(true);
                startRecording();
              }}
              className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}
            >
              <Mic className="h-4 w-4" />
              They&rsquo;ve agreed, start
            </button>
            <button onClick={() => setPhase("idle")} className={`${btn} border border-ink-200 text-ink-600 hover:bg-ink-50`}>
              Cancel
            </button>
          </div>
        </div>
      ) : phase === "recording" ? (
        <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" />
            Recording… <span className="tabular-nums font-normal text-rose-500">{mmss}</span>
          </span>
          <button onClick={stopRecording} className={`${btn} bg-slate-900 text-white hover:bg-slate-700`}>
            <Square className="h-3.5 w-3.5" />
            Stop
          </button>
        </div>
      ) : phase === "transcribing" ? (
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Transcribing… this takes a few seconds.
        </div>
      ) : phase === "review" ? (
        <div className="space-y-3">
          <p className="text-xs text-ink-400">Check the transcript, fix anything, then save it to Notes or summarise it.</p>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            placeholder="Transcript will appear here. You can also type or dictate."
            className="w-full resize-y rounded-xl border border-ink-200 p-3 text-sm leading-relaxed outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={saveTranscript} disabled={saving} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save transcript to notes
            </button>
            <button onClick={summarise} disabled={saving} className={`${btn} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>
              <Sparkles className="h-4 w-4" />
              AI summary
            </button>
            <button onClick={() => startRecording()} disabled={saving} className={`${btn} border border-ink-200 text-ink-600 hover:bg-ink-50`}>
              <Mic className="h-4 w-4" />
              Re-record
            </button>
            <button onClick={reset} disabled={saving} className={`${btn} text-ink-500 hover:text-ink-900`}>
              Discard
            </button>
          </div>
        </div>
      ) : phase === "summarizing" ? (
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Summarising…
        </div>
      ) : (
        <SummaryBlock summary={summary} saving={saving} onAdd={addToNotes} onRedo={summarise} onCancel={reset} btn={btn} />
      )}
    </div>
  );
}

function ManualBox({
  transcript,
  setTranscript,
  onSave,
  onSummarise,
  phase,
  saving,
  btn,
}: {
  transcript: string;
  setTranscript: (v: string) => void;
  onSave: () => void;
  onSummarise: () => void;
  phase: Phase;
  saving: boolean;
  btn: string;
}) {
  return (
    <>
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={5}
        placeholder="What did you discuss? Products, quantities, samples, pricing, next steps…"
        className="w-full resize-y rounded-xl border border-ink-200 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
      <div className="flex flex-wrap gap-2">
        <button onClick={onSave} disabled={saving || phase === "summarizing"} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save to notes
        </button>
        <button onClick={onSummarise} disabled={saving || phase === "summarizing"} className={`${btn} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>
          {phase === "summarizing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {phase === "summarizing" ? "Summarising…" : "AI summary"}
        </button>
      </div>
    </>
  );
}

function SummaryBlock({
  summary,
  saving,
  onAdd,
  onRedo,
  onCancel,
  btn,
}: {
  summary: string;
  saving: boolean;
  onAdd: () => void;
  onRedo: () => void;
  onCancel: () => void;
  btn: string;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">Summary</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-900">{summary}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={onAdd} disabled={saving} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {saving ? "Adding…" : "Add to notes"}
        </button>
        <button onClick={onRedo} disabled={saving} className={`${btn} border border-ink-200 text-ink-600 hover:bg-ink-50`}>
          Redo
        </button>
        <button onClick={onCancel} disabled={saving} className={`${btn} text-ink-500 hover:text-ink-900`}>
          Discard
        </button>
      </div>
    </div>
  );
}
