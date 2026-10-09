import { Users } from "lucide-react";

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

// Read-only tracker of everyone invited as a pilot: when sent, when access
// ends, whether they accepted (set their password / confirmed) and last active.
export default function PilotInvitesList({ rows }: { rows: PilotRow[] }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white shadow-card">
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
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50 text-left text-xs font-medium text-ink-500">
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Invited</th>
                <th className="px-4 py-2.5">Access until</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">ELOS</th>
                <th className="px-4 py-2.5">Accepted</th>
                <th className="px-4 py-2.5">Last active</th>
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
