"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Check } from "lucide-react";

// Admin tool: provision a customer/pilot by email. Creates the account with
// full self-expiring access (and optional ELOS) and emails them a set-your-own-
// password link. No SQL, no "tell Claude" step.
function defaultAccessUntil(): string {
  const d = new Date();
  d.setDate(d.getDate() + 50); // sensible pilot window; adjust per invite
  return d.toISOString().slice(0, 10);
}

export default function InviteCustomer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [accessUntil, setAccessUntil] = useState(defaultAccessUntil());
  const [fullAccess, setFullAccess] = useState(true);
  const [elos, setElos] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          full_name: fullName,
          company_name: companyName,
          access_until: accessUntil,
          full_access: fullAccess,
          elos,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not send the invite.");
      const who = email;
      setDone(
        `${data.existing ? "Set-password link re-sent to" : "Invite sent to"} ${who}${
          data.emailSent === false ? ", but the email did not send, check Resend." : "."
        }`,
      );
      setEmail("");
      setFullName("");
      setCompanyName("");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Could not send the invite.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-emerald-600">
            <UserPlus className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">Invite a customer</p>
            <p className="text-[11px] text-ink-500">Create an account by email and send a set-password link. No SQL needed.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setOpen((o) => !o); setDone(null); setError(null); }}
          className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {open ? "Close" : "New invite"}
        </button>
      </div>

      {done && !open && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <Check className="h-4 w-4" /> {done}
        </p>
      )}

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-600">Email (required)</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="buyer@company.com"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-600">Access until</span>
              <input
                type="date"
                value={accessUntil}
                onChange={(e) => setAccessUntil(e.target.value)}
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-600">Full name (optional)</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-600">Company (optional)</span>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Foods"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={fullAccess} onChange={(e) => setFullAccess(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
              Full access until the date above
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={elos} onChange={(e) => setElos(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
              Enable ELOS for this account
            </label>
          </div>

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
          {done && (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4" /> {done}
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {busy ? "Sending…" : "Create account and send link"}
            </button>
            <span className="text-[11px] text-ink-400">They set their own password from the emailed link.</span>
          </div>
        </form>
      )}
    </div>
  );
}
