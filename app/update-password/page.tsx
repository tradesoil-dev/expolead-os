"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) { setVerifying(false); return; }
    const supabase = createClient();

    // PKCE flow: token_hash + type=recovery in query params
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (tokenHash && type === "recovery") {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" })
        .then(({ error }) => {
          if (error) {
            setError("This reset link has expired or has already been used. Please request a new one.");
          } else {
            setSessionReady(true);
          }
          setVerifying(false);
        });
      return;
    }

    // Implicit flow: Supabase processes the URL hash and fires PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
        setVerifying(false);
      }
    });

    // Also check if a recovery session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true);
        setVerifying(false);
      }
    });

    // Timeout: if no session after 6s, show error
    const timeout = setTimeout(() => {
      setVerifying(false);
      setError("This reset link has expired or has already been used. Please request a new one.");
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/dashboard");
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
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
            <svg className="h-4 w-4 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Verifying your reset link...
          </div>
        ) : !sessionReady ? (
          <div className="mt-8 rounded-xl bg-rose-50 border border-rose-200 px-5 py-4">
            <p className="text-sm font-semibold text-rose-700">Link expired</p>
            <p className="mt-1 text-sm text-rose-600">{error}</p>
            <a href="/reset-password" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Request a new reset link
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">New password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </label>

            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">Confirm password</span>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
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
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
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
