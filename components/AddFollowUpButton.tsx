"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import DatePicker from "@/components/DatePicker";

type Choice = {
  id: string;
  company_name: string;
  follow_up_date: string | null;
  follow_up_note: string | null;
};

// Quick "schedule the next follow-up for any connection" entry point on the
// Follow-ups tab. Fills the gap where a connection captured with no follow-up
// yet never appears on this tab; pick it here, set a date + note, and it shows.
// Writes the same follow_up_date / follow_up_note the connection form uses.
export default function AddFollowUpButton({ connections }: { connections: Choice[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Choice | null>(null);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const [date, setDate] = useState(tomorrow);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  // Portal target is only available on the client; gate to avoid an SSR mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? connections.filter((c) => c.company_name.toLowerCase().includes(q)) : connections;
    return list.slice(0, 8);
  }, [connections, query]);

  function close() {
    setOpen(false);
    setQuery("");
    setSelected(null);
    setDate(tomorrow);
    setNote("");
  }

  function pick(c: Choice) {
    setSelected(c);
    if (c.follow_up_date) setDate(c.follow_up_date);
    if (c.follow_up_note) setNote(c.follow_up_note);
  }

  async function save() {
    if (!isSupabaseConfigured || !selected || !date) return;
    setSaving(true);
    await createClient()
      .from("suppliers")
      .update({ follow_up_date: date, follow_up_note: note.trim() || null })
      .eq("id", selected.id);
    setSaving(false);
    close();
    router.refresh();
  }

  const inp = "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
      >
        <span className="text-base leading-none">+</span> Add follow-up
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Add a follow-up</h2>
              <button onClick={close} aria-label="Close" className="text-ink-400 hover:text-ink-700">✕</button>
            </div>

            {!selected ? (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-slate-600">Pick a connection</label>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search company name"
                  className={inp}
                />
                <ul className="mt-2 max-h-56 divide-y divide-ink-100 overflow-auto rounded-lg border border-ink-200">
                  {connections.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-ink-400">
                      No connections yet. Add a connection first.
                    </li>
                  ) : results.length === 0 ? (
                    <li className="px-3 py-6 text-center text-xs text-ink-400">No connections match that search.</li>
                  ) : (
                    results.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => pick(c)}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-ink-50"
                        >
                          <span className="truncate text-slate-800">{c.company_name}</span>
                          {c.follow_up_date && (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              has follow-up
                            </span>
                          )}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2">
                  <span className="truncate text-sm font-medium text-emerald-900">{selected.company_name}</span>
                  <button onClick={() => setSelected(null)} className="shrink-0 text-xs font-medium text-emerald-700 hover:underline">
                    Change
                  </button>
                </div>

                {selected.follow_up_date && (
                  <p className="text-xs text-amber-600">
                    This connection already has a follow-up on {new Date(selected.follow_up_date).toLocaleDateString()}. Saving will update it.
                  </p>
                )}

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Follow-up date</label>
                  <DatePicker value={date} onChange={setDate} />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Note (optional)</label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Next action, e.g. Send quotation"
                    className={inp}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={save}
                    disabled={saving || !date}
                    className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save follow-up"}
                  </button>
                  <button onClick={close} className="text-sm text-ink-400 hover:text-ink-700">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
