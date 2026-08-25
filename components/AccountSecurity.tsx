"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useToast } from "@/components/useToast";

const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition";

export default function AccountSecurity() {
  const router = useRouter();
  const { showToast, ToastUI } = useToast();

  // --- change password ---
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
    if (next.length < 8) { showToast("New password must be at least 8 characters.", "error"); return; }
    if (next !== confirm) { showToast("New passwords do not match.", "error"); return; }

    setSavingPw(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { showToast("Please sign in again.", "error"); setSavingPw(false); return; }

    // Verify the current password before allowing a change.
    const { error: reauthErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
    if (reauthErr) { showToast("Current password is incorrect.", "error"); setSavingPw(false); return; }

    const { error } = await supabase.auth.updateUser({ password: next });
    setSavingPw(false);
    if (error) { showToast(error.message || "Could not update password.", "error"); return; }
    setCurrent(""); setNext(""); setConfirm("");
    showToast("Password updated.", "success");
  }

  // --- delete account ---
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    if (!isSupabaseConfigured) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) { showToast("Could not delete account. Please contact support.", "error"); setDeleting(false); return; }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      {ToastUI}
      <h3 className="text-lg font-bold text-slate-900">Account Security</h3>

      {/* Change password */}
      <form onSubmit={changePassword} className="mt-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">Change password</p>
        <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" className={inputClass} />
        <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password (min 8 characters)" className={inputClass} />
        <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" className={inputClass} />
        <button
          type="submit"
          disabled={savingPw || !current || !next || !confirm}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {savingPw ? "Updating…" : "Update password"}
        </button>
      </form>

      {/* Danger zone */}
      <div className="mt-6 border-t border-ink-100 pt-5">
        <p className="text-sm font-semibold text-rose-700">Delete account</p>
        <p className="mt-1 text-sm text-slate-600">
          Permanently delete your account and <strong>all</strong> your data — connections, opportunities, exhibitions and follow-ups. This cannot be undone.
        </p>

        {!showDelete ? (
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="mt-3 rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm text-rose-800">
              Type <strong>DELETE</strong> to confirm. Consider exporting your data first (CSV export on the Connections and Opportunities pages).
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className={`${inputClass} mt-3 max-w-xs`}
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={deleteAccount}
                disabled={confirmText !== "DELETE" || deleting}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Permanently delete account"}
              </button>
              <button
                type="button"
                onClick={() => { setShowDelete(false); setConfirmText(""); }}
                className="text-sm font-medium text-ink-500 hover:text-ink-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
