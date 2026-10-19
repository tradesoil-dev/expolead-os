"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Arriving from an expired invitation: same secure reset mechanism, but
  // worded for someone who has never set a password yet.
  const [fromInvite, setFromInvite] = useState(false);
  useEffect(() => {
    try {
      setFromInvite(new URLSearchParams(window.location.search).get("from") === "invite");
    } catch { /* ignore */ }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 px-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          ← Back to sign in
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          {fromInvite ? "Get a new link to set your password" : "Reset your password"}
        </h1>

        {sent ? (
          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <p className="text-sm font-semibold text-emerald-700">Check your email</p>
            <p className="mt-1 text-sm text-emerald-600">
              We sent a link to <strong>{email}</strong>. Click it to {fromInvite ? "set your password" : "set a new password"}.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-slate-500">
              {fromInvite
                ? "Enter the email your invitation was sent to and we'll send you a fresh link."
                : "Enter your account email and we'll send you a reset link."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="block text-xs font-bold uppercase tracking-wide text-ink-700 mb-2">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                />
              </label>

              {error && (
                <p className="text-sm text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-600/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 px-3.5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Sending…" : fromInvite ? "Send me a new link" : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
