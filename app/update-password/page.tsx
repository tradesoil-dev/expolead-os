"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { friendlyPasswordError } from "@/lib/errors";
import { Eye, EyeOff } from "lucide-react";

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) { setVerifying(false); return; }
    const supabase = createClient();

    // 1. Expired / already-used link: Supabase redirects back with the error in
    //    the URL hash. Show it clearly instead of spinning forever.
    if (typeof window !== "undefined" && window.location.hash.includes("error")) {
      const p = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      if (p.get("error") || p.get("error_code")) {
        setLinkError("This link has expired or has already been used. Request a new one below.");
        setVerifying(false);
        return;
      }
    }

    // 2. PKCE flow: token_hash in the URL — works for both password reset and invite.
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    if (tokenHash && (type === "recovery" || type === "invite")) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "recovery" | "invite" })
        .then(({ error }) => {
          if (error) setLinkError("This link has expired or has already been used. Request a new one below.");
          else setSessionReady(true);
          setVerifying(false);
        });
      return;
    }

    // 3. Implicit flow: the session arrives in the URL hash and the client
    //    establishes it. Accept a password-reset session OR an invite / sign-in
    //    session, so invite links open the form too (not just reset links).
    let settled = false;
    const ready = (session: unknown) => {
      if (session && !settled) { settled = true; setSessionReady(true); setVerifying(false); }
    };
    supabase.auth.getSession().then(({ data }) => ready(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => ready(session));

    // If no session is established shortly, stop spinning and offer a new link.
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        setVerifying(false);
        setLinkError("This link could not be verified. It may have expired. Request a new one below.");
      }
    }, 6000);

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (password !== confirm) { setSubmitError("Passwords do not match."); return; }
    if (password.length < 8) { setSubmitError("Password must be at least 8 characters."); return; }
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setLoading(false); setSubmitError(friendlyPasswordError(error) ?? error.message); return; }
    // Notify + audit the change (best-effort), while the session is still active.
    try {
      await fetch("/api/account/password-changed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "the set-password page" }),
      });
    } catch { /* non-fatal */ }
    // Professional flow: sign out and send them to the login page to sign in
    // with their new password, rather than dropping straight into the app. The
    // welcome email then fires when they first land in the app after logging in.
    try { await supabase.auth.signOut(); } catch { /* non-fatal */ }
    router.push("/login?reset=1");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Set new password
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Choose a strong password for your ExpoLead OS account.
        </p>

        {verifying ? (
          <div className="mt-8">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <svg className="h-4 w-4 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Verifying your reset link...
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Taking too long?{" "}
              <a href="/reset-password" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Request a new link
              </a>
            </p>
          </div>
        ) : linkError ? (
          <div className="mt-8 rounded-xl bg-rose-50 border border-rose-200 px-5 py-4">
            <p className="text-sm font-semibold text-rose-700">Link expired</p>
            <p className="mt-1 text-sm text-rose-600">{linkError}</p>
            <a href="/reset-password" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Request a new reset link
            </a>
          </div>
        ) : sessionReady ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">New password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-11 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">Confirm password</span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:ring-2 transition ${
                  confirm && confirm !== password
                    ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
                    : confirm && confirm === password
                    ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
              {confirm && confirm !== password && (
                <p className="mt-2 text-xs text-rose-600 font-medium">Passwords do not match</p>
              )}
              {confirm && confirm === password && (
                <p className="mt-2 text-xs text-emerald-600 font-medium">Passwords match</p>
              )}
            </label>

            {submitError && (
              <p className="text-sm text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-600/20 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-600 px-3.5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        ) : (
          // Implicit flow — still waiting for PASSWORD_RECOVERY event
          // No timeout. Show spinner with manual escape hatch.
          <div className="mt-8">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <svg className="h-4 w-4 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Verifying your reset link...
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Taking too long?{" "}
              <a href="/reset-password" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Request a new link
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense>
      <UpdatePasswordForm />
    </Suspense>
  );
}
