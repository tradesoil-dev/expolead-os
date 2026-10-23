"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2, Send, MessageSquareText, X } from "lucide-react";
import { useConfirm } from "@/components/useConfirm";
import { useToast } from "@/components/useToast";
import ExhibitionPicker, { campaignFor, type LibraryShow } from "@/components/ExhibitionPicker";

export type PilotRow = {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  pilot_invited_at: string | null;
  early_access_until: string | null;
  elos_enabled: boolean;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
};

export type LatestCheckin = { campaign: string; sent_at: string; answered_at: string | null };

function fmt(s: string | null) {
  return s ? new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

function accessStatus(until: string | null): { label: string; cls: string } {
  if (!until) return { label: "No end date", cls: "bg-slate-100 text-slate-600" };
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return { label: "Expired", cls: "bg-slate-100 text-slate-500" };
  const days = Math.ceil(ms / 86400000);
  if (days <= 7) return { label: `Ends in ${days}d`, cls: "bg-amber-100 text-amber-800" };
  return { label: `Active · ${days}d left`, cls: "bg-emerald-50 text-emerald-700" };
}

// Tracker of everyone invited as a pilot: when sent, when access ends, whether
// they accepted (set their password / confirmed) and last active. Each row can
// be revoked (clears their access and removes them from this list), and a
// pilot who has not accepted yet can be sent a fresh invite.
export default function PilotInvitesList({
  rows,
  checkins = {},
  library = [],
}: {
  rows: PilotRow[];
  checkins?: Record<string, LatestCheckin>;
  library?: LibraryShow[];
}) {
  const router = useRouter();
  const { confirm, ConfirmUI } = useConfirm();
  const { showToast, ToastUI } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [checkinFor, setCheckinFor] = useState<PilotRow | null>(null);
  const [exhibition, setExhibition] = useState("");
  const [campaign, setCampaign] = useState("");
  const [campaignEdited, setCampaignEdited] = useState(false);
  const [sending, setSending] = useState(false);

  function openCheckin(r: PilotRow) {
    setExhibition("");
    setCampaign("");
    setCampaignEdited(false);
    setCheckinFor(r);
  }

  // Picking a library show fills the campaign as "<name> <year>" unless the
  // admin has typed their own campaign name.
  function pickShow(show: LibraryShow | null) {
    if (campaignEdited) return;
    setCampaign(show ? campaignFor(show) : "");
  }

  async function sendCheckin(confirmRepeat = false): Promise<void> {
    if (!checkinFor || !exhibition.trim()) return;
    const r = checkinFor;
    setSending(true);
    try {
      const res = await fetch("/api/admin/send-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: r.id,
          exhibition: exhibition.trim(),
          campaign: campaign.trim() || exhibition.trim(),
          confirm_repeat: confirmRepeat,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && data?.needsConfirm) {
        setSending(false);
        const ok = await confirm(
          `${r.email} was already sent this campaign's check-in on ${fmt(data.sentAt)}${data.answered ? " and has answered it" : ""}. Send another one anyway?`,
          { title: "Send again?", confirmLabel: "Send again" },
        );
        if (ok) return sendCheckin(true);
        return;
      }
      if (!res.ok) throw new Error(data?.error || "Could not send the check-in.");
      showToast(`Check-in sent to ${r.email}.`, "success");
      setCheckinFor(null);
      router.refresh();
    } catch (e: any) {
      showToast(e.message || "Could not send the check-in.", "error");
    } finally {
      setSending(false);
    }
  }

  async function resend(r: PilotRow) {
    const ok = await confirm(
      `Send ${r.email} a fresh invite? They get the same invitation email with a new link to set their password. Any earlier link stops working.`,
      { title: "Resend invite", confirmLabel: "Send invite" },
    );
    if (!ok) return;
    setBusy(r.id);
    try {
      const res = await fetch("/api/admin/resend-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: r.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not resend the invite.");
      showToast(`New invite sent to ${r.email}.`, "success");
    } catch (e: any) {
      showToast(e.message || "Could not resend the invite.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function revoke(r: PilotRow) {
    const ok = await confirm(
      `Revoke pilot access for ${r.email}? They lose full access and ELOS and drop off this list. The account and its data stay (delete it fully from the People page).`,
      { title: "Revoke pilot access", confirmLabel: "Revoke" },
    );
    if (!ok) return;
    setBusy(r.id);
    try {
      const res = await fetch("/api/admin/revoke-pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: r.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not revoke.");
      router.refresh();
    } catch (e: any) {
      showToast(e.message || "Could not revoke.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white shadow-card">
      {ConfirmUI}
      {ToastUI}
      {checkinFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={() => !sending && setCheckinFor(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-ink-900">Send check-in</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  To {checkinFor.email}. A short survey, then the steps to bring their show leads in.
                </p>
              </div>
              <button type="button" onClick={() => !sending && setCheckinFor(null)} className="text-ink-400 hover:text-ink-700" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 text-xs font-semibold text-ink-700">
              Exhibition
              <ExhibitionPicker
                shows={library}
                value={exhibition}
                onChange={(t) => {
                  setExhibition(t);
                  if (!campaignEdited) setCampaign("");
                }}
                onPick={pickShow}
              />
              <span className="mt-1 block font-normal text-ink-400">Used in the email and survey: &ldquo;How did SIAL Paris go?&rdquo;</span>
            </div>
            <label className="mt-3 block text-xs font-semibold text-ink-700">
              Campaign <span className="font-normal text-ink-400">(optional)</span>
              <input
                value={campaign}
                onChange={(e) => {
                  setCampaign(e.target.value);
                  setCampaignEdited(e.target.value.trim() !== "");
                }}
                maxLength={80}
                placeholder="e.g. SIAL Paris 2026"
                className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-normal focus:border-emerald-500 focus:outline-none"
              />
              <span className="mt-1 block font-normal text-ink-400">Groups answers on the Feedback page. Filled in when you pick a show; leave empty to use the exhibition name.</span>
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCheckinFor(null)}
                disabled={sending}
                className="rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => sendCheckin(false)}
                disabled={sending || !exhibition.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                Send email
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
          <Users className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-900">Invited pilots</p>
          <p className="text-[11px] text-ink-400">Everyone you have given pilot access, with status</p>
        </div>
        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-ink-400">
          No pilots yet. Send an invite above and it will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-medium text-ink-500">
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Invited</th>
                <th className="px-4 py-2.5">Access until</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">ELOS</th>
                <th className="px-4 py-2.5">Accepted</th>
                <th className="px-4 py-2.5">Last active</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => {
                const status = accessStatus(r.early_access_until);
                const accepted = !!r.email_confirmed_at || !!r.last_sign_in_at;
                return (
                  <tr key={r.id} className="hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink-900">{r.email}</span>
                      {(r.full_name || r.company_name) && (
                        <span className="block text-xs text-ink-400">
                          {[r.full_name, r.company_name].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {checkins[r.id] && (
                        <span className="mt-0.5 block text-[11px] font-medium text-emerald-700">
                          Check-in sent {fmt(checkins[r.id].sent_at)}
                          {checkins[r.id].answered_at ? `, answered ${fmt(checkins[r.id].answered_at)}` : ", waiting"}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-600">{fmt(r.pilot_invited_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-600">{fmt(r.early_access_until)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {r.elos_enabled ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">On</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">Off</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {accepted ? (
                        <span className="text-emerald-700">Yes · {fmt(r.email_confirmed_at ?? r.last_sign_in_at)}</span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Pending</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-600">
                      {r.last_sign_in_at ? fmt(r.last_sign_in_at) : <span className="text-ink-400">Never</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {accepted && status.label !== "Expired" && (
                        <button
                          type="button"
                          onClick={() => openCheckin(r)}
                          disabled={busy === r.id}
                          className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <MessageSquareText className="h-3.5 w-3.5" />
                          Send check-in
                        </button>
                      )}
                      {!accepted && (
                        <button
                          type="button"
                          onClick={() => resend(r)}
                          disabled={busy === r.id}
                          className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Resend invite
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => revoke(r)}
                        disabled={busy === r.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
                      >
                        {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        Revoke
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
