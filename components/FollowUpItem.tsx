"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import DatePicker from "@/components/DatePicker";
import Select from "@/components/Select";
import MarkFollowUpDone from "@/components/MarkFollowUpDone";
import { MEETING_TYPES, meetingTypeLabel } from "@/lib/types";

export type FollowUpMeeting = { id: string; met_on: string; notes: string | null; meeting_type: string | null };

// An interactive Follow-ups row for a connection: expand to see the interaction
// history, log a call/meeting, and advance (or clear) the next follow-up.
export default function FollowUpItem({
  supplierId,
  label,
  href,
  date,
  noteInitial,
  meetings,
  pill,
}: {
  supplierId: string;
  label: string;
  href: string;
  date: string;
  noteInitial: string;
  meetings: FollowUpMeeting[];
  pill: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(noteInitial);

  const today = new Date().toISOString().slice(0, 10);
  const [logOpen, setLogOpen] = useState(false);
  const [logDate, setLogDate] = useState(today);
  const [logType, setLogType] = useState("call");
  const [logNotes, setLogNotes] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  const [nextDate, setNextDate] = useState(date);
  const [nextNote, setNextNote] = useState(noteInitial);
  const [savingNext, setSavingNext] = useState(false);

  async function logInteraction() {
    if (!isSupabaseConfigured || !logNotes.trim()) return;
    setSavingLog(true);
    await createClient().from("meetings").insert({ supplier_id: supplierId, met_on: logDate || today, meeting_type: logType, notes: logNotes.trim() });
    setSavingLog(false);
    setLogNotes("");
    setLogType("call");
    setLogOpen(false);
    router.refresh();
  }

  async function saveNext() {
    if (!isSupabaseConfigured) return;
    setSavingNext(true);
    await createClient().from("suppliers").update({ follow_up_date: nextDate || null, follow_up_note: nextNote.trim() || null }).eq("id", supplierId);
    setSavingNext(false);
    setNote(nextNote);
    router.refresh();
  }

  const inp = "w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500";

  return (
    <li className="px-4 py-3 transition-colors hover:bg-ink-50">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <button onClick={() => setExpanded((v) => !v)} className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label={expanded ? "Collapse" : "Expand"}>
            <svg className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link href={href} className="truncate text-sm font-medium text-slate-900 hover:text-emerald-700">{label}</Link>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Connection</span>
              {meetings.length > 0 && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">{meetings.length} touch{meetings.length > 1 ? "es" : ""}</span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {note?.trim() ? note : <span className="italic text-slate-400">No next action set</span>}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-8 sm:pl-0">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pill}`}>{new Date(date).toLocaleDateString()}</span>
          <MarkFollowUpDone kind="Connection" id={supplierId} />
        </div>
      </div>

      {expanded && (
        <div className="ml-8 mt-3 space-y-4 border-l-2 border-emerald-100 pl-4">
          {/* Interaction history */}
          <div>
            <p className="text-xs font-semibold text-slate-600">History</p>
            {meetings.length === 0 ? (
              <p className="mt-1 text-xs text-slate-400">No interactions logged yet.</p>
            ) : (
              <ul className="mt-1.5 space-y-1.5">
                {meetings.map((m) => (
                  <li key={m.id} className="text-xs leading-relaxed text-slate-600">
                    <span className="mr-1.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">{meetingTypeLabel(m.meeting_type)}</span>
                    <span className="font-semibold text-slate-700">{new Date(m.met_on).toLocaleDateString()}</span>
                    {m.notes ? <span>: {m.notes}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Log an interaction (call / meeting / touch) */}
          {logOpen ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <div className="w-40"><DatePicker value={logDate} onChange={setLogDate} /></div>
                <div className="w-44"><Select value={logType} onChange={setLogType} size="sm" options={MEETING_TYPES} /></div>
              </div>
              <textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} rows={2} placeholder="What was discussed? e.g. Wants samples, target price 5% lower" className={`${inp} resize-y`} />
              <div className="flex items-center gap-2">
                <button onClick={logInteraction} disabled={savingLog || !logNotes.trim()} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{savingLog ? "Saving…" : "Save interaction"}</button>
                <button onClick={() => setLogOpen(false)} className="text-xs text-ink-400 hover:text-ink-700">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setLogOpen(true)} className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100">+ Log interaction</button>
          )}

          {/* Advance the next follow-up */}
          <div>
            <p className="text-xs font-semibold text-slate-600">Next follow-up</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <div className="w-40"><DatePicker value={nextDate} onChange={setNextDate} /></div>
              <input value={nextNote} onChange={(e) => setNextNote(e.target.value)} placeholder="Next action" className={`min-w-0 flex-1 ${inp}`} />
              <button onClick={saveNext} disabled={savingNext} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{savingNext ? "…" : "Update"}</button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
